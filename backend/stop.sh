#!/bin/bash

echo "========================================"
echo "TechCommunity Backend Stop Script"
echo "========================================"
echo

COMPOSE_FILE="docker-compose.yml"

echo "Stopping services..."
docker-compose -f $COMPOSE_FILE down

echo
echo "Services stopped."
echo
