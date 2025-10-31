---
layout: default
title: CLI Reference
---

# Command-Line Interface Reference

Complete reference for all LakeXpress command-line arguments.

## Basic Usage

```bash
LakeXpress [OPTIONS]
```

## Global Options

### Help and Version

| Option | Description |
|--------|-------------|
| `-h, --help` | Show help message and exit |
| `--version` | Show program version number and exit |

### License Management

| Option | Type | Description |
|--------|------|-------------|
| `--license TEXT` | String | License text (alternative to license file or environment variable) |
| `--license_file PATH` | Path | Path to license file (alternative to default locations) |

## Authentication

### Required

| Option | Type | Description |
|--------|------|-------------|
| `-a PATH, --auth PATH` | Path | JSON file containing database authentication credentials **(Required)** |
| `--log_db_auth_id LOG_DB_AUTH_ID` | String | Export logging DB identifier in auth file (e.g., `log_db_ms`, `log_db_pg`) **(Required)** |

### Optional

| Option | Type | Description |
|--------|------|-------------|
| `--source_db_auth_id ID` | String | Source DB identifier in auth file (e.g., `ds_03_pg`, `ds_08_oracle`) |
| `--source_db_name NAME` | String | Source database name (e.g., `tpch`, `northwind`) |

## Export Database Management

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--log_db_mode MODE` | Enum | `preserve` | Control export logging database data:<br>• `preserve` - Keep existing data<br>• `truncate` - Clear data, keep schema<br>• `drop` - Recreate from scratch |
| `--init_db` | Flag | `false` | Initialize export database (optional - schema auto-creates on first export) |

**Note:** The export logging database schema is automatically created on the first export if it doesn't exist. The `--init_db` flag is useful for pre-setup verification or deployment automation.

## Schema and Table Selection

### Schema Selection

| Option | Type | Description |
|--------|------|-------------|
| `--source_schema_name PATTERN` | String | Source schema name(s). Options:<br>• Single schema: `public`<br>• Pattern list: `prod_%, dev_%`<br>• All schemas if omitted |

### Table Filtering

| Option | Type | Description |
|--------|------|-------------|
| `-i PATTERN, --include PATTERN` | String | Include tables from SQL patterns (comma-separated)<br>Examples: `"orders%, customer%"` or `"l%"` |
| `-e PATTERN, --exclude PATTERN` | String | Exclude tables from SQL patterns (comma-separated)<br>Examples: `"Z%, temp%"` or `"test%"` |

**Pattern Matching:** Uses SQL `LIKE` syntax where `%` matches any characters and `_` matches single character.

## FastBCP Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--fastbcp_dir_path PATH` | Path | N/A | Directory path where the FastBCP executable is located |
| `-p INT, --fastbcp_p INT` | Integer | `1` | Number of parallel jobs within FastBCP for large table partitioning |
| `--fastbcp_table_config CONFIG` | String | N/A | Table-specific FastBCP configuration (see below) |
| `--large_table_threshold INT` | Integer | `100000` | Row count threshold for parallel export optimization |

### Table-Specific Configuration Format

Format: `table:method:key_column:p[;table:method:key_column:p;...]`

- Use empty fields for defaults (e.g., `::` means default key and p)
- Example: `lineitem:DataDriven:YEAR(l_shipdate):8;orders:Ctid::4`
- Overridden by table-specific configuration in export database `partition_columns` table

**Available Export Methods:**
- `Ctid` - PostgreSQL tuple identifier (PostgreSQL only)
- `Rowid` - Oracle row identifier (Oracle only)
- `Physloc` - SQL Server physical location (SQL Server only)
- `DataDriven` - Custom column-based partitioning
- `RangeId` - Sequential range-based partitioning
- `Modulo` - Modulo-based partitioning

## Parallel Processing

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--n_jobs INT` | Integer | `1` | Number of parallel table export jobs (table-level parallelism) |

**Performance Tuning:**
- `--n_jobs`: Controls how many tables are exported simultaneously
- `--fastbcp_p`: Controls parallelism within large tables
- `--large_table_threshold`: Tables with fewer rows use simple sequential export

**Example:** `--n_jobs 4 --fastbcp_p 2` will export 4 tables simultaneously, each using 2 parallel processes for large tables.

## Resume and Run Management

| Option | Type | Description |
|--------|------|-------------|
| `-r RUN_ID, --resume RUN_ID` | UUID | Resume jobs given a run ID<br>Example: `-r 2f73b4d0-8647-11ef-8089-c403a82a4577` |
| `--run_id RUN_ID` | UUID | Run ID for post-process metadata generation<br>(use with `--generate_metadata` for standalone mode) |

**Resume Workflow:**
1. Find the run ID from the failed export output or export logging database
2. Use `--resume` flag with the run ID to retry failed/incomplete tables
3. All configuration is retrieved from the logged run - no other arguments needed

## CDM Metadata Generation

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--generate_metadata` | Flag | `false` | Generate CDM metadata<br>• In-process mode: include when running export<br>• Post-process mode: add `--run_id` |
| `--include_entity_files` | Flag | `false` | Generate individual entity `.cdm.json` files<br>(for use with `--generate_metadata`) |
| `--manifest_name NAME` | String | Auto | Custom name for `manifestName` field in CDM `manifest.json` files<br>Defaults to schema name (per-schema) or database name (global) |

**CDM Metadata Structure:**
- `manifest.json` - Main manifest file with schema metadata
- Entity files (optional) - Individual `.cdm.json` files per table

## Storage Configuration

### Local Filesystem

| Option | Type | Description |
|--------|------|-------------|
| `--output_dir PATH` | Path | Local directory for filesystem exports<br>**Mutually exclusive with** `--target_storage_id` |

### Cloud Storage

| Option | Type | Description |
|--------|------|-------------|
| `--target_storage_id ID` | String | Target storage ID for cloud exports<br>**Mutually exclusive with** `--output_dir`<br>Examples: `s3_01`, `gcs_01`, `s3_02` |
| `--sub_path SUB_PATH` | String | Optional sub-path between base path and schema directory<br>Example: `staging/temp` creates `base/staging/temp/schema/table/` |

**Important:** You must specify **either** `--output_dir` (local filesystem) **or** `--target_storage_id` (cloud storage). These options are mutually exclusive.

## Logging

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--log_level LEVEL` | Enum | `INFO` | Logging level:<br>• `DEBUG` - Detailed diagnostic information<br>• `INFO` - General informational messages<br>• `WARNING` - Warning messages<br>• `ERROR` - Error messages<br>• `CRITICAL` - Critical error messages |
| `--log_dir PATH` | Path | Current directory | Directory for log files |

## Environment Management

| Option | Type | Description |
|--------|------|-------------|
| `--env_name ENV_NAME` | String | Environment name for configuration isolation |

## Complete Example

Here's a comprehensive example using many options:

### Windows (PowerShell)
```powershell
.\LakeXpress.exe --auth ./credentials.json `
  --log_db_auth_id log_db_postgres `
  --log_db_mode preserve `
  --source_db_auth_id source_oracle `
  --source_db_name prod_db `
  --source_schema_name "sales%, orders%" `
  --include "fact_%, dim_%" `
  --exclude "temp_%, test_%" `
  --fastbcp_dir_path ./FastBCP_win-x64_v0.4.0/ `
  --fastbcp_p 4 `
  --large_table_threshold 500000 `
  --n_jobs 8 `
  --target_storage_id s3_01 `
  --sub_path data-lake/staging `
  --generate_metadata `
  --include_entity_files `
  --manifest_name "Production Sales Data" `
  --log_level INFO `
  --log_dir ./logs
```

### Linux
```bash
./LakeXpress --auth ./credentials.json \
  --log_db_auth_id log_db_postgres \
  --log_db_mode preserve \
  --source_db_auth_id source_oracle \
  --source_db_name prod_db \
  --source_schema_name "sales%, orders%" \
  --include "fact_%, dim_%" \
  --exclude "temp_%, test_%" \
  --fastbcp_dir_path ./FastBCP_linux-x64_v0.4.0/ \
  --fastbcp_p 4 \
  --large_table_threshold 500000 \
  --n_jobs 8 \
  --target_storage_id s3_01 \
  --sub_path data-lake/staging \
  --generate_metadata \
  --include_entity_files \
  --manifest_name "Production Sales Data" \
  --log_level INFO \
  --log_dir ./logs
```

This command will:
- Export from Oracle database using pattern-matched schemas (`sales%`, `orders%`)
- Include only tables matching `fact_%` or `dim_%` patterns
- Exclude tables matching `temp_%` or `test_%` patterns
- Use 8 parallel table exports with 4-way parallelism for large tables
- Export to AWS S3 under `data-lake/staging/` sub-path
- Generate CDM metadata with individual entity files
- Write detailed logs to `./logs` directory

## See Also

- [Quick Start Guide]({{ '/quickstart' | relative_url }}) - Get started quickly
- [Storage Backends]({{ '/storage-backends' | relative_url }}) - Configure cloud storage
- [Database Configuration]({{ '/database-configuration' | relative_url }}) - Setup database connections
- [FastBCP Configuration]({{ '/fastbcp-configuration' | relative_url }}) - Optimize FastBCP performance
- [Command Builder]({{ '/command-builder' | relative_url }}) - Interactive command generator
- [Examples]({{ '/examples' | relative_url }}) - Real-world usage examples
