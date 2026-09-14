#!/bin/sh
set -eu

chmod +x .githooks/pre-commit
git config core.hooksPath .githooks
echo "Git hooks enabled from .githooks"