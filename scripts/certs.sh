#!/usr/bin/env bash
# Gestion des certificats HTTPS locaux pour le serveur de dev Vite.
#
# Usage: npm run certs [-- <commande>]
#   create  Crée les certificats s'ils n'existent pas (défaut)
#   renew   Supprime puis recrée les certificats
#   remove  Supprime les certificats
#   info    Affiche les domaines et la date d'expiration

set -euo pipefail

cd "$(dirname "$0")/.."

KEY_FILE="localhost-key.pem"
CERT_FILE="localhost.pem"

require_mkcert() {
  if ! command -v mkcert >/dev/null 2>&1; then
    echo "❌ mkcert n'est pas installé: https://github.com/FiloSottile/mkcert" >&2
    echo "   macOS: brew install mkcert" >&2
    exit 1
  fi
}

# IP locale, pour accéder au serveur de dev depuis un autre appareil (vite --host)
lan_ip() {
  ipconfig getifaddr en0 2>/dev/null \
    || hostname -I 2>/dev/null | awk '{print $1}' \
    || true
}

create() {
  if [[ -f "$KEY_FILE" && -f "$CERT_FILE" ]]; then
    echo "✅ Les certificats existent déjà ($CERT_FILE, $KEY_FILE)"
    echo "   Utilise 'npm run certs -- renew' pour les recréer"
    return
  fi

  require_mkcert
  mkcert -install

  local hosts=(localhost 127.0.0.1 ::1)
  local ip
  ip="$(lan_ip)"
  [[ -n "$ip" ]] && hosts+=("$ip")

  mkcert -key-file "$KEY_FILE" -cert-file "$CERT_FILE" "${hosts[@]}"
  echo "✅ Certificats créés pour: ${hosts[*]}"
}

remove() {
  rm -f "$KEY_FILE" "$CERT_FILE"
  echo "🗑️  Certificats supprimés"
}

info() {
  if [[ ! -f "$CERT_FILE" ]]; then
    echo "❌ Aucun certificat trouvé. Lance 'npm run certs'" >&2
    exit 1
  fi
  openssl x509 -in "$CERT_FILE" -noout -enddate
  openssl x509 -in "$CERT_FILE" -noout -ext subjectAltName
}

case "${1:-create}" in
  create) create ;;
  renew) remove && create ;;
  remove) remove ;;
  info) info ;;
  *)
    echo "Usage: npm run certs [-- create|renew|remove|info]" >&2
    exit 1
    ;;
esac
