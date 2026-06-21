from typing import Dict, List


class HOSService:
    MAX_DRIVING_HOURS = 11
    MAX_ON_DUTY_HOURS = 14

    BREAK_AFTER_HOURS = 8
    BREAK_DURATION_HOURS = 0.5

    MIN_REST_HOURS = 10

    FUEL_STOP_DURATION_HOURS = 0.5

    @classmethod
    def calculate(
        cls,
        total_driving_hours: float,
        total_distance_miles: float = 0,
        current_cycle_used_hours: float = 0,
        pickup_required: bool = True,
        dropoff_required: bool = True,
    ) -> List[Dict]:

        if total_driving_hours <= 0:
            raise ValueError("total_driving_hours must be > 0")

        fuel_stops_remaining = int(total_distance_miles // 1000)

        days = []

        remaining_driving = total_driving_hours

        day_number = 1

        while remaining_driving > 0:

            segments = []

            total_on_duty = 0

            #
            # 00:00-10:00 off duty
            #
            segments.append({"status": "off", "duration": 10})

            current_driving_capacity = cls.MAX_DRIVING_HOURS

            #
            # pickup
            #
            if pickup_required and day_number == 1:

                segments.append({"status": "on", "duration": 1})

                total_on_duty += 1

            #
            # driving before break
            #
            first_leg = min(
                remaining_driving, cls.BREAK_AFTER_HOURS, current_driving_capacity
            )

            if first_leg > 0:

                segments.append({"status": "driving", "duration": round(first_leg, 2)})

                remaining_driving -= first_leg

                total_on_duty += first_leg

                current_driving_capacity -= first_leg

            #
            # 30 min break
            #
            if first_leg >= cls.BREAK_AFTER_HOURS and remaining_driving > 0:

                segments.append({"status": "off", "duration": 0.5})

            #
            # second driving block
            #
            second_leg = min(remaining_driving, current_driving_capacity)

            if second_leg > 0:
                segments.append({"status": "driving", "duration": round(second_leg, 2)})
                remaining_driving -= second_leg
                total_on_duty += second_leg

            if fuel_stops_remaining > 0:
                segments.append({"status": "on", "duration": 0.5})
                fuel_stops_remaining -= 1
                total_on_duty += 0.5

            if dropoff_required and remaining_driving <= 0:
                segments.append({"status": "on", "duration": 1})
                total_on_duty += 1

            total_duration = sum(s["duration"] for s in segments)
            if total_duration < 24:
                segments.append(
                    {"status": "off", "duration": round(24 - total_duration, 2)}
                )

            days.append(
                {
                    "day": day_number,
                    "driving_hours": round(
                        sum(
                            s["duration"] for s in segments if s["status"] == "driving"
                        ),
                        2,
                    ),
                    "on_duty_hours": round(
                        sum(s["duration"] for s in segments if s["status"] == "on")
                        + sum(
                            s["duration"] for s in segments if s["status"] == "driving"
                        ),
                        2,
                    ),
                    "off_duty_hours": round(
                        sum(s["duration"] for s in segments if s["status"] == "off"), 2
                    ),
                    "segments": segments,
                }
            )
            day_number += 1
        return days
