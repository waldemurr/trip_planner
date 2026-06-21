FROM python:3.13

WORKDIR /app

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY . .

WORKDIR /app/backend

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
