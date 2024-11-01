


build-prod:
	docker build --target runtime-production -t quant-ux .

build-dev:
	docker build --target runtime-development -t quant-ux .


up:
	 docker compose --file docker/docker-compose.yml up

down:
	 docker compose --file docker/docker-compose.yml down