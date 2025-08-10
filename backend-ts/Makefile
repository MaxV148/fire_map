# Makefile for TypeORM Migrations in NestJS Backend
# Usage: make <target>

.PHONY: help migration-generate migration-run migration-revert migration-show migration-drop build clean install dev start

# Default target
help:
	@echo "🔥 Fire Map Backend-TS - TypeORM Migration Commands"
	@echo ""
	@echo "Available targets:"
	@echo "  help                 - Show this help message"
	@echo ""
	@echo "📦 Setup:"
	@echo "  install             - Install dependencies with yarn"
	@echo "  build               - Build the application"
	@echo "  clean               - Clean build artifacts"
	@echo ""
	@echo "🗄️  Database Migrations:"
	@echo "  migration-generate  - Generate new migration (interactive or NAME=MigrationName)"
	@echo "  migration-run       - Run pending migrations"
	@echo "  migration-revert    - Revert last migration"
	@echo "  migration-show      - Show migration status"
	@echo "  migration-drop      - Drop entire database schema"
	@echo ""
	@echo "🚀 Development:"
	@echo "  dev                 - Start development server"
	@echo "  start               - Start production server"
	@echo ""
	@echo "Examples:"
	@echo "  make migration-generate              # Interactive input"
	@echo "  make migration-generate NAME=AddUserTable  # Direct parameter"
	@echo "  make migration-run"
	@echo "  make migration-revert"

# Installation and setup
install:
	@echo "📦 Installing dependencies..."
	yarn install

build:
	@echo "🏗️  Building application..."
	yarn build

clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf dist/
	rm -rf node_modules/.cache/

# Migration commands
migration-generate:
	@if [ -z "$(NAME)" ]; then \
		echo "🔄 Generating new migration..."; \
		read -p "Enter migration name (e.g., AddUserProfile): " migration_name; \
		if [ -z "$$migration_name" ]; then \
			echo "❌ Error: Migration name cannot be empty"; \
			exit 1; \
		fi; \
		echo "🔄 Generating migration: $$migration_name"; \
		yarn migration:generate src/database/migrations/$$migration_name; \
	else \
		echo "🔄 Generating migration: $(NAME)"; \
		yarn migration:generate src/database/migrations/$(NAME); \
	fi

migration-run:
	@echo "⬆️  Running pending migrations..."
	yarn migration:run

migration-revert:
	@echo "⬇️  Reverting last migration..."
	yarn migration:revert

migration-show:
	@echo "📋 Showing migration status..."
	yarn typeorm migration:show -d src/database/data-source.ts

migration-drop:
	@echo "⚠️  WARNING: This will drop the entire database schema!"
	@read -p "Are you sure? Type 'yes' to continue: " confirm && [ "$$confirm" = "yes" ] || exit 1
	yarn typeorm schema:drop -d src/database/data-source.ts

# Development commands
dev:
	@echo "🚀 Starting development server..."
	yarn start:dev

start:
	@echo "🌟 Starting production server..."
	yarn start:prod

# Database utilities
db-reset: migration-drop migration-run
	@echo "🔄 Database reset complete"

db-fresh: migration-drop migration-run
	@echo "🆕 Fresh database setup complete"

# Quick shortcuts
mg: migration-generate
mr: migration-run
mrev: migration-revert
ms: migration-show

# Environment check
check-env:
	@echo "🔍 Checking environment..."
	@if [ ! -f .env ]; then \
		echo "⚠️  Warning: .env file not found"; \
		echo "Create .env file with database configuration"; \
	else \
		echo "✅ .env file found"; \
	fi
	@echo "Node version: $$(node --version)"
	@echo "Yarn version: $$(yarn --version)"

# Complete setup for new developers
setup: install check-env build
	@echo "🎉 Setup complete! Use 'make dev' to start development"

# Show current migration status and help
status: migration-show
	@echo ""
	@echo "Use 'make help' for available commands"