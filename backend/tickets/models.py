from django.conf import settings
from django.db import models


class Ticket(models.Model):
    STATUS = [
        ("open", "Open"),
        ("in_progress", "In progress"),
        ("resolved", "Resolved"),
        ("closed", "Closed"),
    ]
    PRIORITY = [("low", "Low"), ("medium", "Medium"), ("high", "High")]

    title = models.CharField(max_length=120)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS, default="open")
    priority = models.CharField(max_length=10, choices=PRIORITY, default="medium")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="created_tickets"
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assigned_tickets",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Comment(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)