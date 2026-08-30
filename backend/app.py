"""Create and run the Flask application."""

# Import Flask to create the web application.
from flask import Flask

# Create the Flask application instance.
app = Flask(__name__)


# Provide a simple endpoint for checking that the backend is running.
@app.get("/")
def health_check():
    # Return a basic response from the backend.
    return {"status": "ok"}


# Start the development server when this file is executed directly.
if __name__ == "__main__":
    # Listen on all container interfaces at port 5000.
    app.run(host="0.0.0.0", port=5000)
