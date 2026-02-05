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


### UPDATE
Backend Architecture Agreement
Single Backend Policy

This project uses Flask (Python) as the sole backend.

Node/Express code is legacy and not part of the active stack

Any Node-related files have been moved out of the active server directory

No frontend code should import Node/Express/Mongoose modules

Authoritative backend: Flask
Backend port: 5001

API & Port Standardization

All frontend API calls must target port 5001

The backend base URL is defined via:

VITE_API_URL=http://127.0.0.1:5001


No assumptions about Flask’s default port (5000)

No reliance on Vite proxy unless explicitly documented

## Frontend–Backend Contract

Frontend services (client/src/services/) must:

Use browser-safe APIs only (fetch / axios)

Avoid server-only imports

Use VITE_API_URL for all backend communication

## Repository Cleanup & Baseline (Dev Branch)

The dev branch represents a stable baseline with the following guarantees:

Legacy Node backend artifacts removed or isolated

Flask-only backend confirmed

API communication standardized to port 5001

Client builds cleanly with Vite

No duplicate routers or conflicting entry points

All contributors must pull from dev before continuing work on feature branches.

git checkout dev
git pull origin dev

Responsibility Boundary

Infrastructure cleanup and standardization do not include:

Feature logic

Business rules (booking, pricing, availability)

Individual branch bug fixes

Each contributor is responsible for rebasing or merging dev into their branch.

Summary

The repository has been standardized to a Flask-only backend running on port 5001, with all legacy Node backend code removed from active use. The dev branch reflects this baseline and must be used as the reference point for all ongoing development.