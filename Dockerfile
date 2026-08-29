# Use the small Python 3.11 image as the application base image.
FROM python:3.11-slim

# Set the working directory inside the container.
WORKDIR /app

# Prevent Python from creating .pyc bytecode files.
ENV PYTHONDONTWRITEBYTECODE=1

# Send Python output directly to the container logs.
ENV PYTHONUNBUFFERED=1

# Copy the Python dependency list into the container.
COPY requirements.txt .

# Install all Python dependencies listed in requirements.txt.
RUN pip install --no-cache-dir -r requirements.txt

# Copy the project files into the container.
COPY . .

# Ensure the upload directory exists inside the container.
RUN mkdir -p /app/uploads

# Document the port used by the Flask application.
EXPOSE 5000

# Start the Flask application through its app.py entry point.
CMD ["python", "app.py"]
