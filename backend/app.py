"""Create and run the Flask application."""

# Import Flask to create the web application.
from flask import Flask

from backend import config
from backend.routes import documents_bp


# Create and configure the Flask application.
def create_app():
    # Create the Flask application instance.
    app = Flask(__name__)

    # Load settings such as the MongoDB URI and upload folder.
    app.config.from_object(config)

    # Register document API routes under /api/v1/documents.
    app.register_blueprint(documents_bp)
    return app


# Create the application instance used by Flask and Docker.
app = create_app()


# Provide a simple endpoint for checking that the backend is running.
@app.get("/")
def health_check():
    # Return a basic response from the backend.
    return {"status": "ok"}


# Start the development server when this file is executed directly.
if __name__ == "__main__":
    # Listen on all container interfaces at port 5000.
    app.run(host="0.0.0.0", port=5000)
