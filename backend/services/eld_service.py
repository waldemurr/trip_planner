from datetime import date, time, timedelta
from typing import Dict, List

from backend.apps.logs.models import DailyLog, LogSegment


def _time_from_minutes(minutes: int) -> time:
    minutes = max(0, min(minutes, 24 * 60 - 1))
    return time(minutes // 60, minutes % 60)


def _add_minutes(base_minutes: int, delta: int) -> int:
    return max(0, min(base_minutes + delta, 24 * 60))


class _SegmentBuilder:
    def __init__(self, daily_log: DailyLog):
        self.daily_log = daily_log
        self.cursor = 0

        self.totals = {
            LogSegment.Status.OFF_DUTY: 0.0,
            LogSegment.Status.SLEEPER: 0.0,
            LogSegment.Status.DRIVING: 0.0,
            LogSegment.Status.ON_DUTY: 0.0,
        }

    def add(
        self,
        status: str,
        duration_hours: float,
    ):
        if duration_hours <= 0:
            return

        minutes = int(duration_hours * 60)

        start_minutes = self.cursor
        end_minutes = start_minutes + minutes

        LogSegment.objects.create(
            daily_log=self.daily_log,
            status=status,
            start_time=_time_from_minutes(start_minutes),
            end_time=_time_from_minutes(end_minutes),
        )
        self.totals[status] += duration_hours
        self.cursor = end_minutes


class ELDService:
    @classmethod
    def generate(
        cls,
        trip,
        hos_days: List[Dict],
    ):

        DailyLog.objects.filter(trip=trip).delete()

        current_date = date.today()

        for day in hos_days:

            daily_log = DailyLog.objects.create(
                trip=trip,
                date=current_date,
            )

            builder = _SegmentBuilder(daily_log)

            for segment in day["segments"]:

                builder.add(
                    segment["status"],
                    segment["duration"],
                )

            daily_log.driving_hours = round(
                builder.totals[LogSegment.Status.DRIVING],
                2,
            )

            daily_log.on_duty_hours = round(
                builder.totals[LogSegment.Status.ON_DUTY],
                2,
            )

            daily_log.off_duty_hours = round(
                builder.totals[LogSegment.Status.OFF_DUTY],
                2,
            )

            daily_log.sleeper_hours = round(
                builder.totals[LogSegment.Status.SLEEPER],
                2,
            )
            daily_log.save()
            current_date += timedelta(days=1)
