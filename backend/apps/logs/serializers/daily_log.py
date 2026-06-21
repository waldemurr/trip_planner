from rest_framework import serializers

from backend.apps.logs.models import DailyLog
from backend.apps.logs.serializers.log_segment import LogSegmentSerializer


class DailyLogSerializer(serializers.ModelSerializer):
    segments = LogSegmentSerializer(many=True)

    class Meta:
        model = DailyLog
        fields = (
            "date",
            "driving_hours",
            "on_duty_hours",
            "off_duty_hours",
            "sleeper_hours",
            "segments",
        )
