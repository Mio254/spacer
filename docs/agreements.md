# Spacer – Shared Agreements

## Naming
- Backend: snake_case
- Frontend: camelCase
- API responses: snake_case

## Time
- ISO 8601 UTC timestamps only

## Status Enums
Booking: pending | confirmed | active | completed | cancelled  
Payment: unpaid | paid | refunded

## Roles
- admin
- client

## Booking Logic
new_start < existing_end AND new_end > existing_start

## Error Shape
{ "error": "message" }

## 
Backend Configuration
Server

Framework: Flask

Base URL: http://127.0.0.1

Port: 5001 

All backend services MUST run on port 5001 in local development.

http://127.0.0.1:5001

Health Check

The backend must expose a health endpoint at:

GET /health


Expected usage from frontend:

fetch("http://127.0.0.1:5001/health")
