"""
WSGI config for config project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

import os
import sys
from pathlib import Path

# In Docker: __file__ = /app/backend/config/wsgi.py
# We need /app in sys.path so Python can find the 'backend' package.
backend_dir = Path(__file__).resolve().parent      # /app/backend/config
project_root = backend_dir.parent                   # /app/backend
app_root = project_root.parent                      # /app
for path in (str(backend_dir), str(project_root), str(app_root)):
    if path not in sys.path:
        sys.path.insert(0, path)

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

application = get_wsgi_application()
