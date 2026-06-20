# LiveSale Fitness Deployment

Production domains:

- `https://livesale.fitness` -> public frontend
- `https://admin.livesale.fitness` -> admin frontend
- `https://api.livesale.fitness` -> backend API

## Server Prerequisites

1. Point DNS `A` records for `livesale.fitness`, `www.livesale.fitness`, `api.livesale.fitness`, and `admin.livesale.fitness` to the VPS public IP.
2. Install Docker, Docker Compose plugin, Git, and Certbot.
3. Clone this repository on the VPS, for example `/opt/livesale-fitness`.
4. Create `.env.production` from `.env.production.example` and replace every secret value.

## First SSL Certificate

Run this before starting the production compose stack, because Nginx expects the certificate files to exist:

```bash
sudo docker run --rm -p 80:80 \
  -v /etc/letsencrypt:/etc/letsencrypt \
  certbot/certbot certonly --standalone \
  -d livesale.fitness \
  -d www.livesale.fitness \
  -d api.livesale.fitness \
  -d admin.livesale.fitness \
  --email admin@livesale.fitness \
  --agree-tos \
  --no-eff-email
```

## Start Production

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Health checks:

```bash
curl https://api.livesale.fitness/health
docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

## GitHub Actions CI/CD

Add these repository secrets:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_KEY`
- `DEPLOY_PORT` optional, defaults to `22`
- `DEPLOY_PATH`, for example `/opt/livesale-fitness`
- `ENV_PRODUCTION`, the full contents of your server `.env.production`

The workflow builds both frontends, then SSHes into the VPS, pulls `main`, writes `.env.production`, and runs:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build --remove-orphans
```

## Certificate Renewal

If you renew certificates on the host with Certbot, reload Nginx after renewal:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec nginx nginx -s reload
```
