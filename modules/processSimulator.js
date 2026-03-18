const config = require('../config');

class ProcessSimulator {
  constructor() {
    this.bootTime = config.honeypot.bootTime;
    this.processes = this._initProcesses();
  }

  _initProcesses() {
    return [
      { pid: 1, ppid: 0, user: 'root', cpu: '0.0', mem: '0.3', vsz: 169436, rss: 11584, tty: '?', stat: 'Ss', start: this._fmtStart(47), time: '0:12', command: '/sbin/init' },
      { pid: 2, ppid: 0, user: 'root', cpu: '0.0', mem: '0.0', vsz: 0, rss: 0, tty: '?', stat: 'S', start: this._fmtStart(47), time: '0:00', command: '[kthreadd]' },
      { pid: 412, ppid: 1, user: 'root', cpu: '0.0', mem: '0.1', vsz: 28380, rss: 3476, tty: '?', stat: 'Ss', start: this._fmtStart(47), time: '0:05', command: '/lib/systemd/systemd-journald' },
      { pid: 438, ppid: 1, user: 'root', cpu: '0.0', mem: '0.1', vsz: 25520, rss: 5720, tty: '?', stat: 'Ss', start: this._fmtStart(47), time: '0:01', command: '/lib/systemd/systemd-udevd' },
      { pid: 1023, ppid: 1, user: 'root', cpu: '0.0', mem: '0.0', vsz: 8536, rss: 2920, tty: '?', stat: 'Ss', start: this._fmtStart(47), time: '0:03', command: '/usr/sbin/cron -f -P' },
      { pid: 1056, ppid: 1, user: 'syslog', cpu: '0.0', mem: '0.1', vsz: 224344, rss: 4892, tty: '?', stat: 'Ssl', start: this._fmtStart(47), time: '0:08', command: '/usr/sbin/rsyslogd -n -iNONE' },
      { pid: 1847, ppid: 1, user: 'root', cpu: '0.0', mem: '0.1', vsz: 15420, rss: 6048, tty: '?', stat: 'Ss', start: this._fmtStart(47), time: '0:04', command: 'sshd: /usr/sbin/sshd -D' },
      { pid: 2341, ppid: 1, user: 'root', cpu: '0.1', mem: '0.2', vsz: 55692, rss: 8240, tty: '?', stat: 'Ss', start: this._fmtStart(47), time: '1:23', command: 'nginx: master process /usr/sbin/nginx' },
      { pid: 2342, ppid: 2341, user: 'www-data', cpu: '0.2', mem: '0.3', vsz: 56280, rss: 12480, tty: '?', stat: 'S', start: this._fmtStart(47), time: '3:45', command: 'nginx: worker process' },
      { pid: 2343, ppid: 2341, user: 'www-data', cpu: '0.1', mem: '0.3', vsz: 56280, rss: 12320, tty: '?', stat: 'S', start: this._fmtStart(47), time: '3:12', command: 'nginx: worker process' },
      { pid: 3456, ppid: 1, user: 'postgres', cpu: '0.3', mem: '1.2', vsz: 215620, rss: 78848, tty: '?', stat: 'Ss', start: this._fmtStart(47), time: '12:34', command: '/usr/lib/postgresql/14/bin/postgres -D /var/lib/postgresql/14/main' },
      { pid: 3461, ppid: 3456, user: 'postgres', cpu: '0.0', mem: '0.5', vsz: 215780, rss: 32768, tty: '?', stat: 'Ss', start: this._fmtStart(47), time: '0:45', command: 'postgres: checkpointer' },
      { pid: 3462, ppid: 3456, user: 'postgres', cpu: '0.0', mem: '0.4', vsz: 215620, rss: 26624, tty: '?', stat: 'Ss', start: this._fmtStart(47), time: '0:32', command: 'postgres: background writer' },
      { pid: 3891, ppid: 1, user: 'redis', cpu: '0.2', mem: '0.8', vsz: 72136, rss: 52428, tty: '?', stat: 'Ssl', start: this._fmtStart(47), time: '8:56', command: '/usr/bin/redis-server 0.0.0.0:6379' },
      { pid: 4521, ppid: 1, user: 'root', cpu: '0.4', mem: '1.5', vsz: 845236, rss: 98304, tty: '?', stat: 'Ssl', start: this._fmtStart(30), time: '15:23', command: '/opt/prometheus/prometheus --config.file=/opt/prometheus/prometheus.yml' },
      { pid: 5012, ppid: 1, user: 'mongodb', cpu: '0.5', mem: '2.1', vsz: 1523768, rss: 137420, tty: '?', stat: 'Ssl', start: this._fmtStart(47), time: '22:10', command: '/usr/bin/mongod --config /etc/mongod.conf' },
      { pid: 12044, ppid: 1, user: 'admin', cpu: '1.2', mem: '3.4', vsz: 2845120, rss: 222822, tty: '?', stat: 'Sl', start: this._fmtStart(5), time: '45:12', command: 'java -jar /opt/cryptobridge/lib/gateway-3.7.1.jar --spring.profiles.active=prod' },
      { pid: 15234, ppid: 1, user: 'admin', cpu: '0.8', mem: '1.8', vsz: 918452, rss: 117964, tty: '?', stat: 'Ssl', start: this._fmtStart(2), time: '5:34', command: 'node /opt/cryptobridge/server/app.js --env=prod' },
      { pid: 15890, ppid: 1, user: 'admin', cpu: '0.6', mem: '1.5', vsz: 756320, rss: 98304, tty: '?', stat: 'Ssl', start: this._fmtStart(2), time: '4:21', command: 'node /opt/cryptobridge/worker/index.js --workers=8 --env=prod' },
      { pid: 18201, ppid: 1847, user: 'admin', cpu: '0.0', mem: '0.1', vsz: 16872, rss: 7168, tty: 'pts/0', stat: 'Ss', start: this._fmtStart(0, 1), time: '0:00', command: '-bash' },
      { pid: 18250, ppid: 18201, user: 'admin', cpu: '0.0', mem: '0.0', vsz: 10684, rss: 3456, tty: 'pts/0', stat: 'R+', start: this._fmtStart(0, 0), time: '0:00', command: 'ps aux' },
    ];
  }

  _fmtStart(daysAgo, hoursAgo = 0) {
    const d = new Date(Date.now() - daysAgo * 86400000 - hoursAgo * 3600000);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]}${String(d.getDate()).padStart(2, '0')}`;
  }

  getPsAux() {
    const header = 'USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND';
    const lines = this.processes.map(p =>
      `${p.user.padEnd(9)}${String(p.pid).padStart(5)} ${p.cpu.padStart(4)} ${p.mem.padStart(4)} ${String(p.vsz).padStart(6)} ${String(p.rss).padStart(5)} ${(p.tty || '?').padEnd(8)} ${p.stat.padEnd(4)} ${p.start} ${p.time.padStart(5)} ${p.command}`
    );
    return header + '\n' + lines.join('\n');
  }

  getPs() {
    const userProcs = this.processes.filter(p => p.user === config.user.username || p.tty !== '?');
    const header = '  PID TTY          TIME CMD';
    const lines = userProcs.map(p =>
      `${String(p.pid).padStart(5)} ${(p.tty || '?').padEnd(12)} ${p.time} ${p.command.split('/').pop().split(' ')[0]}`
    );
    return header + '\n' + lines.join('\n');
  }

  getTop() {
    const upSec = config.honeypot.uptime;
    const days = Math.floor(upSec / 86400);
    const hours = Math.floor((upSec % 86400) / 3600);
    const mins = Math.floor((upSec % 3600) / 60);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const totalMem = config.honeypot.totalMemoryMB;
    const usedMem = config.honeypot.usedMemoryMB;
    const freeMem = totalMem - usedMem;
    const cached = Math.floor(totalMem * 0.35);

    return `top - ${timeStr} up ${days} days, ${hours}:${String(mins).padStart(2, '0')},  2 users,  load average: 1.23, 0.98, 0.87
Tasks: ${this.processes.length} total,   1 running, ${this.processes.length - 1} sleeping,   0 stopped,   0 zombie
%Cpu(s):  4.2 us,  1.1 sy,  0.0 ni, 94.2 id,  0.3 wa,  0.0 hi,  0.2 si,  0.0 st
MiB Mem :  ${totalMem}.0 total,  ${freeMem}.0 free,  ${usedMem}.0 used,  ${cached}.0 buff/cache
MiB Swap:   8192.0 total,   8192.0 free,      0.0 used.  ${freeMem + cached}.0 avail Mem

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
${this.processes.filter(p => parseFloat(p.cpu) > 0 || p.pid < 100).slice(0, 15).map(p =>
  `${String(p.pid).padStart(7)} ${p.user.padEnd(9)} 20   0 ${String(p.vsz).padStart(7)} ${String(p.rss).padStart(6)}  ${String(Math.floor(p.rss * 0.4)).padStart(5)} ${p.stat[0]} ${p.cpu.padStart(5)} ${p.mem.padStart(5)} ${p.time.padStart(9)} ${p.command.split('/').pop().split(' ')[0]}`
).join('\n')}`;
  }

  getSystemctl() {
    return `  UNIT                        LOAD   ACTIVE SUB     DESCRIPTION
  cron.service                loaded active running Regular background program processing daemon
  docker.service              loaded active running Docker Application Container Engine
  mongod.service              loaded active running MongoDB Database Server
  nginx.service               loaded active running A high performance web server
  postgresql@14-main.service  loaded active running PostgreSQL Cluster 14-main
  prometheus.service          loaded active running Prometheus Monitoring System
  redis-server.service        loaded active running Advanced key-value store
  ssh.service                 loaded active running OpenBSD Secure Shell server
  ufw.service                 loaded active exited  Uncomplicated firewall

LOAD   = Reflects whether the unit definition was properly loaded.
ACTIVE = The high-level unit activation state, i.e. generalization of SUB.
SUB    = The low-level unit activation state, values depend on unit type.

9 loaded units listed.`;
  }

  kill(pid) {
    const proc = this.processes.find(p => p.pid === parseInt(pid));
    if (!proc) return `bash: kill: (${pid}) - No such process`;
    if (proc.user === 'root' && config.user.username !== 'root') {
      return `bash: kill: (${pid}) - Operation not permitted`;
    }
    return '';
  }
}

module.exports = ProcessSimulator;
