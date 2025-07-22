
compose/up:
	docker compose -f devops/docker-compose.yaml up -d

compose/down:  
	docker compose -f devops/docker-compose.yaml down
