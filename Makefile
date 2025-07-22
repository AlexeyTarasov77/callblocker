
compose/up:
	docker compose -f devops/docker-compose.yaml up -d

compose/build:
	docker compose -f devops/docker-compose.yaml build

compose/down:  
	docker compose -f devops/docker-compose.yaml down
