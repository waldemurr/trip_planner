from rest_framework import serializers

from backend.apps.trips.models import Stop


class StopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stop
        fields = (
            "id",
            "stop_type",
            "address",
            "latitude",
            "longitude",
            "duration_minutes",
            "sequence",
        )
