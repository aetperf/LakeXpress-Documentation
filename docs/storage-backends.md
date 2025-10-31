---
layout: default
title: Storage Backends
---

# Storage Backends

LakeXpress supports multiple storage backends for exporting Parquet files to different destinations.

## Overview

LakeXpress requires you to choose between two output destinations:

| Option | Flag | Description |
|--------|------|-------------|
| **Local Filesystem** | `--output_dir` | Export to local directories |
| **Cloud Storage** | `--target_storage_id` | Export to cloud storage (S3, GCS) |

**Important:** You must specify **either** `--output_dir` **or** `--target_storage_id`. These options are mutually exclusive.

## Local Filesystem

Export Parquet files to a local directory.

### Configuration

```bash
./LakeXpress -a auth.json --log_db_auth_id log_db_ms \
        --source_db_auth_id ds_03_pg \
        --output_dir ./exports \
        --fastbcp_dir_path /path/to/fastbcp
```

### Directory Structure

When exporting to local filesystem, LakeXpress creates this structure:

```
output_dir/
└── schema_name/
    └── table_name/
        ├── part-00000.parquet
        ├── part-00001.parquet
        └── ...
```

With `--sub_path` option:

```bash
./LakeXpress --output_dir ./exports --sub_path staging/temp ...
```

Creates:

```
exports/
└── staging/
    └── temp/
        └── schema_name/
            └── table_name/
                ├── part-00000.parquet
                └── ...
```

### Permissions

The user running LakeXpress must have:
- Write permissions to the output directory
- Sufficient disk space for exported data
- Ability to create subdirectories

## S3-Compatible Storage

LakeXpress uses a **unified S3 storage type** for all S3-compatible storage providers. Whether you're using AWS S3, OVH S3, MinIO, Wasabi, or any other S3-compatible storage, you configure them all with `storage_type: "s3"`. Provider differentiation is handled through configuration parameters like `endpoint_url`.

**Supported S3-Compatible Providers:**
- Amazon S3
- OVH S3
- MinIO
- Wasabi
- DigitalOcean Spaces
- Backblaze B2
- Any S3-compatible object storage

### Configuration Methods

LakeXpress supports three configuration methods for S3 storage:

1. **AWS Profile** (recommended for AWS S3)
2. **Direct Credentials with Endpoint** (for non-AWS S3-compatible storage)
3. **Direct Credentials** (simple AWS S3 setup)

---

### Method 1: AWS Profile Configuration (Recommended for AWS)

Use AWS CLI profiles from `~/.aws/config` and `~/.aws/credentials`:

**Credentials JSON:**
```json
{
  "s3_01": {
    "storage_type": "s3",
    "info": {
      "profile": "your-aws-profile",
      "bucket": "your-bucket-name",
      "base_path": "lakexpress/exports",
      "region": "us-east-1"
    }
  }
}
```

**AWS Profile Setup (`~/.aws/config`):**
```ini
[profile your-aws-profile]
region = us-east-1
```

**AWS Credentials (`~/.aws/credentials`):**
```ini
[your-aws-profile]
aws_access_key_id = YOUR_ACCESS_KEY
aws_secret_access_key = YOUR_SECRET_KEY
```

**Configuration Fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `storage_type` | Yes | Must be `"s3"` for all S3-compatible storage |
| `profile` | Yes | AWS profile name from `~/.aws/credentials` |
| `bucket` | Yes | S3 bucket name |
| `base_path` | No | Base path prefix within bucket |
| `region` | Yes | AWS region (e.g., `us-east-1`, `eu-west-1`) |

---

### Method 2: Direct Credentials with Endpoint (S3-Compatible Providers)

For non-AWS S3-compatible storage (OVH, MinIO, etc.), use direct credentials with `endpoint_url`:

**Example: OVH S3**
```json
{
  "s3_02": {
    "storage_type": "s3",
    "info": {
      "bucket": "your-ovh-bucket",
      "base_path": "lakexpress",
      "endpoint_url": "https://s3.gra.io.cloud.ovh.net",
      "region": "gra",
      "aws_access_key_id": "YOUR_OVH_ACCESS_KEY",
      "aws_secret_access_key": "YOUR_OVH_SECRET_KEY"
    }
  }
}
```

**Example: MinIO**
```json
{
  "s3_03": {
    "storage_type": "s3",
    "info": {
      "bucket": "data-lake",
      "endpoint_url": "http://localhost:9000",
      "region": "us-east-1",
      "aws_access_key_id": "minioadmin",
      "aws_secret_access_key": "minioadmin"
    }
  }
}
```

**Configuration Fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `storage_type` | Yes | Must be `"s3"` |
| `bucket` | Yes | S3 bucket name |
| `endpoint_url` | Yes | Custom S3 endpoint URL (provider-specific) |
| `region` | Yes | Region identifier |
| `aws_access_key_id` | Yes | Access key ID |
| `aws_secret_access_key` | Yes | Secret access key |
| `base_path` | No | Base path prefix within bucket |

---

### Method 3: Direct Credentials (Simple AWS S3)

For simple AWS S3 setup without AWS profiles:

```json
{
  "s3_01": {
    "storage_type": "s3",
    "info": {
      "bucket_name": "my-data-lake",
      "region": "us-east-1",
      "access_key_id": "YOUR_ACCESS_KEY",
      "secret_access_key": "YOUR_SECRET_KEY",
      "base_path": "exports"
    }
  }
}
```

---

### Usage Examples

**AWS S3:**
```bash
./LakeXpress -a auth.json --log_db_auth_id log_db_ms \
        --source_db_auth_id ds_03_pg \
        --target_storage_id s3_01 \
        --fastbcp_dir_path /path/to/fastbcp
```

**OVH S3:**
```bash
./LakeXpress -a auth.json --log_db_auth_id log_db_ms \
        --source_db_auth_id ds_03_pg \
        --target_storage_id s3_02 \
        --fastbcp_dir_path /path/to/fastbcp
```

**MinIO:**
```bash
./LakeXpress -a auth.json --log_db_auth_id log_db_ms \
        --source_db_auth_id ds_03_pg \
        --target_storage_id s3_03 \
        --fastbcp_dir_path /path/to/fastbcp
```

### S3 Path Structure

```
s3://bucket-name/base_path/schema_name/table_name/part-00000.parquet
```

With `--sub_path`:

```
s3://bucket-name/base_path/sub_path/schema_name/table_name/part-00000.parquet
```

### Required IAM Permissions (AWS S3)

The AWS IAM user or role must have these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name/*",
        "arn:aws:s3:::your-bucket-name"
      ]
    }
  ]
}
```

### Backward Compatibility

LakeXpress maintains backward compatibility with custom storage types ending in `_s3` (e.g., `minio_s3`, `custom_s3`). However, the recommended approach is to use the unified `storage_type: "s3"` for all S3-compatible storage.

## Google Cloud Storage (GCS)

Export Parquet files directly to Google Cloud Storage buckets.

### Authentication Configuration

```json
{
  "gcs_01": {
    "storage_type": "gcs",
    "info": {
      "bucket": "your-gcs-bucket",
      "base_path": "lakexpress/exports",
      "credentials_file": "/path/to/service-account-key.json"
    }
  }
}
```

### Configuration Fields

| Field | Required | Description |
|-------|----------|-------------|
| `storage_type` | Yes | Must be `"gcs"` |
| `bucket` | Yes | GCS bucket name |
| `base_path` | No | Base path prefix within bucket |
| `credentials_file` | Yes | Path to GCS service account JSON key file |

### Usage Example

```bash
./LakeXpress -a auth.json --log_db_auth_id log_db_ms \
        --source_db_auth_id ds_03_pg \
        --target_storage_id gcs_01 \
        --fastbcp_dir_path /path/to/fastbcp
```

### GCS Path Structure

```
gs://bucket-name/base_path/schema_name/table_name/part-00000.parquet
```

### Service Account Permissions

The GCS service account must have these roles:
- `Storage Object Creator` - To create objects
- `Storage Object Viewer` - To read bucket contents (if needed)

Or custom IAM permissions:
- `storage.objects.create`
- `storage.objects.delete` (if overwriting)
- `storage.buckets.get`

### Creating a Service Account

```bash
# Create service account
gcloud iam service-accounts create lakexpress-export \
    --display-name="LakeXpress Export Service Account"

# Grant permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:lakexpress-export@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.objectCreator"

# Create key file
gcloud iam service-accounts keys create service-account-key.json \
    --iam-account=lakexpress-export@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

## Sub-Path Option

All storage backends support the `--sub_path` option to add an intermediate directory level:

```bash
./LakeXpress --target_storage_id s3_01 --sub_path staging/daily/2025-01-15 ...
```

Creates:
```
s3://bucket/base_path/staging/daily/2025-01-15/schema_name/table_name/*.parquet
```

This is useful for:
- **Date partitioning**: `staging/2025/01/15`
- **Environment separation**: `dev/exports` vs `prod/exports`
- **Project organization**: `project-a/datasets`

## Troubleshooting

### Local Filesystem

**Problem:** Permission denied errors

**Solution:**
- Check directory permissions: `chmod 755 /path/to/output_dir`
- Ensure parent directories exist
- Run with appropriate user permissions

### AWS S3

**Problem:** Access denied or credential errors

**Solution:**
- Verify AWS credentials: `aws s3 ls s3://your-bucket --profile your-profile`
- Check IAM permissions include `s3:PutObject`
- Verify region matches bucket region
- Check bucket policy doesn't block uploads

**Problem:** Slow uploads

**Solution:**
- Use S3 Transfer Acceleration (configure in bucket settings)
- Ensure network bandwidth is sufficient
- Consider using S3 in the same region as your source database

### GCS

**Problem:** Authentication errors

**Solution:**
- Verify service account key file path is correct
- Check service account has `Storage Object Creator` role
- Ensure service account is enabled
- Verify bucket name is correct (no `gs://` prefix)

**Problem:** Quota exceeded

**Solution:**
- Check GCS quotas in Google Cloud Console
- Request quota increase if needed
- Monitor bucket storage limits

### S3-Compatible Storage

**Problem:** Connection errors

**Solution:**
- Verify endpoint URL is correct and accessible
- Check firewall rules allow outbound connections
- Ensure SSL certificates are valid (or use HTTP endpoint for testing)
- Verify credentials format matches provider requirements

## See Also

- [Quick Start Guide]({{ '/quickstart' | relative_url }}) - Getting started
- [CLI Reference]({{ '/cli-reference' | relative_url }}) - Complete option reference
- [Database Configuration]({{ '/database-configuration' | relative_url }}) - Database setup
- [Examples]({{ '/examples' | relative_url }}) - Real-world storage configuration examples
