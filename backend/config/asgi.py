"""
ASGI config for config project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

import os
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent
project_root = backend_dir.parent
app_root = project_root.parent
for path in (str(backend_dir), str(project_root), str(app_root)):
    if path not in sys.path:
        sys.path.insert(0, path)

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

application = get_asgi_application()
