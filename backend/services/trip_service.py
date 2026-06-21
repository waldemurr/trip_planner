from backend.services.eld_service import ELDService
from backend.apps.trips.models import Trip, Stop

from backend.services.geocoding_service import GeocodingService
from backend.services.routing_service import RoutingService
from backend.services.hos_service import HOSService


class TripService:

    @classmethod
    def create_trip(
        cls,
        current_location: str,
        pickup_location: str,
        dropoff_location: str,
        current_cycle_used_hours: float,
    ):
        trip = Trip.objects.create(current_cycle_used_hours=current_cycle_used_hours)
        current_coords = GeocodingService.get_coordinates(current_location)
        pickup_coords = GeocodingService.get_coordinates(pickup_location)
        dropoff_coords = GeocodingService.get_coordinates(dropoff_location)

        leg1 = RoutingService.get_route(current_coords, pickup_coords)

        leg2 = RoutingService.get_route(pickup_coords, dropoff_coords)

        total_distance = leg1["distance_miles"] + leg2["distance_miles"]

        total_hours = leg1["duration_hours"] + leg2["duration_hours"]

        cls.create_stops(
            trip,
            pickup_location,
            pickup_coords,
            dropoff_location,
            dropoff_coords,
            total_distance,
        )
        hos_days = HOSService.calculate(total_hours)
        ELDService.generate(trip=trip, hos_days=hos_days)
        return trip

    @classmethod
    def create_stops(
        cls,
        trip,
        pickup_address,
        pickup_coords,
        dropoff_address,
        dropoff_coords,
        total_distance,
    ):

        Stop.objects.create(
            trip=trip,
            stop_type=Stop.StopType.PICKUP,
            address=pickup_address,
            latitude=pickup_coords["lat"],
            longitude=pickup_coords["lng"],
            duration_minutes=60,
        )

        Stop.objects.create(
            trip=trip,
            stop_type=Stop.StopType.DROPOFF,
            address=dropoff_address,
            latitude=dropoff_coords["lat"],
            longitude=dropoff_coords["lng"],
            duration_minutes=60,
        )

        fuel_count = int(total_distance // 1000)

        for i in range(fuel_count):
            Stop.objects.create(
                trip=trip,
                stop_type=Stop.StopType.FUEL,
                address="Fuel stop",
                latitude=0,
                longitude=0,
                duration_minutes=30,
            )
