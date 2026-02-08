# Incident Response Runbook

> Severity classification, response procedures, escalation paths, communication templates, and post-incident review process.

## 1. Severity Classification

### Severity Levels

| Severity | Name | Definition | Examples | Response Time | Resolution Target |
|---|---|---|---|---|---|
| **SEV-1** | Critical | Complete platform outage or data breach affecting multiple tenants | Database down, API unresponsive, security breach, data loss | 15 minutes | 1 hour |
| **SEV-2** | Major | Significant feature degradation or single-tenant impact | Workflow engine stuck, AI agents offline, slow response (>5s), single tenant data issue | 30 minutes | 4 hours |
| **SEV-3** | Minor | Limited feature impact, workaround available | Report generation failures, notification delays, UI rendering issues | 2 hours | 24 hours |
| **SEV-4** | Low | Cosmetic issues or minor inconveniences | Typos, minor UI glitches, non-critical log errors | Next business day | 5 business days |

### Severity Decision Matrix

| Impact \ Urgency | Affecting All Users | Affecting Some Users | Affecting One User |
|---|---|---|---|
| **Core Feature Broken** | SEV-1 | SEV-2 | SEV-3 |
| **Feature Degraded** | SEV-2 | SEV-3 | SEV-3 |
| **Minor/Cosmetic** | SEV-3 | SEV-4 | SEV-4 |

## 2. Escalation Paths

### On-Call Rotation

| Role | Responsibility | Contact Method |
|---|---|---|
| Primary On-Call Engineer | First responder; triage, initial investigation | PagerDuty, Slack `#incidents` |
| Secondary On-Call Engineer | Backup if primary unavailable or needs help | PagerDuty (escalation after 10 min) |
| Engineering Lead | Coordinates response for SEV-1 and SEV-2 | PagerDuty, phone |
| VP Engineering | Executive escalation for SEV-1 | Phone, SMS |
| Security Lead | All security-related incidents | PagerDuty, phone |
| Customer Success Lead | Customer communication for SEV-1 | Slack, phone |

### Escalation Timeline

```
Incident Detected
    │
    ▼ (0 min)
Primary On-Call Paged
    │
    ▼ (10 min - no acknowledgment)
Secondary On-Call Paged
    │
    ▼ (15 min - SEV-1 only)
Engineering Lead Notified
    │
    ▼ (30 min - SEV-1 not resolved)
VP Engineering Notified
Customer Success Notified (begin customer comms)
    │
    ▼ (1 hour - SEV-1 not resolved)
CTO/CEO Briefed
External status page updated
```

## 3. Response Procedures

### SEV-1: Critical Incident Response

**Step 1: Acknowledge and Triage (0--5 minutes)**

1. Acknowledge the PagerDuty alert
2. Join the `#incident-active` Slack channel
3. Post initial assessment:
   ```
   INCIDENT: [Brief description]
   SEVERITY: SEV-1
   IMPACT: [Who is affected]
   STATUS: Investigating
   LEAD: [Your name]
   ```
4. Create a Jira incident ticket

**Step 2: Investigate (5--15 minutes)**

1. Check Application Insights for error spikes:
   ```kql
   AppRequests
   | where Success == false
   | where TimeGenerated > ago(15m)
   | summarize count() by ResultCode, OperationName
   | order by count_ desc
   ```

2. Check service health:
   ```bash
   # Container Apps status
   az containerapp show -g rg-procgenie-prod -n ca-procgenie-api \
     --query properties.runningStatus

   # PostgreSQL connectivity
   az postgres flexible-server show -g rg-procgenie-prod \
     -n psql-procgenie-prod --query state

   # Redis health
   az redis show -g rg-procgenie-prod -n redis-procgenie-prod \
     --query provisioningState
   ```

3. Check recent deployments:
   ```bash
   az containerapp revision list -g rg-procgenie-prod \
     -n ca-procgenie-api --query "[0:3].{name:name, created:createdTime}"
   ```

**Step 3: Mitigate (15--30 minutes)**

Based on the root cause, choose the appropriate mitigation:

| Root Cause | Mitigation Action |
|---|---|
| Bad deployment | Rollback to previous revision |
| Database overload | Scale up database tier; kill long-running queries |
| Redis failure | Restart Redis; application falls back to database |
| External dependency | Enable circuit breaker; disable affected feature |
| Security breach | Isolate affected resources; revoke compromised credentials |
| Infrastructure failure | Failover to secondary region (if multi-region) |

**Step 4: Resolve and Verify (30--60 minutes)**

1. Apply the fix
2. Verify health endpoints return 200
3. Verify error rates return to baseline
4. Run smoke tests
5. Monitor for 15 minutes to confirm stability

**Step 5: Communicate**

1. Update status page
2. Notify affected customers
3. Post resolution to `#incident-active`
4. Schedule post-incident review within 48 hours

### SEV-2: Major Incident Response

Follow SEV-1 procedure with these differences:
- 30-minute response window instead of 15
- Engineering Lead notified at 30 minutes instead of 15
- Customer communication only if external impact
- Post-incident review within 5 business days

### SEV-3/SEV-4: Standard Incident Response

1. Acknowledge and create Jira ticket
2. Investigate during normal business hours
3. Apply fix and verify
4. No formal post-incident review required (but document in ticket)

## 4. Common Incident Playbooks

### Playbook: API Unresponsive

```
1. Check Container Apps status:
   az containerapp show -g rg-procgenie-prod -n ca-procgenie-api

2. Check container logs:
   az containerapp logs show -g rg-procgenie-prod -n ca-procgenie-api --tail 100

3. Check if recent deployment caused the issue:
   az containerapp revision list -g rg-procgenie-prod -n ca-procgenie-api

4. If bad deployment, rollback:
   az containerapp ingress traffic set -g rg-procgenie-prod \
     -n ca-procgenie-api --revision-weight <previous-revision>=100

5. If resource exhaustion, scale up:
   az containerapp update -g rg-procgenie-prod -n ca-procgenie-api \
     --min-replicas 4 --max-replicas 20

6. If database connection issue, check PostgreSQL:
   az postgres flexible-server show -g rg-procgenie-prod \
     -n psql-procgenie-prod
```

### Playbook: Database Connection Failures

```
1. Check PostgreSQL server status:
   az postgres flexible-server show -g rg-procgenie-prod -n psql-procgenie-prod

2. Check connection count:
   SELECT count(*) FROM pg_stat_activity;
   SELECT state, count(*) FROM pg_stat_activity GROUP BY state;

3. Kill idle connections if pool exhausted:
   SELECT pg_terminate_backend(pid) FROM pg_stat_activity
   WHERE state = 'idle' AND query_start < now() - interval '10 minutes';

4. If server is down, check for ongoing maintenance:
   az postgres flexible-server show -g rg-procgenie-prod \
     -n psql-procgenie-prod --query maintenanceWindow

5. If failover needed:
   az postgres flexible-server restart -g rg-procgenie-prod \
     -n psql-procgenie-prod --failover Forced
```

### Playbook: Redis Failure

```
1. Check Redis status:
   az redis show -g rg-procgenie-prod -n redis-procgenie-prod

2. Check memory usage:
   az redis show -g rg-procgenie-prod -n redis-procgenie-prod \
     --query "instances[0].usedMemory"

3. If memory exhausted, flush non-critical caches:
   redis-cli -h <host> -a <password> --tls FLUSHDB

4. If Redis is completely down:
   - Application should fall back to database queries
   - Bull queues will retry when Redis recovers
   - Monitor API response times for degradation

5. Restart if needed:
   az redis force-reboot -g rg-procgenie-prod -n redis-procgenie-prod \
     --reboot-type AllNodes
```

### Playbook: Security Breach

```
1. IMMEDIATELY: Do not destroy evidence

2. Isolate affected resources:
   - Revoke compromised API keys/tokens
   - Rotate JWT secrets
   - Block suspicious IP addresses at Front Door WAF

3. Assess scope:
   - Which tenants are affected?
   - What data was accessed?
   - How was access gained?

4. Preserve evidence:
   - Export audit logs for affected timeframe
   - Screenshot/export Application Insights data
   - Preserve container logs

5. Notify Security Lead and VP Engineering immediately

6. If personal data breach (GDPR Article 33):
   - Begin 72-hour notification clock
   - Document affected data subjects
   - Prepare supervisory authority notification

7. Follow data breach notification workflow (see Compliance Guide)
```

## 5. Communication Templates

### Status Page Update (Investigating)

```
Title: Investigating platform performance issues
Status: Investigating
Time: [ISO-8601 timestamp]

We are investigating reports of [degraded performance / errors /
unavailability] affecting [the ProcGenie platform / specific feature].
Our engineering team is actively working to identify and resolve the issue.

We will provide an update within [30 minutes / 1 hour].
```

### Status Page Update (Identified)

```
Title: Platform performance issue identified
Status: Identified
Time: [ISO-8601 timestamp]

We have identified the cause of the [issue description]. The issue is related
to [root cause summary without sensitive details].

We are implementing a fix and expect the service to be restored within
[estimated time].

Affected services: [list affected features]
Workaround: [if available]
```

### Status Page Update (Resolved)

```
Title: Platform performance issue resolved
Status: Resolved
Time: [ISO-8601 timestamp]

The [issue description] has been resolved. All services are operating normally.

Root cause: [brief, non-sensitive description]
Duration: [start time] to [end time] ([total duration])
Impact: [summary of what was affected]

We will conduct a post-incident review and take steps to prevent recurrence.
We apologize for any inconvenience.
```

### Customer Email (SEV-1)

```
Subject: ProcGenie Service Incident - [Date]

Dear [Customer Name],

We are writing to inform you of a service incident that occurred on [date]
from [start time] to [end time] UTC.

What happened:
[Brief description of the issue]

Impact to your organization:
[Specific impact, e.g., "Users were unable to submit purchase requests
during this period"]

Root cause:
[Non-sensitive description]

Actions taken:
- [Immediate fix applied]
- [Preventive measures being implemented]

We sincerely apologize for the disruption. If you have any questions,
please contact your Customer Success Manager or email support@procgenie.io.

Sincerely,
The ProcGenie Engineering Team
```

## 6. Post-Incident Review

### Timeline

| Action | Deadline |
|---|---|
| SEV-1 post-incident review meeting | Within 48 hours |
| SEV-2 post-incident review meeting | Within 5 business days |
| Written post-incident report | Within 5 business days of meeting |
| Action items tracked in Jira | Created during meeting |
| Action items completed | Per assigned deadlines |

### Post-Incident Report Template

```
# Post-Incident Report: [Title]

**Date:** [Incident date]
**Duration:** [Start] to [End] ([total])
**Severity:** SEV-[1/2/3]
**Lead:** [Incident commander name]

## Summary
[2-3 sentence summary of what happened and impact]

## Timeline
- [HH:MM] - [Event]
- [HH:MM] - [Event]
- ...

## Root Cause
[Detailed technical explanation of what caused the incident]

## Impact
- Users affected: [count or percentage]
- Tenants affected: [list]
- Data impact: [none / read-only degradation / write failures]
- Financial impact: [if applicable]

## What Went Well
- [Thing that worked]
- [Thing that worked]

## What Needs Improvement
- [Thing that could be better]
- [Thing that could be better]

## Action Items
| # | Action | Owner | Deadline | Status |
|---|--------|-------|----------|--------|
| 1 | [Action] | [Name] | [Date] | Open |
| 2 | [Action] | [Name] | [Date] | Open |

## Lessons Learned
[Key takeaways for the team]
```

### Blameless Culture

Post-incident reviews follow a **blameless** approach:
- Focus on systems and processes, not individuals
- Ask "what" happened, not "who" caused it
- Identify systemic improvements, not assign blame
- Share learnings across the engineering team
