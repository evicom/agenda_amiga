// ============ ESTADO ============
let events = [];
let currentFilter = 'all';
let alertedToday = JSON.parse(localStorage.getItem('agendaAmiga_alerted') || '{}');
let saveTimeout = null;

const categoryIcons = { medico: '🏥', escola: '🎓', reuniao: '💼', evento: '🎉' };
const categoryNames = { medico: 'Médico', escola: 'Escola', reuniao: 'Reunião', evento: 'Evento' };

// ============ VERIFICA CONFIG ============
if (typeof CLOUD_CONFIG === 'undefined') {
  alert('⚠️ Arquivo config.js não encontrado! Copie config.example.js para config.js e preencha suas credenciais.');
}

// ============ STATUS DE SINCRONIZAÇÃO ============
function setSyncStatus(state, text) {
  const dot = document.getElementById('syncDot');
  const txt = document.getElementById('syncText');
  if (!dot || !txt) return;
  dot.className = 'sync-dot ' + state;
  txt.textContent = text;
}

// ============ CARREGAR DA NUVEM ============
async function loadFromCloud() {
  if (!CLOUD_CONFIG?.binId || !CLOUD_CONFIG?.masterKey) {
    setSyncStatus('error', '⚠️ Configure o config.js');
    events = JSON.parse(localStorage.getItem('agendaAmiga_events') || '[]');
    return;
  }
  setSyncStatus('saving', '🔄 Baixando da nuvem...');
  try {
    const response = await fetch(`${CLOUD_CONFIG.baseUrl}/${CLOUD_CONFIG.binId}/latest`, {
      method: 'GET',
      headers: { 'X-Master-Key': CLOUD_CONFIG.masterKey }
    });

    if (!response.ok) {
      if (response.status === 404) {
        events = JSON.parse(localStorage.getItem('agendaAmiga_events') || '[]');
        setSyncStatus('ok', '✅ Nuvem vazia — usando dados locais');
        return;
      }
      throw new Error('Erro HTTP: ' + response.status);
    }

    const data = await response.json();
    const cloudEvents = data.record?.events || [];
    const cloudIds = new Set(cloudEvents.map(e => e.id));
    const localOnly = JSON.parse(localStorage.getItem('agendaAmiga_events') || '[]')
      .filter(e => !cloudIds.has(e.id));

    events = [...cloudEvents, ...localOnly];
    localStorage.setItem('agendaAmiga_events', JSON.stringify(events));

    const count = events.length;
    setSyncStatus('ok', `✅ Sincronizado (${count} compromisso${count !== 1 ? 's' : ''})`);
  } catch (err) {
    console.error('Erro ao baixar da nuvem:', err);
    events = JSON.parse(localStorage.getItem('agendaAmiga_events') || '[]');
    setSyncStatus('error', '⚠️ Offline — usando dados locais');
  }
}

// ============ SALVAR NA NUVEM ============
async function saveToCloud() {
  if (!CLOUD_CONFIG?.binId || !CLOUD_CONFIG?.masterKey) return;
  setSyncStatus('saving', '☁️ Salvando na nuvem...');
  try {
    const response = await fetch(`${CLOUD_CONFIG.baseUrl}/${CLOUD_CONFIG.binId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': CLOUD_CONFIG.masterKey
      },
      body: JSON.stringify({ events: events })
    });
    if (!response.ok) throw new Error('Erro HTTP: ' + response.status);
    setSyncStatus('ok', '✅ Salvo na nuvem com sucesso');
  } catch (err) {
    console.error('Erro ao salvar na nuvem:', err);
    setSyncStatus('error', '⚠️ Erro ao salvar — dados em cache local');
  }
}

function scheduleSaveToCloud() {
  if (saveTimeout) clearTimeout(saveTimeout);
  setSyncStatus('saving', '⏳ Aguardando para sincronizar...');
  saveTimeout = setTimeout(() => saveToCloud(), 1000);
}

// ============ UTILITÁRIOS ============
function saveLocal() { localStorage.setItem('agendaAmiga_events', JSON.stringify(events)); }

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function isToday(dateStr) { return dateStr === getTodayStr(); }
function isPast(dateStr) { return dateStr < getTodayStr(); }

// ============ SOM DE ALERTA ============
function playAlertSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.2);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.2 + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.2 + 0.3);
      osc.start(ctx.currentTime + i * 0.2);
      osc.stop(ctx.currentTime + i * 0.2 + 0.3);
    });
  } catch (e) { console.log('Áudio não suportado'); }
}

// ============ RENDERIZAÇÃO ============
function renderEvents() {
  const list = document.getElementById('eventsList');
  let filtered = [...events];

  if (currentFilter === 'today') filtered = filtered.filter(e => isToday(e.date));
  else if (currentFilter !== 'all') filtered = filtered.filter(e => e.category === currentFilter);

  filtered.sort((a, b) => {
    const aToday = isToday(a.date) ? 0 : 1;
    const bToday = isToday(b.date) ? 0 : 1;
    if (aToday !== bToday) return aToday - bToday;
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty">
        <div class="empty-icon">📭</div>
        <p>Nenhum compromisso encontrado.</p>
        <p style="font-size:0.9em;margin-top:5px;">Adicione um novo acima!</p>
      </div>`;
    return;
  }

  list.innerHTML = filtered.map(ev => {
    const todayClass = isToday(ev.date) ? 'today' : '';
    const pastClass = isPast(ev.date) && !isToday(ev.date) ? 'past' : '';
    const tooltipText = ev.description ? ev.description.replace(/"/g, '&quot;') : 'Sem detalhes adicionais';
    return `
      <div class="event-item category-${ev.category} ${todayClass} ${pastClass}">
        <div class="event-icon">${categoryIcons[ev.category]}</div>
        <div class="event-info">
          <div class="event-title">
            ${ev.title}
            <span class="badge badge-${ev.category}">${categoryNames[ev.category]}</span>
          </div>
          <div class="event-meta">
            📅 ${formatDate(ev.date)} &nbsp; ⏰ ${ev.time}
            ${isToday(ev.date) ? ' &nbsp; <strong style="color:#ff9800;">🔥 HOJE</strong>' : ''}
          </div>
          ${ev.description ? `<div class="event-desc">"${ev.description}"</div>` : ''}
        </div>
        <div class="tooltip-balloon">${tooltipText}</div>
        <div class="event-actions">
          <button class="btn btn-small btn-danger" onclick="deleteEvent('${ev.id}')">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

function updateStatusBar() {
  const now = new Date();
  const todayEvents = events.filter(e => isToday(e.date));
  const hour = now.getHours();
  const min = now.getMinutes();
  const timeStr = `${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
  const dateStr = formatDate(getTodayStr());

  let status = `📆 ${dateStr} • 🕐 ${timeStr}`;
  if (todayEvents.length > 0) status += ` • <strong>🔥 ${todayEvents.length} compromisso(s) hoje</strong>`;
  else status += ` • ✨ Dia livre!`;

  if (hour >= 1 && hour < 12) status += ` • 🌅 Bom dia!`;
  else if (hour >= 12 && hour < 18) status += ` • ☀️ Boa tarde!`;
  else status += ` • 🌙 Boa noite!`;

  document.getElementById('statusBar').innerHTML = status;
}

// ============ FORMULÁRIO ============
document.getElementById('eventForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const newEvent = {
    id: Date.now().toString(),
    title: document.getElementById('title').value.trim(),
    category: document.getElementById('category').value,
    date: document.getElementById('date').value,
    time: document.getElementById('time').value,
    description: document.getElementById('description').value.trim()
  };
  events.push(newEvent);
  saveLocal();
  scheduleSaveToCloud();
  renderEvents();
  updateStatusBar();
  e.target.reset();
  document.getElementById('date').value = getTodayStr();
  showBalloon('✅ Compromisso salvo!', `${newEvent.title} em ${formatDate(newEvent.date)} às ${newEvent.time}`);
});

function deleteEvent(id) {
  if (confirm('Deseja realmente excluir este compromisso?')) {
    events = events.filter(e => e.id !== id);
    saveLocal();
    scheduleSaveToCloud();
    renderEvents();
    updateStatusBar();
  }
}

// ============ FILTROS ============
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderEvents();
  });
});

// ============ BALÃO DE ALERTA ============
function showBalloon(title, content) {
  document.getElementById('alertTitle').innerHTML = title;
  document.getElementById('alertContent').innerHTML = content;
  const balloon = document.getElementById('alertBalloon');
  balloon.classList.add('show');
  playAlertSound();
  setTimeout(() => { balloon.classList.remove('show'); }, 10000);
}

function closeAlert() {
  document.getElementById('alertBalloon').classList.remove('show');
}

// ============ AÇÕES MANUAIS ============
async function syncFromCloud() {
  await loadFromCloud();
  renderEvents();
  updateStatusBar();
}

async function forceSyncToCloud() { await saveToCloud(); }

// ============ ALERTAS DIÁRIOS ============
function checkDailyAlerts() {
  const now = new Date();
  const hour = now.getHours();
  const todayStr = getTodayStr();

  if (hour < 1) return;
  if (alertedToday[todayStr]) return;

  const todayEvents = events.filter(e => e.date === todayStr);
  if (todayEvents.length === 0) return;

  const list = todayEvents.map(e =>
    `• <strong>${e.time}</strong> - ${e.title} (${categoryNames[e.category]})`
  ).join('<br>');

  showBalloon(
    `🔔 Você tem ${todayEvents.length} compromisso(s) hoje!`,
    `<br>${list}<br><br><em>Bom dia! Não esqueça de seus compromissos!</em>`
  );

  alertedToday[todayStr] = true;
  localStorage.setItem('agendaAmiga_alerted', JSON.stringify(alertedToday));
}

// ============ INICIALIZAÇÃO ============
async function init() {
  document.getElementById('date').value = getTodayStr();
  document.getElementById('time').value = '09:00';

  await loadFromCloud();
  renderEvents();
  updateStatusBar();

  checkDailyAlerts();
  setInterval(() => {
    checkDailyAlerts();
    updateStatusBar();
  }, 30000);

  const keys = Object.keys(alertedToday);
  if (keys.length > 7) {
    keys.sort();
    const toRemove = keys.slice(0, keys.length - 7);
    toRemove.forEach(k => delete alertedToday[k]);
    localStorage.setItem('agendaAmiga_alerted', JSON.stringify(alertedToday));
  }
}

init();
