import logging
from typing import Dict, List

from backend.apps.trips.models import Stop, Trip
from backend.services.eld_service import ELDService
from backend.services.geocoding_service import GeocodingService
from backend.services.hos_service import HOSService
from backend.services.routing_service import RoutingService

logger = logging.getLogger(__name__)

FUEL_INTERVAL_MILES = 1000


class TripService:
    @classmethod
    def create_trip(
        cls,
        current_location: str,
        pickup_location: str,
        dropoff_location: str,
        current_cycle_used_hours: float,
    ) -> Trip:
        current_coords = GeocodingService.get_coordinates(current_location)
        pickup_coords = GeocodingService.get_coordinates(pickup_location)
        dropoff_coords = GeocodingService.get_coordinates(dropoff_location)

        leg1 = RoutingService.get_route(current_coords, pickup_coords)
        leg2 = RoutingService.get_route(pickup_coords, dropoff_coords)

        total_distance = leg1["distance_miles"] + leg2["distance_miles"]
        total_duration = leg1["duration_hours"] + leg2["duration_hours"]
        geometry = cls._merge_geometry(leg1["geometry"], leg2["geometry"])

        trip = Trip.objects.create(
            current_cycle_used_hours=current_cycle_used_hours,
            total_distance_miles=round(total_distance, 2),
            total_duration_hours=round(total_duration, 2),
            route_geometry=geometry,
        )

        hos_days = HOSService.calculate(
            total_driving_hours=total_duration,
            total_distance_miles=total_distance,
            current_cycle_used_hours=current_cycle_used_hours,
            pickup_required=True,
            dropoff_required=True,
        )

        cls._create_stops(
            trip,
            current_location,
            current_coords,
            pickup_location,
            pickup_coords,
            dropoff_location,
            dropoff_coords,
            geometry,
            hos_days,
        )

        ELDService.generate(trip=trip, hos_days=hos_days)
        return trip

    @staticmethod
    def _merge_geometry(
        leg1: List[List[float]], leg2: List[List[float]]
    ) -> List[List[float]]:
        """Combine two route geometries, removing the duplicate shared waypoint."""
        if not leg2:
            return leg1
        if not leg1:
            return leg2
        # Avoid duplicating the pickup coordinate if it appears at the end of
        # leg1 and the start of leg2.
        if leg1[-1] == leg2[0]:
            return leg1 + leg2[1:]
        return leg1 + leg2

    @classmethod
    def _create_stops(
        cls,
        trip: Trip,
        current_address: str,
        current_coords: Dict[str, float],
        pickup_address: str,
        pickup_coords: Dict[str, float],
        dropoff_address: str,
        dropoff_coords: Dict[str, float],
        geometry: List[List[float]],
        hos_days: List[Dict],
    ):
        stops: List[Dict] = []

        stops.append(
            {
                "type": Stop.StopType.START,
                "address": current_address,
                "coords": [current_coords["lat"], current_coords["lng"]],
                "duration": 0,
                "miles": 0,
            }
        )

        stops.append(
            {
                "type": Stop.StopType.PICKUP,
                "address": pickup_address,
                "coords": [pickup_coords["lat"], pickup_coords["lng"]],
                "duration": 60,
                "miles": 0,
            }
        )

        # Fuel stops every 1000 miles along the full route.
        fuel_marks = list(
            range(
                FUEL_INTERVAL_MILES,
                int(trip.total_distance_miles),
                FUEL_INTERVAL_MILES,
            )
        )
        for miles in fuel_marks:
            point = RoutingService.point_at_distance(geometry, miles)
            if point:
                stops.append(
                    {
                        "type": Stop.StopType.FUEL,
                        "address": f"Fuel stop ~{miles} mi",
                        "coords": point,
                        "duration": 30,
                        "miles": miles,
                    }
                )

        # Overnight rest stops at the end of each driving day, except the last.
        cumulative_distance = 0.0
        for day in hos_days[:-1]:
            day_distance = cls._day_distance_miles(
                day, trip.total_distance_miles, trip.total_duration_hours
            )
            cumulative_distance += day_distance
            if cumulative_distance >= trip.total_distance_miles:
                break
            point = RoutingService.point_at_distance(geometry, cumulative_distance)
            if point:
                stops.append(
                    {
                        "type": Stop.StopType.REST,
                        "address": f"Rest stop (end of day {day['day']})",
                        "coords": point,
                        "duration": 10 * 60,
                        "miles": cumulative_distance,
                    }
                )

        stops.append(
            {
                "type": Stop.StopType.DROPOFF,
                "address": dropoff_address,
                "coords": [dropoff_coords["lat"], dropoff_coords["lng"]],
                "duration": 60,
                "miles": trip.total_distance_miles,
            }
        )

        # Sort by distance along the route and persist with sequence numbers.
        stops.sort(key=lambda s: s["miles"])
        for index, stop in enumerate(stops, start=1):
            Stop.objects.create(
                trip=trip,
                stop_type=stop["type"],
                address=stop["address"],
                latitude=stop["coords"][0],
                longitude=stop["coords"][1],
                duration_minutes=stop["duration"],
                sequence=index,
            )

    @classmethod
    def _day_distance_miles(
        cls, day: Dict, total_distance: float, total_duration: float
    ) -> float:
        if total_duration <= 0:
            return 0
        return day["driving_hours"] / total_duration * total_distance
