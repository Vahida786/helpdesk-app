from django.contrib import admin
from .models import Ticket, Comment


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "status", "priority", "created_by", "created_at")
    list_filter = ("status", "priority")
    search_fields = ("title", "description")


admin.site.register(Comment)