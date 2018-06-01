all: down build

build:
	docker-compose build

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
