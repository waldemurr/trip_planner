from rest_framework import serializers

from backend.apps.logs.serializers.daily_log import DailyLogSerializer
from backend.apps.trips.models import Trip
from backend.apps.trips.serializers.stop import StopSerializer


class TripSerializer(serializers.ModelSerializer):
    stops = StopSerializer(many=True)
    daily_logs = DailyLogSerializer(many=True)

    class Meta:
        model = Trip
        fields = (
            "id",
            "current_cycle_used_hours",
            "total_distance_miles",
            "total_duration_hours",
            "route_geometry",
            "created_at",
            "stops",
            "daily_logs",
        )


class TripCreateSerializer(serializers.Serializer):
    current_location = serializers.CharField()
    pickup_location = serializers.CharField()
    dropoff_location = serializers.CharField()
    current_cycle_used_hours = serializers.FloatField(min_value=0, max_value=70)
