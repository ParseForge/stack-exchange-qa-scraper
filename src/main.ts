import { Actor, log } from 'apify';
import c from 'chalk';

interface Input {
    maxItems?: number;
    site?: string;
    tag?: string;
    searchQuery?: string;
    sort?: string;
    fromDate?: string;
    toDate?: string;
    includeAnswers?: boolean;
}

const STARTUP = ['💬 Pulling Stack Exchange Q&A…', '🧠 Crawling developer answers…', '📚 Reading the latest questions…'];
const DONE = ['🎉 Q&A delivered.', '✅ Stack Exchange data ready.', '🚀 Knowledge captured.'];
const pick = (arr: string[]): string => arr[Math.floor(Math.random() * arr.length)] ?? arr[0]!;

await Actor.init();
const input = (await Actor.getInput<Input>()) ?? {};
const userIsPaying = Boolean(Actor.getEnv()?.userIsPaying);
const isPayPerEvent = Actor.getChargingManager().getPricingInfo().isPayPerEvent;

let effectiveMaxItems = input.maxItems ?? 10;
if (!userIsPaying) {
    if (!effectiveMaxItems || effectiveMaxItems > 10) {
        effectiveMaxItems = 10;
        log.warning([
            '',
            `${c.dim('        *  .  ✦        .    *       .')}`,
            `${c.dim('  .        *')}    🛰️  ${c.dim('.        *   .    ✦')}`,
            `${c.dim('     ✦  .        .       *        .')}`,
            '',
            `${c.yellow("  You're on a free plan — limited to 10 items.")}`,
            `${c.cyan('  Upgrade to a paid plan for up to 1,000,000 items.')}`,
            '',
            `  ✦ ${c.green.underline('https://console.apify.com/sign-up?fpr=vmoqkp')}`,
            '',
        ].join('\n'));
    }
}

const site = input.site ?? 'stackoverflow';
const tag = (input.tag ?? '').trim();
const searchQuery = (input.searchQuery ?? '').trim();
const sort = input.sort ?? 'activity';
const fromDate = input.fromDate ? Math.floor(new Date(input.fromDate).getTime() / 1000) : null;
const toDate = input.toDate ? Math.floor(new Date(input.toDate).getTime() / 1000) : null;
const includeAnswers = input.includeAnswers !== false;

const FILTER = 'withbody';

console.log(c.cyan('\n🛰️  Arguments:'));
console.log(c.green(`   🟩 site : ${site}`));
if (tag) console.log(c.green(`   🟩 tag : ${tag}`));
if (searchQuery) console.log(c.green(`   🟩 searchQuery : ${searchQuery}`));
console.log(c.green(`   🟩 sort : ${sort}`));
console.log(c.green(`   🟩 includeAnswers : ${includeAnswers}`));
console.log(c.green(`   🟩 maxItems : ${effectiveMaxItems}`));
console.log('');
console.log(c.magenta(`📬 ${pick(STARTUP)}\n`));

function buildUrl(): string {
    const base = searchQuery
        ? `https://api.stackexchange.com/2.3/search/advanced`
        : `https://api.stackexchange.com/2.3/questions`;
    const params = new URLSearchParams();
    params.set('site', site);
    params.set('order', 'desc');
    params.set('sort', sort);
    params.set('pagesize', String(Math.min(100, effectiveMaxItems)));
    params.set('filter', FILTER);
    if (searchQuery) params.set('q', searchQuery);
    if (tag) params.set('tagged', tag);
    if (fromDate) params.set('fromdate', String(fromDate));
    if (toDate) params.set('todate', String(toDate));
    return `${base}?${params.toString()}`;
}

async function fetchAnswers(questionId: number): Promise<any[]> {
    const url = `https://api.stackexchange.com/2.3/questions/${questionId}/answers?site=${site}&order=desc&sort=votes&filter=${FILTER}`;
    try {
        const r = await fetch(url, { headers: { 'User-Agent': 'ApifyStackExchange/1.0' } });
        if (!r.ok) return [];
        const data = (await r.json()) as { items?: any[] };
        return data.items ?? [];
    } catch {
        return [];
    }
}

const url = buildUrl();
log.info(`📡 ${url}`);

let pushed = 0;
try {
    const r = await fetch(url, { headers: { 'User-Agent': 'ApifyStackExchange/1.0' } });
    if (!r.ok) {
        log.error(`❌ HTTP ${r.status}`);
        await Actor.pushData([{ error: `HTTP ${r.status}` }]);
        await Actor.exit();
    }
    const data = (await r.json()) as { items?: any[]; quota_remaining?: number };
    log.info(`📊 ${data.items?.length ?? 0} questions, quota left: ${data.quota_remaining}`);

    for (const q of data.items ?? []) {
        if (pushed >= effectiveMaxItems) break;
        let answers: any[] = [];
        if (includeAnswers && q.answer_count > 0) {
            answers = await fetchAnswers(q.question_id);
        }
        const record = {
            questionId: q.question_id,
            title: q.title,
            link: q.link,
            tags: q.tags ?? [],
            score: q.score,
            viewCount: q.view_count,
            answerCount: q.answer_count,
            isAnswered: q.is_answered,
            owner: q.owner ? {
                userId: q.owner.user_id ?? null,
                displayName: q.owner.display_name ?? null,
                reputation: q.owner.reputation ?? null,
                userType: q.owner.user_type ?? null,
                profileImage: q.owner.profile_image ?? null,
                link: q.owner.link ?? null,
            } : null,
            creationDate: q.creation_date ? new Date(q.creation_date * 1000).toISOString() : null,
            lastActivityDate: q.last_activity_date ? new Date(q.last_activity_date * 1000).toISOString() : null,
            bodyMarkdown: q.body_markdown ?? null,
            body: q.body ?? null,
            acceptedAnswerId: q.accepted_answer_id ?? null,
            answers: answers.map((a) => ({
                answerId: a.answer_id,
                isAccepted: a.is_accepted,
                score: a.score,
                creationDate: a.creation_date ? new Date(a.creation_date * 1000).toISOString() : null,
                bodyMarkdown: a.body_markdown ?? null,
                owner: a.owner ? {
                    userId: a.owner.user_id ?? null,
                    displayName: a.owner.display_name ?? null,
                    reputation: a.owner.reputation ?? null,
                } : null,
            })),
            scrapedAt: new Date().toISOString(),
        };

        if (isPayPerEvent) await Actor.pushData([record], 'result-item');
        else await Actor.pushData([record]);
        pushed += 1;
    }
} catch (err: any) {
    log.error(`❌ ${err.message}`);
    await Actor.pushData([{ error: err.message }]);
}

if (pushed === 0) await Actor.pushData([{ error: 'No questions matched.' }]);
log.info(c.green(`✅ Pushed ${pushed} Q&A records`));
console.log(c.magenta(`\n${pick(DONE)}`));
await Actor.exit();
