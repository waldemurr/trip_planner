import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from backend.apps.trips.models import Trip
from backend.apps.trips.serializers.trip import TripCreateSerializer, TripSerializer
from backend.services.trip_service import TripService

logger = logging.getLogger(__name__)


class CreateTripAPIView(APIView):
    def post(self, request):
        serializer = TripCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            trip = TripService.create_trip(**serializer.validated_data)
        except ValueError as exc:
            logger.warning("Trip create validation error: %s", exc)
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except ConnectionError as exc:
            logger.warning("External routing service error: %s", exc)
            return Response(
                {"error": "Routing/geocoding service is unavailable. Please try again later."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except RuntimeError as exc:
            logger.warning("External service runtime error: %s", exc)
            return Response({"error": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception as exc:  # noqa: BLE001
            logger.exception("Unexpected error while creating trip")
            return Response(
                {"error": "Unable to plan the trip. Please check the addresses and try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        return Response(TripSerializer(trip).data)


class TripAPIView(APIView):
    def get(self, request, pk):
        try:
            trip = Trip.objects.prefetch_related("stops", "daily_logs", "daily_logs__segments").get(pk=pk)
        except Trip.DoesNotExist:
            return Response({"error": "Trip not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(TripSerializer(trip).data)
