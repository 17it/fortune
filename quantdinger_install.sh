#!/usr/bin/env bash
#
# QuantDinger 选项 A 一键安装脚本（Ubuntu 24.04）
# 功能：检查磁盘 -> 安装 Docker -> 审查并运行官方 install.sh -> 验证服务
#
# 用法：
#   sudo bash quantdinger_install.sh
#
# 可选环境变量：
#   DOCKER_DATA_ROOT   # 将 /var/lib/docker 软链/迁移到独立磁盘（如 /data/docker）
#   SKIP_DOCKER_CHECK  # 设为 1 可跳过 Docker 已安装检测（不推荐）
#   MIN_FREE_GB        # 最小可用磁盘(GB)，默认 10
#
set -euo pipefail

MIN_FREE_GB="${MIN_FREE_GB:-10}"
DOCKER_DATA_ROOT="${DOCKER_DATA_ROOT:-}"
INSTALL_SH_URL="https://raw.githubusercontent.com/OpenByteInc/QuantDinger/main/install.sh"

log()  { echo -e "\033[32m[INFO]\033[0m  $*"; }
warn() { echo -e "\033[33m[WARN]\033[0m  $*"; }
err()  { echo -e "\033[31m[ERROR]\033[0m $*" >&2; }
die()  { err "$*"; exit 1; }

# 1. 必须以 root 运行
[ "$(id -u)" -eq 0 ] || die "请使用 sudo 运行： sudo bash $0"

# 2. 系统版本提示（非 24.04 仅警告）
if [ -f /etc/os-release ]; then
  . /etc/os-release
  if [ "${VERSION_ID:-}" != "24.04" ]; then
    warn "检测到系统为 ${PRETTY_NAME:-未知}，本脚本面向 Ubuntu 24.04，继续前请确认。"
  fi
fi

# 3. 磁盘空间检查（检查根分区 /）
free_gb=$(df -BG / | awk 'NR==2 {gsub("G","",$4); print $4}')
log "根分区可用空间: ${free_gb}G (要求 >= ${MIN_FREE_GB}G)"
if [ "${free_gb}" -lt "${MIN_FREE_GB}" ]; then
  die "磁盘空间不足，请清理或挂载额外磁盘后重试（可设置 DOCKER_DATA_ROOT 指向大容量盘）。"
fi

# 4. 安装 Docker（如尚未安装）
if command -v docker >/dev/null 2>&1 && [ "${SKIP_DOCKER_CHECK:-0}" != "1" ]; then
  log "已检测到 Docker: $(docker --version)"
else
  log "开始安装 Docker 引擎与 Compose 插件 ..."
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg lsb-release
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
    https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    | tee /etc/apt/sources.list.d/docker.list >/dev/null
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

  systemctl enable --now docker
  log "Docker 安装完成: $(docker --version)"
  docker compose version || die "docker compose v2 未就绪"
fi

# 5. 可选：将 Docker 数据目录迁移到独立磁盘
if [ -n "${DOCKER_DATA_ROOT}" ]; then
  if [ ! -d "${DOCKER_DATA_ROOT}" ]; then
    mkdir -p "${DOCKER_DATA_ROOT}"
    log "已创建 Docker 数据根目录: ${DOCKER_DATA_ROOT}"
  fi
  if [ ! -f /etc/docker/daemon.json ]; then
    echo "{\"data-root\": \"${DOCKER_DATA_ROOT}\"}" > /etc/docker/daemon.json
    log "已设置 /etc/docker/daemon.json data-root=${DOCKER_DATA_ROOT}"
    systemctl restart docker
    sleep 3
  else
    warn "/etc/docker/daemon.json 已存在，跳过 data-root 配置（请手动确认）。"
  fi
fi

# 6. 下载官方 install.sh 供审查（避免直接 curl | bash）
tmp_sh="/tmp/quantdinger_install.sh"
log "下载官方安装脚本到 ${tmp_sh} ..."
curl -fsSL "${INSTALL_SH_URL}" -o "${tmp_sh}"
chmod +x "${tmp_sh}"
log "脚本大小: $(du -h "${tmp_sh}" | cut -f1)"

echo
warn "强烈建议先审阅脚本内容再执行。可另开终端查看： cat ${tmp_sh}"
read -r -p "确认执行官方 install.sh ？(y/N) " confirm
case "${confirm}" in
  y|Y|yes|YES) ;;
  *) die "已取消执行。请自行审阅后手动运行: bash ${tmp_sh}";;
esac

# 7. 运行安装脚本
log "开始运行 QuantDinger 安装脚本 ..."
bash "${tmp_sh}"

# 8. 验证服务
echo
log "安装脚本执行完毕，等待服务启动(30s) ..."
sleep 30
for url in "http://127.0.0.1:8888" "http://127.0.0.1:5000/api/health"; do
  if curl -fsS -o /dev/null "$url"; then
    log "✅ 可访问: $url"
  else
    warn "⚠️  暂未就绪: $url （稍后请运行 docker compose ps 检查）"
  fi
done

echo
log "完成。访问地址："
log "  Web 客户端: http://127.0.0.1:8888"
log "  移动端 H5 : http://127.0.0.1:8889"
log "  API 健康  : http://127.0.0.1:5000/api/health"
