from django.urls import path

from backend.apps.trips.views import CreateTripAPIView, TripAPIView

urlpatterns = [
    path("create/", CreateTripAPIView.as_view(), name="trip-create"),
    path("<int:pk>/", TripAPIView.as_view(), name="trip-detail"),
]
