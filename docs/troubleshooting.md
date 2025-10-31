---
layout: default
title: Troubleshooting Guide
---

# Troubleshooting Guide

Common issues and solutions for LakeXpress.

## Installation and Setup

### FastBCP Not Found

**Problem:** `FastBCP executable not found in specified directory`

**Solution:**
1. Verify FastBCP directory path is correct:
   ```bash
   ls /path/to/fastbcp/FastBCP*
   ```
2. Ensure FastBCP has execute permissions:
   ```bash
   chmod +x /path/to/fastbcp/FastBCP
   ```
3. Check platform matches (Windows .exe vs Linux binary)

### License Issues

**Problem:** `License validation failed` or `License not found`

**Solution:**
- Provide license via command-line: `--license "YOUR_LICENSE_TEXT"`
- Or via file: `--license_file /path/to/license.txt`
- Or via environment variable: `export LAKEXPRESS_LICENSE="YOUR_LICENSE"`
- Check license expiration date
- Verify license format is correct

## Database Connection Issues

### Cannot Connect to Source Database

**Problem:** Connection timeout or authentication errors

**Solution PostgreSQL:**
```bash
# Test connection manually
psql -h hostname -p 5432 -U username -d database

# Check pg_hba.conf allows connections from your IP
# Add to pg_hba.conf:
host    all    all    YOUR_IP/32    md5
```

**Solution Oracle:**
```bash
# Test with sqlplus
sqlplus username/password@hostname:1521/servicename

# For thick mode, verify ORACLE_HOME and LD_LIBRARY_PATH
export LD_LIBRARY_PATH=/opt/oracle/instantclient_19_8:$LD_LIBRARY_PATH
```

**Solution SQL Server:**
```bash
# Test with sqlcmd
sqlcmd -S hostname -U username -P password -d database

# Enable SQL Server authentication (not just Windows auth)
```

### Export Log Database Connection Failed

**Problem:** Cannot create or connect to export logging database

**Solution:**
1. Verify log database exists (or user can create it)
2. Check permissions:
   ```sql
   -- PostgreSQL: User needs CREATE permissions
   GRANT CREATE ON DATABASE lakexpress_log TO user;

   -- SQL Server: User needs dbcreator role or CREATE DATABASE
   ALTER SERVER ROLE dbcreator ADD MEMBER user;
   ```
3. For SQLite: Ensure directory exists and is writable:
   ```bash
   mkdir -p /path/to/db/directory
   chmod 755 /path/to/db/directory
   ```

## Export Errors

### Table Export Failed

**Problem:** Specific tables fail to export

**Check Logs:**
```sql
-- Query export log database
SELECT
    source_table,
    status,
    error_message,
    started_at,
    finished_at
FROM jobs
WHERE status = 'failed'
ORDER BY started_at DESC
LIMIT 10;
```

**Common Causes:**

1. **Unsupported data types:**
   - Check error message for specific type
   - Consider excluding problematic tables
   - Contact support for data type compatibility

2. **Permission denied:**
   ```sql
   -- Grant SELECT on specific table
   GRANT SELECT ON schema.table_name TO user;
   ```

3. **Table locked:**
   - Wait for locks to release
   - Export during maintenance window
   - Use lower parallel degree to reduce contention

### Slow Export Performance

**Problem:** Export takes too long

**Solutions:**

1. **Increase table-level parallelism:**
   ```bash
   --n_jobs 8  # Export more tables simultaneously
   ```

2. **Increase within-table parallelism:**
   ```bash
   --fastbcp_p 4  # More parallel processes per table
   ```

3. **Optimize FastBCP method:**
   ```bash
   # Try different methods for large tables
   --fastbcp_table_config "large_table:DataDriven:YEAR(date_col):8"
   ```

4. **Check network bandwidth:**
   - Cloud exports limited by network speed
   - Consider exporting to local, then uploading separately

5. **Monitor source database:**
   ```sql
   -- PostgreSQL: Check for slow queries
   SELECT * FROM pg_stat_activity WHERE state = 'active';

   -- SQL Server: Check for blocking
   EXEC sp_who2;
   ```

### Memory Errors

**Problem:** Out of memory errors

**Solution:**
- Reduce parallel degree:
  ```bash
  --n_jobs 2 --fastbcp_p 1
  ```
- Increase large table threshold:
  ```bash
  --large_table_threshold 1000000
  ```
- Export smaller batches using table filtering:
  ```bash
  --include "batch1_%, batch2_%"
  ```

## Storage Issues

### AWS S3 Upload Failures

**Problem:** Permission denied or access denied errors

**Check AWS Credentials:**
```bash
# Verify AWS CLI works
aws s3 ls s3://your-bucket --profile your-profile

# Test upload
echo "test" | aws s3 cp - s3://your-bucket/test.txt --profile your-profile
```

**Verify IAM Permissions:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket/*",
        "arn:aws:s3:::your-bucket"
      ]
    }
  ]
}
```

**Check Region:**
- Ensure region in credentials matches bucket region

### GCS Upload Failures

**Problem:** Authentication or permission errors

**Verify Service Account:**
```bash
# Test GCS access
gsutil -i service-account-key.json ls gs://your-bucket

# Check service account has Storage Object Creator role
gcloud projects get-iam-policy YOUR_PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:lakexpress@*"
```

**Verify Credentials File:**
- Ensure `credentials_file` path is absolute
- Check JSON format is valid
- Verify service account is enabled

### Local Filesystem Errors

**Problem:** Permission denied writing to output directory

**Solution:**
```bash
# Check directory permissions
ls -ld /path/to/output_dir

# Fix permissions
chmod 755 /path/to/output_dir
chown your_user:your_group /path/to/output_dir

# Verify disk space
df -h /path/to/output_dir
```

## Resume Issues

### Cannot Resume Export

**Problem:** `Run ID not found` or `Run ID has no failed jobs`

**Solution:**
1. Verify run ID is correct:
   ```sql
   SELECT run_id, started_at, status
   FROM runs
   ORDER BY started_at DESC
   LIMIT 10;
   ```

2. Check if export actually failed:
   ```sql
   SELECT COUNT(*) as failed_jobs
   FROM jobs
   WHERE run_id = 'your-run-id' AND status = 'failed';
   ```

3. If no failed jobs, resume not needed - export completed successfully

## Metadata Generation Issues

### CDM Metadata Not Generated

**Problem:** No manifest.json or entity files created

**Solution:**
1. Ensure `--generate_metadata` flag is used
2. Check export completed successfully (no failed tables)
3. Verify write permissions to output location
4. For post-process mode, ensure `--run_id` is specified:
   ```bash
   LakeXpress -a auth.json --log_db_auth_id log_db \
     --run_id YOUR_RUN_ID --generate_metadata
   ```

## Performance Tuning

### Finding Optimal Settings

**Start Conservative:**
```bash
./LakeXpress ... --n_jobs 2 --fastbcp_p 1
```

**Monitor and Increase:**
```bash
# Check CPU usage
top

# Check database load
# PostgreSQL
SELECT * FROM pg_stat_activity;

# SQL Server
EXEC sp_who2;
```

**Gradually Increase:**
```bash
# Medium load
./LakeXpress ... --n_jobs 4 --fastbcp_p 2

# High load (powerful server)
./LakeXpress ... --n_jobs 8 --fastbcp_p 4
```

### Benchmarking

**Compare Methods:**
```bash
# Test different FastBCP methods
./LakeXpress ... --fastbcp_table_config "table1:Ctid::4" --run_id test1
./LakeXpress ... --fastbcp_table_config "table1:DataDriven:date_col:4" --run_id test2

# Compare times
SELECT run_id, started_at, finished_at,
       finished_at - started_at as duration
FROM runs
WHERE run_id IN ('test1', 'test2');
```

## Logging and Debugging

### Enable Debug Logging

```bash
./LakeXpress ... --log_level DEBUG --log_dir ./logs
```

**Check Log Files:**
```bash
# View latest log
ls -lt ./logs/lakexpress_*.log | head -1 | xargs cat

# Search for errors
grep ERROR ./logs/lakexpress_*.log

# Follow log in real-time
tail -f ./logs/lakexpress_*.log
```

### Export Logging Database Queries

**View All Runs:**
```sql
SELECT run_id, started_at, finished_at, status, error_message
FROM runs
ORDER BY started_at DESC;
```

**View Jobs for Specific Run:**
```sql
SELECT source_schema, source_table, status,
       started_at, finished_at,
       finished_at - started_at as duration,
       row_count, error_message
FROM jobs
WHERE run_id = 'YOUR_RUN_ID'
ORDER BY source_schema, source_table;
```

**Find Slowest Tables:**
```sql
SELECT source_table,
       finished_at - started_at as duration,
       row_count,
       row_count / EXTRACT(EPOCH FROM (finished_at - started_at)) as rows_per_second
FROM jobs
WHERE run_id = 'YOUR_RUN_ID' AND status = 'completed'
ORDER BY duration DESC
LIMIT 10;
```

## Getting Help

### Before Reporting Issues

1. **Check Logs:**
   - Enable DEBUG logging
   - Review log files for detailed error messages

2. **Query Export Database:**
   - Check runs and jobs tables for error details

3. **Verify Configuration:**
   - Test database connections manually
   - Verify storage credentials
   - Check file paths and permissions

### Information to Include

When reporting issues, include:

1. **LakeXpress Version:**
   ```bash
   LakeXpress --version
   ```

2. **Command Used:**
   - Full command line (redact sensitive info)

3. **Error Message:**
   - Complete error message from logs

4. **Environment:**
   - OS and version
   - Database types and versions
   - Storage backend

5. **Log Files:**
   - Relevant log excerpts

## See Also

- [Quick Start Guide]({{ '/quickstart' | relative_url }}) - Getting started
- [CLI Reference]({{ '/cli-reference' | relative_url }}) - All options explained
- [Database Configuration]({{ '/database-configuration' | relative_url }}) - Database setup
- [Storage Backends]({{ '/storage-backends' | relative_url }}) - Storage configuration
- [FastBCP Configuration]({{ '/fastbcp-configuration' | relative_url }}) - Performance tuning
