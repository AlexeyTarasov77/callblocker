#!/bin/sh
set -e

api_key=$(openssl rand -hex 16)

docker compose -f devops/docker-compose.yaml exec postgres \
  psql -U $POSTGRES_USER -d $POSTGRES_DB -c "INSERT INTO api_key(key) values ('${api_key}')" 1>/dev/null

echo $api_key
