import cron from 'node-cron';
import app from './app.js';
import { getSetting } from './services/settingsService.js';
import { sendEventReminders, sendDailySummaries } from './jobs/reminderJobs.js';

const PORT = process.env.PORT || 5000;

function startCronJobs() {
  cron.schedule('0 * * * *', sendEventReminders);

  cron.schedule('* * * * *', async () => {
    const timeSetting = await getSetting('daily_summary_time');
    const configured = (timeSetting || '08:00').replace(/"/g, '');
    const now = new Date();
    const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (current === configured) {
      await sendDailySummaries();
    }
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startCronJobs();
});
