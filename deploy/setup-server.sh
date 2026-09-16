#!/usr/bin/env bash
# One-time bootstrap for a fresh Ubuntu 22.04+ VPS. Run as a user with sudo access:
#   curl -fsSL https://raw.githubusercontent.com/<owner>/<repo>/main/deploy/setup-server.sh | bash
# or copy it up and run it directly.
set -euo pipefail

if ! command -v docker >/dev/null 2>&1; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
fi

sudo mkdir -p /opt/expense-tracker
sudo chown "$USER":"$USER" /opt/expense-tracker

if command -v ufw >/dev/null 2>&1; then
  sudo ufw allow OpenSSH
  sudo ufw allow 80/tcp
  sudo ufw allow 4000/tcp
  sudo ufw --force enable
fi

cat <<'EOF'

Server bootstrap complete. Next steps:

1. Log out and back in (or run `newgrp docker`) so your user can run docker without sudo.
2. Create /opt/expense-tracker/.env with the production secrets (see .env.production.example
   in the repo for the required keys — POSTGRES_*, JWT_*_SECRET, WEB_ORIGIN).
3. Add these GitHub Actions secrets in the repo (Settings -> Secrets and variables -> Actions):
     DEPLOY_HOST          this server's IP
     DEPLOY_USER           the SSH user you'll deploy as
     DEPLOY_SSH_KEY        private key matching a public key in this user's ~/.ssh/authorized_keys
     DEPLOY_PORT           usually 22
     NEXT_PUBLIC_API_URL   the public URL the browser will call, e.g. http://<this-server-ip>:4000
4. Push to main. The Deploy workflow will build images, push them to ghcr.io, copy
   docker-compose.prod.yml here, and run `docker compose up -d`.
5. By default the ghcr.io packages are private, so this server needs to authenticate to pull them:
     echo <a GitHub PAT with read:packages> | docker login ghcr.io -u <github-username> --password-stdin
   Or simplest: make the two packages public in GitHub -> your profile -> Packages, after the first push.

EOF
