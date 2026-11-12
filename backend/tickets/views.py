from django.contrib.auth.models import User
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Ticket
from .serializers import CommentSerializer, RegisterSerializer, TicketSerializer


class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "priority", "assigned_to"]
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "priority"]
    ordering = ["-created_at"]

    def get_queryset(self):
        # select_related avoids extra database queries (N+1)
        qs = Ticket.objects.select_related("created_by", "assigned_to")
        user = self.request.user
        if user.is_staff:
            return qs  # company staff see all tickets
        return qs.filter(created_by=user)  # customers see only their own

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["get", "post"])
    def comments(self, request, pk=None):
        ticket = self.get_object()  # 404 if the ticket is not theirs
        if request.method == "GET":
            qs = ticket.comments.select_related("author")
            return Response(CommentSerializer(qs, many=True).data)
        serializer = CommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(ticket=ticket, author=request.user)
        return Response(serializer.data, status=201)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class MeView(APIView):
    def get(self, request):
        u = request.user
        return Response({"id": u.id, "username": u.username, "is_staff": u.is_staff})