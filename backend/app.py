"""Create and run the Flask application."""

# Import Flask to create the web application and redirect the root page.
from flask import Flask, redirect, url_for

from backend import config
from backend.routes import documents_bp


# Create and configure the Flask application.
def create_app():
    # Create the Flask application instance.
    app = Flask(
        __name__,
        static_folder="../frontend",
        static_url_path="/frontend",
    )

    # Load settings such as the MongoDB URI and upload folder.
    app.config.from_object(config)

    # Register document API routes under /api/v1/documents.
    app.register_blueprint(documents_bp)
    return app


# Create the application instance used by Flask and Docker.
app = create_app()


# Redirect the root URL to the staff document registration page.
@app.get("/")
def home():
    return redirect(url_for("static", filename="html/staff_upload.html"))


# Start the development server when this file is executed directly.
if __name__ == "__main__":
    # Listen on all container interfaces at port 5000.
    app.run(host="0.0.0.0", port=5000)
