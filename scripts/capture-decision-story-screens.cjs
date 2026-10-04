// Capture the running app. Ephemeral microphone-free room; no cloud assistant.
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/mahen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'docs/assets/decision-rooms-screenshots-v2/source-screens');
fs.mkdirSync(out, { recursive: true });
const app = 'http://127.0.0.1:5173';
const api = 'http://127.0.0.1:8000/api/voice/rooms';
const records = [];
const accesses = [];
let browser;
async function shot(page, id, description) {
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(out, id + '.png') });
  records.push({ id, description, viewport: { width: 430, height: 1040 }, mode: 'Actual app UI, microphone-free shared Stage' });
  console.log('Captured: ' + id);
}
async function request(url, body, access) {
  const response = await fetch(url, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', ...(access ? { 'X-Room-Member': access.memberSecret } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  const data = await response.json();
  if (!response.ok) throw new Error('Room API ' + response.status + ': ' + (typeof data.detail === 'string' ? data.detail : 'request rejected'));
  return data;
}
const cmd = (access, body) => request(api + '/' + access.room.code + '/stage', body, access);
const snapshot = access => request(api + '/' + access.room.code, undefined, access);
async function openStage(page, name, code) {
  await page.goto(app + (code ? '/?room=' + code : '/'), { waitUntil: 'networkidle' });
  if (!code) await page.getByRole('button', { name: 'Try live Agora voice', exact: true }).click();
  await page.getByLabel('Your name for the voice room', { exact: true }).fill(name);
  const responsePromise = page.waitForResponse(response => response.url().includes('/api/voice/rooms') && response.request().method() === 'POST' && response.status() === 200 && !response.url().endsWith('/assistant'));
  await page.getByRole('button', { name: 'Open shared Stage without microphone', exact: true }).click();
  const access = await (await responsePromise).json();
  accesses.push(access);
  await page.getByText('Live Smart Stage', { exact: true }).waitFor();
  return access;
}
async function selectCheck(page, label) {
  await page.getByRole('button', { name: 'Checks', exact: true }).click();
  await page.getByRole('button', { name: label, exact: false }).click();
}
async function main() {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 430, height: 1040 }, deviceScaleFactor: 2, locale: 'en-IN', timezoneId: 'Asia/Kolkata', reducedMotion: 'reduce' });
  const hostPage = await context.newPage();
  await hostPage.goto(app, { waitUntil: 'networkidle' });
  await shot(hostPage, '01-home-current', 'Current home, approved logo and fictional character world');
  await hostPage.getByRole('button', { name: 'Try live Agora voice', exact: true }).click();
  await hostPage.getByText('Voice service ready', { exact: true }).waitFor();
  await hostPage.getByLabel('Your name for the voice room', { exact: true }).fill('You');
  await shot(hostPage, '02-start-room-current', 'Real room setup and language choice');
  const responsePromise = hostPage.waitForResponse(r => r.url().endsWith('/api/voice/rooms') && r.request().method() === 'POST' && r.status() === 200);
  await hostPage.getByRole('button', { name: 'Open shared Stage without microphone', exact: true }).click();
  const host = await (await responsePromise).json(); accesses.push(host);
  await hostPage.getByText('Live Smart Stage', { exact: true }).waitFor();
  const guestContext = await browser.newContext({ viewport: { width: 430, height: 1040 }, deviceScaleFactor: 2, locale: 'en-IN', timezoneId: 'Asia/Kolkata', reducedMotion: 'reduce' });
  const priyaPage = await guestContext.newPage();
  await priyaPage.goto(app + '/?room=' + host.room.code, { waitUntil: 'networkidle' });
  await priyaPage.getByLabel('Your name for the voice room', { exact: true }).fill('Priya');
  await shot(priyaPage, '03-join-room-current', 'Real join by code and microphone-free alternative');
  const priyaPromise = priyaPage.waitForResponse(r => r.url().endsWith('/join') && r.status() === 200);
  await priyaPage.getByRole('button', { name: 'Open shared Stage without microphone', exact: true }).click();
  const priya = await (await priyaPromise).json(); accesses.push(priya);
  const ayaanPage = await guestContext.newPage();
  const ayaan = await openStage(ayaanPage, 'Ayaan', host.room.code);
  await cmd(host, { action: 'plan', plan: { city: 'Bengaluru', origin: 'Indiranagar, Bengaluru', date: '2026-10-05', time: '18:00' } });
  await cmd(host, { action: 'preference', preference: { note: 'Home by 9 pm' } });
  await cmd(priya, { action: 'utterance', text: 'I want vegetarian food and indoors.', turnId: 'story-priya-preference' });
  await cmd(ayaan, { action: 'utterance', text: 'My budget is seven hundred rupees.', turnId: 'story-ayaan-budget' });
  await hostPage.waitForTimeout(1600);
  await hostPage.getByRole('button', { name: 'Call view', exact: true }).click();
  await shot(hostPage, '04-people-and-kabir', 'Three actual room members and current Kabir avatar; cameras and microphone off');
  await hostPage.getByRole('button', { name: 'Room + Stage', exact: true }).click();
  await hostPage.getByRole('button', { name: 'Plan', exact: true }).click();
  await shot(hostPage, '05-shared-preferences', 'Shared plan and real individual preference cards');
  await hostPage.getByRole('button', { name: 'Checks', exact: true }).click();
  await shot(hostPage, '06-smart-stage-checks', 'Current four-tab Stage and its four checks');
  const checks = {};
  for (const tool of ['venues', 'weather', 'reservations', 'travel']) {
    await cmd(host, { action: 'check', tool });
    let current;
    const until = Date.now() + 70000;
    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      current = (await snapshot(host)).room.stage;
    } while (current.checks[tool].status === 'checking' && Date.now() < until);
    checks[tool] = { status: current.checks[tool].status, provider: current.checks[tool].provider, summary: current.checks[tool].summary, source: current.checks[tool].source };
    console.log('Read check: ' + tool + ' — ' + current.checks[tool].status);
    if (tool === 'venues' && current.venues.length) {
      await hostPage.waitForTimeout(1400);
      await hostPage.getByRole('button', { name: 'Options', exact: true }).click();
      await shot(hostPage, '07-real-venue-options', 'Live public venue discovery and source metadata');
      await cmd(host, { action: 'select', venueId: current.venues[0].id });
    }
  }
  await hostPage.waitForTimeout(1500);
  for (const [label, id, desc] of [
    ['Rain check', '08-rain-result', 'Actual rain forecast with source and timestamp'],
    ['Reservations & hours', '09-venue-policy-result', 'Actual listed reservation policy/hours, not a live booking slot'],
    ['Travel time', '10-travel-result', 'Actual driving estimate from the named meeting town centre']
  ]) {
    await selectCheck(hostPage, label);
    await shot(hostPage, id, desc);
  }
  await hostPage.getByRole('button', { name: 'हिंदी में ऐप देखें', exact: true }).click();
  await shot(hostPage, '11-hindi-stage', 'Hindi interface with shared read result');
  await hostPage.getByRole('button', { name: 'Use English interface', exact: true }).click();
  await hostPage.getByRole('button', { name: 'Plan', exact: true }).click();
  await hostPage.getByRole('button', { name: 'Edit meeting details', exact: true }).click();
  await shot(hostPage, '12-edit-shared-plan', 'Actual editable city, meeting town, date and time form');
  await hostPage.getByRole('button', { name: 'Cancel', exact: true }).click();
  await hostPage.getByRole('button', { name: 'Decision', exact: true }).click();
  const stage = (await snapshot(host)).room.stage;
  if (stage.selectedId) {
    await shot(hostPage, '13-voting-open', 'Actual participant vote controls before consensus');
    for (const access of [host, priya, ayaan]) await cmd(access, { action: 'vote', support: true, version: stage.decisionVersion });
    await hostPage.waitForTimeout(1400);
    await shot(hostPage, '14-all-members-support', 'All three actual authenticated member votes and host confirmation gate');
    await cmd(host, { action: 'approve', version: stage.decisionVersion });
    await hostPage.waitForTimeout(1400);
    await shot(hostPage, '15-confirmed-shared-plan', 'Actual confirmed plan with no-booking message');
  }
  fs.writeFileSync(path.join(out, 'capture-manifest.json'), JSON.stringify({
    created: '2026-10-04', captureMethod: 'Headless browser screenshots of the running app; image files are not AI redraws',
    voice: 'Microphone-free Stage; no Agora assistant start or simulated audio/video',
    providerChecks: checks, screenshots: records
  }, null, 2) + '\n');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(async () => {
  for (const access of accesses.reverse()) {
    try { await request(api + '/' + access.room.code + '/leave', {}, access); } catch {}
  }
  if (browser) await browser.close();
});
