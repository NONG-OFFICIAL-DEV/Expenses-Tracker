# Deployment

`apps/api` and `apps/web` are independent Node projects (their own `package.json`, `package-lock.json`,
`node_modules`, and `Dockerfile`). Nothing is shared between them at the code level except a small
duplicated copy of the Zod schemas/types (`apps/api/src/shared` and `apps/web/src/lib/shared`) — if you
change one, change the other to match.

## Local development

```bash
docker compose up -d                 # Postgres on localhost:5433

cd apps/api && npm install && npm run db:migrate && npm run db:seed && npm run dev   # http://localhost:4000
cd apps/web && npm install && npm run dev                                            # http://localhost:3000
```

## Production: self-hosted VPS via Docker Compose

Architecture: GitHub Actions builds both apps as Docker images on every push to `main`, pushes them to
`ghcr.io`, then SSHes into your server and runs `docker compose up -d`.

### One-time server setup

1. Provision an Ubuntu 22.04+ VPS you can SSH into.
2. Run `deploy/setup-server.sh` on it (installs Docker, opens ports 80/4000, creates `/opt/expense-tracker`).
3. Copy `.env.production.example` to `/opt/expense-tracker/.env` on the server and fill in real secrets.
4. Make the two GHCR packages (`expenses-tracker-api`, `expenses-tracker-web`) public after the first push
   (GitHub → your profile → Packages → package settings), or set up a `docker login ghcr.io` on the server
   with a PAT that has `read:packages` — otherwise `docker compose pull` will fail with 401/403.

### GitHub Actions secrets required

Add these under repo Settings → Secrets and variables → Actions:

| Secret | Value |
|---|---|
| `DEPLOY_HOST` | server IP |
| `DEPLOY_USER` | SSH user |
| `DEPLOY_SSH_KEY` | private key matching a key in that user's `~/.ssh/authorized_keys` |
| `DEPLOY_PORT` | usually `22` |
| `NEXT_PUBLIC_API_URL` | public API URL the browser will call, e.g. `http://<server-ip>:4000` |

`NEXT_PUBLIC_API_URL` is baked into the web bundle at **build time** (Next.js inlines `NEXT_PUBLIC_*` vars),
so changing it requires a rebuild — pushing to `main` again is enough.

### What happens on push to `main`

`.github/workflows/deploy.yml`: typecheck/build both apps → build+push both Docker images to GHCR →
copy `docker-compose.prod.yml` to `/opt/expense-tracker` on the server → `docker compose pull && up -d`.

Every deploy also runs `prisma migrate deploy` automatically as the API container's entrypoint, before the
server starts.

### Ports (no domain yet)

- Web: `http://<server-ip>` (port 80)
- API: `http://<server-ip>:4000`
- Postgres is internal to the Docker network only, not exposed on the host.

### Adding a domain + HTTPS later

Point two DNS A records at the server (e.g. `app.yourdomain.com`, `api.yourdomain.com`), put a reverse
proxy like [Caddy](https://caddyserver.com) in front of the `web`/`api` services for automatic Let's
Encrypt TLS, and update `WEB_ORIGIN` / `NEXT_PUBLIC_API_URL` to the new `https://` URLs. Not wired up yet
since there's no domain to point it at — ask when you're ready and this gets straightforward to add.
