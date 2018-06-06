# Loyalty API

Backend assignment that use:
- Node
- Flow
- RabbitMQ
- MongoDB

## Requirements
- Having a RabbitMQ running

## Installation

A Docker section is available below if you prefer

``` bash
> npm install
> npm run build
```

## Settings

Setting up the .env if required (Mandatory with Docker usage)
```bash
> cp .env.sample .env
```

## Dev
```bash
> npm watch
```

## Launch tests
``` bash
> npm run test
```

## Start server
``` bash
> npm start
```

# With Docker

```bash
# Build and install project
> make build
> make install

# Connect external rabbitmq to our network
> docker network connect cp_assignment rabbitmq

# Then you can run the project
> make start

# During development (stop the running app to run it again with watch)
> make watch
```

# Usage

Open [http://localhost:8000/api/hello/robert/32](http://localhost:8000/api/hello/robert/32) to
check the provided API example route.
