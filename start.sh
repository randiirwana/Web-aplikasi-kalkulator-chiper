#!/usr/bin/env bash
set -e

cd "kalkulator"

python -m pip install --upgrade pip
pip install -r requirements.txt

exec gunicorn wsgi:app --workers 2 --bind 0.0.0.0:${PORT:-8000}
