from django.db import models


class Trip(models.Model):
    current_cycle_used_hours = models.FloatField()
    total_distance_miles = models.FloatField(default=0)
    total_duration_hours = models.FloatField(default=0)
    route_geometry = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Trip {self.id} ({self.total_distance_miles:.1f} mi)"


class Stop(models.Model):
    class StopType(models.TextChoices):
        START = "start"
        PICKUP = "pickup"
        DROPOFF = "dropoff"
        REST = "rest"
        FUEL = "fuel"

    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="stops")
    stop_type = models.CharField(max_length=20, choices=StopType.choices)
    address = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    duration_minutes = models.IntegerField()
    sequence = models.IntegerField(default=0)

    class Meta:
        ordering = ["sequence", "id"]

    def __str__(self):
        return f"{self.stop_type}: {self.address}"
