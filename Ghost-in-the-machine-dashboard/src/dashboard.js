import './style.css'
import './ambient-background.js'

document.querySelector('#app').innerHTML = `
  <header class="container dashboard-header" style="margin-top: 2rem; display: flex; justify-content: space-between; align-items: center;">
    <div class="logo text-glow">
      <span class="logo-accent">Ghost</span> Analytics
    </div>
    <nav>
      <a href="/" class="btn btn-outline text-glow">⟵ Disengage Platform</a>
    </nav>
  </header>

  <main class="container">
    <div class="section-header" style="text-align: left; padding-top: 0; margin-top: 3rem;">
      <h1 class="text-glow" style="margin-bottom: 0.5rem; font-size: 2.5rem;">Live Threat Intelligence</h1>
      <p style="color: var(--text-secondary);">Real-time telemetry and captured adversary outputs.</p>
    </div>

    <div class="metrics-grid">
      <div class="glass-panel metric-card">
        <h3 class="metric-label text-glow">Total Attacks Logged</h3>
        <div class="metric-value text-gold text-glow" id="metric-total">14,291</div>
      </div>
      <div class="glass-panel metric-card">
        <h3 class="metric-label text-glow">Active Sessions</h3>
        <div class="metric-value text-gold text-glow" id="metric-active">3</div>
      </div>
      <div class="glass-panel metric-card">
        <h3 class="metric-label text-glow">Network Threat Level</h3>
        <div class="metric-value text-glow log-level-critical" style="color: #ff4c4c;">ELEVATED</div>
      </div>
    </div>

    <div class="glass-panel terminal-feed-container">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem;">
        <h3 class="text-glow" style="margin:0; font-family: var(--font-heading);">Outputs Obtained Feed</h3>
        <div style="font-size: 0.8rem; color: var(--text-secondary); display:flex; gap: 0.5rem; align-items: center; text-transform: uppercase;">
            <div class="term-dot text-glow" style="background: #ff5f56; width: 8px; height: 8px; animation: pulse 2s infinite;"></div> Live Socket
        </div>
      </div>
      
      <div class="dashboard-feed" id="threat-feed">
        <div class="log-entry">
          <div class="log-time">[${new Date(Date.now() - 120000).toISOString()}] [SSH_HONEYPOT]</div>
          <div class="term-cmd">Connection from 185.158.xxx.xx (Moscow, RU)</div>
          <div class="term-output">Failed password for 'root' via ssh2</div>
        </div>
        <div class="log-entry">
          <div class="log-time">[${new Date(Date.now() - 45000).toISOString()}] [WEB_TERMINAL]</div>
          <div class="term-cmd">Session Hijack Attempt</div>
          <div class="term-output log-level-warn" style="color: #f3e5ab;">Payload Captured: DROP TABLE users; --</div>
        </div>
        <div class="log-entry">
          <div class="log-time">[${new Date(Date.now() - 5000).toISOString()}] [SSH_HONEYPOT]</div>
          <div class="term-cmd">Successful login from 104.28.xxx.xx</div>
          <div class="term-output log-level-critical" style="color: #ff4c4c;">WARNING: Attacker spawned interactive shell.</div>
        </div>
        <div class="log-entry">
          <div class="log-time">[${new Date().toISOString()}] [WEB_TERMINAL]</div>
          <div class="term-cmd">File upload detected</div>
          <div class="term-output">File 'c99shell.php' quarantined to analysis sandbox.</div>
        </div>
      </div>
    </div>
  </main>
`
