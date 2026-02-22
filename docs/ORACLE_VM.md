# Deploying FoodChain on Oracle Cloud VM (Ubuntu 24 or Oracle Linux + local MySQL)

This guide deploys FoodChain onto one OCI Linux VM with:
- MySQL server on the same VM
- Spring Boot app managed by `systemd`
- Nginx on port 80 as reverse proxy

## 1) Provision the VM in OCI

Recommended minimum for a small environment:
- Shape: 2 OCPU / 8 GB RAM (or higher)
- OS: Ubuntu 24.04 LTS (recommended) or Oracle Linux 9
- Public IP attached

Open inbound Security List / NSG rules for:
- `80/tcp` (HTTP)
- `22/tcp` (SSH)

## 2) Clone repository onto VM

```bash
git clone https://github.com/<your-org-or-user>/foodchain.git
cd foodchain
```

## 3) Run deployment script

Set required secrets for first deploy:

```bash
export MYSQL_APP_PASSWORD='replace-this-db-password'
export JWT_SECRET='replace-this-with-a-long-random-secret'
sudo -E bash deploy/ubuntu-vm/deploy.sh
```

If your MySQL install requires root password auth, also export:

```bash
export MYSQL_ROOT_PASSWORD='your-mysql-root-password'
```

What the script does:
- Installs system dependencies (`mysql-server`, `nginx`, Java 21, Maven, Node.js)
- Creates local DB/user (`foodchain` / `foodchain@localhost`)
- Builds frontend + backend jar
- Installs and starts `foodchain.service` and Nginx
- Writes runtime env file at `/etc/foodchain/foodchain.env` if missing

The script auto-detects distro and uses:
- `apt` + `mysql` service on Ubuntu
- `dnf` + `mysqld` service on Oracle Linux

## 4) Verify

On VM:

```bash
systemctl status foodchain --no-pager
systemctl status nginx --no-pager
curl http://127.0.0.1:8080/actuator/health
```

From your machine:

```bash
curl http://<vm-public-ip>/actuator/health
```

## 5) Runtime config

Runtime environment file:
- `/etc/foodchain/foodchain.env`

Template source:
- `deploy/ubuntu-vm/foodchain.env.example`

After editing env values:

```bash
sudo systemctl restart foodchain
```

## 6) Redeploy after code changes

On VM inside repo:

```bash
git pull
export MYSQL_APP_PASSWORD='existing-db-password'
export JWT_SECRET='existing-jwt-secret'
sudo -E bash deploy/ubuntu-vm/deploy.sh
```

## 7) GitHub Actions auto-deploy

Workflow file:
- `.github/workflows/deploy-oracle-vm.yml`

How CI deploy works now:
- Builds frontend and backend jar in GitHub Actions runner
- Uploads prebuilt `foodchain.jar` to VM at `/tmp/foodchain.jar`
- Runs `deploy/ubuntu-vm/deploy.sh` with `PREBUILT_JAR=/tmp/foodchain.jar`
- VM skips npm/maven build during deploy in this mode

Required GitHub repository secrets:
- `OCI_VM_HOST`
- `OCI_VM_USER`
- `OCI_VM_SSH_KEY` (private key for SSH auth)
- `MYSQL_APP_PASSWORD`
- `JWT_SECRET`

Optional secrets:
- `MYSQL_ROOT_PASSWORD`
- `OCI_REPO_URL` (defaults to current GitHub repo URL)
- `OCI_REPO_DIR` (defaults to `/opt/foodchain-src`)

VM requirement for non-interactive deploy from CI:
- user in `OCI_VM_USER` must be allowed to run deploy script with `sudo` without interactive password prompt.

## Notes

- Current deploy script is HTTP-only by default. Add TLS (Let's Encrypt or OCI Load Balancer) for production internet traffic.
- Database and app are on same VM for simplicity. For higher availability, split DB and app tiers.
