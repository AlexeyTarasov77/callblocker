include .dev.env
all: compose/down compose/build compose/up

compose/up:
	docker compose -f devops/docker-compose.yaml up -d

compose/build:
	docker compose -f devops/docker-compose.yaml build

compose/down:  
	docker compose -f devops/docker-compose.yaml down

compose/test:
	docker compose -f devops/docker-compose.yaml exec backend sh -c 'npm run test:e2e'

get-api-key:
	@POSTGRES_USER=${POSTGRES_USER} POSTGRES_DB=${POSTGRES_DB} bash get-api-key.sh
