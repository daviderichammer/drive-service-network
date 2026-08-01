const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 3456;

const API_KEY = 'ob_1aef221608de6e2ea25ec111bc89de20fc165987167516d2667740cc3164041c97263d938c0d990153899044e9ced52aafa38a2f219eac25e5e98f2d64136324';
const BASE_URL = 'https://services-staging.openbay.com';
const PARTNER_ID = 116;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// Request logging
app.use(function(req, res, next) {
  if (req.path.startsWith('/api')) {
    console.log(new Date().toISOString() + ' ' + req.method + ' ' + req.path + ' body=' + JSON.stringify(req.body).substring(0, 100));
  }
  next();
});

const apiHeaders = {
  'Authorization': `Api-Key ${API_KEY}`,
  'Content-Type': 'application/json'
};

// Helper to proxy API calls
async function callAPI(method, endpoint, body = null) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
  const opts = {
    method,
    headers: apiHeaders,
    signal: controller.signal
  };
  if (body) {
    opts.body = JSON.stringify(body);
  }
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, opts);
    clearTimeout(timeoutId);
    const data = await res.json();
    return { status: res.status, data };
  } catch (e) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      throw new Error('Request timed out after 15 seconds');
    }
    throw e;
  }
}

// ─── SERVICES ───────────────────────────────────────────────────────────────

// GET all services
app.get('/api/services', async (req, res) => {
  try {
    const { status, data } = await callAPI('GET', '/partners/v2/partner-api/services');
    res.status(status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── LOCATIONS ──────────────────────────────────────────────────────────────

// POST locations near a zipcode (Openbay API accepts POST for location search with radius)
app.post('/api/locations/search', async (req, res) => {
  try {
    const { zipcode, locationType = 'appointment', max_results = 10, radius = 5, service_ids = [], vehicle_make } = req.body;
    const payload = { zipcode, locationType, max_results, radius };
    if (service_ids && service_ids.length > 0) payload.service_ids = service_ids;
    if (vehicle_make) payload.vehicle_make = vehicle_make;
    const { status, data } = await callAPI('POST', '/partners/v2/partner-locations', payload);
    res.status(status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET location details
app.get('/api/locations/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    const { status, data } = await callAPI('GET', `/partners/v2/partner-locations/${locationId}`);
    res.status(status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET time slots for a location
app.post('/api/locations/:locationId/timeslots', async (req, res) => {
  try {
    const { locationId } = req.params;
    const { number_of_days = 7 } = req.body;
    const { status, data } = await callAPI('POST', `/partners/v2/partner-locations/${locationId}/time-slots`, { number_of_days });
    res.status(status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET locations for a specific time slot (use POST since GET+body is blocked)
app.post('/api/locations/for-timeslot', async (req, res) => {
  try {
    const { zipcode, time_slot, locationType = 'appointment', max_results = 10, radius = 5 } = req.body;
    const { status, data } = await callAPI('POST', '/partners/v2/partner-locations', {
      zipcode, locationType, max_results, radius
    });
    res.status(status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── USERS ───────────────────────────────────────────────────────────────────

// POST create user
app.post('/api/users', async (req, res) => {
  try {
    const { email, first_name, last_name, phone_number, zipcode, partner_reference_id } = req.body;
    const { status, data } = await callAPI('POST', '/partners/v2/partner-api/users', {
      email, first_name, last_name, phone_number, zipcode, partner_reference_id
    });
    res.status(status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET user by ID
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, data } = await callAPI('GET', `/partners/v1/partner-users/${userId}`);
    res.status(status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST create SSO link for user
app.post('/api/users/:userId/sso-link', async (req, res) => {
  try {
    const { userId } = req.params;
    const { dayDuration = 7 } = req.body;
    const { status, data } = await callAPI('POST', `/partners/v1/partner-users/${userId}/service-request-link`, { dayDuration });
    res.status(status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── SUBSCRIPTIONS ───────────────────────────────────────────────────────────

// POST create subscription
app.post('/api/subscriptions', async (req, res) => {
  try {
    const { user_id, plan_id = PARTNER_ID, partner_reference_id, start, end, zipcode } = req.body;
    const { status, data } = await callAPI('POST', '/partners/v2/partner-api/subscriptions', {
      user_id, plan_id, partner_reference_id, start, end, zipcode
    });
    res.status(status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET user subscriptions
app.get('/api/subscriptions/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, data } = await callAPI('GET', `/partners/v2/partner-api/subscriptions/user/${userId}`);
    res.status(status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── APPOINTMENTS ────────────────────────────────────────────────────────────

// POST create appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const payload = req.body;
    const { status, data } = await callAPI('POST', '/partners/v2/partner-api/appointments', payload);
    res.status(status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET appointments for user (Openbay accepts GET with body for this endpoint)
app.get('/api/appointments/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, per_page = 10 } = req.query;
    // Use GET with query params instead
    const { status, data } = await callAPI('GET', `/partners/v2/partner-api/appointments?user_id=${userId}&page=${page}&per_page=${per_page}`);
    res.status(status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── API EXPLORER ────────────────────────────────────────────────────────────

// Raw API proxy for the explorer panel
app.post('/api/proxy', async (req, res) => {
  try {
    const { method, endpoint, body } = req.body;

    // Guard: endpoint must be a non-empty string starting with /
    if (!endpoint || typeof endpoint !== 'string' || !endpoint.trim()) {
      return res.status(400).json({
        error: 'Missing endpoint. Please enter an API endpoint path (e.g. /partners/v2/partner-api/services) or select one from the sidebar.'
      });
    }
    const trimmedEndpoint = endpoint.trim();
    if (!trimmedEndpoint.startsWith('/')) {
      return res.status(400).json({
        error: 'Invalid endpoint. The path must start with / (e.g. /partners/v2/partner-api/services).'
      });
    }

    let finalEndpoint = trimmedEndpoint;
    let finalBody = body;

    // For GET requests with body params, convert to query string
    if (method === 'GET' && body && typeof body === 'object' && Object.keys(body).length > 0) {
      const params = new URLSearchParams();
      for (const [key, val] of Object.entries(body)) {
        params.append(key, String(val));
      }
      finalEndpoint = trimmedEndpoint + (trimmedEndpoint.includes('?') ? '&' : '?') + params.toString();
      finalBody = null;
    }

    const { status, data } = await callAPI(method, finalEndpoint, finalBody);
    res.status(200).json({ status, data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── HEALTH ──────────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ status: 'ok', partner_id: PARTNER_ID, api_base: BASE_URL });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Openbay Demo Server running on port ${PORT}`);
});
