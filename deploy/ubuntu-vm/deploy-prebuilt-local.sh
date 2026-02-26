#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

: "${OCI_VM_HOST:?Set OCI_VM_HOST}"
: "${OCI_VM_USER:?Set OCI_VM_USER}"
: "${OCI_VM_SSH_KEY:?Set OCI_VM_SSH_KEY (path to private key)}"
: "${MYSQL_APP_PASSWORD:?Set MYSQL_APP_PASSWORD}"
: "${JWT_SECRET:?Set JWT_SECRET}"

OCI_VM_SSH_PORT="${OCI_VM_SSH_PORT:-22}"
OCI_REPO_DIR="${OCI_REPO_DIR:-/opt/foodchain-src}"
OCI_REPO_URL="${OCI_REPO_URL:-$(git -C "${REPO_ROOT}" remote get-url origin)}"
LOCAL_BUILD_DIR="$(mktemp -d)"
REMOTE_JAR_PATH="/tmp/foodchain.jar"

cleanup() {
  rm -rf "${LOCAL_BUILD_DIR}"
}
trap cleanup EXIT

echo "Preparing clean local build workspace..."
rsync -a --delete \
  --exclude '.git' \
  --exclude '.github' \
  --exclude '.vscode' \
  --exclude 'backend/target' \
  --exclude 'frontend/node_modules' \
  "${REPO_ROOT}/" "${LOCAL_BUILD_DIR}/src/"

pushd "${LOCAL_BUILD_DIR}/src/frontend" >/dev/null
if [[ -f package-lock.json ]]; then
  npm ci --no-audit --no-fund --progress=false
else
  npm install --no-audit --no-fund --progress=false
fi
npm run build
popd >/dev/null

rm -rf "${LOCAL_BUILD_DIR}/src/backend/src/main/resources/static"
mkdir -p "${LOCAL_BUILD_DIR}/src/backend/src/main/resources/static"
cp -R "${LOCAL_BUILD_DIR}/src/frontend/dist/." "${LOCAL_BUILD_DIR}/src/backend/src/main/resources/static/"

pushd "${LOCAL_BUILD_DIR}/src/backend" >/dev/null
mvn -DskipTests package
popd >/dev/null

cp "${LOCAL_BUILD_DIR}/src/backend/target/foodchain.jar" "${LOCAL_BUILD_DIR}/foodchain.jar"

echo "Uploading prebuilt jar to VM..."
scp -i "${OCI_VM_SSH_KEY}" -P "${OCI_VM_SSH_PORT}" "${LOCAL_BUILD_DIR}/foodchain.jar" "${OCI_VM_USER}@${OCI_VM_HOST}:${REMOTE_JAR_PATH}"

echo "Triggering remote deploy on VM..."
SSH_OPTS=(-i "${OCI_VM_SSH_KEY}" -p "${OCI_VM_SSH_PORT}" -o StrictHostKeyChecking=accept-new)
REMOTE_ENV=(
  "MYSQL_APP_PASSWORD=$(printf '%q' "${MYSQL_APP_PASSWORD}")"
  "JWT_SECRET=$(printf '%q' "${JWT_SECRET}")"
  "OCI_REPO_DIR=$(printf '%q' "${OCI_REPO_DIR}")"
  "OCI_REPO_URL=$(printf '%q' "${OCI_REPO_URL}")"
)
if [[ -n "${MYSQL_ROOT_PASSWORD:-}" ]]; then
  REMOTE_ENV+=("MYSQL_ROOT_PASSWORD=$(printf '%q' "${MYSQL_ROOT_PASSWORD}")")
fi

ssh "${SSH_OPTS[@]}" "${OCI_VM_USER}@${OCI_VM_HOST}" "
  set -euo pipefail
  export ${REMOTE_ENV[*]}

  if [ ! -d \"\${OCI_REPO_DIR}/.git\" ]; then
    mkdir -p \"\${OCI_REPO_DIR}\"
    git clone \"\${OCI_REPO_URL}\" \"\${OCI_REPO_DIR}\"
  fi

  cd \"\${OCI_REPO_DIR}\"
  git fetch --prune origin
  git checkout main
  git reset --hard origin/main

  if [ -n \"\${MYSQL_ROOT_PASSWORD:-}\" ]; then
    sudo -E env MYSQL_APP_PASSWORD=\"\${MYSQL_APP_PASSWORD}\" MYSQL_ROOT_PASSWORD=\"\${MYSQL_ROOT_PASSWORD}\" JWT_SECRET=\"\${JWT_SECRET}\" PREBUILT_JAR=\"${REMOTE_JAR_PATH}\" bash deploy/ubuntu-vm/deploy.sh
  else
    sudo -E env MYSQL_APP_PASSWORD=\"\${MYSQL_APP_PASSWORD}\" JWT_SECRET=\"\${JWT_SECRET}\" PREBUILT_JAR=\"${REMOTE_JAR_PATH}\" bash deploy/ubuntu-vm/deploy.sh
  fi
"

echo "Prebuilt deployment complete."
