all: down build

build:
	docker-compose build

build-app:
	docker-compose r
start:
	docker-compose up -d

down:
	docker-compose down

install:
	docker-compose run --rm app npm install && npm run build
	# flow-typed install (for dev only)

test:
	docker-compose run --rm app npm test

logs:
	docker-compose logs -f

watch:
	docker-compose run --rm app npm run watch
