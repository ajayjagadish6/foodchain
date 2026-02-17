#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root (for example: sudo bash deploy/oracle-vm/deploy.sh)."
  exit 1
fi

: "${MYSQL_APP_PASSWORD:?Set MYSQL_APP_PASSWORD before running this script.}"
: "${JWT_SECRET:?Set JWT_SECRET before running this script.}"

APP_USER="foodchain"
APP_GROUP="foodchain"
APP_ROOT="/opt/foodchain"
ENV_DIR="/etc/foodchain"
ENV_FILE="${ENV_DIR}/foodchain.env"
SYSTEMD_UNIT="/etc/systemd/system/foodchain.service"
NGINX_CONF="/etc/nginx/conf.d/foodchain.conf"
RELEASE_TS="$(date +%Y%m%d%H%M%S)"
REPO_SOURCE="${REPO_SOURCE:-$(pwd)}"
RELEASE_DIR="${APP_ROOT}/releases/${RELEASE_TS}"

if [[ ! -f "${REPO_SOURCE}/backend/pom.xml" || ! -f "${REPO_SOURCE}/frontend/package.json" ]]; then
  echo "REPO_SOURCE must point to the FoodChain repository root."
  exit 1
fi

echo "Installing system dependencies..."
dnf -y install oracle-epel-release-el9 >/dev/null 2>&1 || true
dnf -y module enable nodejs:20 >/dev/null 2>&1 || true
dnf -y install git rsync nginx mysql-server java-21-openjdk-headless java-21-openjdk-devel maven nodejs

if ! id -u "${APP_USER}" >/dev/null 2>&1; then
  useradd --system --home-dir "${APP_ROOT}" --shell /sbin/nologin "${APP_USER}"
fi

mkdir -p "${APP_ROOT}/releases" "${ENV_DIR}"
chown -R "${APP_USER}:${APP_GROUP}" "${APP_ROOT}"

systemctl enable --now mysqld

MYSQL_CMD=(mysql -uroot)
if ! "${MYSQL_CMD[@]}" -e "SELECT 1" >/dev/null 2>&1; then
  if [[ -n "${MYSQL_ROOT_PASSWORD:-}" ]]; then
    MYSQL_CMD=(mysql -uroot "-p${MYSQL_ROOT_PASSWORD}")
  fi
fi

if ! "${MYSQL_CMD[@]}" -e "SELECT 1" >/dev/null 2>&1; then
  echo "Unable to authenticate as MySQL root."
  echo "Set MYSQL_ROOT_PASSWORD (if required by your MySQL installation) and retry."
  exit 1
fi

# Create app DB/user if they do not exist.
"${MYSQL_CMD[@]}" <<SQL
CREATE DATABASE IF NOT EXISTS foodchain;
CREATE USER IF NOT EXISTS 'foodchain'@'localhost' IDENTIFIED BY '${MYSQL_APP_PASSWORD}';
ALTER USER 'foodchain'@'localhost' IDENTIFIED BY '${MYSQL_APP_PASSWORD}';
GRANT ALL PRIVILEGES ON foodchain.* TO 'foodchain'@'localhost';
FLUSH PRIVILEGES;
SQL

if [[ ! -f "${ENV_FILE}" ]]; then
  cp "${REPO_SOURCE}/deploy/oracle-vm/foodchain.env.example" "${ENV_FILE}"
fi

# Keep operator-managed env values and ensure core secrets are current.
sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=${MYSQL_APP_PASSWORD}|" "${ENV_FILE}" || true
sed -i "s|^JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" "${ENV_FILE}" || true


echo "Staging release ${RELEASE_TS}..."
rsync -a --delete \
  --exclude '.git' \
  --exclude '.github' \
  --exclude '.vscode' \
  --exclude 'backend/target' \
  --exclude 'frontend/node_modules' \
  "${REPO_SOURCE}/" "${RELEASE_DIR}/"

pushd "${RELEASE_DIR}/frontend" >/dev/null
npm ci
npm run build
popd >/dev/null

pushd "${RELEASE_DIR}/backend" >/dev/null
mvn -DskipTests package
popd >/dev/null

ln -sfn "${RELEASE_DIR}" "${APP_ROOT}/current"
chown -h "${APP_USER}:${APP_GROUP}" "${APP_ROOT}/current"
chown -R "${APP_USER}:${APP_GROUP}" "${RELEASE_DIR}"

install -m 0644 "${REPO_SOURCE}/deploy/oracle-vm/foodchain.service" "${SYSTEMD_UNIT}"
install -m 0644 "${REPO_SOURCE}/deploy/oracle-vm/nginx-foodchain.conf" "${NGINX_CONF}"

systemctl daemon-reload
systemctl enable --now foodchain
systemctl restart foodchain
systemctl enable --now nginx
systemctl restart nginx

if command -v firewall-cmd >/dev/null 2>&1; then
  firewall-cmd --permanent --add-service=http >/dev/null 2>&1 || true
  firewall-cmd --reload >/dev/null 2>&1 || true
fi

sleep 2
curl -fsS "http://127.0.0.1:8080/actuator/health" >/dev/null

echo "Deployment complete."
echo "- app dir: ${APP_ROOT}/current"
echo "- env file: ${ENV_FILE}"
echo "- health:   http://127.0.0.1:8080/actuator/health"
