---
layout: default
title: LakeXpress - Fast Database-to-Parquet Export Tool
---

## What is LakeXpress?

LakeXpress is a command-line tool designed to efficiently export database tables to partitioned Parquet files with multi-cloud object storage support. Whether you're building a data lake, creating analytical datasets, or archiving production data, LakeXpress handles parallel exports, schema discovery, and multi-cloud storage to make large-scale data exports both reliable and efficient. Built on top of [FastBCP](https://www.arpe.io/fastbcp/?v=82a9e4d26595), it combines intelligent partitioning with high-performance parallel data transfer for maximum throughput.

## Key Features

- **Cross-Platform**: Runs on both Windows and Linux with native binaries
- **Multi-Database Support**: Export from Oracle, PostgreSQL, and SQL Server to Parquet format
- **Multi-Cloud Storage**: Direct export to AWS S3, Google Cloud Storage, or local filesystem
- **Dual-Level Parallelism**: Table-level parallelism (multiple tables simultaneously) and within-table parallelism (FastBCP partitioning) for maximum speed
- **Smart Schema Discovery**: Pattern-based schema and table filtering with include/exclude support
- **Resume Capability**: Resume failed or interrupted exports from where they stopped
- **CDM Metadata**: Generate Common Data Model metadata for data lake integration
- **Export Tracking**: Comprehensive logging database tracks all runs, jobs, and file metadata

## Quick Example

### Windows (PowerShell)
```powershell
.\LakeXpress.exe --auth ./credentials.json `
  --log_db_auth_id postgres_log `
  --source_db_auth_id postgres_prod `
  --source_schema_name public `
  --include "orders%, customer%" `
  --fastbcp_dir_path ./FastBCP_win-x64_v0.4.0/ `
  --target_storage_id aws_s3_01 `
  --n_jobs 4 `
  --fastbcp_p 2 `
  --generate_metadata
```

### Linux
```bash
./LakeXpress --auth ./credentials.json \
  --log_db_auth_id postgres_log \
  --source_db_auth_id postgres_prod \
  --source_schema_name public \
  --include "orders%, customer%" \
  --fastbcp_dir_path ./FastBCP_linux-x64_v0.4.0/ \
  --target_storage_id aws_s3_01 \
  --n_jobs 4 \
  --fastbcp_p 2 \
  --generate_metadata
```

## Supported Databases

| Database Type | As Source | As Log Database |
|---------------|-----------|-----------------|
| SQL Server | ✅ Supported | ✅ Supported |
| PostgreSQL | ✅ Supported | ✅ Supported |
| Oracle | ✅ Supported | ❌ Not Supported |
| SQLite | ❌ Not Supported | ✅ Supported |

## Supported Storage Backends

| Storage Backend | Support Status |
|----------------|----------------|
| **Local Filesystem** | ✅ Supported |
| **AWS S3** | ✅ Supported |
| **S3-Compatible (OVH, MinIO, etc.)** | ✅ Supported |
| **Google Cloud Storage (GCS)** | ✅ Supported |

## Getting Started

1. **Download the Binary**: Get the latest LakeXpress binary for your platform
2. **Download FastBCP**: Required for data export operations (platform-specific)
3. **Prepare Credentials**: Create a JSON file with your database and storage credentials
4. **Run Your First Export**: Follow our [Quick Start Guide]({{ '/quickstart' | relative_url }})

## Why LakeXpress?

### Speed
- **Optimized for Enterprise**: Designed for large servers with high network bandwidth and fast storage
- **Table-Level Parallelism**: Process multiple tables simultaneously using `--n_jobs` parameter
- **Within-Table Parallelism**: FastBCP partitions large tables for parallel data transfer using `--fastbcp_p`
- **Smart Optimization**: Automatically selects best export method based on table size and characteristics

### Reliability
- **Table-Level Processing**: Each table is processed independently - if one fails, others continue
- **Comprehensive Logging**: Detailed export logs track success/failure status for each table in a dedicated database
- **Resume Capability**: Resume failed exports with `--resume` flag using run ID
- **Graceful Error Handling**: Failed tables are logged with reasons and can be retried

### Flexibility
- **Multi-Schema Export**: Export single, multiple, or pattern-matched schemas in one command
- **Table Filtering**: Include/exclude tables using SQL patterns
- **Storage Options**: Export to local filesystem or any major cloud provider
- **CDM Metadata**: Generate Common Data Model metadata for data catalog integration
- **Custom Configuration**: Table-specific FastBCP configuration for optimal performance

## Data Export with FastBCP

The data export step uses **FastBCP**, a highly optimized tool that implements **streaming data export**. This streaming approach means:

- **No Memory Saturation**: Data flows directly from source to Parquet files without being stored in memory
- **Continuous Flow**: Records are read, transformed, and written in a continuous stream
- **Scalable Performance**: Can handle tables of any size without memory constraints
- **Highly Optimized**: Written in C# for maximum performance and efficiency
- **Smart Partitioning**: Multiple export methods (Ctid, Rowid, Physloc, DataDriven, RangeId) for different scenarios

This streaming architecture ensures that even massive tables (billions of rows) can be exported reliably without overwhelming system resources. The `--fastbcp_p` parameter allows you to partition large tables for parallel streaming, multiplying throughput while maintaining the memory-efficient streaming approach.

## Next Steps

<div class="card">
<div class="card-header">Ready to export?</div>
<a href="{{ '/quickstart' | relative_url }}" class="btn btn-primary">Get Started</a>
<a href="{{ '/command-builder' | relative_url }}" class="btn btn-secondary">Build Your Command</a>
</div>
