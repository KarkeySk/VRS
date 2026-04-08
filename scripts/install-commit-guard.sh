#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

chmod +x .githooks/pre-commit
git config --local core.hooksPath .githooks

echo "Commit guard enabled."
echo "hooksPath: $(git config --get core.hooksPath)"
echo "Use: ./scripts/switch-git-identity.sh <task-key>"
echo "Task keys: backend | user-frontend | user-workflow | admin-domain"
