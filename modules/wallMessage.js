const config = require('../config');

class WallMessageSystem {
  constructor() {
    this.messages = config.wallMessages;
    this.timers = [];
    this.callback = null;
  }

  start(callback) {
    this.callback = callback;
    this.messages.forEach((msg, i) => {
      const timer = setTimeout(() => {
        if (this.callback) {
          const now = new Date();
          const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
          const formatted = msg.message.replace('{TIME}', timeStr);
          this.callback(`\r\n\r\n${formatted}\r\n`);
        }
      }, msg.delay + Math.random() * 30000);
      this.timers.push(timer);
    });
  }

  stop() {
    this.timers.forEach(t => clearTimeout(t));
    this.timers = [];
    this.callback = null;
  }

  triggerReactive(type) {
    const reactiveMessages = {
      'nmap_detected': `\r\nBroadcast message from sarah.chen@prod-srv-01\n\t(/dev/pts/2) at ${new Date().toTimeString().split(' ')[0]}...\n\nI'm seeing port scan activity from your session. Is this authorized? Respond on Slack #security-ops immediately.\r\n`,
      'exploit_detected': `\r\nBroadcast message from root@prod-srv-01\n\t(/dev/pts/0) at ${new Date().toTimeString().split(' ')[0]}...\n\n[SECURITY] IDS Alert: Suspicious binary execution detected. SOC team has been notified. If this is authorized testing, log a ticket ASAP.\r\n`,
      'ssh_attempt': `\r\nBroadcast message from mike.ross@prod-srv-01\n\t(/dev/pts/3) at ${new Date().toTimeString().split(' ')[0]}...\n\nHey, I'm seeing SSH connections going out from this server to internal hosts. Is someone running Ansible? My monitoring is going crazy.\r\n`,
      'file_exfil': `\r\nBroadcast message from sarah.chen@prod-srv-01\n\t(/dev/pts/2) at ${new Date().toTimeString().split(' ')[0]}...\n\nLarge file transfer detected on eth1. DLP alert fired. @admin please confirm this is the scheduled backup.\r\n`,
    };
    if (this.callback && reactiveMessages[type]) {
      this.callback(reactiveMessages[type]);
    }
  }
}

module.exports = WallMessageSystem;
