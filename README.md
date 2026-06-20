# Trip planner
Trip Planner is a full-stack web application for professional truck drivers, built with Django (backend) and React (frontend). It automates route planning and generates daily ELD logs in strict compliance with FMCSA regulations.

## Objective
The application eliminates manual route planning and paper logbook filling, allowing drivers to obtain a complete route with mandatory stops and a full set of daily logs for the entire trip within minutes.

## How It Works
Input: The user provides current location, pickup and dropoff points, and hours already used in the current cycle.
    
Route Calculation: The backend geocodes addresses, builds a route via a free mapping API, and calculates required stops (rest breaks, fueling every 1,000 miles).
    
Log Generation: Based on the route and 70hrs/8days rules, the system splits the trip into days and generates individual ELD logs with populated events (driving, rest, work).
    
Visualization: The React frontend displays the route on a map and renders completed log sheets with drawn graphs for review and printing.

## Core Logic
FMCSA Compliance: Implements the 70-hour/8-day rule for property-carrying drivers, automatically accounting for 1 hour of pickup and 1 hour of drop-off time.
    
Stop Scheduling: The algorithm automatically integrates rest breaks and fueling stops (at least every 1,000 miles).

## Technology Stack
Backend: Django, PostgreSQL

Frontend: React, Leaflet for map rendering

Mapping API: OpenStreetMap, OSRM for route calculations

## Target Audience

This tool is designed for fleet operators and independent drivers to streamline trip planning and ensure that log sheets always remain compliant with current regulations.
