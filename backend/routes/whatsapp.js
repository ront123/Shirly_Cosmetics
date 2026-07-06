const express = require('express');
const router  = express.Router();
const axios   = require('axios');

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN    = process.env.WHATSAPP_ACCESS_TOKEN;
const VERIFY_TOKEN    = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
const API_VERSION     = process.env.META_API_VERSION || 'v19.0';
const BASE_URL        = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;

/**
 * Convert an Israeli phone number to E.164 format.
 * Input examples: "0521234567", "+972521234567", "972521234567"
 * Output: "972521234567"
 */
function toE164(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('972')) return digits;
  if (digits.startsWith('0'))  return `972${digits.slice(1)}`;
  return digits;
}

/**
 * Replace [שם_הלקוחה] placeholders with the client's name.
 */
function fillTemplate(message, name) {
  return message.replace(/\[שם(?:[ _]ה?לקוחה?)?]/g, name || '');
}

/**
 * Send a single WhatsApp message via Meta Cloud API.
 */
async function sendMetaMessage(to, text) {
  return axios.post(
    BASE_URL,
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { preview_url: false, body: text },
    },
    {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }
  );
}

/**
 * POST /api/whatsapp/send
 * Send a WhatsApp message to a single recipient via Meta Cloud API.
 *
 * Body: { phone: string, name: string, message: string }
 * Response: { success: boolean, messageId?: string, error?: string }
 */
router.post('/send', async (req, res) => {
  const { phone, name, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ success: false, error: 'phone ו-message הם שדות חובה' });
  }

  const to   = toE164(phone);
  const body = fillTemplate(message, name);

  try {
    const response  = await sendMetaMessage(to, body);
    const messageId = response.data?.messages?.[0]?.id;
    console.log(`✅ Meta API sent to ${name} (${to}) | ID: ${messageId}`);
    res.json({ success: true, messageId });
  } catch (err) {
    const errMsg = err.response?.data || err.message;
    console.error(`❌ Meta API failed for ${name} (${to}):`, errMsg);
    res.status(500).json({ success: false, error: errMsg });
  }
});

/**
 * POST /api/whatsapp/send-bulk
 * Send a WhatsApp campaign to multiple recipients.
 * Adds a 600ms delay between messages to respect Meta rate limits.
 *
 * Body: { clients: Array<{ id, phone, name }>, message: string }
 * Response: { success: boolean, sent, failed, results }
 */
router.post('/send-bulk', async (req, res) => {
  const { clients, message } = req.body;

  if (!Array.isArray(clients) || !message) {
    return res.status(400).json({ success: false, error: 'clients (array) ו-message הם שדות חובה' });
  }

  const results = [];

  for (const cl of clients) {
    const to   = toE164(cl.phone);
    const body = fillTemplate(message, cl.name);

    try {
      const response  = await sendMetaMessage(to, body);
      const messageId = response.data?.messages?.[0]?.id;
      console.log(`✅ Sent to ${cl.name} (${to}) | ID: ${messageId}`);
      results.push({ id: cl.id, phone: cl.phone, success: true, messageId });
    } catch (err) {
      const errMsg = err.response?.data || err.message;
      console.error(`❌ Failed for ${cl.name} (${to}):`, errMsg);
      results.push({ id: cl.id, phone: cl.phone, success: false, error: errMsg });
    }

    // 600ms delay between messages to stay within Meta rate limits
    await new Promise(r => setTimeout(r, 600));
  }

  const sent   = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`📊 Bulk done: ${sent} נשלחו, ${failed} נכשלו`);

  res.json({ success: true, sent, failed, results });
});

/**
 * GET /api/whatsapp/status
 * Check if the Meta WhatsApp integration is configured.
 */
router.get('/status', async (req, res) => {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}`,
      {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
        timeout: 8000,
      }
    );
    const { verified_name, status, quality_rating } = response.data;
    res.json({
      success: true,
      connected: status === 'CONNECTED' || !!verified_name,
      verified_name,
      status,
      quality_rating,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.response?.data || err.message });
  }
});

/**
 * GET /api/whatsapp/webhook
 * Webhook verification endpoint — Meta sends a GET request to verify the URL.
 */
router.get('/webhook', (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified by Meta');
    return res.status(200).send(challenge);
  }
  console.warn('❌ Webhook verification failed');
  res.sendStatus(403);
});

/**
 * POST /api/whatsapp/webhook
 * Webhook receiver — Meta sends incoming messages and status updates here.
 */
router.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'whatsapp_business_account') {
    body.entry?.forEach(entry => {
      entry.changes?.forEach(change => {
        const value = change.value;

        // Incoming messages
        value.messages?.forEach(msg => {
          console.log(`📨 New message from ${msg.from}: ${msg.text?.body}`);
          // TODO: handle incoming messages (e.g., save to DB)
        });

        // Status updates (sent, delivered, read)
        value.statuses?.forEach(status => {
          console.log(`📬 Status update for ${status.id}: ${status.status}`);
        });
      });
    });

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

module.exports = router;
