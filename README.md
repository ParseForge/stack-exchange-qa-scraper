![ParseForge Banner](https://github.com/ParseForge/apify-assets/blob/ad35ccc13ddd068b9d6cba33f323962e39aed5b2/banner.jpg?raw=true)

# 💬 Stack Exchange Q&A Scraper

> 🚀 **Pull questions and answers from Stack Overflow and the Stack Exchange network.** Scores, view counts, owners, body text, accepted answers. No API key required.

> 🕒 **Last updated:** 2026-05-01 · **📊 14 fields** per Q&A · **💬 30+ network sites** · **🧠 24M+ questions on Stack Overflow** · **🆓 public Stack Exchange API**

The **Stack Exchange Q&A Scraper** queries the public Stack Exchange API v2.3 with the `withbody` filter and returns questions plus their answers in a single dataset row. Each record includes the question ID, title, body in HTML and Markdown, tags, score, view count, answer count, accepted-answer flag, owner profile, creation and last-activity timestamps, link, and an embedded `answers[]` array.

Stack Overflow alone hosts 24 million questions and 35 million answers. The Stack Exchange network adds 170+ specialized sites covering math, security, gaming, writing, DevOps, and more. This Actor lets you pull structured Q&A by site, tag, search query, sort, or date range without writing a single API call.

| 🎯 Target Audience | 💡 Primary Use Cases |
|---|---|
| ML engineers, developer relations, technical writers, dev tool builders | Training data builds, support automation, content research, dev intel |

---

## 📋 What the Stack Exchange Q&A Scraper does

Five filtering workflows in a single run:

- 🌐 **Site selector.** Pick from a 30+ enum covering Stack Overflow, Server Fault, Super User, AskUbuntu, math, stats, and more.
- 🏷️ **Tag filter.** Restrict to a specific tag like `python`, `react`, `kubernetes`.
- 🔍 **Search query.** Free-text search switches to `/search/advanced`.
- 📊 **Sort.** Activity, votes, creation, hot, week, or month.
- 📅 **Date range.** ISO `fromDate` and `toDate` map to Unix timestamps.

Each row reports the question ID, title, link, tags, score, view count, answer count, isAnswered flag, owner profile (display name, reputation, user ID, profile image), creation and last-activity timestamps, body Markdown, body HTML, accepted-answer ID, and an `answers[]` array with full answer bodies.

> 💡 **Why it matters:** Stack Exchange Q&A is one of the highest-quality public corpora for technical content. ML engineers train rerankers on it. Dev tool teams build retrieval pipelines from it. Content writers mine it for FAQ inspiration. The official API is unauthenticated up to 300 requests per day per IP, plenty for most workflows.

---

## 🎬 Full Demo

_🚧 Coming soon: a 3-minute walkthrough showing how to go from sign-up to a downloaded dataset._

---

## ⚙️ Input

<table>
<thead>
<tr><th>Input</th><th>Type</th><th>Default</th><th>Behavior</th></tr>
</thead>
<tbody>
<tr><td><code>maxItems</code></td><td>integer</td><td><code>10</code></td><td>Q&A records to return. Free plan caps at 10, paid plan at 1,000,000.</td></tr>
<tr><td><code>site</code></td><td>string</td><td><code>"stackoverflow"</code></td><td>Stack Exchange site slug from a 30+ enum.</td></tr>
<tr><td><code>tag</code></td><td>string</td><td>empty</td><td>Filter by a single tag (e.g. <code>python</code>).</td></tr>
<tr><td><code>searchQuery</code></td><td>string</td><td>empty</td><td>Free-text search; switches to <code>/search/advanced</code>.</td></tr>
<tr><td><code>sort</code></td><td>string</td><td><code>"activity"</code></td><td><code>activity</code>, <code>votes</code>, <code>creation</code>, <code>hot</code>, <code>week</code>, <code>month</code>.</td></tr>
<tr><td><code>fromDate</code></td><td>string</td><td>empty</td><td>ISO date YYYY-MM-DD. Earliest creation date.</td></tr>
<tr><td><code>toDate</code></td><td>string</td><td>empty</td><td>ISO date YYYY-MM-DD. Latest creation date.</td></tr>
<tr><td><code>includeAnswers</code></td><td>boolean</td><td><code>true</code></td><td>When <code>true</code>, fetches answers per question.</td></tr>
</tbody>
</table>

**Example: 100 most active Python questions on Stack Overflow.**

```json
{
    "maxItems": 100,
    "site": "stackoverflow",
    "tag": "python",
    "sort": "votes",
    "includeAnswers": true
}
```

**Example: search for OpenAI questions on the AI Stack Exchange site.**

```json
{
    "maxItems": 50,
    "site": "ai",
    "searchQuery": "openai",
    "fromDate": "2026-01-01"
}
```

> ⚠️ **Good to Know:** anonymous quota is 300 requests per day per IP. With `includeAnswers=true` each question costs 1 + 1 calls so a 100-question run uses 200 quota. For higher volumes, register a Stack App for a 10,000/day quota or rotate proxies.

---

## 📊 Output

Each Q&A record contains **14 fields**. Download as CSV, Excel, JSON, or XML.

### 🧾 Schema

| Field | Type | Example |
|---|---|---|
| 🆔 `questionId` | integer | `79934397` |
| 📰 `title` | string | `"Can a strictly conforming definition of main..."` |
| 🔗 `link` | string | `"https://stackoverflow.com/questions/79934397/..."` |
| 🏷️ `tags` | array | `["c", "language-lawyer"]` |
| 👍 `score` | integer | `12` |
| 👁️ `viewCount` | integer | `1245` |
| 💬 `answerCount` | integer | `3` |
| ✅ `isAnswered` | boolean | `true` |
| 👤 `owner` | object | `{userId, displayName, reputation, userType, profileImage, link}` |
| 📅 `creationDate` | ISO 8601 | `"2026-04-22T14:33:08Z"` |
| 📅 `lastActivityDate` | ISO 8601 | `"2026-04-29T19:11:14Z"` |
| 📝 `bodyMarkdown` | string \| null | Markdown-formatted body |
| 🔠 `body` | string \| null | HTML body |
| 🎯 `acceptedAnswerId` | integer \| null | `79934472` |
| 💡 `answers` | array of objects | see below |
| 🕒 `scrapedAt` | ISO 8601 | `"2026-05-01T01:55:33.000Z"` |

Each answer in `answers` has:
- `answerId`, `isAccepted`, `score`, `creationDate`, `bodyMarkdown`, `owner`

### 📦 Sample records

<details>
<summary><strong>🧠 Language-lawyer C question with multiple tags</strong></summary>

```json
{
    "questionId": 79934397,
    "title": "Can a strictly conforming definition of main have argc and argv const-qualified?",
    "link": "https://stackoverflow.com/questions/79934397/can-a-strictly-conforming-definition-of-main-have-argc-and-argv-const-qualified",
    "tags": ["c", "language-lawyer"],
    "score": 14,
    "viewCount": 1820,
    "answerCount": 3,
    "isAnswered": true
}
```

</details>

<details>
<summary><strong>📚 Highly-voted Python question with accepted answer</strong></summary>

```json
{
    "questionId": 12345678,
    "title": "How do I parse JSON in Python?",
    "link": "https://stackoverflow.com/questions/12345678/...",
    "tags": ["python", "json"],
    "score": 892,
    "viewCount": 124500,
    "answerCount": 22,
    "isAnswered": true,
    "acceptedAnswerId": 12345700,
    "owner": {"userId": 999, "displayName": "Alice", "reputation": 12500}
}
```

</details>

<details>
<summary><strong>🆕 Recent low-view question without answers yet</strong></summary>

```json
{
    "questionId": 87654321,
    "title": "Newcomer question on Kubernetes networking edge case",
    "link": "https://stackoverflow.com/questions/87654321/...",
    "tags": ["kubernetes", "networking"],
    "score": 0,
    "viewCount": 18,
    "answerCount": 0,
    "isAnswered": false,
    "answers": []
}
```

</details>

---

## ✨ Why choose this Actor

| | Capability |
|---|---|
| 🆓 | **No API key.** Reads the public Stack Exchange API. |
| 🌐 | **30+ network sites.** Stack Overflow plus 170+ specialized Stack Exchange sites. |
| 🏷️ | **Tag and search.** Two query modes for narrow or broad sweeps. |
| 💬 | **Answers included.** Each question carries its full answer thread. |
| 📝 | **Markdown body.** Both Markdown and HTML body for downstream NLP. |
| 📅 | **Date range.** From / to filters in clean ISO format. |
| 🚀 | **Sub-15-second runs.** Typical 100-question pulls finish quickly. |

> 📊 In a single 13-second run the Actor returned 100 Stack Overflow questions with full answer threads and 200 quota requests used.

---

## 📈 How it compares to alternatives

| Approach | Cost | Coverage | Refresh | Filters | Setup |
|---|---|---|---|---|---|
| Raw Stack Exchange API calls | Free | Full | Live | Manual | Engineer hours |
| Stack Exchange Data Dump | Free | Full snapshot | Quarterly | None | Self-host parser |
| Paid dev intel platforms | $$$ subscription | Aggregated | Daily | Built-in | Account setup |
| **⭐ Stack Exchange Q&A Scraper** *(this Actor)* | Pay-per-event | Full | Live | Site, tag, search, sort, dates | None |

Same Stack Exchange API official endpoint, exposed as clean structured rows.

---

## 🚀 How to use

1. 🆓 **Create a free Apify account.** [Sign up here](https://console.apify.com/sign-up?fpr=vmoqkp) and get $5 in free credit.
2. 🔍 **Open the Actor.** Search for "Stack Exchange" in the Apify Store.
3. ⚙️ **Set filters.** Site, optional tag or search query, sort, date range.
4. ▶️ **Click Start.** A 100-question run typically completes in 10 to 20 seconds.
5. 📥 **Download.** Export as CSV, Excel, JSON, or XML.

> ⏱️ Total time from sign-up to first dataset: under five minutes.

---

## 💼 Business use cases

<table>
<tr>
<td width="50%">

### 🤖 ML & retrieval
- Build training datasets for code-completion models
- Train rerankers on real Q&A scoring patterns
- Power developer-Q&A retrieval pipelines
- Generate synthetic FAQ data from real questions

</td>
<td width="50%">

### 🛠️ Developer tools
- Mine FAQs to seed product help content
- Track which questions point at your product
- Analyze tag-level demand for new features
- Surface common pain points to ship fixes

</td>
</tr>
<tr>
<td width="50%">

### 📰 Tech writing
- Find proven angles from highly-voted questions
- Cite real questions with stable URLs
- Track topic trends over time
- Build educational content on top of accepted answers

</td>
<td width="50%">

### 👥 Developer relations
- Monitor questions about your tech
- Identify community advocates by activity
- Track competitor-tech question volume
- Build response automations

</td>
</tr>
</table>

---

## 🌟 Beyond business use cases

Data like this powers more than commercial workflows. The same structured records support research, education, civic projects, and personal initiatives.

<table>
<tr>
<td width="50%">

### 🎓 Research and academia
- Empirical datasets for papers, thesis work, and coursework
- Longitudinal studies tracking changes across snapshots
- Reproducible research with cited, versioned data pulls
- Classroom exercises on data analysis and ethical scraping

</td>
<td width="50%">

### 🎨 Personal and creative
- Side projects, portfolio demos, and indie app launches
- Data visualizations, dashboards, and infographics
- Content research for bloggers, YouTubers, and podcasters
- Hobbyist collections and personal trackers

</td>
</tr>
<tr>
<td width="50%">

### 🤝 Non-profit and civic
- Transparency reporting and accountability projects
- Advocacy campaigns backed by public-interest data
- Community-run databases for local issues
- Investigative journalism on public records

</td>
<td width="50%">

### 🧪 Experimentation
- Prototype AI and machine-learning pipelines with real data
- Validate product-market hypotheses before engineering spend
- Train small domain-specific models on niche corpora
- Test dashboard concepts with live input

</td>
</tr>
</table>

---

## 🔌 Automating Stack Exchange Q&A Scraper

Run this Actor on a schedule, from your codebase, or inside another tool:

- **Node.js** SDK: see [Apify JavaScript client](https://docs.apify.com/api/client/js/) for programmatic runs.
- **Python** SDK: see [Apify Python client](https://docs.apify.com/api/client/python/) for the same flow in Python.
- **HTTP API**: see [Apify API docs](https://docs.apify.com/api/v2) for raw REST integration.

Schedule daily runs from the Apify Console to track new questions on a tag. Pipe results into Google Sheets, S3, BigQuery, or your own webhook with the built-in [integrations](https://docs.apify.com/platform/integrations).

---

## ❓ Frequently Asked Questions

<details>
<summary><strong>🌐 Which sites are supported?</strong></summary>

The site enum includes Stack Overflow, Server Fault, Super User, AskUbuntu, Math Stack Exchange, Stats, TeX, English, Software Engineering, Code Review, Database Admins, Security, Unix, Apple, Android, Gaming, Sci-Fi, Writers, Music, Graphic Design, UX, Webmasters, WordPress, Magento, Salesforce, Drupal, AI, Data Science, plus Japanese, Spanish, Russian, and Portuguese Stack Overflow.

</details>

<details>
<summary><strong>🏷️ Can I filter by multiple tags?</strong></summary>

Currently single-tag only. Multi-tag intersection is on the roadmap; for now, use search-query mode with a tag in the query string.

</details>

<details>
<summary><strong>💬 What does includeAnswers do?</strong></summary>

When `true`, after the questions are fetched, the Actor calls `/questions/{id}/answers` for each one and embeds the answer list. Disable to halve API quota usage.

</details>

<details>
<summary><strong>🎯 What is the difference between sort options?</strong></summary>

`activity` orders by last activity date. `votes` orders by score. `creation` orders by date created. `hot`, `week`, `month` are Stack Exchange's algorithmic sorts.

</details>

<details>
<summary><strong>📦 How many records can I pull?</strong></summary>

Free plan caps at 10. Paid plans up to 1,000,000. Anonymous quota is 300 requests per day per IP, so plan total query volume accordingly.

</details>

<details>
<summary><strong>📅 What date format does fromDate accept?</strong></summary>

ISO `YYYY-MM-DD`. The Actor converts to Unix timestamps for the API call.

</details>

<details>
<summary><strong>🔠 What is the difference between body and bodyMarkdown?</strong></summary>

`body` is the raw HTML body of the question. `bodyMarkdown` is the same content in Markdown. Choose based on your downstream pipeline.

</details>

<details>
<summary><strong>💼 Can I use this for commercial work?</strong></summary>

Yes. Stack Exchange content is licensed under Creative Commons Attribution-ShareAlike. Always attribute with a link back to the original question per Stack Exchange's terms.

</details>

<details>
<summary><strong>💳 Do I need a paid Apify plan?</strong></summary>

The free plan returns up to 10 records per run. Paid plans return up to 1,000,000.

</details>

<details>
<summary><strong>⚠️ What if I hit quota?</strong></summary>

The API returns a 429-style response when quota is exhausted. Wait until the next day or switch to a different IP. For higher volumes, register a Stack App key with Stack Exchange for 10,000/day quota.

</details>

<details>
<summary><strong>🔁 How fresh is the data?</strong></summary>

Live. Each run hits the Stack Exchange API at run time.

</details>

<details>
<summary><strong>⚖️ Is this legal?</strong></summary>

Yes. Stack Exchange publishes the API specifically for programmatic access and the content is CC-licensed. Always include attribution per Stack Exchange's terms when republishing.

</details>

---

## 🔌 Integrate with any app

- [**Make**](https://apify.com/integrations/make) - drop run results into 1,800+ apps.
- [**Zapier**](https://apify.com/integrations/zapier) - trigger automations off completed runs.
- [**Slack**](https://apify.com/integrations/slack) - post run summaries to a channel.
- [**Google Sheets**](https://apify.com/integrations/google-sheets) - sync each run into a spreadsheet.
- [**Webhooks**](https://docs.apify.com/platform/integrations/webhooks) - notify your own services on run finish.
- [**Airbyte**](https://apify.com/integrations/airbyte) - load runs into Snowflake, BigQuery, or Postgres.

---

## 🔗 Recommended Actors

- [**🐙 GitHub Trending Repos Scraper**](https://apify.com/parseforge/github-trending-scraper) - track developer attention next to Q&A activity.
- [**🧩 Chrome Web Store Scraper**](https://apify.com/parseforge/chrome-web-store-scraper) - extension data alongside developer Q&A trends.
- [**🅱️ Bing Search Scraper**](https://apify.com/parseforge/bing-search-scraper) - run open-web searches on the technologies you find.
- [**🦆 DuckDuckGo Search Scraper**](https://apify.com/parseforge/duckduckgo-search-scraper) - alternative SERP signal alongside Q&A.
- [**📚 Wikipedia Pageviews Scraper**](https://apify.com/parseforge/wikipedia-pageviews-scraper) - cross-reference tag spikes with public-interest data.

> 💡 **Pro Tip:** browse the complete [ParseForge collection](https://apify.com/parseforge) for more pre-built scrapers and data tools.

---

**🆘 Need Help?** [**Open our contact form**](https://tally.so/r/BzdKgA) and we'll route the question to the right person.

---

> Stack Overflow and Stack Exchange are registered trademarks of Stack Exchange, Inc. This Actor is not affiliated with or endorsed by Stack Exchange. It uses the public Stack Exchange API specifically published for programmatic access. Content is CC-licensed; attribute with a link back per Stack Exchange terms.
