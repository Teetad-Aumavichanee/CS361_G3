# CS361_G3

## Project Context

Read [project-context.md](project-context.md) before developing. It contains the project requirements, user roles, technical stack, database information, cloud architecture, and folder structure.

## Setup Guide

### 1. Start Docker

Install and open Docker Desktop, then confirm Docker is running:

```bash
docker --version
docker compose version
```

### 2. Start the application

Run this command from the project root:

```bash
docker compose up --build -d
```

This command builds the Docker image, starts MongoDB, and runs `backend/app.py`.

### 3. Test the application

Open this URL in a browser:

```text
http://localhost:5000
```


### 4. Update Python libraries(importance)

Add or update libraries in project must update into `requirements.txt`. so, other team member can update libraries, then rebuild the application image:

```bash
docker compose up --build -d
```

A rebuild is required after changing `requirements.txt` or `Dockerfile`.

### 5. Stop the application

```bash
docker compose down
```
