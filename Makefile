.PHONY: up up-all down restart logs logs-all psql psql-file status clean nuke

up:
	docker compose up -d db

up-all:
	docker compose up -d --build

down:
	docker compose down

restart:
	docker compose down && docker compose up -d --build

logs:
	docker compose logs -f db

logs-all:
	docker compose logs -f

status:
	docker compose ps

psql:
	@docker exec -it cosmosindexer psql -U $${PG_USER:-cosmos_indexer_user} -d $${PG_DB:-cosmos_indexer_db}

# Usage: make psql-file FILE=path/to/script.sql
psql-file:
	@[ -n "$$FILE" ] || (echo "Usage: make psql-file FILE=path/to/script.sql" && exit 1)
	docker cp $$FILE cosmosindexer:/tmp/run.sql
	docker exec -e PGPASSWORD=$${PG_PASSWORD:-password} cosmosindexer bash -lc "psql -U $${PG_USER:-cosmos_indexer_user} -d $${PG_DB:-cosmos_indexer_db} -f /tmp/run.sql"

clean:
	docker compose down -v
	docker volume prune -f

nuke:
	docker compose down -v
	sudo rm -rf ../indexer-data
	mkdir -p ../indexer-data
	docker volume prune -f
	docker compose up -d --build
