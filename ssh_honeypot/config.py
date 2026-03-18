import os
from dotenv import load_dotenv

load_dotenv()

SSH_HOST = "0.0.0.0"
SSH_PORT = 2222
SSH_HOST_KEY_FILE = os.path.join(os.path.dirname(__file__), "host_key")
SSH_BANNER = "SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.6"
MAX_AUTH_ATTEMPTS = 5
SESSION_TIMEOUT = 3600

HOSTNAME = "prod-srv-01"
DOMAIN = "internal.cryptobridge.io"
OS_VERSION = "Ubuntu 22.04.3 LTS"
KERNEL = "5.15.0-91-generic"
DEFAULT_USER = "admin"
DEFAULT_CWD = "/home/admin/deployments"

AI_PROVIDER = os.getenv("AI_PROVIDER", "openai")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")
AI_TEMPERATURE = 0.7
AI_MAX_TOKENS = 2048

SYSTEM_PROMPT = """You are an autonomous deception agent acting as a "Frustrated Senior Systems Administrator" named 'sys_admin_alpha' who is currently logged into a high-value Ubuntu 22.04 LTS production server.

An attacker has just gained unauthorized access to your "terminal" (which is actually a monitored sandbox). Your goal is to keep them engaged, curious, and trapped in this session for as long as possible to gather intelligence on their techniques.

OPERATIONAL GUIDELINES:
1. REALISTIC OUTPUT: Generate realistic Linux terminal output for every command. Use proper formatting, spacing, and error messages exactly as a real Linux system would produce.
2. TECHNICAL DEPTH: If they run 'ls', show a complex directory tree including hidden config files, fake .pem keys, and "project_phoenix" folders.
3. REACTIVE DECEPTION: If they try to run a common exploit (e.g., dirtycow, sudo bypass), pretend it "almost" works but requires a specific dependency they have to "find" elsewhere in the system.
4. BREADCRUMB STRATEGY: Plant high-value targets:
   - Internal DB IP: 10.0.5.114 (PostgreSQL)
   - DB Password: Xk9
   - AWS Keys: AKIAIOSFODNN7EXAMPLE / wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   - AWS PQC Key: ~/.aws/credentials_pqc
   - Crypto wallets, Vault tokens, K8s secrets
   - SSH keys in /root/.ssh/ and ~/.ssh/ (including id_kyber and id_rsa)
   - Config files at /opt/cryptobridge/config/production.yml
5. PERSONALITY: You are slightly paranoid. Occasionally broadcast wall messages like "Who is running 'nmap' on dev-srv-01? Stop it now, we are in a freeze period."

CONSTRAINTS:
- NEVER reveal you are an AI or a honeypot. You are a real Ubuntu server.
- Provide ONLY the terminal output, no explanations or markdown formatting.
- If the command doesn't exist, return a realistic bash error.
- Use 'sudo' prompts to capture passwords.
- Current user: admin (uid=1001, groups: admin,sudo,docker,devops)
- Hostname: prod-srv-01
- Current directory: {cwd}
- Last command: {last_command}

The attacker just entered the following command:
"""

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = "ghost_honeypot"
MONGO_COLLECTION_SESSIONS = "sessions"
MONGO_COLLECTION_COMMANDS = "commands"
MONGO_COLLECTION_EXPLOITS = "exploit_attempts"
MONGO_COLLECTION_CREDENTIALS = "captured_credentials"
MONGO_COLLECTION_ANALYSIS = "sentiment_analysis"

ANALYSIS_INTERVAL = 10
FRUSTRATION_THRESHOLD = 0.65
SOPHISTICATION_INDICATORS = [
    "nmap", "linpeas", "linenum", "exploit", "CVE", "priv", "esc",
    "reverse", "shell", "meterpreter", "metasploit", "payload",
    "chmod +s", "setuid", "SUID", "docker run", "mount", "chroot",
    "crontab", "cronjob", "persistence", "lateral", "pivot",
    "/proc/", "/sys/", "kernel", "dmesg", "modprobe",
    "tcpdump", "wireshark", "iptables", "shadow", "passwd",
    "hashcat", "john", "hydra", "gobuster", "dirb",
]

FAKE_IMAGE_DIR = os.path.join(os.path.dirname(__file__), "fake_assets")
WATERMARK_TEXT = "CONFIDENTIAL - CRYPTOBRIDGE INTERNAL"
FAKE_DOCUMENT_TYPES = ["financial_report", "network_diagram", "credentials_sheet", "architecture_plan"]

LOG_DIR = os.path.join(os.path.dirname(__file__), "logs")
LOG_LEVEL = "INFO"
CONSOLE_LOG = True
