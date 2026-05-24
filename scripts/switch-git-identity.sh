#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 || $# -gt 2 ]]; then
  echo "Usage: $0 <developer-key|task-key> [--global]"
  echo "Developer keys: swornim-karki | magish-gautam | nikesh-deuja | swornim-shrestha"
  echo "Task keys: backend | user-frontend | user-workflow | admin-domain"
  exit 1
fi

key="$1"
scope="${2:-}"

if [[ -n "$scope" && "$scope" != "--global" ]]; then
  echo "Invalid second argument: $scope"
  echo "Only '--global' is supported as an optional flag."
  exit 1
fi

config_scope="--local"
if [[ "$scope" == "--global" ]]; then
  config_scope="--global"
fi

case "$key" in
  backend)
    key="swornim-karki"
    ;;
  user-frontend)
    key="magish-gautam"
    ;;
  user-workflow)
    key="nikesh-deuja"
    ;;
  admin-domain)
    key="swornim-shrestha"
    ;;
esac

case "$key" in
  swornim-karki)
    name="Swornim Karki"
    email="np03cs4a240032@heraldcollege.edu.np"
    ;;
  magish-gautam)
    name="Magish Gautam"
    email="np03cs4a240172@heraldcollege.edu.np"
    ;;
  nikesh-deuja)
    name="Nikesh Deuja"
    email="np03cs4a240352@heraldcollege.edu.np"
    ;;
  swornim-shrestha)
    name="Swornim Chakubaji Shrestha"
    email="np03cs4a240239@heraldcollege.edu.np"
    ;;
  *)
    echo "Unknown key: $key"
    echo "Use developer keys: swornim-karki | magish-gautam | nikesh-deuja | swornim-shrestha"
    echo "Or task keys: backend | user-frontend | user-workflow | admin-domain"
    exit 1
    ;;
esac

git config "$config_scope" user.name "$name"
git config "$config_scope" user.email "$email"

if [[ "$config_scope" == "--global" ]]; then
  echo "Global git identity updated:"
else
  echo "Repository git identity updated:"
fi
echo "name:  $name"
echo "email: $email"
