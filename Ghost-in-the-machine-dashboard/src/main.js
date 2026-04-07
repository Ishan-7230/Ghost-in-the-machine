import './style.css'
import './ambient-background.js'

document.querySelector('#app').innerHTML = `
  <header class="container">
    <div class="logo text-glow">
      <span class="logo-accent">Ghost</span> in the Machine
    </div>
    <nav style="display: flex; gap: 1rem;">
      <a href="/dashboard.html" class="btn btn-primary text-glow" style="padding: 0.8rem 1.6rem; font-size: 0.8rem;">Live Dashboard</a>
      <a href="https://github.com/Ishan-7230/Ghost-in-the-machine" target="_blank" class="btn btn-outline text-glow" style="padding: 0.8rem 1.6rem; font-size: 0.8rem;">GitHub</a>
    </nav>
  </header>

  <main>
    <section class="hero container">
      <h1 class="text-glow">The Elegant <span class="text-gold text-glow">Art</span> <br> of Network Deception</h1>
      <p>An advanced, interactive honeypot deception platform crafted to trap, study, and profile attackers in real-time through a sophisticated web and SSH dual-surface architecture.</p>
      
      <div class="cta-group">
        <a href="/dashboard.html" class="btn btn-primary text-glow">Initialize Platform</a>
        <a href="#features" class="btn btn-outline text-glow">Discover Features</a>
      </div>
    </section>

    <section id="features" class="features-section container">
      <div class="section-header">
        <h2 class="text-glow">Refined Threat Intelligence</h2>
        <p>A comprehensive suite of deceptive capabilities wrapped in an elegant architecture.</p>
      </div>

      <div class="features-grid">
        <div class="glass-panel">
          <div class="feature-icon text-glow">✧</div>
          <h3 class="feature-title text-glow">Dual Attack Surfaces</h3>
          <p class="feature-desc">Engage threats seamlessly through a Node.js-based web terminal simulator or a highly realistic Paramiko SSH Server honeypot.</p>
        </div>
        
        <div class="glass-panel">
          <div class="feature-icon text-glow">✧</div>
          <h3 class="feature-title text-glow">Intelligent Deception</h3>
          <p class="feature-desc">Deploys dynamic breadcrumbs, false AWS keys, crypto wallets, and functional exploit traps that mimic critical vulnerabilities like DirtyCow.</p>
        </div>

        <div class="glass-panel">
          <div class="feature-icon text-glow">✧</div>
          <h3 class="feature-title text-glow">Behavioral Profiling</h3>
          <p class="feature-desc">Performs real-time sentiment analysis, intent classification, and sophistication scoring of the attacker using adaptive AI patterns.</p>
        </div>
      </div>
    </section>

    <section class="architecture-section container">
      <div class="arch-content">
        <div class="arch-text">
          <h2 class="text-glow">Sophisticated Architecture</h2>
          <p>Ghost in the Machine captures activity at the very edge, logging high-fidelity telemetry to a central data store for threat analysis.</p>
          
          <ul class="arch-list">
            <li><strong>Web Terminal:</strong> Socket.IO powered virtual environment mimicking deep Linux system behavior.</li>
            <li><strong>Deep-Logging:</strong> Every keystroke, intent, and frustration metric is stored in MongoDB.</li>
            <li><strong>AI Response Engine:</strong> Dynamically generates realistic but deceptive responses using LLMs to keep attackers engaged longer.</li>
          </ul>
        </div>
        
        <div class="arch-visual">
          <div class="terminal-window">
            <div class="terminal-header">
              <div class="term-dot"></div>
              <div class="term-dot"></div>
              <div class="term-dot"></div>
            </div>
            <div class="terminal-body" id="quickstart">
              <div><span class="term-prompt">user@system:~$</span> <span class="term-cmd">git clone https://github.com/Ishan-7230/Ghost-in-the-machine.git</span></div>
              <div class="term-output">Cloning into 'Ghost-in-the-machine'...<br>Resolving deltas: 100% (367/367), done.</div>
              
              <div><span class="term-prompt">user@system:~$</span> <span class="term-cmd">cd Ghost-in-the-machine && npm install</span></div>
              <div class="term-output">added 286 packages, and audited 287 packages in 3s</div>
              
              <div><span class="term-prompt">user@system:~$</span> <span class="term-cmd">npm start</span></div>
              <div class="term-output text-glow" style="color:var(--accent-light);">[OK] Ghost in the Machine Web Terminal listening on port 3000</div>
              <div><span class="term-prompt">user@system:~$</span> <span class="term-cmd terminal-cursor">_</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="container">
      <p>&copy; 2024 Ghost in the Machine. For authorized security research only.</p>
    </div>
  </footer>
`
