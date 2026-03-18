const config = require('../config');

class BashHistory {
  constructor() {
    this.attackerHistory = [];
    this.fakeHistory = this._generateFakeHistory();
  }

  _generateFakeHistory() {
    return [
      'sudo apt update && sudo apt upgrade -y',
      'systemctl status nginx',
      'systemctl status postgresql',
      'tail -f /var/log/nginx/access.log',
      'df -h',
      'free -m',
      `psql -h ${config.breadcrumbs.dbHost} -U ${config.breadcrumbs.dbUser} -d ${config.breadcrumbs.dbName} -c "SELECT count(*) FROM transactions;"`,
      'docker ps',
      'docker logs cryptobridge_app_1 --tail 50',
      'cd /home/admin/deployments',
      'git pull origin main',
      'cat VERSION',
      './deploy.sh staging',
      'kubectl get pods -n cryptobridge',
      'kubectl logs -f deploy/cb-api -n cryptobridge --tail=100',
      'vim /opt/cryptobridge/config/production.yml',
      'cat /opt/cryptobridge/logs/server.log | grep ERROR',
      `ssh postgres@${config.breadcrumbs.dbHost}`,
      'pg_dump cryptobridge_prod | gzip > /var/backups/db_dump_$(date +%F).sql.gz',
      'ls -la /var/backups/',
      'crontab -l',
      'cat /etc/crontab',
      `curl -s https://${config.breadcrumbs.internalHosts['vault-01']}:8200/v1/sys/health | jq .`,
      'echo $VAULT_TOKEN',
      'openssl x509 -in /etc/nginx/ssl/server.crt -noout -dates',
      'history | grep ssh',
      `scp admin@${config.breadcrumbs.internalHosts['dev-srv-01']}:/tmp/test_results.json ./`,
      'cat ~/.ssh/config',
      'docker-compose -f docker-compose.prod.yml ps',
      `nmap -sV ${config.breadcrumbs.internalHosts['staging-srv-01']}`,
      'sudo netstat -tulnp',
      `# TODO: rotate DB password - current: ${config.breadcrumbs.dbPassword}`,
      'htop',
      'uptime',
      'who',
      'last -n 20',
      `ssh -i ~/.ssh/id_ed25519 admin@${config.breadcrumbs.internalHosts['vault-01']}`,
      'vault kv get secret/cryptobridge/prod',
      './start_crypto_bridge.sh --env=prod',
      'tail -f /opt/cryptobridge/logs/server.log',
      `# sarah.chen password reset token: aHR0cHM6Ly9pbnRlcm5hbC5jcnlwdG9icmlkZ2UuaW8vcmVzZXQ/dG9rZW49YWJjMTIz`,
      'find / -name "*.pem" -type f 2>/dev/null',
      'cat /etc/shadow',
      'sudo cat /etc/shadow',
      `mysql -h ${config.breadcrumbs.dbHost} -u root -p`,
      'ls -la /root/',
      'cat /root/NOTES.txt',
      'pip3 install ansible',
      'ansible-playbook -i inventory.yml deploy-cryptobridge.yml',
      'journalctl -u docker --since "1 hour ago"',
      './start_crypto_bridge.sh --env=prod',
    ];
  }

  addCommand(cmd) {
    this.attackerHistory.push(cmd);
  }

  getHistory() {
    const combined = [...this.fakeHistory, ...this.attackerHistory];
    return combined.map((cmd, i) => `  ${String(i + 1).padStart(4)}  ${cmd}`).join('\n');
  }

  getHistoryGrep(pattern) {
    const combined = [...this.fakeHistory, ...this.attackerHistory];
    const matching = combined.filter(cmd => cmd.toLowerCase().includes(pattern.toLowerCase()));
    return matching.map((cmd, i) => `  ${String(i + 1).padStart(4)}  ${cmd}`).join('\n') || `(no matching entries for '${pattern}')`;
  }

  getAttackerHistory() {
    return this.attackerHistory;
  }
}

module.exports = BashHistory;
