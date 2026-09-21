# Keepalive setup (stop the free project from pausing)

Supabase pauses a free project after 7 days of low activity. The rule is not
"zero requests for 7 days": the docs ask for
[sufficient user database activity](https://supabase.com/docs/guides/platform/free-project-pausing),
and say that "typically a few user requests to the database each day" is enough.
One Shortcut entry per work day sits at or below that line, so the project can
pause even while it is in daily use.

The fix is an external cron that calls the database every hour. It has to come
from outside Supabase: a `pg_cron` job inside the database is not documented to
count, and it stops with the project anyway, so it can never wake it back up.

## What the migration adds

`supabase/migrations/20260921120000_keepalive_ping.sql` adds two functions,
both `SECURITY DEFINER` with `execute` granted to `anon` (per ADR-0007, `anon`
never gets direct table access):

| Function | Called | Returns | Purpose |
|---|---|---|---|
| `keepalive_ping()` | hourly | always `200` | Reads `entries` and `api_tokens` so the call counts as user activity |
| `shortcut_watchdog()` | daily | `200`, or `400` when nothing has been written for 5 days | Turns a silently broken Shortcut into an email |

They are separate on purpose. The watchdog is the one allowed to fail, so a
stale-data alert can never interfere with the call that keeps the project up.

Why two cron jobs instead of one with a response check: none of the free cron
services assert on the response body. cron-job.org has no such feature on any
tier, and UptimeRobot's keyword monitoring is free but its custom headers are
not, so it cannot send the `apikey` header at all. Putting the alert in the HTTP
status is what makes a free service enough.

## Apply the migration

```bash
supabase db push
```

## Set up the cron

[cron-job.org](https://cron-job.org) is free, needs no card, allows custom
headers and a POST body, goes down to 1 minute, and emails on failure and on
recovery. Create an account, then add **two** jobs.

Both jobs need the same three headers. The anon key is the one in
`.env.local` as `NEXT_PUBLIC_SUPABASE_ANON_KEY` (it is already public, it ships
in the browser bundle, so putting it in cron-job.org exposes nothing new):

```
apikey:        <NEXT_PUBLIC_SUPABASE_ANON_KEY>
Authorization: Bearer <NEXT_PUBLIC_SUPABASE_ANON_KEY>
Content-Type:  application/json
```

### Job 1, keepalive

- URL: `https://epvhzadzgxbchttvyfds.supabase.co/rest/v1/rpc/keepalive_ping`
- Method: `POST`, body `{}`
- Schedule: every hour, at a minute that is not `0` (say `:17`), so it does not
  land in the busiest slot
- Notifications: on failure, and on recovery
- Turn on **Save responses** so you can read what happened

A failure here means the project is unreachable, which is the thing you want to
hear about immediately.

### Job 2, watchdog

- URL: `https://epvhzadzgxbchttvyfds.supabase.co/rest/v1/rpc/shortcut_watchdog`
- Method: `POST`, body `{}`
- Schedule: once a day
- Notifications: on failure, and on recovery
- Turn on **Save responses**

A failure here means nothing has been written for 5 days, so either the Shortcut
broke or the truck is closed. The saved response says which, and how long:

```json
{"code":"P0001","message":"nothing written in the last 5 days ({\"status\": \"stale\", \"hours_since_write\": 144, \"hours_since_shortcut\": 144})"}
```

Five days survives a long weekend plus a Monday holiday without crying wolf. To
change it, edit `keepalive_stale_after()` in the migration.

## Check it by hand

```bash
curl -s -X POST "https://epvhzadzgxbchttvyfds.supabase.co/rest/v1/rpc/keepalive_ping" \
  -H "apikey: $ANON" -H "Authorization: Bearer $ANON" \
  -H 'Content-Type: application/json' -d '{}'
```

```json
{"status": "alive", "hours_since_write": 3, "hours_since_shortcut": 3, "checked_at": "..."}
```

`hours_since_shortcut` is the useful one. It comes from `api_tokens.last_used_at`,
which only moves when `create_entry_via_token` succeeds, so it is direct evidence
that the Shortcut is still reaching the database.

## What not to bother with

- **A plain `GET /rest/v1/entries` as the ping.** `anon` has no grant on the
  table, so it fails before it reaches RLS. A monitor watching only the status
  code then sits green forever while doing nothing. This is the most common way
  these keepalives silently fail.
- **A `/auth/v1/health` or Edge Function ping.** Neither touches Postgres, and
  one reported project was paused while serving 20 Edge Function calls an hour.
- **A Storage object plus an uptime monitor.** Storage egress is CDN cached, so
  a cache hit may never reach the database. Reports on whether this works are
  split.
- **GitHub Actions.** It would work, but this repo is public, and GitHub
  disables scheduled workflows in public repos after 60 days with no commits.
  It would quietly die and take the keepalive with it.

## If it still pauses

Supabase sends a warning email about a week before. If one arrives while both
cron jobs are green, the hourly rate is not the problem and the next step is a
support ticket rather than a faster cron. Paid plans never pause, but there is
no cheap tier: Pro is the entry point at $25/mo.

A paused project can be restored from the dashboard for up to 1 year (raised
from 90 days in July 2026), and restore keeps data and configuration. There are
a few unresolved reports of pause backups coming back stale or empty, so a
periodic `pg_dump` of your own is worth keeping regardless.
