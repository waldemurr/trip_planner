import logging
import math
from typing import Dict, List, Optional

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

ORS_URL = "https://api.openrouteservice.org/v2/directions/driving-hgv/geojson"
OSRM_URL = "https://router.project-osrm.org/route/v1/driving/"


def _haversine_miles(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Return the great-circle distance between two coordinates in miles."""
    radius_miles = 3958.8
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)

    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return radius_miles * c


def _coords_from_osrm(geometry: Dict) -> List[List[float]]:
    """Convert OSRM GeoJSON geometry coordinates to [lat, lng]."""
    return [[pt[1], pt[0]] for pt in geometry.get("coordinates", [])]


class RoutingService:
    @staticmethod
    def get_route(start: Dict[str, float], end: Dict[str, float]) -> Dict:
        if not settings.ORS_API_KEY:
            logger.info("ORS_API_KEY not set, falling back to OSRM demo service")
            return RoutingService._osrm_route(start, end)
        return RoutingService._ors_route(start, end)

    @staticmethod
    def _ors_route(start: Dict[str, float], end: Dict[str, float]) -> Dict:
        body = {
            "coordinates": [
                [start["lng"], start["lat"]],
                [end["lng"], end["lat"]],
            ],
            "instructions": False,
            "units": "mi",
        }
        headers = {
            "Authorization": settings.ORS_API_KEY,
            "Content-Type": "application/json",
        }
        try:
            response = requests.post(
                ORS_URL,
                json=body,
                headers=headers,
                timeout=getattr(settings, "ORS_TIMEOUT", 15),
            )
        except requests.exceptions.Timeout as exc:
            raise ConnectionError("OpenRouteService timed out") from exc
        except requests.exceptions.RequestException as exc:
            raise ConnectionError(f"OpenRouteService unavailable: {exc}") from exc

        if response.status_code != 200:
            logger.error("ORS error %s: %s", response.status_code, response.text[:500])
            raise RuntimeError(
                f"OpenRouteService returned status {response.status_code}"
            )

        data = response.json()
        try:
            feature = data["features"][0]
            geometry = feature["geometry"]
            props = feature["properties"]["summary"]
            coords = [[pt[1], pt[0]] for pt in geometry["coordinates"]]
            return {
                "distance_miles": props["distance"] / 1609.34,
                "duration_hours": props["duration"] / 3600,
                "geometry": coords,
            }
        except (KeyError, IndexError) as exc:
            raise RuntimeError("Unexpected OpenRouteService response format") from exc

    @staticmethod
    def _osrm_route(start: Dict[str, float], end: Dict[str, float]) -> Dict:
        coords = f"{start['lng']},{start['lat']};{end['lng']},{end['lat']}"
        url = f"{OSRM_URL}{coords}"
        params = {"overview": "full", "geometries": "geojson"}
        try:
            response = requests.get(
                url, params=params, timeout=getattr(settings, "ORS_TIMEOUT", 15)
            )
        except requests.exceptions.Timeout as exc:
            raise ConnectionError("OSRM routing service timed out") from exc
        except requests.exceptions.RequestException as exc:
            raise ConnectionError(f"OSRM routing service unavailable: {exc}") from exc

        if response.status_code != 200:
            raise RuntimeError(
                f"OSRM routing service returned status {response.status_code}"
            )

        data = response.json()
        if data.get("code") != "Ok" or not data.get("routes"):
            raise RuntimeError(f"OSRM could not find a route: {data.get('message', 'unknown')}")

        route = data["routes"][0]
        return {
            "distance_miles": route["distance"] / 1609.34,
            "duration_hours": route["duration"] / 3600,
            "geometry": _coords_from_osrm(route["geometry"]),
        }

    @staticmethod
    def total_distance_along_geometry(geometry: List[List[float]]) -> float:
        """Sum the great-circle distance of each segment in the geometry (miles)."""
        total = 0.0
        for i in range(1, len(geometry)):
            total += _haversine_miles(
                geometry[i - 1][0],
                geometry[i - 1][1],
                geometry[i][0],
                geometry[i][1],
            )
        return total

    @staticmethod
    def point_at_distance(
        geometry: List[List[float]], target_miles: float
    ) -> Optional[List[float]]:
        """Return the [lat, lng] coordinate at ``target_miles`` along the geometry."""
        if not geometry:
            return None
        if target_miles <= 0:
            return geometry[0]

        cumulative = 0.0
        for i in range(1, len(geometry)):
            seg_distance = _haversine_miles(
                geometry[i - 1][0],
                geometry[i - 1][1],
                geometry[i][0],
                geometry[i][1],
            )
            if cumulative + seg_distance >= target_miles:
                ratio = (
                    (target_miles - cumulative) / seg_distance
                    if seg_distance > 0
                    else 0
                )
                lat = geometry[i - 1][0] + ratio * (geometry[i][0] - geometry[i - 1][0])
                lng = geometry[i - 1][1] + ratio * (geometry[i][1] - geometry[i - 1][1])
                return [lat, lng]
            cumulative += seg_distance

        return geometry[-1]
