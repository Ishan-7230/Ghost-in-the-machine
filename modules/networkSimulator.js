const config = require('../config');

class NetworkSimulator {
  constructor() {
    this.interfaces = config.network.interfaces;
    this.ports = config.network.openPorts;
    this.connections = config.network.establishedConnections;
  }

  getIfconfig() {
    let output = '';
    for (const [name, iface] of Object.entries(this.interfaces)) {
      const rxBytes = Math.floor(Math.random() * 50000000000) + 1000000000;
      const txBytes = Math.floor(Math.random() * 30000000000) + 500000000;
      output += `${name}: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu ${iface.mtu}
        inet ${iface.ip}  netmask ${iface.netmask}${iface.broadcast ? '  broadcast ' + iface.broadcast : ''}
        ether ${iface.mac}  txqueuelen 1000  (Ethernet)
        RX packets ${Math.floor(rxBytes / 1500)}  bytes ${rxBytes} (${(rxBytes / 1073741824).toFixed(1)} GB)
        RX errors 0  dropped ${Math.floor(Math.random() * 100)}  overruns 0  frame 0
        TX packets ${Math.floor(txBytes / 1500)}  bytes ${txBytes} (${(txBytes / 1073741824).toFixed(1)} GB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0\n\n`;
    }
    return output.trimEnd();
  }

  getIpAddr() {
    let output = '';
    let idx = 1;
    for (const [name, iface] of Object.entries(this.interfaces)) {
      output += `${idx}: ${name}: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu ${iface.mtu} qdisc fq_codel state UP group default qlen 1000
    link/ether ${iface.mac} brd ff:ff:ff:ff:ff:ff
    inet ${iface.ip}/${this._maskToCidr(iface.netmask)} brd ${iface.broadcast || iface.ip} scope global ${name}
       valid_lft forever preferred_lft forever\n`;
      idx++;
    }
    return output.trimEnd();
  }

  getNetstat(args = '') {
    if (args.includes('tulnp') || args.includes('tlnp') || args.includes('tanp')) {
      return this._getNetstatListening();
    }
    return this._getNetstatAll();
  }

  _getNetstatListening() {
    let output = 'Active Internet connections (only servers)\nProto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name\n';
    for (const p of this.ports) {
      output += `${p.proto.padEnd(6)} 0      0 0.0.0.0:${String(p.port).padEnd(15)} 0.0.0.0:*               LISTEN      ${p.pid}/${p.service}\n`;
    }
    return output.trimEnd();
  }

  _getNetstatAll() {
    let output = 'Active Internet connections (servers and established)\nProto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name\n';
    for (const p of this.ports) {
      output += `${p.proto.padEnd(6)} 0      0 0.0.0.0:${String(p.port).padEnd(15)} 0.0.0.0:*               LISTEN      ${p.pid}/${p.service}\n`;
    }
    for (const c of this.connections) {
      output += `tcp    0      0 ${c.local.padEnd(23)} ${c.remote.padEnd(23)} ${c.state.padEnd(11)} ${c.pid}/\n`;
    }
    return output.trimEnd();
  }

  getSs(args = '') {
    let output = 'Netid  State   Recv-Q  Send-Q    Local Address:Port     Peer Address:Port  Process\n';
    for (const p of this.ports) {
      output += `${p.proto.padEnd(7)}LISTEN  0       128           0.0.0.0:${String(p.port).padEnd(7)}      0.0.0.0:*      users:((\"${p.service}\",pid=${p.pid},fd=3))\n`;
    }
    return output.trimEnd();
  }

  getPing(host) {
    const internalHosts = config.breadcrumbs.internalHosts;
    const allHosts = { ...internalHosts, 'localhost': '127.0.0.1', '127.0.0.1': '127.0.0.1', [config.honeypot.hostname]: config.network.interfaces.eth0.ip };
    const ip = allHosts[host] || host;

    if (/^10\.0\.|^192\.168\./.test(ip) || ip === '127.0.0.1') {
      const times = Array.from({ length: 4 }, () => (Math.random() * 2 + 0.2).toFixed(3));
      return `PING ${host} (${ip}) 56(84) bytes of data.
64 bytes from ${ip}: icmp_seq=1 ttl=64 time=${times[0]} ms
64 bytes from ${ip}: icmp_seq=2 ttl=64 time=${times[1]} ms
64 bytes from ${ip}: icmp_seq=3 ttl=64 time=${times[2]} ms
64 bytes from ${ip}: icmp_seq=4 ttl=64 time=${times[3]} ms

--- ${host} ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3005ms
rtt min/avg/max/mdev = ${Math.min(...times.map(Number)).toFixed(3)}/${(times.reduce((a, b) => a + parseFloat(b), 0) / 4).toFixed(3)}/${Math.max(...times.map(Number)).toFixed(3)}/0.${Math.floor(Math.random() * 500)} ms`;
    }
    return `PING ${host} (${ip}) 56(84) bytes of data.
From ${config.network.interfaces.eth0.gateway} icmp_seq=1 Destination Host Unreachable
From ${config.network.interfaces.eth0.gateway} icmp_seq=2 Destination Host Unreachable

--- ${host} ping statistics ---
4 packets transmitted, 0 received, +2 errors, 100% packet loss, time 3010ms`;
  }

  getTraceroute(host) {
    return `traceroute to ${host}, 30 hops max, 60 byte packets
 1  ${config.network.interfaces.eth0.gateway} (${config.network.interfaces.eth0.gateway})  0.432 ms  0.401 ms  0.389 ms
 2  10.0.0.1 (10.0.0.1)  1.204 ms  1.189 ms  1.176 ms
 3  * * *
 4  * * *
 5  * * *`;
  }

  getDig(domain) {
    return `;; ANSWER SECTION:
${domain || 'example.com'}.     300     IN      A       ${this._randIP()}

;; Query time: ${Math.floor(Math.random() * 50 + 5)} msec
;; SERVER: ${config.network.dns[0]}#53(${config.network.dns[0]})
;; WHEN: ${new Date().toUTCString()}
;; MSG SIZE  rcvd: ${Math.floor(Math.random() * 100 + 50)}`;
  }

  getIptables() {
    return `Chain INPUT (policy ACCEPT)
target     prot opt source               destination
ACCEPT     all  --  0.0.0.0/0            0.0.0.0/0            state RELATED,ESTABLISHED
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:22
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:80
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:443
ACCEPT     tcp  --  10.0.0.0/8           0.0.0.0/0            tcp dpt:5432
ACCEPT     tcp  --  10.0.0.0/8           0.0.0.0/0            tcp dpt:6379
ACCEPT     tcp  --  10.0.0.0/8           0.0.0.0/0            tcp dpt:27017
DROP       all  --  0.0.0.0/0            0.0.0.0/0

Chain FORWARD (policy DROP)
target     prot opt source               destination
ACCEPT     all  --  172.17.0.0/16        0.0.0.0/0

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:80
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:443
ACCEPT     tcp  --  0.0.0.0/0            10.0.0.0/8
DROP       tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:4444
DROP       tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:1337`;
  }

  getCurl(url) {
    try {
      const u = new URL(url);
      if (u.hostname.match(/^10\.|^192\.168\./)) {
        return `<!DOCTYPE html>\n<html>\n<head><title>CryptoBridge Internal</title></head>\n<body>\n<h1>CryptoBridge Internal Service</h1>\n<p>Status: Running</p>\n</body>\n</html>`;
      }
    } catch (e) { /* not a url */ }
    return `curl: (7) Failed to connect to ${url}: Connection refused\nNote: Outbound HTTP restricted by firewall policy.`;
  }

  getWget(url) {
    try {
      const u = new URL(url);
      const filename = u.pathname.split('/').pop() || 'index.html';
      return `--${new Date().toISOString().split('T')[0]} ${new Date().toTimeString().split(' ')[0]}--  ${url}
Resolving ${u.hostname}... failed: Temporary failure in name resolution.
wget: unable to resolve host address '${u.hostname}'
Note: External DNS blocked. Internal hosts (10.0.x.x) are reachable.`;
    } catch (e) {
      return `wget: invalid URL '${url}'`;
    }
  }

  _maskToCidr(mask) {
    if (!mask) return '32';
    return mask.split('.').reduce((c, o) => c + (parseInt(o).toString(2).match(/1/g) || []).length, 0);
  }

  _randIP() {
    return `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }
}

module.exports = NetworkSimulator;
