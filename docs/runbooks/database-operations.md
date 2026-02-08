# Database Operations Runbook

> Backup procedures, restore operations, migration management, connection pool tuning, RLS administration, and performance optimization.

## 1. Backup Procedures

### Automated Backups (Azure Managed)

Azure Database for PostgreSQL Flexible Server provides automated backups:

| Setting | Development | Production |
|---|---|---|
| Backup frequency | Daily | Daily + continuous WAL archiving |
| Retention period | 7 days | 35 days |
| Backup type | Full + incremental | Full + incremental |
| Geo-redundancy | Disabled | Enabled (paired region) |
| Point-in-time recovery | Yes (within retention) | Yes (within retention) |

### Verify Backup Status

```bash
# Check backup configuration
az postgres flexible-server show \
  --resource-group rg-procgenie-prod \
  --name psql-procgenie-prod \
  --query backup

# List available restore points
az postgres flexible-server show \
  --resource-group rg-procgenie-prod \
  --name psql-procgenie-prod \
  --query "{earliestRestore:backup.earliestRestoreDate, retention:backup.backupRetentionDays}"
```

### Manual Backup (pg_dump)

For on-demand backups or pre-migration safety:

```bash
# Full database backup
pg_dump \
  -h psql-procgenie-prod.postgres.database.azure.com \
  -U procgenie_admin \
  -d procgenie_prod \
  -F custom \
  -f backup_$(date +%Y%m%d_%H%M%S).dump

# Schema-only backup
pg_dump \
  -h psql-procgenie-prod.postgres.database.azure.com \
  -U procgenie_admin \
  -d procgenie_prod \
  --schema-only \
  -f schema_$(date +%Y%m%d_%H%M%S).sql

# Specific table backup
pg_dump \
  -h psql-procgenie-prod.postgres.database.azure.com \
  -U procgenie_admin \
  -d procgenie_prod \
  -t requisitions -t request_items \
  -F custom \
  -f requisitions_backup.dump

# Tenant-specific backup (using WHERE clause)
pg_dump \
  -h psql-procgenie-prod.postgres.database.azure.com \
  -U procgenie_admin \
  -d procgenie_prod \
  --data-only \
  -t requisitions \
  --where="tenant_id = '<tenant-uuid>'" \
  -f tenant_backup.sql
```

### Backup Verification

Run weekly backup verification:

```bash
# Restore to a test database
createdb procgenie_backup_test
pg_restore -d procgenie_backup_test backup_file.dump

# Verify row counts match production
psql -d procgenie_backup_test -c "
  SELECT 'requisitions' as table_name, count(*) FROM requisitions
  UNION ALL
  SELECT 'vendors', count(*) FROM vendors
  UNION ALL
  SELECT 'contracts', count(*) FROM contracts
  UNION ALL
  SELECT 'audit_events', count(*) FROM audit_events;
"

# Clean up
dropdb procgenie_backup_test
```

## 2. Restore Procedures

### Point-in-Time Restore (Azure)

Restore the database to any point within the retention window:

```bash
# Restore to a new server at a specific point in time
az postgres flexible-server restore \
  --resource-group rg-procgenie-prod \
  --name psql-procgenie-prod-restored \
  --source-server psql-procgenie-prod \
  --restore-time "2026-02-08T12:00:00Z"

# After verification, swap DNS or update connection strings
```

> **Warning:** Point-in-time restore creates a NEW server. You must update application connection strings to point to the restored server.

### Restore from pg_dump

```bash
# Restore full database
pg_restore \
  -h psql-procgenie-prod.postgres.database.azure.com \
  -U procgenie_admin \
  -d procgenie_prod \
  --clean --if-exists \
  backup_file.dump

# Restore specific tables only
pg_restore \
  -h psql-procgenie-prod.postgres.database.azure.com \
  -U procgenie_admin \
  -d procgenie_prod \
  -t requisitions -t request_items \
  --data-only \
  backup_file.dump
```

### Restore Checklist

1. [ ] Notify team via `#incidents` Slack channel
2. [ ] Take a fresh backup of current state before restoring
3. [ ] Stop application traffic (scale API to 0 replicas or enable maintenance mode)
4. [ ] Perform the restore
5. [ ] Verify data integrity (row counts, recent records, RLS policies)
6. [ ] Run any migrations that were applied after the backup point
7. [ ] Resume application traffic
8. [ ] Verify application health endpoints
9. [ ] Monitor for 30 minutes for anomalies
10. [ ] Post restoration confirmation to `#incidents`

## 3. Migration Management

### Migration Workflow

```
Developer creates migration
    │
    ▼
PR with migration reviewed
    │
    ▼
CI runs migration against test database
    │
    ▼
Merge to main → staging auto-deploy
    │
    ▼
Migration runs on staging database
    │
    ▼
QA verification on staging
    │
    ▼
Production deployment (manual trigger)
    │
    ▼
Migration runs on production database
```

### Creating Migrations

```bash
# Generate migration from entity changes
npm run migration:generate --workspace=apps/api -- -n DescriptiveName

# Create empty migration for custom SQL
npm run migration:create --workspace=apps/api -- -n DescriptiveName
```

### Running Migrations

```bash
# Run all pending migrations
npm run db:migrate

# Show migration status
npm run migration:show --workspace=apps/api

# Revert the last migration
npm run migration:revert --workspace=apps/api
```

### Migration Best Practices

| Practice | Description |
|---|---|
| **Backward compatible** | Migrations must be backward-compatible so that old code works during rolling deployment |
| **Additive only** | Prefer adding columns (nullable or with defaults) over dropping or renaming |
| **No data in migrations** | Keep data transformations in separate seed scripts or one-time scripts |
| **Test rollback** | Every migration should have a working `down()` method |
| **Small migrations** | One logical change per migration for easy rollback |
| **Lock timeout** | Set `SET lock_timeout = '10s'` to prevent blocking during DDL changes |

### Multi-Tenant Migration Example

When adding a column to a tenant-isolated table:

```sql
-- Up migration
SET lock_timeout = '10s';

ALTER TABLE requisitions
  ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'standard';

-- Ensure RLS policy still covers the new column (RLS is row-level, not column-level)
-- No changes needed to RLS policies for column additions

-- Down migration
ALTER TABLE requisitions
  DROP COLUMN IF EXISTS priority;
```

### Large Table Migrations

For tables with millions of rows, use `CREATE INDEX CONCURRENTLY`:

```sql
-- This does NOT lock the table
CREATE INDEX CONCURRENTLY idx_requisitions_priority
  ON requisitions (priority)
  WHERE priority IS NOT NULL;
```

## 4. Connection Pool Management

### Connection Pool Configuration

| Setting | Development | Production |
|---|---|---|
| `DB_MAX_CONNECTIONS` | 20 | 100 |
| PostgreSQL `max_connections` | 200 | 800 |
| Connection idle timeout | 10 minutes | 5 minutes |
| Connection lifetime | 30 minutes | 60 minutes |
| Statement timeout | 30 seconds | 15 seconds |

### Monitoring Connections

```sql
-- Current connection count by state
SELECT state, count(*)
FROM pg_stat_activity
GROUP BY state
ORDER BY count DESC;

-- Connections by application
SELECT application_name, count(*)
FROM pg_stat_activity
GROUP BY application_name
ORDER BY count DESC;

-- Long-running queries (> 60 seconds)
SELECT pid, now() - query_start AS duration, query, state
FROM pg_stat_activity
WHERE state = 'active'
  AND now() - query_start > interval '60 seconds'
ORDER BY duration DESC;

-- Waiting queries (blocked by locks)
SELECT pid, now() - query_start AS duration, wait_event_type, wait_event, query
FROM pg_stat_activity
WHERE wait_event IS NOT NULL
  AND state = 'active'
ORDER BY duration DESC;
```

### Troubleshooting Connection Exhaustion

```sql
-- Kill idle connections older than 10 minutes
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
  AND query_start < now() - interval '10 minutes'
  AND pid != pg_backend_pid();

-- Kill a specific long-running query
SELECT pg_cancel_backend(<pid>);    -- Graceful cancel
SELECT pg_terminate_backend(<pid>); -- Force terminate
```

## 5. Row-Level Security Administration

### Viewing RLS Policies

```sql
-- List all RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
ORDER BY tablename;

-- Check if RLS is enabled on a table
SELECT relname, relrowsecurity, relforcerowsecurity
FROM pg_class
WHERE relname IN ('requisitions', 'vendors', 'contracts', 'audit_events');
```

### Creating RLS Policies for New Tables

```sql
-- 1. Enable RLS on the table
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE new_table FORCE ROW LEVEL SECURITY;

-- 2. Create tenant isolation policy
CREATE POLICY tenant_isolation ON new_table
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- 3. Create bypass policy for SuperAdmin (used by migration and admin scripts)
CREATE POLICY superadmin_bypass ON new_table
  FOR ALL
  USING (current_setting('app.is_superadmin', true)::boolean = true);
```

### Testing RLS Policies

```sql
-- Set tenant context (simulates application behavior)
SET app.current_tenant_id = '<tenant-a-uuid>';

-- This should only return Tenant A data
SELECT count(*) FROM requisitions;

-- Switch to Tenant B
SET app.current_tenant_id = '<tenant-b-uuid>';

-- This should only return Tenant B data
SELECT count(*) FROM requisitions;

-- Reset (for admin operations)
RESET app.current_tenant_id;
```

### RLS Performance Considerations

| Consideration | Recommendation |
|---|---|
| Index on `tenant_id` | Always create a composite index starting with `tenant_id` |
| Partition by tenant | For tables > 10M rows, consider range partitioning by `tenant_id` |
| Connection pooling | Each connection must set `app.current_tenant_id` before queries |
| Query plan caching | Prepared statements are safe with RLS (plan is re-evaluated per setting) |

## 6. Performance Tuning

### Key PostgreSQL Parameters

| Parameter | Development | Production | Purpose |
|---|---|---|---|
| `shared_buffers` | 128 MB | 512 MB -- 2 GB | Shared memory for caching |
| `effective_cache_size` | 512 MB | 4 -- 8 GB | Planner's estimate of available cache |
| `work_mem` | 4 MB | 8 -- 16 MB | Per-operation sort/hash memory |
| `maintenance_work_mem` | 64 MB | 256 MB -- 512 MB | Memory for VACUUM, CREATE INDEX |
| `max_connections` | 200 | 400 -- 800 | Maximum concurrent connections |
| `random_page_cost` | 4.0 | 1.1 | Cost estimate for random I/O (SSD) |
| `effective_io_concurrency` | 1 | 200 | Concurrent I/O operations (SSD) |
| `wal_buffers` | -1 (auto) | 16 MB | WAL write buffer |
| `checkpoint_completion_target` | 0.5 | 0.9 | Spread checkpoint I/O |

### Identifying Slow Queries

```sql
-- Enable pg_stat_statements extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Top 10 slowest queries by total time
SELECT
  calls,
  round(total_exec_time::numeric, 2) AS total_ms,
  round(mean_exec_time::numeric, 2) AS mean_ms,
  round(max_exec_time::numeric, 2) AS max_ms,
  rows,
  substring(query, 1, 100) AS query_preview
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;

-- Top 10 most frequently called queries
SELECT
  calls,
  round(mean_exec_time::numeric, 2) AS mean_ms,
  rows,
  substring(query, 1, 100) AS query_preview
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 10;
```

### Index Management

```sql
-- Find missing indexes (tables with sequential scans)
SELECT
  schemaname, relname,
  seq_scan, seq_tup_read,
  idx_scan, idx_tup_fetch,
  n_tup_ins, n_tup_upd, n_tup_del
FROM pg_stat_user_tables
WHERE seq_scan > 1000
ORDER BY seq_tup_read DESC
LIMIT 20;

-- Find unused indexes (candidates for removal)
SELECT
  schemaname, relname, indexrelname,
  idx_scan, idx_tup_read, idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname NOT IN ('pg_catalog', 'pg_toast')
ORDER BY pg_relation_size(indexrelid) DESC;

-- Find duplicate indexes
SELECT
  a.indrelid::regclass AS table_name,
  a.indexrelid::regclass AS index_a,
  b.indexrelid::regclass AS index_b,
  pg_size_pretty(pg_relation_size(a.indexrelid)) AS size_a,
  pg_size_pretty(pg_relation_size(b.indexrelid)) AS size_b
FROM pg_index a
JOIN pg_index b ON a.indrelid = b.indrelid
  AND a.indexrelid != b.indexrelid
  AND a.indkey::text = b.indkey::text;
```

### VACUUM and Maintenance

```sql
-- Check autovacuum status
SELECT
  relname,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze,
  n_dead_tup,
  n_live_tup
FROM pg_stat_user_tables
WHERE n_dead_tup > 10000
ORDER BY n_dead_tup DESC;

-- Manual VACUUM for critical tables (non-blocking)
VACUUM (VERBOSE, ANALYZE) requisitions;
VACUUM (VERBOSE, ANALYZE) audit_events;

-- Full VACUUM (blocking - use during maintenance window only)
VACUUM FULL requisitions;
```

### Table Size Monitoring

```sql
-- Top 20 largest tables
SELECT
  schemaname,
  relname AS table_name,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
  pg_size_pretty(pg_relation_size(relid)) AS table_size,
  pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) AS index_size,
  n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 20;
```

## 7. Emergency Procedures

### Database Failover

```bash
# Check current server state
az postgres flexible-server show \
  -g rg-procgenie-prod \
  -n psql-procgenie-prod \
  --query "{state:state, haEnabled:highAvailability.mode}"

# Force failover to standby
az postgres flexible-server restart \
  -g rg-procgenie-prod \
  -n psql-procgenie-prod \
  --failover Forced
```

### Emergency Read-Only Mode

If the database is experiencing write issues but reads are working:

```sql
-- Set database to read-only mode
ALTER DATABASE procgenie_prod SET default_transaction_read_only = on;

-- Revert when issue is resolved
ALTER DATABASE procgenie_prod SET default_transaction_read_only = off;
```

### Data Corruption Recovery

1. Immediately stop writes to the affected table(s)
2. Identify the scope of corruption
3. Point-in-time restore to before the corruption occurred
4. Compare restored data with current data
5. Selectively restore affected rows
6. Verify data integrity and application functionality
