.PHONY: help upgrade downgrade autogenerate history current init-db clean-db

# Makefile für Alembic Database Migrations

# Shell explizit auf bash setzen für source-Befehl
SHELL := /bin/bash

# Virtuelle Umgebung aktivieren
VENV = .venv/bin/activate

help: ## Zeigt diese Hilfe an
	@echo "Verfügbare Alembic-Befehle:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

upgrade: ## Führt alle ausstehenden Migrationen aus (upgrade head)
	@echo "🚀 Führe Datenbank-Upgrade aus..."
	@source $(VENV) && alembic upgrade head
	@echo "✅ Datenbank-Upgrade abgeschlossen!"

downgrade: ## Führt eine Migration zurück (downgrade -1)
	@echo "⬇️  Führe Datenbank-Downgrade aus..."
	@source $(VENV) && alembic downgrade -1
	@echo "✅ Datenbank-Downgrade abgeschlossen!"

downgrade-base: ## Führt alle Migrationen zurück (downgrade base)
	@echo "⚠️  ACHTUNG: Alle Migrationen werden zurückgeführt!"
	@read -p "Sind Sie sicher? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	@source $(VENV) && alembic downgrade base
	@echo "✅ Datenbank auf Basis zurückgesetzt!"

autogenerate: ## Erstellt eine neue Migration basierend auf Modelländerungen
	@echo "📝 Erstelle neue Migration..."
	@read -p "Migration Name: " name; \
	source $(VENV) && alembic revision --autogenerate -m "$$name"
	@echo "✅ Migration erstellt!"

revision: ## Erstellt eine leere Migration-Datei
	@echo "📝 Erstelle leere Migration..."
	@read -p "Migration Name: " name; \
	source $(VENV) && alembic revision -m "$$name"
	@echo "✅ Leere Migration erstellt!"

history: ## Zeigt die Migration-Historie an
	@echo "📚 Migration-Historie:"
	@source $(VENV) && alembic history --verbose

current: ## Zeigt die aktuelle Migration-Version an
	@echo "📍 Aktuelle Migration-Version:"
	@source $(VENV) && alembic current --verbose

stamp: ## Markiert die Datenbank mit einer bestimmten Migration-Version (ohne Ausführung)
	@echo "🏷️  Datenbank-Version markieren..."
	@read -p "Migration-Version (head für neueste): " version; \
	source $(VENV) && alembic stamp "$$version"
	@echo "✅ Datenbank-Version markiert!"

check: ## Überprüft, ob Migrationen ausstehen
	@echo "🔍 Überprüfe ausstehende Migrationen..."
	@source $(VENV) && alembic current
	@echo "📋 Verfügbare Migrationen:"
	@source $(VENV) && alembic heads

init-db: ## Initialisiert die Datenbank (upgrade head)
	@echo "🏗️  Initialisiere Datenbank..."
	@source $(VENV) && alembic upgrade head
	@echo "✅ Datenbank initialisiert!"

# Entwickler-Befehle
dev-reset: ## Setzt die Entwicklungsdatenbank komplett zurück (VORSICHT!)
	@echo "⚠️  WARNUNG: Dies löscht alle Daten in der Entwicklungsdatenbank!"
	@read -p "Sind Sie ABSOLUT sicher? Geben Sie 'RESET' ein: " confirm && [ "$$confirm" = "RESET" ] || exit 1
	@source $(VENV) && alembic downgrade base
	@source $(VENV) && alembic upgrade head
	@echo "✅ Entwicklungsdatenbank zurückgesetzt!"

show-sql: ## Zeigt SQL für Upgrade ohne Ausführung (dry-run)
	@echo "📄 SQL für Upgrade (ohne Ausführung):"
	@source $(VENV) && alembic upgrade head --sql

show-downgrade-sql: ## Zeigt SQL für Downgrade ohne Ausführung (dry-run)
	@echo "📄 SQL für Downgrade (ohne Ausführung):"
	@source $(VENV) && alembic downgrade -1 --sql 