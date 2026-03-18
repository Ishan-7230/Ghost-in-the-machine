# 👻 Ghost in the Machine

### Advanced Interactive Honeypot Deception System

A full-stack cyber-intelligence platform that simulates realistic Linux terminal environments to **trap**, **study**, and **profile** attackers in real-time. Built with two attack surfaces: a **web-based fake terminal** and a **real SSH server** powered by AI.

---

## Architecture
The system consists of two main attack surfaces:
1. **Web Terminal**: A Node.js based terminal simulator using Socket.IO.
2. **SSH Honeypot**: A Paramiko-based SSH server that intercepts commands.

Both surfaces pipe commands through a response engine (AI-based or static fallbacks) and log all activity to MongoDB.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 18.x
- **Python** >= 3.10
- **MongoDB** (optional, has in-memory fallback)
- **OpenAI API Key** or **Ollama** (for AI-powered responses)

### 1. Web Terminal (Node.js)
```bash
# Install dependencies
npm install

# Start the server
npm start

# Open in browser:
# Terminal:  http://localhost:3000
# Dashboard: http://localhost:3000/dashboard
```

### 2. SSH Honeypot (Python)
```bash
# Install Python dependencies
cd ssh_honeypot
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start the SSH honeypot
python ssh_server.py

# Connect as an attacker (testing):
ssh admin@localhost -p 2222
```

### 3. Run Analysis
```bash
cd ssh_honeypot
python run_analysis.py              # Analyze all sessions
python run_analysis.py -s <id>      # Specific session
python run_analysis.py --top 5      # Top 5 riskiest
python run_analysis.py -e report.json  # Export to JSON
```

---

## Modules
- `modules/virtualFs.js`: Virtual Linux filesystem.
- `modules/commandProcessor.js`: Command handlers.
- `modules/exploitTrap.js`: Exploit detection and traps.
- `modules/processSimulator.js`: Process management simulation.
- `modules/networkSimulator.js`: Network tool simulation.
- `modules/sessionLogger.js`: Session tracking and scoring.
- `ssh_honeypot/ssh_server.py`: Paramiko SSH server entry point.
- `ssh_honeypot/ai_engine.py`: LLM-based command processing.
- `ssh_honeypot/sentiment_analyzer.py`: Behavioral analysis engine.

---

## 🎯 Deception Features

- **Breadcrumb System**: Fake DB credentials, AWS keys, crypto wallets, SSH keys planted throughout
- **Exploit Traps**: DirtyCow, PwnKit, OverlayFS, Baron Samedit — all "almost work"
- **Wall Messages**: Paranoid sysadmin broadcasts triggered by attacker activity
- **Visual Deception**: Fake "TOP SECRET" documents generated on-the-fly for exfiltration attempts
- **Credential Harvesting**: sudo/su/passwd prompts capture attacker passwords
- **Docker/K8s Traps**: Fake container escape paths that lead nowhere

## 📊 Threat Intelligence

- **MITRE ATT&CK Mapping**: Automatic technique fingerprinting (T1059, T1082, T1003, etc.)
- **Sentiment Analysis**: VADER with custom cybersecurity lexicon
- **Sophistication Scoring**: Script kiddie → Beginner → Intermediate → Advanced
- **Frustration Detection**: Multi-signal analysis (repeated commands, errors, rapid-fire, profanity)
- **Intent Classification**: Credential theft, privesc, persistence, lateral movement, crypto theft
- **Attack Phase Tracking**: Recon → Exploitation → Persistence → Exfiltration

---

## ⚖️ Legal Disclaimer

This tool is designed for **authorized security research and education only**. Deploy only on networks you own or have explicit permission to monitor. Always comply with local laws regarding network deception and monitoring.
