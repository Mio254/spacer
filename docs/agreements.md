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
