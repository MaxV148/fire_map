from logging.config import fileConfig
import os
import sys
from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config


# Import settings to get database credentials
from src.conf.model import Settings

settings = Settings()


config.set_main_option(
    "sqlalchemy.url",
    f"postgresql+psycopg://{settings.db_user}:{settings.db_password}@localhost:5432/{settings.db_name}",
)

EXCLUDED_TABLES = {
    "spatial_ref_sys",
    "faces",
    "pagc_lex",
    "state",
    "tiger",
    "pagc_rules",
    "state_lookup",
    "countysub_lookup",
    "zip_state_loc",
    "street_type_lookup",
    "tabblock",
    "topology",
    "tract",
    "bg",
    "geocode_settings",
    "featnames",
    "zcta5",
    "addrfeat",
    "zip_lookup",
    "zip_lookup_all",
    "cousub",
    "tabblock20",
    "county",
    "geocode_settings_default",
    "layer",
    "loader_lookuptables",
    "loader_platform",
    "addr",
    "edges",
    "county_lookup",
    "place_lookup",
    "direction_lookup",
    "loader_variables",
    "place",
    "zip_lookup_base",
    "pagc_gaz",
    "zip_state",
    "secondary_unit_lookup",
}


def include_object(object, name, type_, reflected, compare_to):
    if type_ == "table" and name in EXCLUDED_TABLES:
        return False
    return True


# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
from src.domain.user.model import *
from src.domain.role.model import *
from src.domain.event.model import *
from src.domain.issue.model import *
from src.domain.tag.model import *
from src.domain.vehicletype.model import *
from src.infrastructure.postgresql.db import Base

target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            include_object=include_object,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
