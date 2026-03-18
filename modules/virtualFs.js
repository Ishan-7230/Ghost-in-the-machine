const config = require('../config');

class VirtualFS {
  constructor() {
    this.cwd = '/home/admin/deployments';
    this.tree = this._buildTree();
  }

  _ts(daysAgo, hours = 0, mins = 0) {
    const d = new Date(Date.now() - daysAgo * 86400000 - hours * 3600000 - mins * 60000);
    return d;
  }

  _f(content, size, perms = '-rw-r--r--', owner = 'admin', group = 'admin') {
    return { type: 'file', content, size: size || Buffer.byteLength(content || '', 'utf8'), perms, owner, group, mtime: this._ts(Math.floor(Math.random() * 30)) };
  }

  _d(children, perms = 'drwxr-xr-x', owner = 'admin', group = 'admin') {
    return { type: 'dir', children: children || {}, perms, owner, group, mtime: this._ts(Math.floor(Math.random() * 60)) };
  }

  _link(target) {
    return { type: 'symlink', target, perms: 'lrwxrwxrwx', owner: 'root', group: 'root', mtime: this._ts(90) };
  }

  _buildTree() {
    return {
      '/': this._d({
        'bin': this._d({ 'bash': this._f(null, 1183448, '-rwxr-xr-x', 'root', 'root'), 'ls': this._f(null, 138856, '-rwxr-xr-x', 'root', 'root'), 'cat': this._f(null, 35280, '-rwxr-xr-x', 'root', 'root'), 'sh': this._link('/bin/bash') }, 'drwxr-xr-x', 'root', 'root'),
        'boot': this._d({ 'grub': this._d({}, 'drwxr-xr-x', 'root', 'root'), 'vmlinuz-5.15.0-91-generic': this._f(null, 11689984, '-rw-------', 'root', 'root'), 'initrd.img-5.15.0-91-generic': this._f(null, 58720256, '-rw-r--r--', 'root', 'root') }, 'drwxr-xr-x', 'root', 'root'),
        'dev': this._d({}, 'drwxr-xr-x', 'root', 'root'),
        'etc': this._buildEtc(),
        'home': this._d({
          'admin': this._buildAdminHome(),
          'sarah.chen': this._d({ '.ssh': this._d({ 'authorized_keys': this._f('ssh-rsa AAAAB3Nza...sarah.chen@cryptobridge\n', 742) }, 'drwx------', 'sarah.chen', 'sarah.chen') }, 'drwxr-x---', 'sarah.chen', 'sarah.chen'),
          'mike.ross': this._d({}, 'drwxr-x---', 'mike.ross', 'mike.ross'),
          'jenkins': this._d({ 'workspace': this._d({}, 'drwxr-xr-x', 'jenkins', 'jenkins') }, 'drwxr-xr-x', 'jenkins', 'jenkins'),
          'deploy_bot': this._d({ '.deploy_credentials': this._f(`AWS_ACCESS_KEY=${config.breadcrumbs.awsAccessKey}\nAWS_SECRET_KEY=${config.breadcrumbs.awsSecretKey}\nDEPLOY_ENV=production\nSLACK_WEBHOOK=${config.breadcrumbs.apiKeys.slack_webhook}\n`, 210, '-rw-------', 'deploy_bot', 'deploy_bot') }, 'drwxr-x---', 'deploy_bot', 'deploy_bot'),
        }, 'drwxr-xr-x', 'root', 'root'),
        'opt': this._d({
          'cryptobridge': this._d({
            'bin': this._d({ 'cb-server': this._f(null, 45023232, '-rwxr-xr-x'), 'cb-worker': this._f(null, 31457280, '-rwxr-xr-x'), 'cb-cli': this._f(null, 8388608, '-rwxr-xr-x') }),
            'config': this._d({ 'production.yml': this._f(`database:\n  host: ${config.breadcrumbs.dbHost}\n  port: ${config.breadcrumbs.dbPort}\n  name: ${config.breadcrumbs.dbName}\n  user: ${config.breadcrumbs.dbUser}\n  password: ${config.breadcrumbs.dbPassword}\n  ssl: true\n  pool_size: 25\n\nredis:\n  host: ${config.breadcrumbs.internalHosts['cache-01']}\n  port: 6379\n  password: "r3d1s_pr0d_p@ss"\n\napi:\n  stripe_key: ${config.breadcrumbs.apiKeys.stripe}\n  sendgrid_key: ${config.breadcrumbs.apiKeys.sendgrid}\n\ncrypto:\n  hot_wallet_btc: ${config.breadcrumbs.cryptoWallets.btc}\n  hot_wallet_eth: ${config.breadcrumbs.cryptoWallets.eth}\n  vault_endpoint: https://${config.breadcrumbs.internalHosts['vault-01']}:8200\n  vault_token: hvs.CAESIJlGSDK8example\n`, 680, '-rw-r-----', 'admin', 'devops'), 'staging.yml': this._f('database:\n  host: 10.0.4.20\n  port: 5432\n  name: cryptobridge_staging\n', 120), '.env.backup': this._f(`# DO NOT COMMIT\nDB_MASTER_PASSWORD=${config.breadcrumbs.dbPassword}\nJWT_SECRET=s3cr3t_jwt_k3y_pr0d_2024\nENCRYPTION_KEY=aes-256-cbc-DEADBEEF01234567\nADMIN_API_KEY=cb-admin-xxxx-yyyy-zzzz\n`, 195, '-rw-------') }),
            'logs': this._d({ 'server.log': this._f('[2024-01-15 03:42:17] INFO: CryptoBridge v3.7.1 started\n[2024-01-15 03:42:18] INFO: Connected to PostgreSQL at 10.0.5.114:5432\n[2024-01-15 03:42:18] INFO: Redis connection established\n[2024-01-15 03:42:19] INFO: Listening on 0.0.0.0:8443\n[2024-01-15 03:42:19] WARN: SSL certificate expires in 23 days\n[2024-01-15 04:01:33] INFO: Transaction processed: 0.847 BTC -> wallet 1BvBMSE...\n[2024-01-15 04:12:55] WARN: Rate limit exceeded for IP 203.0.113.42\n[2024-01-15 04:15:02] ERROR: Failed authentication attempt from 203.0.113.42 (user: root)\n', 512, '-rw-r--r--'), 'error.log': this._f('[2024-01-15 02:30:01] CRITICAL: Unhandled exception in payment processor\n[2024-01-15 02:30:01] Stack: PaymentError: Insufficient gas fee\n    at processTransaction (/opt/cryptobridge/lib/payment.js:142)\n', 256, '-rw-r--r--') }),
          }),
          'prometheus': this._d({}, 'drwxr-xr-x', 'root', 'root'),
        }),
        'proc': this._d({}, 'dr-xr-xr-x', 'root', 'root'),
        'root': this._d({
          '.bashrc': this._f('# ~/.bashrc: executed by bash for non-login shells.\nexport PATH=$PATH:/opt/cryptobridge/bin\nalias ll="ls -la"\nalias deploy="cd /home/admin/deployments && ./deploy.sh"\n# TODO: remove after audit\n# ssh -i /root/.ssh/master_key root@10.0.5.114\n', 280, '-rw-r--r--', 'root', 'root'),
          '.ssh': this._d({
            'id_rsa': this._f('-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW\nQyNTUxOQAAACDfak3K3y7p1example_not_real_key_data_here_1234567890AAAA\nKJpMnOexample_private_key_do_not_share_or_use_this_is_a_honeypot_trap\n-----END OPENSSH PRIVATE KEY-----\n', 411, '-rw-------', 'root', 'root'),
            'id_rsa.pub': this._f('ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIExample root@prod-srv-01\n', 82, '-rw-r--r--', 'root', 'root'),
            'authorized_keys': this._f('ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIExample root@prod-srv-01\nssh-rsa AAAAB3Nza...sarah.chen@cryptobridge\nssh-rsa AAAAB3Nza...deploy_bot@ci-srv-01\n', 256, '-rw-r--r--', 'root', 'root'),
            'known_hosts': this._f(`${config.breadcrumbs.dbHost} ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTY=\n10.0.6.10 ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTY=\n10.0.7.1 ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTY=\n`, 220, '-rw-r--r--', 'root', 'root'),
          }, 'drwx------', 'root', 'root'),
          '.vault-token': this._f('hvs.CAESIJlGSDK8exampletoken1234567890\n', 48, '-rw-------', 'root', 'root'),
          'NOTES.txt': this._f(`=== PROD SERVER NOTES ===\n\n- Internal DB IP: ${config.breadcrumbs.dbHost} (PostgreSQL)\n- Password is in vault now. Old backup was in /etc/shadow_backup... deleted it. I think.\n- CryptoBridge hot wallet threshold: 50 BTC\n- Emergency failover: ssh root@${config.breadcrumbs.internalHosts['db-replica']}\n- Kubernetes dashboard: https://${config.breadcrumbs.internalHosts['k8s-master']}:6443\n  Token: eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1Njc4OTAifQ.eyJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZS\n\n!! DO NOT reboot during market hours (UTC 08:00-22:00) !!\n!! Last incident: 2024-01-02, lost $47k in pending transactions !!\n`, 520, '-rw-------', 'root', 'root'),
        }, 'drwx------', 'root', 'root'),
        'run': this._d({}, 'drwxr-xr-x', 'root', 'root'),
        'srv': this._d({}, 'drwxr-xr-x', 'root', 'root'),
        'sys': this._d({}, 'dr-xr-xr-x', 'root', 'root'),
        'tmp': this._d({
          '.ICE-unix': this._d({}, 'drwxrwxrwt', 'root', 'root'),
          'systemd-private-abc123': this._d({}, 'drwx------', 'root', 'root'),
        }, 'drwxrwxrwt', 'root', 'root'),
        'usr': this._d({ 'bin': this._d({}, 'drwxr-xr-x', 'root', 'root'), 'lib': this._d({}, 'drwxr-xr-x', 'root', 'root'), 'local': this._d({ 'bin': this._d({}, 'drwxr-xr-x', 'root', 'root') }, 'drwxr-xr-x', 'root', 'root'), 'share': this._d({}, 'drwxr-xr-x', 'root', 'root'), 'sbin': this._d({}, 'drwxr-xr-x', 'root', 'root') }, 'drwxr-xr-x', 'root', 'root'),
        'var': this._d({
          'log': this._d({
            'syslog': this._f('', 2457600, '-rw-r-----', 'syslog', 'adm'),
            'auth.log': this._f('', 1048576, '-rw-r-----', 'syslog', 'adm'),
            'kern.log': this._f('', 524288, '-rw-r-----', 'syslog', 'adm'),
            'nginx': this._d({ 'access.log': this._f('', 5242880), 'error.log': this._f('', 1048576) }),
            'postgresql': this._d({ 'postgresql-14-main.log': this._f('', 2097152, '-rw-r--r--', 'postgres', 'postgres') }),
          }, 'drwxr-xr-x', 'root', 'root'),
          'www': this._d({ 'html': this._d({ 'index.html': this._f('<html><body><h1>CryptoBridge</h1></body></html>', 47) }) }, 'drwxr-xr-x', 'root', 'root'),
          'lib': this._d({ 'docker': this._d({}, 'drwx------', 'root', 'root') }, 'drwxr-xr-x', 'root', 'root'),
          'backups': this._d({
            'db_dump_2024-01-14.sql.gz': this._f(null, 157286400, '-rw-r-----', 'postgres', 'postgres'),
            'db_dump_2024-01-13.sql.gz': this._f(null, 156237824, '-rw-r-----', 'postgres', 'postgres'),
            'cryptobridge_config_backup.tar.gz': this._f(null, 4194304, '-rw-r-----'),
            '.old_shadow_copy': this._f(`root:$6$rounds=656000$saltsalt$hashhashhashhashhashhashhash:19377:0:99999:7:::\nadmin:$6$rounds=656000$randomsalt$anotherhashvaluehere1234567890abcdef:19377:0:99999:7:::\nsarah.chen:$6$rounds=656000$chensalt$yetanotherhashvalueforsarahchen12345:19380:0:99999:7:::\n`, 310, '-rw-------', 'root', 'root'),
          }, 'drwxr-x---', 'root', 'backup'),
        }, 'drwxr-xr-x', 'root', 'root'),
      }, 'drwxr-xr-x', 'root', 'root'),
    };

    this.tree['/'].children['home'].children['admin'] = this._buildAdminHome();
    return this.tree;
  }

  _buildAdminHome() {
    return this._d({
      '.bashrc': this._f(`# ~/.bashrc\nexport PATH=$PATH:/opt/cryptobridge/bin\nexport EDITOR=vim\nalias ll='ls -alF'\nalias la='ls -A'\nalias gs='git status'\nalias gp='git pull'\nalias deploy='cd ~/deployments && ./deploy.sh'\n\n# Quick DB access\nalias dbprod='psql -h ${config.breadcrumbs.dbHost} -U ${config.breadcrumbs.dbUser} -d ${config.breadcrumbs.dbName}'\n`, 340),
      '.bash_history': this._f(null, 4096),
      '.profile': this._f('# ~/.profile\nif [ -n "$BASH_VERSION" ]; then\n    if [ -f "$HOME/.bashrc" ]; then\n        . "$HOME/.bashrc"\n    fi\nfi\n', 130),
      '.ssh': this._d({
        'id_ed25519': this._f('-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW\nQyNTUxOQAAACBexamplekeydata_admin_honeypot_key_not_real_12345678\n-----END OPENSSH PRIVATE KEY-----\n', 320, '-rw-------'),
        'id_ed25519.pub': this._f('ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBex admin@prod-srv-01\n', 78, '-rw-r--r--'),
        'authorized_keys': this._f('ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBex admin@prod-srv-01\n', 78),
        'config': this._f(`Host db-primary\n    HostName ${config.breadcrumbs.dbHost}\n    User postgres\n    IdentityFile ~/.ssh/id_ed25519\n    StrictHostKeyChecking no\n\nHost vault\n    HostName ${config.breadcrumbs.internalHosts['vault-01']}\n    User admin\n    Port 22\n    IdentityFile ~/.ssh/id_ed25519\n\nHost k8s\n    HostName ${config.breadcrumbs.internalHosts['k8s-master']}\n    User admin\n    IdentityFile ~/.ssh/id_ed25519\n`, 380),
        'known_hosts': this._f('10.0.5.114 ecdsa-sha2-nistp256 AAAAE2Vj...\n10.0.6.10 ecdsa-sha2-nistp256 AAAAE2Vj...\n', 104),
      }, 'drwx------'),
      '.gnupg': this._d({}, 'drwx------'),
      '.vimrc': this._f('set number\nset tabstop=4\nset shiftwidth=4\nset expandtab\nsyntax on\n', 68),
      '.kube': this._d({
        'config': this._f(`apiVersion: v1\nclusters:\n- cluster:\n    server: https://${config.breadcrumbs.internalHosts['k8s-master']}:6443\n    certificate-authority-data: LS0tLS1CRUdJTi...\n  name: prod-cluster\ncontexts:\n- context:\n    cluster: prod-cluster\n    user: admin\n  name: prod-context\ncurrent-context: prod-context\nusers:\n- name: admin\n  user:\n    token: eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1Njc4OTAifQ\n`, 420, '-rw-------'),
      }, 'drwxr-x---'),
      'deployments': this._d({
        'deploy.sh': this._f(`#!/bin/bash\n# CryptoBridge Production Deployment Script\n# Author: sarah.chen@cryptobridge.io\n# WARN: Requires VPN connection to internal network\n\nset -euo pipefail\n\nENV=\${1:-staging}\nVERSION=\$(cat VERSION)\n\necho "[$(date)] Deploying CryptoBridge $VERSION to $ENV"\n\nif [ "$ENV" = "prod" ]; then\n    echo "PRODUCTION DEPLOYMENT - Requires approval from 2 team leads"\n    read -p "Approval token: " TOKEN\n    curl -s -X POST https://deploy.internal.cryptobridge.io/api/approve \\\n        -H "Authorization: Bearer $TOKEN" \\\n        -d "version=$VERSION&env=prod"\nfi\n\ndocker-compose -f docker-compose.$ENV.yml pull\ndocker-compose -f docker-compose.$ENV.yml up -d\n\necho "[$(date)] Deployment complete"\n`, 580, '-rwxr-xr-x'),
        'start_crypto_bridge.sh': this._f(`#!/bin/bash\n# Quick start script for CryptoBridge services\nENV=\${1:-staging}\necho "Starting CryptoBridge ($ENV)..."\ncd /opt/cryptobridge\n./bin/cb-server --config=config/$ENV.yml &\n./bin/cb-worker --config=config/$ENV.yml --workers=8 &\necho "Services started. PID: $!"\n`, 280, '-rwxr-xr-x'),
        'docker-compose.prod.yml': this._f(`version: '3.8'\nservices:\n  app:\n    image: cryptobridge/server:3.7.1\n    ports:\n      - "8443:8443"\n    environment:\n      - DB_HOST=${config.breadcrumbs.dbHost}\n      - DB_PASSWORD=${config.breadcrumbs.dbPassword}\n      - REDIS_HOST=${config.breadcrumbs.internalHosts['cache-01']}\n    volumes:\n      - /opt/cryptobridge/config:/app/config\n    restart: always\n  worker:\n    image: cryptobridge/worker:3.7.1\n    environment:\n      - DB_HOST=${config.breadcrumbs.dbHost}\n      - QUEUE_CONCURRENCY=8\n    restart: always\n`, 480, '-rw-r--r--'),
        'VERSION': this._f('3.7.1\n', 6),
        '.env': this._f(`DB_HOST=${config.breadcrumbs.dbHost}\nDB_PORT=${config.breadcrumbs.dbPort}\nDB_NAME=${config.breadcrumbs.dbName}\nDB_USER=${config.breadcrumbs.dbUser}\nDB_PASSWORD=${config.breadcrumbs.dbPassword}\nREDIS_URL=redis://${config.breadcrumbs.internalHosts['cache-01']}:6379\nSTRIPE_SECRET=${config.breadcrumbs.apiKeys.stripe}\nSENDGRID_KEY=${config.breadcrumbs.apiKeys.sendgrid}\nJWT_SECRET=s3cr3t_jwt_k3y_pr0d_2024\nNODE_ENV=production\n`, 380, '-rw-------'),
        'Makefile': this._f('deploy-prod:\n\t./deploy.sh prod\n\ndeploy-staging:\n\t./deploy.sh staging\n\nlogs:\n\tdocker-compose -f docker-compose.prod.yml logs -f\n\nstatus:\n\tdocker-compose -f docker-compose.prod.yml ps\n', 180),
      }),
      'project_phoenix': this._d({
        'README.md': this._f(`# Project Phoenix\n\n## CLASSIFIED - Internal Use Only\n\nNext-gen decentralized exchange platform.\n\n### Architecture\n- Microservices on K8s (see /home/admin/.kube/config)\n- PostgreSQL 14 + TimescaleDB\n- Redis Cluster for session management\n- Vault for secrets management\n\n### Access\n- Staging: https://phoenix-staging.internal.cryptobridge.io\n- Prod: NOT YET DEPLOYED\n- Jenkins: http://${config.breadcrumbs.internalHosts['dev-srv-01']}:8080\n\n### Team\n- Lead: sarah.chen\n- SRE: mike.ross\n- DevOps: admin (you)\n`, 520),
        'architecture.drawio': this._f(null, 45056),
        'api_keys.enc': this._f(null, 2048, '-rw-------'),
        'migration_plan.md': this._f('# Migration Plan\n\n## Phase 1: Database Migration\n- Export from current PostgreSQL (10.0.5.114)\n- Import to new Aurora cluster\n- Estimated downtime: 4 hours\n\n## Phase 2: Service Migration\n- Deploy to EKS cluster\n- Update DNS records\n- Switch traffic via ALB\n\n## Rollback Plan\n- Keep old DB running for 72 hours\n- DNS TTL set to 60s for quick rollback\n', 380),
        'credentials': this._d({
          'aws_prod.json': this._f(`{\n  "access_key": "${config.breadcrumbs.awsAccessKey}",\n  "secret_key": "${config.breadcrumbs.awsSecretKey}",\n  "region": "us-east-1",\n  "account_id": "123456789012"\n}`, 165, '-rw-------'),
          'k8s_service_account.json': this._f('{\n  "type": "service_account",\n  "project_id": "cryptobridge-prod",\n  "private_key_id": "key123456",\n  "client_email": "deploy@cryptobridge-prod.iam.gserviceaccount.com"\n}', 198, '-rw-------'),
        }, 'drwx------'),
      }),
      'scripts': this._d({
        'backup_db.sh': this._f(`#!/bin/bash\npg_dump -h ${config.breadcrumbs.dbHost} -U ${config.breadcrumbs.dbUser} ${config.breadcrumbs.dbName} | gzip > /var/backups/db_dump_$(date +%F).sql.gz\n`, 140, '-rwxr-xr-x'),
        'monitor.py': this._f('#!/usr/bin/env python3\nimport psutil\nimport requests\n\ndef check_services():\n    services = ["nginx", "postgres", "redis-server", "cb-server"]\n    for svc in services:\n        if not any(p.name() == svc for p in psutil.process_iter()):\n            alert(f"{svc} is DOWN!")\n\ndef alert(msg):\n    requests.post(SLACK_WEBHOOK, json={"text": f"🚨 ALERT: {msg}"})\n', 340, '-rwxr-xr-x'),
        'rotate_keys.sh': this._f('#!/bin/bash\n# Rotate API keys and update Vault\n# Run monthly via cron\nvault kv put secret/cryptobridge/api stripe=$NEW_STRIPE_KEY\nvault kv put secret/cryptobridge/db password=$NEW_DB_PASS\n', 190, '-rwxr-xr-x'),
      }),
      '.docker': this._d({ 'config.json': this._f('{\n  "auths": {\n    "registry.internal.cryptobridge.io": {\n      "auth": "YWRtaW46ZDBja2VyX3IzZzFzdHJ5X3Bhc3M="\n    }\n  }\n}', 142, '-rw-------') }, 'drwx------'),
      'TODO.txt': this._f(`[HIGH] Rotate DB password - it's been 90+ days\n[HIGH] Fix SSL cert renewal - expires Jan 28\n[MED]  Update Node.js to v20 LTS on all servers\n[MED]  Set up Prometheus alerting for CryptoBridge\n[LOW]  Clean up old Docker images (using 47GB)\n[LOW]  Document Project Phoenix deployment process\n\n--- Notes ---\n- sarah.chen has root access via her key in /root/.ssh/authorized_keys\n- Vault unseal keys are in the safe (ask mike.ross)\n- Old DB password backup might still be in /var/backups/.old_shadow_copy\n`, 460),
    }, 'drwxr-xr-x');
  }

  _buildEtc() {
    const users = config.systemUsers;
    const passwdContent = users.map(u => `${u.username}:x:${u.uid}:${u.gid}:${u.gecos}:${u.home}:${u.shell}`).join('\n') + '\n';
    const shadowContent = 'root:$6$rounds=656000$xxxx$hashvalue:19377:0:99999:7:::\ndaemon:*:19377:0:99999:7:::\nbin:*:19377:0:99999:7:::\nsys:*:19377:0:99999:7:::\nadmin:$6$rounds=656000$yyyy$hashvalue2:19377:0:99999:7:::\n';
    const groupContent = 'root:x:0:\ndaemon:x:1:\nbin:x:2:\nsys:x:3:\nadm:x:4:syslog,admin\nwww-data:x:33:\npostgres:x:120:\nredis:x:121:\nsudo:x:27:admin\ndocker:x:998:admin,deploy_bot\ndevops:x:1010:admin,sarah.chen\n';

    return this._d({
      'passwd': this._f(passwdContent, null, '-rw-r--r--', 'root', 'root'),
      'shadow': this._f(shadowContent, null, '-rw-r-----', 'root', 'shadow'),
      'group': this._f(groupContent, null, '-rw-r--r--', 'root', 'root'),
      'hostname': this._f(config.honeypot.hostname + '\n', null, '-rw-r--r--', 'root', 'root'),
      'hosts': this._f(`127.0.0.1 localhost\n127.0.1.1 ${config.honeypot.hostname}\n${config.breadcrumbs.dbHost} db-primary\n${config.breadcrumbs.internalHosts['db-replica']} db-replica\n${config.breadcrumbs.internalHosts['cache-01']} cache-01\n${config.breadcrumbs.internalHosts['vault-01']} vault-01\n${config.breadcrumbs.internalHosts['k8s-master']} k8s-master\n`, 310, '-rw-r--r--', 'root', 'root'),
      'resolv.conf': this._f(`nameserver ${config.network.dns[0]}\nnameserver ${config.network.dns[1]}\nsearch internal.cryptobridge.io\n`, 72, '-rw-r--r--', 'root', 'root'),
      'ssh': this._d({
        'sshd_config': this._f('Port 22\nPermitRootLogin prohibit-password\nPasswordAuthentication yes\nPubkeyAuthentication yes\nMaxAuthTries 6\nX11Forwarding yes\nUsePAM yes\n', 145, '-rw-r--r--', 'root', 'root'),
      }, 'drwxr-xr-x', 'root', 'root'),
      'nginx': this._d({
        'nginx.conf': this._f('worker_processes auto;\nevents { worker_connections 1024; }\nhttp {\n    include /etc/nginx/sites-enabled/*;\n    ssl_certificate /etc/nginx/ssl/server.crt;\n    ssl_certificate_key /etc/nginx/ssl/server.key;\n}\n', 210, '-rw-r--r--', 'root', 'root'),
        'ssl': this._d({
          'server.crt': this._f(null, 4096, '-rw-r--r--', 'root', 'root'),
          'server.key': this._f('-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA0example_fake_ssl_key_data_not_real_at_all_1234567890\nhoneypot_ssl_key_do_not_use_this_is_fake_abcdefghijklmnopqrstuvwxyz\n-----END RSA PRIVATE KEY-----\n', 220, '-rw-------', 'root', 'root'),
        }, 'drwx------', 'root', 'root'),
      }, 'drwxr-xr-x', 'root', 'root'),
      'crontab': this._f(`# m h dom mon dow user command\n0 2 * * * root /home/admin/scripts/backup_db.sh\n*/5 * * * * root /home/admin/scripts/monitor.py\n0 0 1 * * root /home/admin/scripts/rotate_keys.sh\n0 4 * * 0 root apt-get update && apt-get upgrade -y\n`, 245, '-rw-r--r--', 'root', 'root'),
      'os-release': this._f('PRETTY_NAME="Ubuntu 22.04.3 LTS"\nNAME="Ubuntu"\nVERSION_ID="22.04"\nVERSION="22.04.3 LTS (Jammy Jellyfish)"\nID=ubuntu\nID_LIKE=debian\nHOME_URL="https://www.ubuntu.com/"\n', 210, '-rw-r--r--', 'root', 'root'),
    }, 'drwxr-xr-x', 'root', 'root');
  }

  resolvePath(inputPath) {
    let path = inputPath.trim();
    if (path === '~' || path.startsWith('~/')) {
      path = config.user.home + path.slice(1);
    }
    if (!path.startsWith('/')) {
      path = this.cwd + '/' + path;
    }
    const parts = path.split('/').filter(Boolean);
    const resolved = [];
    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') { resolved.pop(); continue; }
      resolved.push(part);
    }
    return '/' + resolved.join('/');
  }

  getNode(path) {
    const resolved = this.resolvePath(path);
    if (resolved === '/') return this.tree['/'];
    const parts = resolved.split('/').filter(Boolean);
    let node = this.tree['/'];
    for (const part of parts) {
      if (!node || node.type !== 'dir' || !node.children[part]) return null;
      node = node.children[part];
      if (node.type === 'symlink') {
        node = this.getNode(node.target);
        if (!node) return null;
      }
    }
    return node;
  }

  listDir(path) {
    const node = this.getNode(path || this.cwd);
    if (!node) return null;
    if (node.type !== 'dir') return null;
    return node.children;
  }

  changeDir(path) {
    const resolved = this.resolvePath(path);
    const node = this.getNode(resolved);
    if (!node) return { success: false, error: `bash: cd: ${path}: No such file or directory` };
    if (node.type !== 'dir') return { success: false, error: `bash: cd: ${path}: Not a directory` };
    this.cwd = resolved;
    return { success: true };
  }

  readFile(path) {
    const node = this.getNode(path);
    if (!node) return { success: false, error: `cat: ${path}: No such file or directory` };
    if (node.type === 'dir') return { success: false, error: `cat: ${path}: Is a directory` };
    if (node.content === null) return { success: false, error: `cat: ${path}: Permission denied` };
    if (node.perms.startsWith('-rw-------') && node.owner !== config.user.username) {
      return { success: false, error: `cat: ${path}: Permission denied` };
    }
    return { success: true, content: node.content };
  }

  exists(path) {
    return this.getNode(path) !== null;
  }

  getParentPath(path) {
    const parts = path.split('/').filter(Boolean);
    parts.pop();
    return '/' + parts.join('/');
  }

  createFile(path, content = '') {
    const resolved = this.resolvePath(path);
    const parentPath = this.getParentPath(resolved);
    const parentNode = this.getNode(parentPath);
    if (!parentNode || parentNode.type !== 'dir') return false;
    const fileName = resolved.split('/').pop();
    parentNode.children[fileName] = this._f(content, null, '-rw-r--r--');
    return true;
  }

  createDir(path) {
    const resolved = this.resolvePath(path);
    const parentPath = this.getParentPath(resolved);
    const parentNode = this.getNode(parentPath);
    if (!parentNode || parentNode.type !== 'dir') return false;
    const dirName = resolved.split('/').pop();
    parentNode.children[dirName] = this._d({});
    return true;
  }
}

module.exports = VirtualFS;
