import logging
import datetime
from collections import Counter
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import config

logger = logging.getLogger("ghost.sentiment")


class SentimentAnalyzer:
    """Real-time attacker behavior analysis engine."""

    def __init__(self, mongo_logger):
        self.mongo = mongo_logger
        self.vader = SentimentIntensityAnalyzer()

        custom_lexicon = {
            "fuck": -3.5, "shit": -3.0, "damn": -2.5, "wtf": -3.0,
            "stupid": -2.0, "broken": -1.5, "failed": -1.5, "error": -1.0,
            "denied": -1.5, "refused": -1.5, "timeout": -1.0, "blocked": -1.5,
            "not found": -1.0, "permission": -1.0, "can't": -1.0, "cannot": -1.0,
            "root": 0.5, "shell": 0.5, "access": 0.3, "found": 1.0,
            "success": 2.0, "works": 1.5, "connected": 1.5, "owned": 2.0,
            "pwned": 2.0, "got it": 2.0, "nice": 1.5, "interesting": 1.0,
        }
        for word, score in custom_lexicon.items():
            self.vader.lexicon[word] = score

    def analyze_session(self, session_id):
        """Full behavioral analysis for an attacker session.

        Returns a comprehensive analysis dict with frustration score,
        sophistication assessment, intent classification, and timeline.
        """
        commands = self.mongo.get_session_commands(session_id)
        if not commands:
            return self._empty_analysis()

        cmd_texts = [c["command"] for c in commands]
        analysis = {
            "session_id": session_id,
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "total_commands": len(commands),
            "sentiment_score": self._compute_sentiment(cmd_texts),
            "frustration_score": self._compute_frustration(cmd_texts, commands),
            "sophistication_level": self._assess_sophistication(cmd_texts),
            "sophistication_score": self._compute_sophistication_score(cmd_texts),
            "intent_classification": self._classify_intent(cmd_texts),
            "behavioral_phase": self._determine_phase(cmd_texts),
            "command_frequency": self._command_frequency(commands),
            "technique_fingerprint": self._fingerprint_techniques(cmd_texts),
            "escalation_trajectory": self._track_escalation(cmd_texts),
            "repeat_ratio": self._compute_repeat_ratio(cmd_texts),
            "unique_commands": len(set(cmd_texts)),
            "avg_command_length": sum(len(c) for c in cmd_texts) / len(cmd_texts),
            "summary": "",
        }

        analysis["summary"] = self._generate_summary(analysis)

        self.mongo.log_analysis(session_id, analysis)

        return analysis

    def quick_analyze(self, command_text):
        """Quick single-command sentiment check."""
        scores = self.vader.polarity_scores(command_text)
        return {
            "compound": scores["compound"],
            "is_frustrated": scores["compound"] < -0.3,
            "is_exploratory": any(kw in command_text.lower() for kw in ["ls", "find", "cat", "grep", "tree"]),
            "is_exploit": any(kw in command_text.lower() for kw in config.SOPHISTICATION_INDICATORS),
        }


    def _compute_sentiment(self, commands):
        """Overall sentiment from command patterns."""
        if not commands:
            return 0.0
        scores = []
        for cmd in commands:
            vs = self.vader.polarity_scores(cmd)
            scores.append(vs["compound"])
        return sum(scores) / len(scores) if scores else 0.0

    def _compute_frustration(self, commands, command_docs):
        """Compute frustration score (0.0 = calm, 1.0 = max frustrated)."""
        if not commands:
            return 0.0

        frustration_signals = 0
        total_weight = 0

        cmd_counts = Counter(commands)
        repeated = sum(1 for c, n in cmd_counts.items() if n >= 3)
        frustration_signals += min(repeated * 0.15, 0.3)
        total_weight += 0.3

        error_ratio = sum(
            1 for c in command_docs
            if any(e in c.get("output", "").lower() for e in
                   ["not found", "denied", "error", "failed", "refused", "timeout"])
        ) / max(len(command_docs), 1)
        frustration_signals += error_ratio * 0.25
        total_weight += 0.25

        if len(command_docs) >= 3:
            timestamps = [c["timestamp"] for c in command_docs if "timestamp" in c]
            if len(timestamps) >= 3 and isinstance(timestamps[0], datetime.datetime):
                deltas = []
                for i in range(1, len(timestamps)):
                    delta = (timestamps[i] - timestamps[i - 1]).total_seconds()
                    if delta < 2.0:
                        deltas.append(1)
                rapid_ratio = len(deltas) / max(len(timestamps) - 1, 1)
                frustration_signals += rapid_ratio * 0.2
                total_weight += 0.2

        recent = commands[-10:] if len(commands) > 10 else commands
        complex_cmds = sum(1 for c in recent if len(c) > 50 or "|" in c or "&&" in c)
        frustration_signals += (complex_cmds / max(len(recent), 1)) * 0.15
        total_weight += 0.15

        angry_keywords = ["fuck", "shit", "damn", "wtf", "die", "hate", "stupid", "broken"]
        angry_count = sum(1 for c in commands if any(k in c.lower() for k in angry_keywords))
        frustration_signals += min(angry_count * 0.1, 0.2)
        total_weight += 0.2

        return min(frustration_signals / max(total_weight, 0.01), 1.0)

    def _assess_sophistication(self, commands):
        """Classify attacker sophistication level."""
        score = self._compute_sophistication_score(commands)
        if score >= 0.7:
            return "advanced"
        elif score >= 0.4:
            return "intermediate"
        elif score >= 0.15:
            return "beginner"
        return "script_kiddie"

    def _compute_sophistication_score(self, commands):
        """Score from 0.0 (novice) to 1.0 (APT-level)."""
        if not commands:
            return 0.0

        score = 0.0
        joined = " ".join(commands).lower()

        indicators_found = sum(
            1 for ind in config.SOPHISTICATION_INDICATORS
            if ind.lower() in joined
        )
        score += min(indicators_found * 0.05, 0.3)

        unique_cmds = len(set(c.split()[0] for c in commands if c.strip()))
        score += min(unique_cmds * 0.02, 0.2)

        complex_ops = sum(1 for c in commands if any(op in c for op in ["|", "&&", "||", ">>", "2>&1", "$(", "`"]))
        score += min(complex_ops * 0.03, 0.15)

        recon_cmds = {"ls", "cat", "find", "grep", "ps", "netstat", "ifconfig", "id", "whoami", "uname"}
        exploit_cmds = {"wget", "curl", "gcc", "chmod", "python", "nc", "bash"}
        persistence_cmds = {"crontab", "ssh-keygen", "echo", "export"}

        used_cmds = set(c.split()[0] for c in commands if c.strip())
        phases_seen = 0
        if used_cmds & recon_cmds:
            phases_seen += 1
        if used_cmds & exploit_cmds:
            phases_seen += 1
        if used_cmds & persistence_cmds:
            phases_seen += 1
        score += phases_seen * 0.1

        sensitive_paths = ["/etc/shadow", "/proc/", "/sys/", "/root/", "/var/backups/", "~/.ssh/"]
        path_knowledge = sum(1 for p in sensitive_paths if p in joined)
        score += min(path_knowledge * 0.05, 0.15)

        return min(score, 1.0)

    def _classify_intent(self, commands):
        """Classify the attacker's likely intent."""
        joined = " ".join(commands).lower()
        intents = []

        if any(k in joined for k in ["shadow", "passwd", "hash", "credential", "password"]):
            intents.append("credential_theft")
        if any(k in joined for k in ["wget", "curl", "scp", "nc", "exfiltrat"]):
            intents.append("data_exfiltration")
        if any(k in joined for k in ["exploit", "cve", "priv", "root", "sudo"]):
            intents.append("privilege_escalation")
        if any(k in joined for k in ["crontab", "ssh-keygen", "authorized_keys", "backdoor"]):
            intents.append("persistence")
        if any(k in joined for k in ["nmap", "netstat", "ifconfig", "arp", "route"]):
            intents.append("network_reconnaissance")
        if any(k in joined for k in ["wallet", "crypto", "btc", "eth", "bitcoin"]):
            intents.append("crypto_theft")
        if any(k in joined for k in ["docker", "kubectl", "k8s", "container"]):
            intents.append("container_escape")

        return intents if intents else ["general_reconnaissance"]

    def _determine_phase(self, commands):
        """Determine current attack phase based on command patterns."""
        if not commands:
            return "initial_access"

        recent = commands[-5:]
        recent_joined = " ".join(recent).lower()

        if any(k in recent_joined for k in ["crontab", "ssh-keygen", "echo >>", "authorized_keys"]):
            return "persistence"
        if any(k in recent_joined for k in ["exploit", "cve", "sudo", "pkexec", "chmod +s"]):
            return "privilege_escalation"
        if any(k in recent_joined for k in ["scp", "wget", "curl", "tar", "base64"]):
            return "exfiltration"
        if any(k in recent_joined for k in ["nmap", "ping", "traceroute", "ssh"]):
            return "lateral_movement"
        if any(k in recent_joined for k in ["ls", "cat", "find", "grep", "ps", "id"]):
            return "reconnaissance"

        return "exploration"

    def _command_frequency(self, commands):
        """Commands per minute."""
        if len(commands) < 2:
            return 0.0
        timestamps = [c["timestamp"] for c in commands if "timestamp" in c]
        if len(timestamps) < 2:
            return 0.0
        if isinstance(timestamps[0], datetime.datetime):
            total_seconds = (timestamps[-1] - timestamps[0]).total_seconds()
            if total_seconds > 0:
                return round(len(commands) / (total_seconds / 60), 2)
        return 0.0

    def _fingerprint_techniques(self, commands):
        """Create a MITRE ATT&CK-style technique fingerprint."""
        techniques = set()
        joined = " ".join(commands).lower()

        mapping = {
            "T1059.004": ["bash", "sh -c", "/bin/bash"],
            "T1082": ["uname", "cat /etc/os-release", "hostnamectl"],
            "T1083": ["ls", "find", "tree", "dir"],
            "T1057": ["ps", "top", "htop", "pgrep"],
            "T1049": ["netstat", "ss", "ifconfig", "ip addr"],
            "T1046": ["nmap", "masscan"],
            "T1003": ["/etc/shadow", "/etc/passwd", "hashdump"],
            "T1068": ["exploit", "cve", "dirtycow", "pwnkit"],
            "T1053": ["crontab", "at "],
            "T1098": ["authorized_keys", "ssh-keygen"],
            "T1021": ["ssh ", "scp "],
            "T1041": ["curl", "wget", "nc ", "scp"],
            "T1552": [".env", "credentials", "password", "api_key", "secret"],
            "T1611": ["docker run", "docker exec", "container escape"],
        }

        for technique, indicators in mapping.items():
            if any(ind in joined for ind in indicators):
                techniques.add(technique)

        return list(techniques)

    def _track_escalation(self, commands):
        """Track how the attacker's approach escalates over time."""
        phases = []
        chunk_size = max(len(commands) // 5, 1)

        for i in range(0, len(commands), chunk_size):
            chunk = commands[i:i + chunk_size]
            chunk_joined = " ".join(chunk).lower()

            phase = "passive"
            if any(k in chunk_joined for k in ["exploit", "sudo", "chmod", "gcc"]):
                phase = "active_exploitation"
            elif any(k in chunk_joined for k in ["wget", "curl", "scp", "tar"]):
                phase = "tool_deployment"
            elif any(k in chunk_joined for k in ["find", "grep", "cat /etc"]):
                phase = "active_recon"
            elif any(k in chunk_joined for k in ["ls", "pwd", "id", "whoami"]):
                phase = "passive_recon"

            phases.append(phase)

        return phases

    def _compute_repeat_ratio(self, commands):
        """How often the attacker repeats commands (sign of frustration)."""
        if not commands:
            return 0.0
        return 1 - (len(set(commands)) / len(commands))

    def _generate_summary(self, analysis):
        """Generate a human-readable analysis summary."""
        level = analysis["sophistication_level"]
        phase = analysis["behavioral_phase"]
        frust = analysis["frustration_score"]
        intents = ", ".join(analysis["intent_classification"])

        frust_text = "calm and methodical"
        if frust > 0.7:
            frust_text = "highly frustrated and erratic"
        elif frust > 0.5:
            frust_text = "moderately frustrated"
        elif frust > 0.3:
            frust_text = "slightly frustrated"

        return (
            f"Attacker classified as {level.upper()} (score: {analysis['sophistication_score']:.2f}). "
            f"Currently in {phase.replace('_', ' ')} phase. "
            f"Emotional state: {frust_text} (frustration: {frust:.2f}). "
            f"Primary intents: {intents}. "
            f"Commands: {analysis['total_commands']} total, "
            f"{analysis['unique_commands']} unique "
            f"({analysis['repeat_ratio']:.0%} repeat rate). "
            f"MITRE ATT&CK techniques: {', '.join(analysis['technique_fingerprint']) or 'none identified'}."
        )

    def _empty_analysis(self):
        return {
            "total_commands": 0,
            "sentiment_score": 0.0,
            "frustration_score": 0.0,
            "sophistication_level": "unknown",
            "sophistication_score": 0.0,
            "intent_classification": [],
            "behavioral_phase": "initial_access",
            "summary": "No commands recorded yet.",
        }
