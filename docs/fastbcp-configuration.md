---
layout: default
title: FastBCP Configuration
---

# FastBCP Configuration

LakeXpress uses FastBCP for high-performance data export. This page explains how to configure FastBCP for optimal performance.

## Overview

FastBCP provides multiple export methods to handle different table sizes and database types efficiently. LakeXpress allows you to control these methods on a per-table basis.

## Configuration Approaches

### 1. Auto-Detection (Default)

LakeXpress automatically selects the best export method based on:
- Table size
- Database type
- Available database features

**No configuration needed** - this works well for most use cases.

### 2. Database Table Configuration (Production)

Store table-specific settings in the export logging database's `partition_columns` table.

**Best for:**
- Production environments
- Persistent configuration
- Multiple export runs
- Team collaboration

### 3. CLI Configuration (Development/Testing)

Use `--fastbcp_table_config` command-line parameter for quick testing.

**Best for:**
- Development and testing
- One-off exports
- Experimentation
- Quick prototyping

## Available Export Methods

### Methods Without Key Column

These methods don't require specifying a distribution key column:

| Method | Database | Description | Best For |
|--------|----------|-------------|----------|
| **None** | All | Sequential export (no parallelism) | Small tables (< 100K rows) |
| **Ctid** | PostgreSQL | PostgreSQL tuple ID-based parallel export | Medium to large PostgreSQL tables |
| **Rowid** | Oracle | Oracle row ID-based parallel export | Medium to large Oracle tables |
| **Physloc** | SQL Server | Physical location-based parallel export | Medium to large SQL Server tables |

### Methods With Key Column

These methods require specifying a distribution key column:

| Method | Description | Key Column Requirements | Best For |
|--------|-------------|------------------------|----------|
| **Random** | Distributes using integer/bigint column values | Integer or bigint column | Tables with sequential IDs |
| **DataDriven** | Splits based on distinct column values | Column with distinct values | Tables partitioned by year, region, etc. |
| **RangeId** | Uses column min/max for range partitioning | Numeric or date column with good distribution | Large tables with sortable columns |
| **Ntile** | Leverages column values for even distribution | Numeric column | Tables requiring even distribution |

## Production: Database Configuration

### Creating Table Configuration

Insert configuration into the `partition_columns` table:

```sql
-- Configure FastBCP method for specific table
INSERT INTO partition_columns (
    source_db_type,
    source_database,
    source_schema,
    source_table,
    fastbcp_method,
    fastbcp_parallel_degree,
    fastbcp_distribution_key,
    env_name
) VALUES (
    'postgres',           -- Database type: postgres, oracle, mssql
    'tpch',              -- Database name
    'tpch_1',            -- Schema name
    'lineitem',          -- Table name
    'DataDriven',        -- FastBCP method
    8,                   -- Parallel degree (--fastbcp_p equivalent)
    'YEAR(l_shipdate)',  -- Distribution key column/expression
    'production'         -- Environment name (optional)
);
```

### Examples

#### PostgreSQL - Ctid Method (No Key Column)

```sql
INSERT INTO partition_columns (
    source_db_type, source_database, source_schema, source_table,
    fastbcp_method, fastbcp_parallel_degree, fastbcp_distribution_key
) VALUES (
    'postgres', 'analytics', 'public', 'events',
    'Ctid', 4, NULL
);
```

#### Oracle - DataDriven Method

```sql
INSERT INTO partition_columns (
    source_db_type, source_database, source_schema, source_table,
    fastbcp_method, fastbcp_parallel_degree, fastbcp_distribution_key
) VALUES (
    'oracle', 'PRODDB', 'SALES', 'TRANSACTIONS',
    'DataDriven', 8, 'YEAR(TRANSACTION_DATE)'
);
```

#### SQL Server - Physloc Method

```sql
INSERT INTO partition_columns (
    source_db_type, source_database, source_schema, source_table,
    fastbcp_method, fastbcp_parallel_degree, fastbcp_distribution_key
) VALUES (
    'mssql', 'SalesDB', 'dbo', 'Orders',
    'Physloc', 4, NULL
);
```

#### RangeId Method with Numeric Column

```sql
INSERT INTO partition_columns (
    source_db_type, source_database, source_schema, source_table,
    fastbcp_method, fastbcp_parallel_degree, fastbcp_distribution_key
) VALUES (
    'postgres', 'ecommerce', 'public', 'customer',
    'RangeId', 2, 'c_custkey'
);
```

## Development/Testing: CLI Configuration

### Format

```
--fastbcp_table_config "table:method:key_column:parallel_degree"
```

- Use **empty fields** for defaults: `::` means default key and parallel degree
- Separate multiple tables with **semicolons**

### Single Table Example

```bash
./LakeXpress -a auth.json --log_db_auth_id log_db \
        --source_db_auth_id source_pg \
        --source_schema_name tpch_1 \
        --fastbcp_table_config "lineitem:DataDriven:YEAR(l_shipdate):8" \
        --output_dir ./exports \
        --fastbcp_dir_path /opt/fastbcp
```

### Multiple Tables Example

```bash
./LakeXpress -a auth.json --log_db_auth_id log_db \
        --source_db_auth_id source_pg \
        --source_schema_name tpch_1 \
        --fastbcp_table_config "lineitem:DataDriven:YEAR(l_shipdate):8;orders:Ctid::4;customer:RangeId:c_custkey:2" \
        --output_dir ./exports \
        --fastbcp_dir_path /opt/fastbcp
```

This configures:
- `lineitem`: DataDriven method, partition by YEAR(l_shipdate), 8 parallel processes
- `orders`: Ctid method, no key column, 4 parallel processes
- `customer`: RangeId method, partition by c_custkey, 2 parallel processes

### Using Defaults

```bash
# Use default parallel degree (from --fastbcp_p or 1)
--fastbcp_table_config "orders:Ctid::"

# Use default method and parallel degree (auto-detection)
--fastbcp_table_config "orders:::"
```

## Configuration Priority

LakeXpress uses this priority order (highest to lowest):

1. **partition_columns table** - Database configuration (production)
2. **--fastbcp_table_config** - CLI configuration (testing)
3. **Auto-detection** - Automatic method selection

**Important:** Database table configuration always overrides CLI configuration.

## Performance Tuning

### Parallel Degree (`--fastbcp_p`)

Controls parallelism within large tables:

```bash
--fastbcp_p 4  # Export large tables using 4 parallel processes
```

**Guidelines:**
- **Small tables** (< 100K rows): Use 1 (default)
- **Medium tables** (100K - 10M rows): Use 2-4
- **Large tables** (> 10M rows): Use 4-8
- **Very large tables** (> 100M rows): Use 8-16

**Considerations:**
- More isn't always better - test with your workload
- Consider available CPU cores
- Monitor source database load
- Network bandwidth limits

### Large Table Threshold

```bash
--large_table_threshold 500000  # Tables with < 500K rows use sequential export
```

Default: 100,000 rows

Tables below this threshold use simple sequential export (no partitioning overhead).

### Table-Level Parallelism (`--n_jobs`)

Controls how many tables export simultaneously:

```bash
--n_jobs 8  # Export 8 tables in parallel
```

**Optimal Settings:**
```bash
# Balanced configuration for medium server
--n_jobs 4 --fastbcp_p 2

# High-performance configuration for large server
--n_jobs 8 --fastbcp_p 4

# Conservative configuration
--n_jobs 2 --fastbcp_p 1
```

## Method Selection Guide

### PostgreSQL Tables

**Small tables** (< 100K rows):
```sql
fastbcp_method = 'None'
```

**Medium to large tables**:
```sql
fastbcp_method = 'Ctid'
fastbcp_parallel_degree = 4
```

**Tables with good distribution column**:
```sql
fastbcp_method = 'DataDriven'
fastbcp_distribution_key = 'YEAR(created_date)'
fastbcp_parallel_degree = 8
```

### Oracle Tables

**Requires SELECT_CATALOG_ROLE** for optimal Rowid-based exports.

**Small tables**:
```sql
fastbcp_method = 'None'
```

**Medium to large tables with SELECT_CATALOG_ROLE**:
```sql
fastbcp_method = 'Rowid'
fastbcp_parallel_degree = 4
```

**Tables without SELECT_CATALOG_ROLE or with distribution column**:
```sql
fastbcp_method = 'DataDriven'
fastbcp_distribution_key = 'EXTRACT(YEAR FROM ORDER_DATE)'
fastbcp_parallel_degree = 8
```

### SQL Server Tables

**Small tables**:
```sql
fastbcp_method = 'None'
```

**Medium to large tables**:
```sql
fastbcp_method = 'Physloc'
fastbcp_parallel_degree = 4
```

**Tables with good distribution column**:
```sql
fastbcp_method = 'DataDriven'
fastbcp_distribution_key = 'YEAR(OrderDate)'
fastbcp_parallel_degree = 8
```

## Distribution Key Examples

### Good Distribution Keys

**Year-based partitioning:**
```sql
-- PostgreSQL
'YEAR(created_date)'
'EXTRACT(YEAR FROM order_date)'

-- Oracle
'EXTRACT(YEAR FROM ORDER_DATE)'
'TO_CHAR(CREATE_DATE, ''YYYY'')'

-- SQL Server
'YEAR(OrderDate)'
'DATEPART(YEAR, CreatedDate)'
```

**Region/Category partitioning:**
```sql
'region_id'
'category'
'department_code'
```

**Numeric range partitioning:**
```sql
'customer_id'
'order_id'
'account_number'
```

### Poor Distribution Keys

**Avoid:**
- **Boolean columns** - Only 2 values (TRUE/FALSE)
- **Low cardinality columns** - Few distinct values
- **Highly skewed columns** - Most rows have same value
- **NULL-heavy columns** - Many NULL values

## Monitoring and Troubleshooting

### Check Export Performance

Query the export logging database:

```sql
-- View job execution times
SELECT
    source_table,
    status,
    started_at,
    finished_at,
    finished_at - started_at AS duration,
    row_count
FROM jobs
WHERE run_id = 'your-run-id'
ORDER BY duration DESC;
```

### Identify Slow Tables

```sql
-- Find tables that took longest
SELECT
    source_table,
    finished_at - started_at AS duration,
    row_count,
    row_count / EXTRACT(EPOCH FROM (finished_at - started_at)) AS rows_per_second
FROM jobs
WHERE run_id = 'your-run-id' AND status = 'completed'
ORDER BY duration DESC
LIMIT 10;
```

### Optimize Slow Tables

If a table is slow:

1. **Increase parallel degree**: Try higher `--fastbcp_p`
2. **Change method**: Test different FastBCP methods
3. **Check distribution key**: Ensure good cardinality and distribution
4. **Monitor source DB**: Check for locks, slow queries, resource constraints

## Complete Example

```bash
# Export with optimized FastBCP settings
./LakeXpress -a auth.json \
  --log_db_auth_id log_db_postgres \
  --source_db_auth_id source_postgres \
  --source_schema_name public \
  --fastbcp_dir_path ./FastBCP_linux-x64_v0.4.0/ \
  --n_jobs 8 \
  --fastbcp_p 4 \
  --large_table_threshold 500000 \
  --fastbcp_table_config "huge_table:DataDriven:YEAR(created):16;medium_table:Ctid::4" \
  --output_dir ./exports
```

This configuration:
- Exports 8 tables simultaneously (`--n_jobs 8`)
- Uses 4-way parallelism for large tables (`--fastbcp_p 4`)
- Tables under 500K rows use sequential export
- `huge_table`: DataDriven with 16-way parallelism
- `medium_table`: Ctid with 4-way parallelism
- Other tables use auto-detection

## See Also

- [CLI Reference]({{ '/cli-reference' | relative_url }}) - FastBCP command-line options
- [Database Configuration]({{ '/database-configuration' | relative_url }}) - Required database permissions
- [Examples]({{ '/examples' | relative_url }}) - Real-world FastBCP configurations
- [Troubleshooting]({{ '/troubleshooting' | relative_url }}) - Performance issues
