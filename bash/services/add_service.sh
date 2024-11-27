#!/bin/bash
# POST request to logged-in user

if [ $# -ne 1 ]; then
  echo "Usage: <script> <name>"
  exit 1
fi

curl -b cookies.txt -X POST http://localhost:5002/api/v1/services \
-H "Content-Type: application/json" -d "{\"name\": \"$1\"}"
