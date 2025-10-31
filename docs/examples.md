---
layout: default
title: Real-World Examples
---

# Real-World Examples

Practical examples demonstrating common LakeXpress export scenarios.

## Table of Contents

- [PostgreSQL to Local Filesystem](#postgresql-to-local-filesystem)
- [PostgreSQL to S3 Storage](#postgresql-to-aws-s3)
- [PostgreSQL to Google Cloud Storage](#postgresql-to-google-cloud-storage)
- [PostgreSQL to OVH S3](#postgresql-to-ovh-s3-compatible)
- [SQL Server to Local Filesystem](#sql-server-to-local-filesystem)
- [SQL Server to S3 Storage](#sql-server-to-aws-s3)
- [Multi-Schema Export](#multi-schema-export)
- [Table Filtering Examples](#table-filtering-examples)
- [Resume Failed Exports](#resume-failed-exports)

## PostgreSQL to Local Filesystem

Export PostgreSQL database to local directory with CDM metadata.

### Scenario

- **Source**: PostgreSQL TPC-H database
- **Log DB**: SQL Server
- **Destination**: Local filesystem (`/tmp/tpch/`)
- **Options**: 4 parallel tables, 2-way parallelism per table, CDM metadata

### Windows (PowerShell)

```powershell
.\LakeXpress.exe -a .\credentials.json `
  --log_db_auth_id log_db_ms `
  --source_db_auth_id ds_04_pg `
  --source_db_name tpch `
  --source_schema_name tpch_1 `
  --fastbcp_dir_path .\FastBCP_win-x64_v0.4.0\ `
  --fastbcp_p 2 `
  --n_jobs 4 `
  --output_dir C:\exports\tpch\ `
  --generate_metadata `
  --log_db_mode drop
```

### Linux

```bash
./LakeXpress -a credentials.json \
  --log_db_auth_id log_db_ms \
  --source_db_auth_id ds_04_pg \
  --source_db_name tpch \
  --source_schema_name tpch_1 \
  --fastbcp_dir_path ./FastBCP_linux-x64_v0.4.0/ \
  --fastbcp_p 2 \
  --n_jobs 4 \
  --output_dir /tmp/tpch/ \
  --generate_metadata \
  --log_db_mode drop
```

**Result:** Exports all tables from `tpch_1` schema to `/tmp/tpch/tpch_1/` with CDM manifest.

## PostgreSQL to S3 Storage

Export PostgreSQL database directly to Amazon S3.

### Scenario

- **Source**: PostgreSQL TPC-H database
- **Log DB**: SQL Server
- **Destination**: AWS S3 bucket
- **Options**: 4 parallel tables, 2-way parallelism, CDM metadata

### Windows (PowerShell)

```powershell
.\LakeXpress.exe -a .\credentials.json `
  --log_db_auth_id log_db_ms `
  --source_db_auth_id ds_04_pg `
  --source_db_name tpch `
  --source_schema_name tpch_1 `
  --fastbcp_dir_path .\FastBCP_win-x64_v0.4.0\ `
  --fastbcp_p 2 `
  --n_jobs 4 `
  --target_storage_id s3_01 `
  --generate_metadata
```

### Linux

```bash
./LakeXpress -a credentials.json \
  --log_db_auth_id log_db_ms \
  --source_db_auth_id ds_04_pg \
  --source_db_name tpch \
  --source_schema_name tpch_1 \
  --fastbcp_dir_path ./FastBCP_linux-x64_v0.4.0/ \
  --fastbcp_p 2 \
  --n_jobs 4 \
  --target_storage_id s3_01 \
  --generate_metadata
```

**Result:** Uploads Parquet files to `s3://your-bucket/base_path/tpch_1/` with CDM metadata.

## PostgreSQL to Google Cloud Storage

Export PostgreSQL database to Google Cloud Storage bucket.

### Scenario

- **Source**: PostgreSQL TPC-H database
- **Log DB**: SQL Server
- **Destination**: Google Cloud Storage
- **Options**: Multi-schema export with pattern matching

### Windows (PowerShell)

```powershell
.\LakeXpress.exe -a .\credentials.json `
  --log_db_auth_id log_db_ms `
  --source_db_auth_id ds_04_pg `
  --source_db_name tpch `
  --source_schema_name tpch_1% `
  --fastbcp_dir_path .\FastBCP_win-x64_v0.4.0\ `
  --fastbcp_p 2 `
  --n_jobs 4 `
  --target_storage_id gcs_01 `
  --generate_metadata
```

### Linux

```bash
./LakeXpress -a credentials.json \
  --log_db_auth_id log_db_ms \
  --source_db_auth_id ds_04_pg \
  --source_db_name tpch \
  --source_schema_name tpch_1% \
  --fastbcp_dir_path ./FastBCP_linux-x64_v0.4.0/ \
  --fastbcp_p 2 \
  --n_jobs 4 \
  --target_storage_id gcs_01 \
  --generate_metadata
```

**Result:** Exports all schemas matching `tpch_1%` pattern to GCS.

## PostgreSQL to S3 Storage (OVH)

Export to OVH S3-compatible object storage.

### Scenario

- **Source**: PostgreSQL TPC-H database
- **Log DB**: SQL Server
- **Destination**: OVH S3-compatible storage
- **Options**: S3-compatible with custom endpoint

### Linux

```bash
./LakeXpress -a credentials.json \
  --log_db_auth_id log_db_ms \
  --source_db_auth_id ds_04_pg \
  --source_db_name tpch \
  --source_schema_name tpch_1 \
  --fastbcp_dir_path ./FastBCP_linux-x64_v0.4.0/ \
  --fastbcp_p 2 \
  --n_jobs 4 \
  --target_storage_id s3_02 \
  --generate_metadata
```

**Credentials file (credentials.json):**

```json
{
  "s3_02": {
    "storage_type": "s3",
    "info": {
      "bucket": "my-ovh-bucket",
      "endpoint_url": "https://s3.gra.io.cloud.ovh.net",
      "region": "gra",
      "aws_access_key_id": "YOUR_OVH_ACCESS_KEY",
      "aws_secret_access_key": "YOUR_OVH_SECRET_KEY"
    }
  }
}
```

## SQL Server to Local Filesystem

Export SQL Server database to local directory.

### Scenario 1: AdventureWorksDW

- **Source**: SQL Server AdventureWorksDW
- **Log DB**: PostgreSQL
- **Destination**: Local filesystem
- **Schema**: dbo

### Linux

```bash
./LakeXpress -a credentials.json \
  --log_db_auth_id log_db_pg \
  --source_db_auth_id ds_10_ms \
  --source_db_name adventureworksdw \
  --source_schema_name dbo \
  --fastbcp_dir_path ./FastBCP_linux-x64_v0.4.0/ \
  --fastbcp_p 2 \
  --n_jobs 4 \
  --output_dir /tmp/tpch/ \
  --generate_metadata
```

### Scenario 2: AdventureWorks with Sub-Path

Export to a specific sub-directory using `--sub_path`:

```bash
./LakeXpress -a credentials.json \
  --log_db_auth_id log_db_pg \
  --source_db_auth_id ds_11_ms \
  --source_db_name adventureworks2019 \
  --fastbcp_dir_path ./FastBCP_linux-x64_v0.4.0/ \
  --fastbcp_p 2 \
  --n_jobs 4 \
  --output_dir /tmp/ \
  --sub_path adventureworks2019 \
  --generate_metadata
```

**Result:** Creates `/tmp/adventureworks2019/schema/table/` structure.

## SQL Server to S3 Storage

Export SQL Server database to Amazon S3 with custom sub-path.

### Scenario

- **Source**: SQL Server AdventureWorksDW
- **Log DB**: PostgreSQL
- **Destination**: AWS S3 with custom sub-path
- **Options**: Organized by database name

### Linux

```bash
./LakeXpress -a credentials.json \
  --log_db_auth_id log_db_pg \
  --source_db_auth_id ds_10_ms \
  --source_db_name adventureworksdw \
  --source_schema_name dbo \
  --fastbcp_dir_path ./FastBCP_linux-x64_v0.4.0/ \
  --fastbcp_p 2 \
  --n_jobs 4 \
  --target_storage_id s3_01 \
  --sub_path adventureworksdw \
  --generate_metadata
```

**Result:** Uploads to `s3://bucket/base_path/adventureworksdw/dbo/table/`.

## Multi-Schema Export

Export multiple schemas using pattern matching.

### Scenario

- **Source**: PostgreSQL with multiple TPC-H schemas
- **Pattern**: All schemas matching `tpch_1%`
- **Destination**: AWS S3 with custom sub-path

### Linux

```bash
./LakeXpress -a credentials.json \
  --log_db_auth_id log_db_ms \
  --source_db_auth_id ds_04_pg \
  --source_db_name tpch \
  --source_schema_name tpch_1% \
  --fastbcp_dir_path ./FastBCP_linux-x64_v0.4.0/ \
  --fastbcp_p 2 \
  --n_jobs 4 \
  --target_storage_id s3_01 \
  --sub_path titi/tata \
  --generate_metadata
```

**Matches:**
- `tpch_1`
- `tpch_10`
- `tpch_100`
- Any schema starting with `tpch_1`

**Result:** Each schema exported to separate directories under `s3://bucket/base/titi/tata/schema_name/`.

## Table Filtering Examples

### Include Specific Table Patterns

Export only fact and dimension tables:

```bash
./LakeXpress -a credentials.json \
  --log_db_auth_id log_db_postgres \
  --source_db_auth_id source_postgres \
  --source_schema_name public \
  --include "fact_%, dim_%" \
  --fastbcp_dir_path ./FastBCP_linux-x64_v0.4.0/ \
  --output_dir ./exports \
  --n_jobs 4
```

**Includes:** `fact_sales`, `fact_orders`, `dim_customer`, `dim_product`, etc.

### Exclude Temporary and Test Tables

Export all tables except temporary and test tables:

```bash
./LakeXpress -a credentials.json \
  --log_db_auth_id log_db_postgres \
  --source_db_auth_id source_postgres \
  --source_schema_name public \
  --exclude "temp_%, test_%, staging_%" \
  --fastbcp_dir_path ./FastBCP_linux-x64_v0.4.0/ \
  --output_dir ./exports \
  --n_jobs 4
```

**Excludes:** `temp_data`, `test_results`, `staging_import`, etc.

### Combine Include and Exclude

Export specific tables while excluding test versions:

```bash
./LakeXpress -a credentials.json \
  --log_db_auth_id log_db_postgres \
  --source_db_auth_id source_postgres \
  --source_schema_name analytics \
  --include "report_%, dashboard_%" \
  --exclude "%_test, %_backup" \
  --fastbcp_dir_path ./FastBCP_linux-x64_v0.4.0/ \
  --output_dir ./exports \
  --n_jobs 4
```

**Includes:** `report_sales`, `dashboard_kpi`
**Excludes:** `report_sales_test`, `dashboard_kpi_backup`

## Resume Failed Exports

Resume an export that failed or was interrupted.

### Step 1: Note the Run ID

When an export starts, note the run ID from the output:

```
2025-10-31 10:15:23 | INFO | Starting export run: 2f73b4d0-8647-11ef-8089-c403a82a4577
```

### Step 2: Resume the Export

### Windows (PowerShell)

```powershell
.\LakeXpress.exe -a .\credentials.json `
  --log_db_auth_id log_db_postgres `
  --resume 2f73b4d0-8647-11ef-8089-c403a82a4577
```

### Linux

```bash
./LakeXpress -a credentials.json \
  --log_db_auth_id log_db_postgres \
  --resume 2f73b4d0-8647-11ef-8089-c403a82a4577
```

**Result:** LakeXpress will:
- Load the original run configuration
- Skip successfully completed tables
- Retry failed tables
- Continue from where it stopped

### Query Failed Tables

Find which tables failed in a run:

```sql
-- Query the export logging database
SELECT
    source_schema,
    source_table,
    status,
    error_message,
    started_at,
    finished_at
FROM jobs
WHERE run_id = '2f73b4d0-8647-11ef-8089-c403a82a4577'
  AND status = 'failed'
ORDER BY source_schema, source_table;
```

## Advanced Examples

### Custom FastBCP Configuration

Export with table-specific FastBCP settings:

```bash
./LakeXpress -a credentials.json \
  --log_db_auth_id log_db_postgres \
  --source_db_auth_id source_postgres \
  --source_schema_name tpch \
  --fastbcp_dir_path ./FastBCP_linux-x64_v0.4.0/ \
  --fastbcp_table_config "lineitem:DataDriven:YEAR(l_shipdate):8;orders:Ctid::4;customer:RangeId:c_custkey:2" \
  --n_jobs 4 \
  --output_dir ./exports
```

**Configuration:**
- `lineitem`: DataDriven method, 8-way parallelism, partitioned by year
- `orders`: Ctid method, 4-way parallelism
- `customer`: RangeId method, 2-way parallelism, partitioned by customer key

### Export with Debug Logging

Enable debug logging for troubleshooting:

```bash
./LakeXpress -a credentials.json \
  --log_db_auth_id log_db_postgres \
  --source_db_auth_id source_postgres \
  --source_schema_name public \
  --fastbcp_dir_path ./FastBCP_linux-x64_v0.4.0/ \
  --output_dir ./exports \
  --log_level DEBUG \
  --log_dir ./logs \
  --n_jobs 2
```

### Generate CDM Metadata Only (Post-Process)

Generate metadata for an existing export run:

```bash
./LakeXpress -a credentials.json \
  --log_db_auth_id log_db_postgres \
  --run_id 2f73b4d0-8647-11ef-8089-c403a82a4577 \
  --generate_metadata \
  --include_entity_files \
  --manifest_name "Production Analytics Export"
```

## See Also

- [Quick Start Guide]({{ '/quickstart' | relative_url }}) - Getting started
- [CLI Reference]({{ '/cli-reference' | relative_url }}) - All command-line options
- [Storage Backends]({{ '/storage-backends' | relative_url }}) - Storage configuration
- [FastBCP Configuration]({{ '/fastbcp-configuration' | relative_url }}) - Performance tuning
- [Troubleshooting]({{ '/troubleshooting' | relative_url }}) - Common issues
