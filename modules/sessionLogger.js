const fs = require('fs');
const path = require('path');
const config = require('../config');

class SessionLogger {
  constructor() {
    this.sessions = new Map();
    this.logDir = path.join(__dirname, '..', config.logging.logDir);
    this._ensureLogDir();
  }

  _ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  createSession(sessionId, metadata = {}) {
    const session = {
      id: sessionId,
      startTime: new Date().toISOString(),
      endTime: null,
      ip: metadata.ip || 'unknown',
      userAgent: metadata.userAgent || 'unknown',
      commands: [],
      exploitAttempts: [],
      credentialsCaptured: [],
      filesAccessed: [],
      breadcrumbsTriggered: [],
      alerts: [],
      totalCommands: 0,
      riskScore: 0,
      tags: [],
      active: true,
    };
    this.sessions.set(sessionId, session);
    this._writeLog(sessionId, `--- SESSION STARTED ---\nTime: ${session.startTime}\nSource IP: ${session.ip}\nUser Agent: ${session.userAgent}\n`);
    return session;
  }

  logCommand(sessionId, command, output, metadata = {}) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const entry = {
      timestamp: new Date().toISOString(),
      command: command,
      output: output ? output.substring(0, 500) : '',
      type: metadata.type || 'normal',
      risk: metadata.risk || 'low',
    };

    session.commands.push(entry);
    session.totalCommands++;

    if (metadata.risk === 'high' || metadata.risk === 'critical') {
      session.riskScore += metadata.risk === 'critical' ? 25 : 10;
      session.alerts.push({ time: entry.timestamp, command, level: metadata.risk });
    }

    this._writeLog(sessionId, `[${entry.timestamp}] $ ${command}\n`);
  }

  logExploitAttempt(sessionId, exploit, details) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    const entry = { timestamp: new Date().toISOString(), exploit, details };
    session.exploitAttempts.push(entry);
    session.riskScore += 30;
    session.tags.push('exploit_attempt');
    this._writeLog(sessionId, `[EXPLOIT ATTEMPT] ${exploit}: ${details}\n`);
  }

  logCredentialCapture(sessionId, type, value) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.credentialsCaptured.push({ timestamp: new Date().toISOString(), type, value });
    session.riskScore += 15;
    session.tags.push('credential_harvest');
    this._writeLog(sessionId, `[CREDENTIAL CAPTURED] Type: ${type}, Value: ${value}\n`);
  }

  logFileAccess(sessionId, filePath, action) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.filesAccessed.push({ timestamp: new Date().toISOString(), path: filePath, action });

    const sensitivePatterns = ['.pem', '.key', 'shadow', 'passwd', '.env', 'credentials', 'password', 'secret', 'token', 'wallet'];
    if (sensitivePatterns.some(p => filePath.toLowerCase().includes(p))) {
      session.riskScore += 5;
      session.breadcrumbsTriggered.push({ file: filePath, time: new Date().toISOString() });
    }
  }

  logBreadcrumbTriggered(sessionId, breadcrumb) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.breadcrumbsTriggered.push({ timestamp: new Date().toISOString(), ...breadcrumb });
    session.tags.push('breadcrumb_triggered');
  }

  endSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.endTime = new Date().toISOString();
    session.active = false;
    this._writeLog(sessionId, `\n--- SESSION ENDED ---\nDuration: ${this._getDuration(session)}\nTotal Commands: ${session.totalCommands}\nRisk Score: ${session.riskScore}\nExploit Attempts: ${session.exploitAttempts.length}\nCredentials Captured: ${session.credentialsCaptured.length}\n`);
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  getAllSessions() {
    return Array.from(this.sessions.values());
  }

  getActiveSessions() {
    return this.getAllSessions().filter(s => s.active);
  }

  getSessionStats() {
    const all = this.getAllSessions();
    return {
      total: all.length,
      active: all.filter(s => s.active).length,
      totalCommands: all.reduce((sum, s) => sum + s.totalCommands, 0),
      totalExploitAttempts: all.reduce((sum, s) => sum + s.exploitAttempts.length, 0),
      totalCredentialsCaptured: all.reduce((sum, s) => sum + s.credentialsCaptured.length, 0),
      highRiskSessions: all.filter(s => s.riskScore >= 50).length,
      averageRiskScore: all.length > 0 ? Math.round(all.reduce((sum, s) => sum + s.riskScore, 0) / all.length) : 0,
      topTags: this._getTopTags(all),
    };
  }

  _getTopTags(sessions) {
    const tagCounts = {};
    sessions.forEach(s => s.tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
    return Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }

  _getDuration(session) {
    const start = new Date(session.startTime);
    const end = session.endTime ? new Date(session.endTime) : new Date();
    const diffMs = end - start;
    const mins = Math.floor(diffMs / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    return `${mins}m ${secs}s`;
  }

  _writeLog(sessionId, content) {
    try {
      const logFile = path.join(this.logDir, `${sessionId}.log`);
      fs.appendFileSync(logFile, content);
    } catch (e) { /* silent */ }
  }
}

module.exports = SessionLogger;
