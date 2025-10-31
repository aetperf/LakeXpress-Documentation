---
layout: default
title: Database Configuration
---

# Database Configuration

LakeXpress supports multiple database types as sources and for export logging.

## Supported Databases

### Source Databases

| Database | Support Status | Notes |
|----------|----------------|-------|
| **PostgreSQL** | ✅ Supported | Full support with Ctid-based parallel export |
| **Oracle** | ✅ Supported | Supports thin and thick modes, Rowid-based parallel export |
| **SQL Server** | ✅ Supported | Physloc-based parallel export |

### Log Databases

| Database | Support Status | Notes |
|----------|----------------|-------|
| **PostgreSQL** | ✅ Supported | Recommended for production |
| **SQL Server** | ✅ Supported | Full support |
| **SQLite** | ✅ Supported | Lightweight option for single-user scenarios |

## Authentication File Format

Create a JSON file containing your database credentials:

```json
{
  "log_db_postgres": {
    "ds_type": "postgres",
    "auth_mode": "classic",
    "info": {
      "username": "postgres",
      "password": "your_password",
      "server": "localhost",
      "port": 5432,
      "database": "lakexpress_log"
    }
  },
  "source_oracle": {
    "ds_type": "oracle",
    "auth_mode": "classic",
    "info": {
      "username": "oracle_user",
      "password": "oracle_password",
      "server": "oracle-server.com",
      "port": 1521,
      "database": "orclpdb1",
      "lib_dir": "/opt/oracle/instantclient_19_8"
    }
  },
  "source_postgres": {
    "ds_type": "postgres",
    "auth_mode": "classic",
    "info": {
      "username": "postgres",
      "password": "your_password",
      "server": "localhost",
      "port": 5432,
      "database": "production_db"
    }
  },
  "source_mssql": {
    "ds_type": "mssql",
    "auth_mode": "classic",
    "info": {
      "username": "sa",
      "password": "mssql_password",
      "server": "mssql-server.com",
      "port": 1433,
      "database": "sales_db"
    }
  },
  "log_db_sqlite": {
    "ds_type": "sqlite",
    "auth_mode": "filesystem",
    "info": {
      "filepath": "/path/to/lakexpress_log.sqlite"
    }
  }
}
```

## PostgreSQL Configuration

### Connection Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `ds_type` | Yes | Must be `"postgres"` |
| `auth_mode` | Yes | Must be `"classic"` |
| `username` | Yes | PostgreSQL username |
| `password` | Yes | PostgreSQL password |
| `server` | Yes | Server hostname or IP |
| `port` | Yes | Port number (default: 5432) |
| `database` | Yes | Database name |

### Required Permissions

```sql
-- Source database user needs:
GRANT SELECT ON ALL TABLES IN SCHEMA public TO lakexpress_user;
GRANT USAGE ON SCHEMA public TO lakexpress_user;

-- For information_schema access (automatic)
-- User can read information_schema by default
```

### Example

```json
{
  "postgres_prod": {
    "ds_type": "postgres",
    "auth_mode": "classic",
    "info": {
      "username": "dataexport",
      "password": "SecureP@ssw0rd",
      "server": "pg-prod.company.com",
      "port": 5432,
      "database": "analytics"
    }
  }
}
```

## Oracle Configuration

### Connection Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `ds_type` | Yes | Must be `"oracle"` |
| `auth_mode` | Yes | Must be `"classic"` |
| `username` | Yes | Oracle username |
| `password` | Yes | Oracle password |
| `server` | Yes | Server hostname or IP |
| `port` | Yes | Port number (default: 1521) |
| `database` | Yes | Service name or SID |
| `lib_dir` | No | Client library directory (for thick mode) |

### Thin vs Thick Mode

**Thin Mode (Recommended):**
- No client libraries required
- Works with Oracle 12.1 and later
- Omit the `lib_dir` parameter

**Thick Mode:**
- Required for Oracle 11.2 and earlier
- Requires Oracle Instant Client
- Specify `lib_dir` pointing to Instant Client directory

### Required Permissions

For optimal FastBCP performance with parallel RowID-based exports:

```sql
-- Connect as Oracle DBA (e.g., sys as sysdba)
GRANT SELECT_CATALOG_ROLE TO your_username;
```

This role provides access to:
- Table and column metadata discovery
- RowID range partitioning for parallel exports
- Optimal export method selection

### Example: Thin Mode

```json
{
  "oracle_prod": {
    "ds_type": "oracle",
    "auth_mode": "classic",
    "info": {
      "username": "EXPORT_USER",
      "password": "OracleP@ss",
      "server": "oracle-prod.company.com",
      "port": 1521,
      "database": "PRODPDB"
    }
  }
}
```

### Example: Thick Mode

```json
{
  "oracle_legacy": {
    "ds_type": "oracle",
    "auth_mode": "classic",
    "info": {
      "username": "LEGACY_USER",
      "password": "OracleP@ss",
      "server": "oracle-11g.company.com",
      "port": 1521,
      "database": "LEGACY",
      "lib_dir": "/opt/oracle/instantclient_19_8"
    }
  }
}
```

## SQL Server Configuration

### Connection Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `ds_type` | Yes | Must be `"mssql"` |
| `auth_mode` | Yes | Must be `"classic"` |
| `username` | Yes | SQL Server username |
| `password` | Yes | SQL Server password |
| `server` | Yes | Server hostname or IP |
| `port` | Yes | Port number (default: 1433) |
| `database` | Yes | Database name |

### Required Permissions

```sql
-- Source database user needs:
GRANT SELECT ON SCHEMA::dbo TO lakexpress_user;
GRANT VIEW DEFINITION ON SCHEMA::dbo TO lakexpress_user;

-- For INFORMATION_SCHEMA access (automatic)
-- User has access to INFORMATION_SCHEMA by default
```

### Example

```json
{
  "mssql_prod": {
    "ds_type": "mssql",
    "auth_mode": "classic",
    "info": {
      "username": "sa",
      "password": "StrongP@ssw0rd",
      "server": "mssql-prod.company.com",
      "port": 1433,
      "database": "SalesDB"
    }
  }
}
```

## SQLite Configuration (Log Database Only)

SQLite can only be used as a log database, not as a source database.

### Connection Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `ds_type` | Yes | Must be `"sqlite"` |
| `auth_mode` | Yes | Must be `"filesystem"` |
| `filepath` | Yes | Path to SQLite database file |

### Example

```json
{
  "log_db_local": {
    "ds_type": "sqlite",
    "auth_mode": "filesystem",
    "info": {
      "filepath": "/var/lib/lakexpress/export_log.sqlite"
    }
  }
}
```

### When to Use SQLite

**Use SQLite for:**
- Single-user scenarios
- Development and testing
- Simple deployment without database server

**Avoid SQLite for:**
- Multi-user environments
- Production deployments with high concurrency
- Distributed systems

## Connection String Examples

### Using the Auth File

```bash
# PostgreSQL source, PostgreSQL log
./LakeXpress -a auth.json \
  --log_db_auth_id log_db_postgres \
  --source_db_auth_id source_postgres

# Oracle source, SQL Server log
./LakeXpress -a auth.json \
  --log_db_auth_id log_db_mssql \
  --source_db_auth_id source_oracle

# SQL Server source, SQLite log
./LakeXpress -a auth.json \
  --log_db_auth_id log_db_sqlite \
  --source_db_auth_id source_mssql
```

## Troubleshooting

### PostgreSQL

**Problem:** Connection refused

**Solution:**
- Check PostgreSQL is running: `systemctl status postgresql`
- Verify `pg_hba.conf` allows connections from your IP
- Check firewall rules: `sudo ufw allow 5432/tcp`

**Problem:** Authentication failed

**Solution:**
- Verify username and password
- Check password encryption method in `pg_hba.conf`
- Ensure user exists: `SELECT * FROM pg_user WHERE usename='your_user';`

### Oracle

**Problem:** ORA-12154: TNS:could not resolve the connect identifier

**Solution:**
- Verify service name is correct
- Check `tnsnames.ora` configuration
- Use IP address instead of hostname
- Ensure Oracle listener is running

**Problem:** ORA-28000: the account is locked

**Solution:**
```sql
-- Unlock user account
ALTER USER your_username ACCOUNT UNLOCK;
```

**Problem:** Thick mode library not found

**Solution:**
- Verify `lib_dir` path is correct
- Check Oracle Instant Client is installed
- Ensure library files have correct permissions
- Set `LD_LIBRARY_PATH` environment variable (Linux)

### SQL Server

**Problem:** Login failed for user

**Solution:**
- Verify SQL Server authentication is enabled (not Windows-only)
- Check user exists and has correct permissions
- Verify password is correct
- Check if user is allowed to connect from your IP

**Problem:** Cannot open database requested by the login

**Solution:**
- Verify database name is correct
- Check user has access to the database
- Ensure database is online: `SELECT state_desc FROM sys.databases WHERE name='YourDB'`

### SQLite

**Problem:** Unable to open database file

**Solution:**
- Check file path is correct
- Verify directory exists and has write permissions
- Ensure filepath is absolute, not relative
- Check disk space is available

## Security Best Practices

### 1. Credential Storage

- **Never commit** credentials to version control
- Store `auth.json` in secure location with restricted permissions:
  ```bash
  chmod 600 auth.json
  ```
- Use environment-specific auth files (dev, staging, prod)

### 2. Least Privilege

- Create dedicated database users for LakeXpress
- Grant only necessary permissions (SELECT on source, full on log DB)
- Use read-only credentials for source databases

### 3. Network Security

- Use SSL/TLS connections when possible
- Restrict database access by IP address
- Use VPN or private networks for database connections

### 4. Password Management

- Use strong passwords (minimum 12 characters, mixed case, numbers, symbols)
- Rotate passwords regularly
- Consider using secret management tools (AWS Secrets Manager, HashiCorp Vault)

## See Also

- [Quick Start Guide]({{ '/quickstart' | relative_url }}) - Getting started
- [CLI Reference]({{ '/cli-reference' | relative_url }}) - Command-line options
- [Storage Backends]({{ '/storage-backends' | relative_url }}) - Storage configuration
- [Troubleshooting]({{ '/troubleshooting' | relative_url }}) - Common issues and solutions
