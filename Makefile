APP_NAME=smart-laundry-web
TAG=latest

build-local:
	cp .env.local .env.production
	docker build -t $(APP_NAME):local .