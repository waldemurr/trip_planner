import logging
from typing import Dict

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

BASE_URL = "https://nominatim.openstreetmap.org/search"


class GeocodingService:
    @staticmethod
    def get_coordinates(address: str) -> Dict[str, float]:
        if not address or not address.strip():
            raise ValueError("Address is required")

        try:
            response = requests.get(
                BASE_URL,
                params={
                    "q": address.strip(),
                    "format": "json",
                    "limit": 1,
                    "addressdetails": 0,
                },
                headers={"User-Agent": "eld-planner/1.0"},
                timeout=getattr(settings, "ORS_TIMEOUT", 15),
            )
        except requests.exceptions.Timeout as exc:
            raise ConnectionError(
                f"Geocoding service timed out for address: {address}"
            ) from exc
        except requests.exceptions.RequestException as exc:
            raise ConnectionError(f"Geocoding service unavailable: {exc}") from exc

        if response.status_code != 200:
            raise RuntimeError(
                f"Geocoding service returned status {response.status_code}"
            )

        data = response.json()
        if not data:
            raise ValueError(f"Address not found: {address}")

        return {"lat": float(data[0]["lat"]), "lng": float(data[0]["lon"])}
