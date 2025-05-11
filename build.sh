#!/bin/bash
set -e

# Create and activate virtual environment
python -m venv /opt/venv
source /opt/venv/bin/activate

# Install dependencies
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

echo "Build completed successfully!"
