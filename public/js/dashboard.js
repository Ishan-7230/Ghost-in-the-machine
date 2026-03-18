(function () {
  const socket = io('/dashboard');
  let currentTab = 'overview';
  let allSessions = [];
  let liveFeedEntries = [];

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.dataset.tab;
      switchTab(tab);
    });
  });

  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`.nav-item[data-tab="${tab}"]`).classList.add('active');
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');

    const titles = { overview: 'Threat Overview', sessions: 'Session Details', live: 'Live Command Feed', threats: 'Threat Alerts', credentials: 'Captured Credentials' };
    document.getElementById('page-title').textContent = titles[tab] || 'Dashboard';
  }

  socket.on('stats', (stats) => {
    document.getElementById('stat-total-sessions').textContent = stats.total || 0;
    document.getElementById('stat-active-sessions').textContent = stats.active || 0;
    document.getElementById('stat-total-commands').textContent = formatNumber(stats.totalCommands || 0);
    document.getElementById('stat-exploit-attempts').textContent = stats.totalExploitAttempts || 0;
    document.getElementById('stat-creds-captured').textContent = stats.totalCredentialsCaptured || 0;
    document.getElementById('stat-high-risk').textContent = stats.highRiskSessions || 0;
    document.getElementById('session-count').textContent = stats.total || 0;
  });

  socket.on('sessions', (sessions) => {
    allSessions = sessions;
    updateSessionsTable(sessions);
    updateCredentialsTable(sessions);
    updateThreatsView(sessions);
    updateLiveFeed(sessions);
  });

  socket.on('active-count', (count) => {
    document.getElementById('active-count').textContent = count;
  });

  function updateSessionsTable(sessions) {
    const tbody = document.getElementById('sessions-tbody');
    tbody.innerHTML = sessions.slice(0, 30).map(s => {
      const risk = getRiskLevel(s.riskScore);
      const status = s.active ? '<span class="status-active">● Active</span>' : '<span class="status-ended">○ Ended</span>';
      const duration = getDuration(s.startTime, s.endTime);
      return `<tr>
        <td>${s.id ? s.id.substring(0, 8) : '—'}</td>
        <td>${s.ip || 'unknown'}</td>
        <td>${escapeHtml(s.userAgent ? s.userAgent.substring(0, 20) : '—')}</td>
        <td>${s.totalCommands || 0}</td>
        <td><span class="risk-badge ${risk}">${risk} (${s.riskScore || 0})</span></td>
        <td>${status}</td>
        <td>${duration}</td>
      </tr>`;
    }).join('');
  }

  function updateCredentialsTable(sessions) {
    const tbody = document.getElementById('creds-tbody');
    const creds = [];
    sessions.forEach(s => {
      if (s.credentialsCaptured) {
        s.credentialsCaptured.forEach(c => {
          creds.push({ ...c, sessionId: s.id ? s.id.substring(0, 8) : '—' });
        });
      }
    });

    tbody.innerHTML = creds.slice(0, 50).map(c => `
      <tr>
        <td>${c.timestamp ? new Date(c.timestamp).toLocaleTimeString() : '—'}</td>
        <td>${c.sessionId}</td>
        <td><span class="risk-badge high">${escapeHtml(c.type || 'unknown')}</span></td>
        <td>${escapeHtml(c.value || c.username || '—')}</td>
        <td style="color: var(--accent-red)">${escapeHtml(c.password || c.value || '—')}</td>
      </tr>
    `).join('');
  }

  function updateThreatsView(sessions) {
    const container = document.getElementById('threats-list');
    const threats = [];
    sessions.forEach(s => {
      if (s.exploitAttempts) {
        s.exploitAttempts.forEach(e => {
          threats.push({ ...e, sessionId: s.id ? s.id.substring(0, 8) : '—', ip: s.ip });
        });
      }
      if (s.alerts) {
        s.alerts.forEach(a => {
          threats.push({ ...a, sessionId: s.id ? s.id.substring(0, 8) : '—', ip: s.ip, exploit: a.command });
        });
      }
    });

    if (threats.length === 0) {
      container.innerHTML = '<div class="empty-state">No threat alerts yet.</div>';
      return;
    }

    container.innerHTML = threats.slice(0, 30).map(t => `
      <div class="feed-entry" style="padding: 12px;">
        <span class="feed-time">${t.time ? new Date(t.time).toLocaleTimeString() : '—'}</span>
        <span class="feed-session">[${t.sessionId}]</span>
        <span style="color: var(--accent-red); flex: 1;">${escapeHtml(t.exploit || t.details || 'Unknown threat')}</span>
        <span class="risk-badge critical">${t.level || 'HIGH'}</span>
      </div>
    `).join('');
  }

  function updateLiveFeed(sessions) {
    const container = document.getElementById('live-feed');
    const allCmds = [];

    sessions.forEach(s => {
      if (s.commands) {
        s.commands.slice(-10).forEach(c => {
          allCmds.push({
            time: c.timestamp,
            session: s.id ? s.id.substring(0, 8) : '—',
            command: c.command,
            risk: c.risk || 'low',
          });
        });
      }
    });

    allCmds.sort((a, b) => new Date(b.time) - new Date(a.time));

    if (allCmds.length === 0) {
      container.innerHTML = '<div class="empty-state">Waiting for attacker activity...</div>';
      return;
    }

    const newEntries = allCmds.slice(0, 100);
    container.innerHTML = newEntries.map(c => `
      <div class="feed-entry">
        <span class="feed-time">${c.time ? new Date(c.time).toLocaleTimeString() : '—'}</span>
        <span class="feed-session">[${c.session}]</span>
        <span class="feed-cmd">$ ${escapeHtml(c.command)}</span>
        <span class="feed-risk"><span class="risk-badge ${c.risk}">${c.risk}</span></span>
      </div>
    `).join('');
  }

  function getRiskLevel(score) {
    if (score >= 80) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 20) return 'medium';
    return 'low';
  }

  function getDuration(start, end) {
    if (!start) return '—';
    const s = new Date(start);
    const e = end ? new Date(end) : new Date();
    const diff = Math.floor((e - s) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s`;
    return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
  }

  function formatNumber(n) {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n.toString();
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(String(text)));
    return div.innerHTML;
  }

  setInterval(() => {
    document.getElementById('current-time').textContent = new Date().toLocaleTimeString();
  }, 1000);
  document.getElementById('current-time').textContent = new Date().toLocaleTimeString();

  let poisonedData = 2.4;
  let quantumAlerts = 0;
  
  setInterval(() => {
    if (Math.random() > 0.6) {
      poisonedData += (Math.random() * 0.2);
      document.getElementById('stat-poisoned-data').textContent = poisonedData.toFixed(2) + ' MB';
    }
    if (Math.random() > 0.95) {
      quantumAlerts++;
      document.getElementById('stat-quantum-alerts').textContent = quantumAlerts;
    }
  }, 3000);
})();
