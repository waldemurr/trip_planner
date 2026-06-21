from rest_framework import serializers

from backend.apps.logs.models import LogSegment


class LogSegmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogSegment
        fields = ("status", "start_time", "end_time")
