include .dev.env
all: compose/down compose/build compose/up

compose/up:
	docker compose -f devops/docker-compose.yaml up -d

compose/build:
	docker compose -f devops/docker-compose.yaml build

compose/down:  
	docker compose -f devops/docker-compose.yaml down

get-api-key:
	@bash get-api-key.sh
