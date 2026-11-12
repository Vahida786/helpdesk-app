from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password as check_password
from rest_framework import serializers

from .models import Ticket, Comment


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def validate_password(self, value):
        check_password(value)
        return value

    def create(self, validated_data):
        # create_user hashes the password
        return User.objects.create_user(**validated_data)


class TicketSerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source="created_by.username")

    class Meta:
        model = Ticket
        fields = [
            "id", "title", "description", "status", "priority",
            "created_by", "assigned_to", "created_at", "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def validate_status(self, value):
        if self.instance and self.instance.status == "closed" and value == "open":
            raise serializers.ValidationError("A closed ticket cannot be reopened.")
        return value


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source="author.username")

    class Meta:
        model = Comment
        fields = ["id", "ticket", "author", "body", "created_at"]
        read_only_fields = ["ticket", "created_at"]