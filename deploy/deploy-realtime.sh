#!/usr/bin/env bash
set -euo pipefail

archive="${1:?release archive is required}"
release_id="${2:?release id is required}"
release_dir="/srv/web-lab/releases/${release_id}"

install -d -o ubuntu -g ubuntu /srv/web-lab/releases
install -d -o ubuntu -g ubuntu "${release_dir}"
tar -xzf "${archive}" -C "${release_dir}"
chown -R ubuntu:ubuntu "${release_dir}"
ln -sfn "${release_dir}" /srv/web-lab/current

systemctl restart web-lab-realtime
rm -f "${archive}"
