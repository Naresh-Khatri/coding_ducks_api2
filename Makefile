build:
	docker compose -f docker-compose.yml build

up:
	docker compose up -d --remove-orphans
	docker logs -f codingducks-backend

up-prod:
	docker compose -f docker-compose.prod.yml up --build -d

down: 
	docker compose down