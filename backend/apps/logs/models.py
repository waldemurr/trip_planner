from django.db import models

from backend.apps.trips.models import Trip


class DailyLog(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="daily_logs")
    date = models.DateField()
    driving_hours = models.FloatField(default=0)
    on_duty_hours = models.FloatField(default=0)
    off_duty_hours = models.FloatField(default=0)
    sleeper_hours = models.FloatField(default=0)

    class Meta:
        ordering = ["date"]

    def __str__(self):
        return f"Log for {self.date}"


class LogSegment(models.Model):
    class Status(models.TextChoices):
        OFF_DUTY = "off"
        SLEEPER = "sleeper"
        DRIVING = "driving"
        ON_DUTY = "on"

    daily_log = models.ForeignKey(
        DailyLog, on_delete=models.CASCADE, related_name="segments"
    )
    status = models.CharField(max_length=20, choices=Status.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        ordering = ["start_time"]

    def __str__(self):
        return f"{self.status}: {self.start_time} - {self.end_time}"
