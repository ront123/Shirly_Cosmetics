/**
 * cron.js
 * ─────────────────────────────────────────────────────
 * Daily scheduler for Easybizy client sync.
 * Runs every day at 02:00 AM (Israel time).
 *
 * Usage:
 *   node backend/cron.js
 *
 * On Render / Railway: set this as your start command,
 * or run alongside your main server.
 */

const cron           = require('node-cron');
const { syncClients } = require('./scripts/sync-clients');
require('dotenv').config();

const SCHEDULE = process.env.SYNC_CRON || '0 2 * * *'; // 02:00 every night

console.log('═══════════════════════════════════════════');
console.log('  🔄  Easybizy Sync Scheduler — מופעל');
console.log(`  📅  לוח זמנים: ${SCHEDULE}`);
console.log(`  ⏰  ריצה הבאה: כל יום ב-02:00`);
console.log('═══════════════════════════════════════════\n');

/* ── Schedule daily sync ── */
cron.schedule(SCHEDULE, async () => {
  console.log(`\n⏰  [${new Date().toLocaleString('he-IL')}] מתזמן מריץ סנכרון...`);
  try {
    const result = await syncClients();
    if (result.success) {
      console.log(`✅  סנכרון הצליח — ${result.added} לקוחות חדשים`);
    } else {
      console.error(`❌  סנכרון נכשל: ${result.error}`);
    }
  } catch (err) {
    console.error('❌  שגיאה לא צפויה בסנכרון:', err.message);
  }
}, {
  timezone: 'Asia/Jerusalem',
});

/* ── Optional: run once on startup if env says so ── */
if (process.env.SYNC_ON_START === 'true') {
  console.log('🚀  SYNC_ON_START=true — מריץ סנכרון ראשוני...');
  syncClients().catch(err => console.error('שגיאה בסנכרון ראשוני:', err.message));
}

/* ── Keep process alive ── */
process.on('SIGINT',  () => { console.log('\n👋  Cron הופסק.'); process.exit(0); });
process.on('SIGTERM', () => { console.log('\n👋  Cron הופסק.'); process.exit(0); });
