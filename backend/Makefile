.PHONY: help install run dev migrate autogenerate upgrade downgrade test lint clean docker-up docker-down

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	pip install -r requirements.txt

run: ## Run the application in production mode
	uvicorn app.main:app --host 0.0.0.0 --port 5000

dev: ## Run the application in development mode
	uvicorn app.main:app --reload --port 5000

migrate: ## Generate a new migration
	alembic revision --autogenerate -m "$(MSG)"

upgrade: ## Apply all migrations
	alembic upgrade head

downgrade: ## Downgrade one migration
	alembic downgrade -1

test: ## Run tests (placeholder for future implementation)
	@echo "Tests not implemented yet"

lint: ## Run linting (placeholder for future implementation)
	@echo "Linting not implemented yet"

clean: ## Clean up Python cache files
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete

docker-up: ## Start services with Docker Compose
	docker-compose up -d

docker-down: ## Stop services with Docker Compose
	docker-compose down

docker-logs: ## View Docker Compose logs
	docker-compose logs -f

# Database commands
db-reset: ## Reset database (WARNING: destroys all data)
	alembic downgrade base
	alembic upgrade head

# Development helpers
shell: ## Open Python shell with app context
	python -c "from app.db.session import SessionLocal; from app.models import *; db = SessionLocal(); print('Database session available as \"db\"')"