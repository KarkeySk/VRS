#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <developer-key>"
  echo "Keys: swornim-karki | magish-gautam | nikesh-deuja | swornim-shrestha"
  exit 1
fi

key="$1"

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
    echo "Use one of: swornim-karki | magish-gautam | nikesh-deuja | swornim-shrestha"
    exit 1
    ;;
esac

git config --global user.name "$name"
git config --global user.email "$email"

echo "Global git identity updated:"
echo "name:  $name"
echo "email: $email"
