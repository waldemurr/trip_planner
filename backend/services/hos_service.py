from typing import Dict, List


class HOSService:
    """Calculate day-by-day Hours of Service plan for a trip.

    Uses FMCSA property-carrier rules for interstate commerce:
    - 11-hour driving limit within a duty day.
    - 14-hour on-duty window.
    - 10 consecutive hours off-duty/sleeper before driving again.
    - 30-minute break after 8 consecutive hours of driving.
    - 70-hour / 8-day on-duty rolling limit.
    """

    MAX_DRIVING_HOURS = 11
    MAX_ON_DUTY_HOURS = 14
    MIN_REST_HOURS = 10
    BREAK_AFTER_HOURS = 8
    BREAK_MINUTES = 30
    CYCLE_HOURS = 70
    FUEL_STOP_MINUTES = 30

    @classmethod
    def calculate(
        cls,
        total_driving_hours: float,
        current_cycle_used_hours: float = 0,
        pickup_required: bool = True,
        dropoff_required: bool = True,
        total_distance_miles: float = 0,
        fuel_interval_miles: float = 1000,
    ) -> List[Dict]:
        if total_driving_hours <= 0:
            raise ValueError("Total driving time must be greater than zero")

        remaining_hours = total_driving_hours
        remaining_cycle = cls.CYCLE_HOURS - current_cycle_used_hours
        if remaining_cycle <= 0:
            raise ValueError(
                "Driver has already exhausted the 70-hour/8-day cycle. "
                "A 34-hour restart is required before starting a new trip."
            )

        # Estimate fuel stops: one per 1000 miles.
        fuel_stops_total = int(total_distance_miles // fuel_interval_miles)

        days = []
        day_number = 1
        while remaining_hours > 0:
            # Fixed non-driving work for the day.
            pickup_hours = 1.0 if (pickup_required and day_number == 1) else 0.0
            dropoff_hours = 1.0 if (dropoff_required and remaining_hours <= cls.MAX_DRIVING_HOURS) else 0.0

            # Try to drive up to the daily driving limit, but respect the 14-hour
            # on-duty window and the remaining weekly cycle.
            available_for_driving = min(remaining_hours, cls.MAX_DRIVING_HOURS)

            # 30-minute break is needed if the driving block reaches 8 hours.
            break_hours = cls.BREAK_MINUTES / 60 if available_for_driving >= cls.BREAK_AFTER_HOURS else 0

            # Fuel stops for this day: distribute them evenly across driving days.
            fuel_today = 0
            if fuel_stops_total > 0:
                fuel_today = max(1, fuel_stops_total // max(1, cls._estimated_days(remaining_hours)))
                fuel_today = min(fuel_today, fuel_stops_total)
                fuel_stops_total -= fuel_today

            fuel_hours = fuel_today * (cls.FUEL_STOP_MINUTES / 60)

            # Respect the 14-hour duty window.
            on_duty_without_driving = pickup_hours + dropoff_hours + fuel_hours + break_hours
            max_driving_from_duty = cls.MAX_ON_DUTY_HOURS - on_duty_without_driving
            available_for_driving = min(available_for_driving, max_driving_from_duty)

            # Respect the 70-hour / 8-day cycle.
            max_driving_from_cycle = remaining_cycle - on_duty_without_driving
            available_for_driving = min(available_for_driving, max_driving_from_cycle)

            if available_for_driving <= 0:
                raise ValueError(
                    "Trip cannot be completed within the 70-hour/8-day cycle. "
                    "A 34-hour restart is required."
                )

            driving_hours = round(available_for_driving, 2)
            on_duty_hours = round(pickup_hours + dropoff_hours + fuel_hours + driving_hours, 2)
            off_duty_hours = round(cls.MIN_REST_HOURS, 2)
            sleeper_hours = 0.0

            days.append(
                {
                    "day": day_number,
                    "driving_hours": driving_hours,
                    "on_duty_hours": on_duty_hours,
                    "off_duty_hours": off_duty_hours,
                    "sleeper_hours": sleeper_hours,
                    "pickup_hours": pickup_hours,
                    "dropoff_hours": dropoff_hours,
                    "fuel_stop_count": fuel_today,
                    "fuel_stop_minutes": fuel_today * cls.FUEL_STOP_MINUTES,
                    "break_minutes": cls.BREAK_MINUTES if break_hours else 0,
                }
            )

            remaining_hours -= driving_hours
            remaining_cycle -= on_duty_hours
            day_number += 1

        return days

    @classmethod
    def _estimated_days(cls, remaining_hours: float) -> int:
        return max(1, int(remaining_hours // cls.MAX_DRIVING_HOURS) + (1 if remaining_hours % cls.MAX_DRIVING_HOURS else 0))
