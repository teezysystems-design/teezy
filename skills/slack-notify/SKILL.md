---
name: slack-notify
description: >
  Post Slack notifications to the XERN.CO workspace. Use when sending progress
  updates, blocker alerts, or daily summaries to the appropriate Slack channel.
  Covers all agent channels plus shared channels like #alerts and #daily-summaries.
---

# Slack Notify Skill

Send notifications to the XERN.CO Slack workspace using incoming webhooks.

## Channel Webhook URLs

Webhook URLs are stored in AGENTS.md (agent instructions) and injected as environment variables or fetched from the Paperclip config at runtime. Do not hardcode webhook URLs in skill files.

| Channel | Env Var / Config Key |
|---------|----------------------|
| `#alerts` | `SLACK_WEBHOOK_ALERTS` |
| `#all-xernco` | `SLACK_WEBHOOK_ALL_XERNCO` |
| `#ceo` | `SLACK_WEBHOOK_CEO` |
| `#cto` | `SLACK_WEBHOOK_CTO` |
| `#customer-success` | `SLACK_WEBHOOK_CUSTOMER_SUCCESS` |
| `#daily-summaries` | `SLACK_WEBHOOK_DAILY_SUMMARIES` |
| `#marketing-lead` | `SLACK_WEBHOOK_MARKETING_LEAD` |
| `#product-designer` | `SLACK_WEBHOOK_PRODUCT_DESIGNER` |
| `#qa-engineer` | `SLACK_WEBHOOK_QA_ENGINEER` |

## Sending a Message

Use `curl` to post a message. The payload is JSON with a `text` field (supports Slack mrkdwn).

```bash
curl -s -X POST "<WEBHOOK_URL>" \
  -H "Content-Type: application/json" \
  -d '{"text": "Your message here"}'
```

A successful response is `ok`. Any other response means the webhook failed — do not retry more than once.

## Message Types & When to Send Them

### 1. Progress Update (Hourly)
Post to your **agent-specific channel** AND `#all-xernco`.

Format:
```
⏱️ *[AgentName] Hourly Update* — <date/time>

*In Progress:* <task title> (<issue-id>)
*Status:* <brief description of what you're doing>
*Next:* <what you plan to do next>
```

### 2. Blocker Alert (Immediate — trigger on status=blocked)
Post to your **agent-specific channel** AND `#alerts`.

Format:
```
🚨 *[AgentName] BLOCKED* — <issue-id>

*Task:* <task title>
*Blocked by:* <reason>
*Waiting on:* <person/agent>
*Action needed:* <what the reader should do>
```

### 3. Daily End-of-Day Summary (Once per day, ~5–6 PM local or end of business)
Post to your **agent-specific channel** AND `#daily-summaries`.

Format:
```
📋 *[AgentName] Daily Summary* — <date>

*Completed today:*
• <task> (<issue-id>)

*In Progress:*
• <task> (<issue-id>) — <% done or next step>

*Blocked:*
• <task> (<issue-id>) — <blocker>

*Tomorrow's priority:*
• <task>
```

## Agent → Channel Mapping

| Agent Role | Primary Channel Webhook |
|-----------|------------------------|
| CEO | `#ceo` |
| CTO | `#cto` |
| QA Engineer | `#qa-engineer` |
| Marketing Lead | `#marketing-lead` |
| Product Designer | `#product-designer` |
| Customer Success | `#customer-success` |

## Rules

- **Always use mrkdwn** — bold with `*text*`, code with `` `code` ``.
- **Never include raw secrets** in Slack messages (no API keys, tokens, passwords).
- **Blocker alerts are mandatory** — any time you PATCH an issue to `blocked`, post to `#alerts` before exiting your heartbeat.
- **Keep messages concise** — the owner reads these on their phone.
- **Include issue identifiers** in every message so the owner can look up context.
