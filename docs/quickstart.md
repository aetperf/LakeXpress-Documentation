---
layout: default
title: Quick Start Guide
---

# Quick Start Guide

Get up and running with LakeXpress in 5 minutes.

## Prerequisites

1. **LakeXpress Binary**: Download the appropriate binary for your platform:
   - Windows: `LakeXpress.exe`
   - Linux: `LakeXpress`
2. **Database Access**: Ensure you have connection details for source database and export logging database
3. **FastBCP**: Required for data export operations - download FastBCP binaries for your platform:
   - Windows: `FastBCP_win-x64_vX.X.X`
   - Linux: `FastBCP_linux-x64_vX.X.X`
4. **Storage Destination**: Either local directory or cloud storage credentials (AWS S3, GCS)

## Step 1: Create Credentials File

Create a JSON file with your database and storage connection details:

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
  },
  "s3_01": {
    "storage_type": "s3",
    "info": {
      "bucket_name": "my-data-lake",
      "region": "us-east-1",
      "access_key_id": "YOUR_ACCESS_KEY",
      "secret_access_key": "YOUR_SECRET_KEY"
    }
  },
  "gcs_01": {
    "storage_type": "gcs",
    "info": {
      "bucket_name": "my-gcs-bucket",
      "project_id": "my-project",
      "credentials_file": "/path/to/service-account-key.json"
    }
  }
}
```

Save this as `credentials.json` in a secure location.

**Note:** For Oracle databases, the `lib_dir` entry is optional. Thick mode (with lib_dir) is only required for Oracle database versions ≤11.2. Later versions support both thin and thick modes.

## Step 2: Initialize Export Database (Optional)

The export logging database tracks all export runs, jobs, and file metadata. LakeXpress automatically creates the schema on first export, so this step is optional.

### When to Use --init_db

Use `--init_db` for:
- **Pre-setup verification**: Test database connectivity before running exports
- **Administrative tasks**: Initialize schema without running exports
- **Deployment automation**: Separate database setup from export operations

### Windows (PowerShell)
```powershell
.\LakeXpress.exe --auth credentials.json `
  --log_db_auth_id log_db_postgres `
  --init_db
```

### Linux
```bash
./LakeXpress --auth credentials.json \
  --log_db_auth_id log_db_postgres \
  --init_db
```

## Step 3: Run Your First Export

Export a single schema to local filesystem:

### Windows (PowerShell)
```powershell
.\LakeXpress.exe --auth credentials.json `
  --log_db_auth_id log_db_postgres `
  --source_db_auth_id source_postgres `
  --source_schema_name public `
  --fastbcp_dir_path ./FastBCP_win-x64_v0.4.0/ `
  --output_dir ./exports `
  --n_jobs 4 `
  --fastbcp_p 2
```

### Linux
```bash
./LakeXpress --auth credentials.json \
  --log_db_auth_id log_db_postgres \
  --source_db_auth_id source_postgres \
  --source_schema_name public \
  --fastbcp_dir_path ./FastBCP_linux-x64_v0.4.0/ \
  --output_dir ./exports \
  --n_jobs 4 \
  --fastbcp_p 2
```

This command will:
- Export all tables from the `public` schema
- Use 4 parallel table exports (`--n_jobs 4`)
- Use 2 parallel processes per large table (`--fastbcp_p 2`)
- Save Parquet files to `./exports/public/table_name/`

## Step 4: Export to Cloud Storage

Export to AWS S3 with CDM metadata generation:

### Windows (PowerShell)
```powershell
.\LakeXpress.exe --auth credentials.json `
  --log_db_auth_id log_db_postgres `
  --source_db_auth_id source_postgres `
  --source_schema_name public `
  --fastbcp_dir_path ./FastBCP_win-x64_v0.4.0/ `
  --target_storage_id s3_01 `
  --n_jobs 4 `
  --fastbcp_p 2 `
  --generate_metadata `
  --include_entity_files
```

### Linux
```bash
./LakeXpress --auth credentials.json \
  --log_db_auth_id log_db_postgres \
  --source_db_auth_id source_postgres \
  --source_schema_name public \
  --fastbcp_dir_path ./FastBCP_linux-x64_v0.4.0/ \
  --target_storage_id s3_01 \
  --n_jobs 4 \
  --fastbcp_p 2 \
  --generate_metadata \
  --include_entity_files
```

This command will:
- Export to S3 bucket configured in `s3_01`
- Generate Common Data Model (CDM) metadata
- Create individual entity `.cdm.json` files for each table

## Step 5: Filter Tables with Patterns

Export only specific tables using include/exclude patterns:

### Windows (PowerShell)
```powershell
.\LakeXpress.exe --auth credentials.json `
  --log_db_auth_id log_db_postgres `
  --source_db_auth_id source_postgres `
  --source_schema_name public `
  --include "orders%, customer%, product%" `
  --exclude "temp%, test%" `
  --fastbcp_dir_path ./FastBCP_win-x64_v0.4.0/ `
  --output_dir ./exports `
  --n_jobs 4
```

### Linux
```bash
./LakeXpress --auth credentials.json \
  --log_db_auth_id log_db_postgres \
  --source_db_auth_id source_postgres \
  --source_schema_name public \
  --include "orders%, customer%, product%" \
  --exclude "temp%, test%" \
  --fastbcp_dir_path ./FastBCP_linux-x64_v0.4.0/ \
  --output_dir ./exports \
  --n_jobs 4
```

This command will:
- Include tables matching `orders%`, `customer%`, or `product%`
- Exclude tables matching `temp%` or `test%`
- Process the filtered table list

## Step 6: Resume Failed Exports

If an export fails or is interrupted, resume it using the run ID:

### Windows (PowerShell)
```powershell
# The run ID is shown in the export output or can be found in the log database
.\LakeXpress.exe --auth credentials.json `
  --log_db_auth_id log_db_postgres `
  --resume 2f73b4d0-8647-11ef-8089-c403a82a4577
```

### Linux
```bash
# The run ID is shown in the export output or can be found in the log database
./LakeXpress --auth credentials.json \
  --log_db_auth_id log_db_postgres \
  --resume 2f73b4d0-8647-11ef-8089-c403a82a4577
```

## Understanding Export Logging Database Modes

Control how LakeXpress handles existing logging data with `--log_db_mode`:

| Mode | Behavior | Use Case |
|------|----------|----------|
| `preserve` (default) | Keep all existing data | Normal operations, preserve history |
| `truncate` | Clear data, keep schema | Fresh start with clean tables |
| `drop` | Drop and recreate all tables | Complete reset, schema migration |

### Example: Start with clean logging tables

```bash
./LakeXpress --auth credentials.json \
  --log_db_auth_id log_db_postgres \
  --log_db_mode drop \
  --source_db_auth_id source_postgres \
  --source_schema_name public \
  --output_dir ./exports \
  --fastbcp_dir_path ./FastBCP_linux-x64_v0.4.0/
```

## Next Steps

- Explore the [full CLI reference]({{ '/cli-reference' | relative_url }}) for all available options
- Learn about [storage backends]({{ '/storage-backends' | relative_url }}) (S3, GCS, local)
- Configure [database connections]({{ '/database-configuration' | relative_url }}) for all supported databases
- Optimize performance with [FastBCP configuration]({{ '/fastbcp-configuration' | relative_url }})
- Use the [interactive command builder]({{ '/command-builder' | relative_url }}) to generate commands
- Check out [real-world examples]({{ '/examples' | relative_url }}) for common scenarios
