#!/bin/bash

echo "========================================"
echo "TechCommunity Backend Deployment Script"
echo "========================================"
echo

COMPOSE_FILE="docker-compose.yml"

echo "[1/4] Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed"
    exit 1
fi
echo "Docker is available."

echo
echo "[2/4] Building and starting services..."
docker-compose -f $COMPOSE_FILE up -d --build
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to start services"
    exit 1
fi

echo
echo "[3/4] Waiting for services to be healthy..."
sleep 30

echo
echo "[4/4] Checking service status..."
docker-compose -f $COMPOSE_FILE ps

echo
echo "========================================"
echo "Deployment completed!"
echo "========================================"
echo
echo "Services:"
echo "  - Frontend: http://localhost"
echo "  - Backend API: http://localhost:8080/api"
echo "  - MySQL: localhost:3306"
echo "  - Redis: localhost:6379"
echo
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
echo
