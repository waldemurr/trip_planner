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
        self.cursor = 0  # minutes from midnight
        self.totals = {
            LogSegment.Status.OFF_DUTY: 0.0,
            LogSegment.Status.SLEEPER: 0.0,
            LogSegment.Status.DRIVING: 0.0,
            LogSegment.Status.ON_DUTY: 0.0,
        }

    def add(self, status: str, minutes: int):
        if minutes <= 0:
            return
        start = _time_from_minutes(self.cursor)
        end_minutes = _add_minutes(self.cursor, minutes)
        end = _time_from_minutes(end_minutes)
        LogSegment.objects.create(
            daily_log=self.daily_log,
            status=status,
            start_time=start,
            end_time=end,
        )
        self.totals[status] += minutes / 60
        self.cursor = end_minutes


class ELDService:
    @classmethod
    def generate(cls, trip, hos_days: List[Dict]):
        current_date = date.today()
        DailyLog.objects.filter(trip=trip).delete()

        for day in hos_days:
            daily_log = DailyLog.objects.create(
                trip=trip,
                date=current_date,
                driving_hours=0,
                on_duty_hours=0,
                off_duty_hours=0,
                sleeper_hours=0,
            )
            cls._build_day(daily_log, day)
            daily_log.driving_hours = round(daily_log.segments.filter(
                status=LogSegment.Status.DRIVING
            ).count() * 1, 2)  # placeholder; real values from builder
            # Recalculate exact totals from segments.
            cls._set_totals(daily_log)
            current_date += timedelta(days=1)

    @classmethod
    def _set_totals(cls, daily_log: DailyLog):
        totals = {s: 0.0 for s in LogSegment.Status.values}
        for segment in daily_log.segments.all():
            start = segment.start_time.hour * 60 + segment.start_time.minute
            end = segment.end_time.hour * 60 + segment.end_time.minute
            if end <= start:
                end += 24 * 60
            totals[segment.status] += (end - start) / 60
        daily_log.driving_hours = round(totals[LogSegment.Status.DRIVING], 2)
        daily_log.on_duty_hours = round(totals[LogSegment.Status.ON_DUTY], 2)
        daily_log.off_duty_hours = round(totals[LogSegment.Status.OFF_DUTY], 2)
        daily_log.sleeper_hours = round(totals[LogSegment.Status.SLEEPER], 2)
        daily_log.save()

    @classmethod
    def _build_day(cls, daily_log: DailyLog, day: Dict):
        builder = _SegmentBuilder(daily_log)

        # 10-hour reset represented by off-duty until 06:00.
        builder.add(LogSegment.Status.OFF_DUTY, 6 * 60)

        # Pickup on the first day.
        if day.get("pickup_hours"):
            builder.add(LogSegment.Status.ON_DUTY, int(day["pickup_hours"] * 60))

        driving_minutes = int(day["driving_hours"] * 60)
        fuel_minutes = day.get("fuel_stop_minutes", 0)
        break_minutes = day.get("break_minutes", 0)

        # If a 30-minute break is required, place it after 8 hours of driving.
        if break_minutes and driving_minutes > 8 * 60:
            first_block = 8 * 60
            builder.add(LogSegment.Status.DRIVING, first_block)
            builder.add(LogSegment.Status.OFF_DUTY, break_minutes)
            driving_minutes -= first_block

        # Insert fuel stops evenly inside the remaining driving time.
        fuel_stops = day.get("fuel_stop_count", 0)
        if fuel_stops > 0 and driving_minutes > 0:
            interval = driving_minutes // (fuel_stops + 1)
            for i in range(fuel_stops):
                chunk = min(interval, driving_minutes)
                builder.add(LogSegment.Status.DRIVING, chunk)
                driving_minutes -= chunk
                builder.add(LogSegment.Status.ON_DUTY, fuel_minutes // fuel_stops)

        builder.add(LogSegment.Status.DRIVING, driving_minutes)

        # Dropoff on the final day.
        if day.get("dropoff_hours"):
            builder.add(LogSegment.Status.ON_DUTY, int(day["dropoff_hours"] * 60))

        # Remaining time in the 24-hour period is off-duty/sleeper.
        remaining = 24 * 60 - builder.cursor
        if remaining > 0:
            builder.add(LogSegment.Status.OFF_DUTY, remaining)
