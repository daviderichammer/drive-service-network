/* ─── Openbay Partner API Demo — app.js ─────────────────────────────────────── */

const API = '';  // relative — proxied through our Express server

// ─── Workflow State ──────────────────────────────────────────────────────────
const wf = {
  userId: null,
  subscriptionId: null,
  locationId: null,
  locationName: null,
  scheduledTime: null,
  serviceIds: []
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json();
  return { status: res.status, data };
}

function showEl(id) { document.getElementById(id).style.display = ''; }
function hideEl(id) { document.getElementById(id).style.display = 'none'; }
function setHTML(id, html) { document.getElementById(id).innerHTML = html; }
function getVal(id) { return document.getElementById(id).value.trim(); }
function setVal(id, val) { document.getElementById(id).value = val; }

function formatHours(day) {
  if (!day || !day.open) return 'Closed';
  return `${day.open} – ${day.close}`;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}
function futureStr(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function ratingStars(r) {
  if (!r) return '<span style="color:#9CA3AF">No rating</span>';
  const full = Math.round(r);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

// ─── Services Browser ────────────────────────────────────────────────────────

let allServices = [];

async function loadServices() {
  showEl('servicesLoading');
  hideEl('servicesGrid');
  hideEl('servicesMeta');

  try {
    const { data } = await apiFetch('/api/services');
    allServices = data.services || data || [];

    // Update hero stat
    document.getElementById('statServices').textContent = allServices.length.toLocaleString();

    // Build category list
    const cats = [...new Set(allServices.map(s => s.category_name || '').filter(Boolean))].sort();
    const catFilter = document.getElementById('categoryFilter');
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c; opt.textContent = c;
      catFilter.appendChild(opt);
    });

    renderServices(allServices);
  } catch (e) {
    document.getElementById('servicesLoading').innerHTML = `<p style="color:#DC2626">Error loading services: ${e.message}</p>`;
  }
}

function renderServices(services) {
  hideEl('servicesLoading');
  const grid = document.getElementById('servicesGrid');
  const meta = document.getElementById('servicesMeta');

  if (!services.length) {
    grid.innerHTML = '<p style="color:#6B7280;text-align:center;padding:32px">No services match your search.</p>';
    showEl('servicesGrid');
    hideEl('servicesMeta');
    return;
  }

  const displayed = services.slice(0, 120);
  grid.innerHTML = displayed.map(s => `
    <div class="service-card">
      <div class="service-name">${s.name}</div>
      ${s.category_name ? `<div class="service-category">${s.category_name}</div>` : ''}
      ${s.ability_requirements?.length ? `<div class="service-abilities">Requires: ${s.ability_requirements.map(a => a.category_name).join(', ')}</div>` : ''}
      <div class="service-id">Service ID: ${s.id}</div>
    </div>
  `).join('');

  meta.textContent = `Showing ${displayed.length} of ${services.length} services`;
  showEl('servicesGrid');
  showEl('servicesMeta');
}

function filterServices() {
  const q = document.getElementById('serviceSearch').value.toLowerCase();
  const cat = document.getElementById('categoryFilter').value;
  const filtered = allServices.filter(s => {
    const matchQ = !q || s.name.toLowerCase().includes(q) || (s.category_name || '').toLowerCase().includes(q);
    const matchCat = !cat || s.category_name === cat;
    return matchQ && matchCat;
  });
  renderServices(filtered);
}

document.getElementById('serviceSearch').addEventListener('input', filterServices);
document.getElementById('categoryFilter').addEventListener('change', filterServices);

// ─── Shop Finder ─────────────────────────────────────────────────────────────

async function findShops() {
  const zipcode = getVal('finderZip');
  const radius = parseInt(getVal('finderRadius'));
  const locationType = getVal('finderType');
  const vehicle_make = getVal('finderMake');

  if (!zipcode) { alert('Please enter a ZIP code.'); return; }

  showEl('shopsLoading');
  hideEl('shopsResults');
  hideEl('shopsEmpty');

  try {
    const body = { zipcode, radius, locationType, max_results: 20 };
    if (vehicle_make) body.vehicle_make = vehicle_make;

    const { data } = await apiFetch('/api/locations/search', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    hideEl('shopsLoading');
    const shops = Array.isArray(data) ? data : [];

    if (!shops.length) {
      showEl('shopsEmpty');
      return;
    }

    renderShops(shops);
  } catch (e) {
    hideEl('shopsLoading');
    document.getElementById('shopsResults').innerHTML = `<p style="color:#DC2626">Error: ${e.message}</p>`;
    showEl('shopsResults');
  }
}

function renderShops(shops) {
  const grid = document.getElementById('shopsResults');
  grid.innerHTML = shops.map(s => `
    <div class="shop-card" onclick="viewShopDetails('${s.openbay_id}')">
      <div class="shop-name">${s.name}</div>
      <div class="shop-address">📍 ${s.address_1}${s.address_2 ? ', ' + s.address_2 : ''}, ${s.city}, ${s.state} ${s.zipcode}</div>
      <div class="shop-meta">
        ${s.distance ? `<span class="shop-tag">${s.distance.toFixed(1)} mi away</span>` : ''}
        ${s.review_rating ? `<span class="shop-tag green">★ ${s.review_rating}</span>` : ''}
        ${s.franchise ? '<span class="shop-tag blue">Franchise</span>' : ''}
        ${s.phone_number ? `<span class="shop-tag">${s.phone_number}</span>` : ''}
      </div>
      <div class="shop-hours">
        Mon–Fri: ${formatHours(s.monday)} · Sat: ${formatHours(s.saturday)}
      </div>
      <div class="shop-actions">
        <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); viewShopDetails('${s.openbay_id}')">View Details & Timeslots</button>
      </div>
    </div>
  `).join('');
  showEl('shopsResults');
}

document.getElementById('findShopsBtn').addEventListener('click', findShops);

// ─── Shop Detail Modal ────────────────────────────────────────────────────────

async function viewShopDetails(locationId) {
  const modal = document.getElementById('shopModal');
  const content = document.getElementById('shopModalContent');
  modal.style.display = 'flex';
  content.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading shop details...</p></div>';

  try {
    const [detailRes, slotsRes] = await Promise.all([
      apiFetch(`/api/locations/${locationId}`),
      apiFetch(`/api/locations/${locationId}/timeslots`, { method: 'POST', body: JSON.stringify({ number_of_days: 7 }) })
    ]);

    const loc = detailRes.data.location || detailRes.data;
    const slots = slotsRes.data.time_slots || slotsRes.data.slots || slotsRes.data || [];

    const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    const hoursTable = days.map(d => `
      <tr>
        <td style="padding:4px 12px 4px 0;font-weight:500;text-transform:capitalize">${d}</td>
        <td style="padding:4px 0;color:#6B7280">${formatHours(loc[d])}</td>
      </tr>
    `).join('');

    // Group slots by day
    const slotsByDay = {};
    slots.forEach(s => {
      if (!slotsByDay[s.day]) slotsByDay[s.day] = [];
      slotsByDay[s.day].push(s);
    });

    const slotsHTML = Object.entries(slotsByDay).slice(0, 5).map(([day, daySlots]) => `
      <div style="margin-bottom:12px">
        <div style="font-size:13px;font-weight:600;color:#374151;margin-bottom:6px">${new Date(day + 'T12:00:00').toLocaleDateString('en-US', {weekday:'long', month:'short', day:'numeric'})}</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${daySlots.slice(0, 8).map(s => `<span style="padding:5px 12px;border:1.5px solid #E5E7EB;border-radius:6px;font-size:12px;background:#F9FAFB">${s.slot_title.trim()}</span>`).join('')}
          ${daySlots.length > 8 ? `<span style="padding:5px 12px;font-size:12px;color:#6B7280">+${daySlots.length - 8} more</span>` : ''}
        </div>
      </div>
    `).join('');

    content.innerHTML = `
      <h2 style="font-size:22px;font-weight:700;margin-bottom:6px">${loc.name}</h2>
      <p style="color:#6B7280;margin-bottom:20px">📍 ${loc.address_1}, ${loc.city}, ${loc.state} ${loc.zipcode}</p>
      
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
        <div>
          <h4 style="font-size:14px;font-weight:600;margin-bottom:10px">Hours</h4>
          <table style="font-size:13px">${hoursTable}</table>
        </div>
        <div>
          <h4 style="font-size:14px;font-weight:600;margin-bottom:10px">Details</h4>
          ${loc.phone_number ? `<p style="font-size:13px;margin-bottom:6px">📞 ${loc.phone_number}</p>` : ''}
          ${loc.review_rating ? `<p style="font-size:13px;margin-bottom:6px">⭐ ${loc.review_rating} / 5 (${loc.review_count || 0} reviews)</p>` : ''}
          ${loc.labor_rate_cents ? `<p style="font-size:13px;margin-bottom:6px">💰 Labor rate: $${(loc.labor_rate_cents/100).toFixed(0)}/hr</p>` : ''}
          ${loc.amenities?.length ? `<p style="font-size:13px;margin-bottom:6px">✅ ${loc.amenities.join(', ')}</p>` : ''}
          ${loc.certifications?.length ? `<p style="font-size:13px">🏆 ${loc.certifications.join(', ')}</p>` : ''}
          <p style="font-size:12px;color:#9CA3AF;margin-top:8px">ID: ${loc.openbay_id}</p>
        </div>
      </div>

      ${slots.length ? `
        <h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Available Appointment Times (Next 7 Days)</h4>
        ${slotsHTML}
      ` : '<p style="color:#6B7280;font-size:14px">No available time slots in the next 7 days.</p>'}
    `;
  } catch (e) {
    content.innerHTML = `<p style="color:#DC2626">Error loading details: ${e.message}</p>`;
  }
}

function closeShopModal() {
  document.getElementById('shopModal').style.display = 'none';
}

// ─── Workflow ─────────────────────────────────────────────────────────────────

function setStepState(stepNum, state) {
  const el = document.getElementById(`step${stepNum}`);
  el.classList.remove('locked', 'active', 'completed');
  if (state) el.classList.add(state);
}

function showStepResult(stepNum, content, type = 'info') {
  const el = document.getElementById(`step${stepNum}Result`);
  el.className = `step-result ${type}`;
  el.innerHTML = content;
  el.style.display = '';
}

async function workflowCreateUser() {
  const email = getVal('wfEmail') || `demo_${Date.now()}@driveservicenetwork.com`;
  const first_name = getVal('wfFirstName');
  const last_name = getVal('wfLastName');
  const zipcode = getVal('wfZip');

  setStepState(1, 'active');
  document.getElementById('step1Status').textContent = '⏳ Creating...';

  try {
    const { status, data } = await apiFetch('/api/users', {
      method: 'POST',
      body: JSON.stringify({ email, first_name, last_name, zipcode, partner_reference_id: `dsn-demo-${Date.now()}` })
    });

    if (data.user_id) {
      wf.userId = data.user_id;
      setStepState(1, 'completed');
      document.getElementById('step1Status').textContent = '✅ Done';
      showStepResult(1, `
        <strong>User Created Successfully!</strong><br>
        User ID: <code>${data.user_id}</code><br>
        Email: <code>${email}</code>
        <pre style="margin-top:8px">${JSON.stringify(data, null, 2)}</pre>
      `, 'success');

      // Unlock step 2
      setStepState(2, 'active');
      document.getElementById('step2Btn').disabled = false;
      document.getElementById('step2Form').style.display = '';
      setVal('wfUserId', data.user_id);
      setVal('wfSubStart', todayStr());
      setVal('wfSubEnd', futureStr(365));
      document.querySelector('#step2 .step-note').style.display = 'none';

      // Unlock step 5
      setStepState(5, 'active');
      document.getElementById('step5Form').style.display = '';
      document.getElementById('step5Note').style.display = 'none';
    } else {
      setStepState(1, '');
      document.getElementById('step1Status').textContent = '❌ Failed';
      showStepResult(1, `<strong>Error:</strong> ${JSON.stringify(data)}`, 'error');
    }
  } catch (e) {
    setStepState(1, '');
    document.getElementById('step1Status').textContent = '❌ Error';
    showStepResult(1, `<strong>Error:</strong> ${e.message}`, 'error');
  }
}

async function workflowCreateSubscription() {
  if (!wf.userId) return;
  const start = getVal('wfSubStart');
  const end = getVal('wfSubEnd');

  setStepState(2, 'active');
  document.getElementById('step2Status').textContent = '⏳ Creating...';

  try {
    const { data } = await apiFetch('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify({
        user_id: wf.userId,
        plan_id: 116,
        start, end,
        zipcode: getVal('wfZip'),
        partner_reference_id: `dsn-sub-${Date.now()}`
      })
    });

    if (data.subscriptionId) {
      wf.subscriptionId = data.subscriptionId;
      setStepState(2, 'completed');
      document.getElementById('step2Status').textContent = '✅ Done';
      showStepResult(2, `
        <strong>Subscription Created!</strong><br>
        Subscription ID: <code>${data.subscriptionId}</code><br>
        Active from <code>${start}</code> to <code>${end}</code>
        <pre style="margin-top:8px">${JSON.stringify(data, null, 2)}</pre>
      `, 'success');

      // Unlock step 3
      setStepState(3, 'active');
      document.getElementById('step3Form').style.display = '';
      document.getElementById('step3Note').style.display = 'none';
    } else {
      setStepState(2, '');
      document.getElementById('step2Status').textContent = '❌ Failed';
      showStepResult(2, `<strong>Error:</strong> ${JSON.stringify(data)}`, 'error');
    }
  } catch (e) {
    setStepState(2, '');
    document.getElementById('step2Status').textContent = '❌ Error';
    showStepResult(2, `<strong>Error:</strong> ${e.message}`, 'error');
  }
}

let wfShops = [];
let wfSelectedShop = null;
let wfSelectedSlot = null;

async function workflowFindShops() {
  const zipcode = getVal('wfZip');
  const list = document.getElementById('step3ShopList');
  list.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Searching...</p></div>';
  list.style.display = '';
  document.getElementById('step3Timeslots').style.display = 'none';

  try {
    const { data } = await apiFetch('/api/locations/search', {
      method: 'POST',
      body: JSON.stringify({ zipcode, locationType: 'appointment', max_results: 5, radius: 5 })
    });

    wfShops = Array.isArray(data) ? data : [];
    if (!wfShops.length) {
      list.innerHTML = '<p style="color:#6B7280;padding:12px">No shops found near this ZIP code.</p>';
      return;
    }

    list.innerHTML = '<p style="font-size:13px;font-weight:600;margin-bottom:10px">Select a shop:</p>' +
      wfShops.map((s, i) => `
        <div class="shop-select-item" onclick="wfSelectShop(${i})" id="wfShop${i}">
          <div>
            <div style="font-weight:600;font-size:14px">${s.name}</div>
            <div style="font-size:12px;color:#6B7280">${s.address_1}, ${s.city}, ${s.state} · ${s.distance ? s.distance.toFixed(1) + ' mi' : ''}</div>
          </div>
          <span style="font-size:12px;color:#9CA3AF">${s.openbay_id}</span>
        </div>
      `).join('');
  } catch (e) {
    list.innerHTML = `<p style="color:#DC2626">Error: ${e.message}</p>`;
  }
}

async function wfSelectShop(idx) {
  wfSelectedShop = wfShops[idx];
  wf.locationId = wfSelectedShop.openbay_id;
  wf.locationName = wfSelectedShop.name;

  // Highlight selected
  wfShops.forEach((_, i) => {
    const el = document.getElementById(`wfShop${i}`);
    if (el) el.classList.toggle('selected', i === idx);
  });

  // Load timeslots
  const slotsContainer = document.getElementById('step3Timeslots');
  const grid = document.getElementById('timeslotGrid');
  slotsContainer.style.display = '';
  grid.innerHTML = '<div class="spinner" style="margin:12px auto"></div>';

  try {
    const { data } = await apiFetch(`/api/locations/${wf.locationId}/timeslots`, {
      method: 'POST',
      body: JSON.stringify({ number_of_days: 7 })
    });

    const slots = data.time_slots || data.slots || data || [];
    if (!slots.length) {
      grid.innerHTML = '<p style="color:#6B7280;font-size:13px">No available slots.</p>';
      return;
    }

    // Group by day
    const byDay = {};
    slots.forEach(s => {
      if (!byDay[s.day]) byDay[s.day] = [];
      byDay[s.day].push(s);
    });

    grid.innerHTML = Object.entries(byDay).slice(0, 5).map(([day, daySlots]) => `
      <div class="timeslot-day">${new Date(day + 'T12:00:00').toLocaleDateString('en-US', {weekday:'long', month:'short', day:'numeric'})}</div>
      ${daySlots.slice(0, 6).map(s => `
        <button class="timeslot-btn" onclick="wfSelectSlot('${s.proposed_time}', '${s.full_slot_title}', this)">
          ${s.slot_title.trim()}
        </button>
      `).join('')}
    `).join('');
  } catch (e) {
    grid.innerHTML = `<p style="color:#DC2626;font-size:13px">Error loading slots: ${e.message}</p>`;
  }
}

function wfSelectSlot(proposedTime, fullTitle, btn) {
  wf.scheduledTime = proposedTime;
  // Highlight
  document.querySelectorAll('.timeslot-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');

  // Mark step 3 done, unlock step 4
  setStepState(3, 'completed');
  document.getElementById('step3Status').textContent = '✅ Done';
  showStepResult(3, `
    <strong>Selected:</strong> ${wf.locationName}<br>
    <strong>Time:</strong> ${fullTitle}
  `, 'success');

  setStepState(4, 'active');
  document.getElementById('step4Form').style.display = '';
  document.getElementById('step4Note').style.display = 'none';
}

async function workflowBookAppointment() {
  if (!wf.userId || !wf.locationId || !wf.scheduledTime) return;

  setStepState(4, 'active');
  document.getElementById('step4Status').textContent = '⏳ Booking...';

  const payload = {
    user_id: wf.userId,
    location_id: wf.locationId,
    scheduled_time: wf.scheduledTime,
    vehicle_year: parseInt(getVal('wfVehicleYear')),
    vehicle_make: getVal('wfVehicleMake'),
    vehicle_model: getVal('wfVehicleModel'),
    vehicle_mileage: parseInt(getVal('wfMileage')),
    appointment_type: 'service',
    notes: getVal('wfNotes'),
    services: []
  };

  try {
    const { status, data } = await apiFetch('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (data.appointment) {
      setStepState(4, 'completed');
      document.getElementById('step4Status').textContent = '✅ Done';
      showStepResult(4, `
        <strong>🎉 Appointment Booked!</strong><br>
        Appointment ID: <code>${data.appointment.id}</code><br>
        Scheduled: <code>${data.appointment.scheduled_at}</code><br>
        Status: <code>${data.appointment.appointment_status}</code>
        <pre style="margin-top:8px">${JSON.stringify(data.appointment, null, 2)}</pre>
      `, 'success');
    } else {
      setStepState(4, '');
      document.getElementById('step4Status').textContent = '❌ Failed';
      showStepResult(4, `<strong>Response (${status}):</strong><pre>${JSON.stringify(data, null, 2)}</pre>`, 'error');
    }
  } catch (e) {
    setStepState(4, '');
    document.getElementById('step4Status').textContent = '❌ Error';
    showStepResult(4, `<strong>Error:</strong> ${e.message}`, 'error');
  }
}

async function workflowGenerateSSO() {
  if (!wf.userId) return;

  setStepState(5, 'active');
  document.getElementById('step5Status').textContent = '⏳ Generating...';

  try {
    const { data } = await apiFetch(`/api/users/${wf.userId}/sso-link`, {
      method: 'POST',
      body: JSON.stringify({ dayDuration: 7 })
    });

    if (data.service_request_link) {
      setStepState(5, 'completed');
      document.getElementById('step5Status').textContent = '✅ Done';
      showStepResult(5, `
        <strong>SSO Links Generated!</strong><br>
        <strong>Service Request Link:</strong><br>
        <a href="${data.service_request_link}" target="_blank" style="color:#2563EB;word-break:break-all">${data.service_request_link}</a><br><br>
        <strong>Dashboard Link:</strong><br>
        <a href="${data.dashboard_link}" target="_blank" style="color:#2563EB;word-break:break-all">${data.dashboard_link}</a>
        <p style="font-size:12px;color:#6B7280;margin-top:8px">These links expire in 7 days and log the user directly into Openbay.</p>
      `, 'success');
    } else {
      setStepState(5, '');
      document.getElementById('step5Status').textContent = '❌ Failed';
      showStepResult(5, `<strong>Error:</strong> ${JSON.stringify(data)}`, 'error');
    }
  } catch (e) {
    setStepState(5, '');
    document.getElementById('step5Status').textContent = '❌ Error';
    showStepResult(5, `<strong>Error:</strong> ${e.message}`, 'error');
  }
}

// ─── API Explorer ─────────────────────────────────────────────────────────────

function loadEndpoint(method, endpoint, body) {
  document.getElementById('explorerMethod').value = method;
  document.getElementById('explorerEndpoint').value = endpoint;
  document.getElementById('explorerBody').value = body ? JSON.stringify(body, null, 2) : '';
  document.getElementById('explorerResponse').style.display = 'none';
}

async function runExplorer() {
  const method = document.getElementById('explorerMethod').value;
  const endpoint = document.getElementById('explorerEndpoint').value.trim();
  const bodyStr = document.getElementById('explorerBody').value.trim();

  // Guard: require a non-empty endpoint path
  if (!endpoint) {
    alert('Please enter an API endpoint path or select one from the sidebar (e.g. click "GET Services").');
    return;
  }
  if (!endpoint.startsWith('/')) {
    alert('Endpoint must start with / (e.g. /partners/v2/partner-api/services).');
    return;
  }

  let body = null;
  if (bodyStr && bodyStr !== 'null') {
    try { body = JSON.parse(bodyStr); } catch (e) {
      alert('Invalid JSON in request body: ' + e.message);
      return;
    }
  }

  const respEl = document.getElementById('explorerResponse');
  const statusEl = document.getElementById('responseStatus');
  const bodyEl = document.getElementById('responseBody');

  respEl.style.display = '';
  statusEl.textContent = '⏳ Loading...';
  statusEl.className = 'response-status';
  bodyEl.textContent = '';

  try {
    const { status, data } = await apiFetch('/api/proxy', {
      method: 'POST',
      body: JSON.stringify({ method, endpoint, body })
    });

    const httpStatus = data.status || status;
    statusEl.textContent = `HTTP ${httpStatus}`;
    statusEl.className = `response-status ${httpStatus < 300 ? 'ok' : 'err'}`;
    bodyEl.textContent = JSON.stringify(data.data !== undefined ? data.data : data, null, 2);
  } catch (e) {
    statusEl.textContent = 'Error';
    statusEl.className = 'response-status err';
    bodyEl.textContent = e.message;
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  loadServices();

  // Pre-populate the explorer with the services endpoint so it works out of the box
  loadEndpoint('GET', '/partners/v2/partner-api/services', null);

  // Set default email placeholder
  document.getElementById('wfEmail').placeholder = `demo_${Date.now()}@driveservicenetwork.com`;
});
