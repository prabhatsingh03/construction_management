import os
from flask import Flask, render_template, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db, bcrypt
from routes import api

# Get the absolute path of the directory where this file is located
basedir = os.path.abspath(os.path.dirname(__file__))

# Create and configure the Flask application instance
app = Flask(__name__, template_folder='templates', static_folder='static')

# --- Final, Corrected CORS Configuration ---
# This configuration explicitly allows the 'Authorization' header, which is
# essential for JWT-based authentication to work across different origins.
CORS(app, resources={r"/api/*": {"origins": "*", "allow_headers": ["Authorization", "Content-Type"]}})

# --- Configuration ---
app.config['JWT_SECRET_KEY'] = 'zdfghtjy54rdtfyguhihuyxzdxjkjhgchgjhkter67ujghcvvbjn'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Explicitly tell flask-jwt-extended where to look for the token
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["JWT_HEADER_NAME"] = "Authorization"
app.config["JWT_HEADER_TYPE"] = "Bearer"

# Add error handling for JWT
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False


# --- Initialize Extensions ---
db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)

# --- JWT Error Handlers ---
# @jwt.expired_token_loader
# def expired_token_callback(jwt_header, jwt_payload):
#     return jsonify({"error": "Token has expired"}), 401

# @jwt.invalid_token_loader
# def invalid_token_callback(error):
#     return jsonify({"error": "Invalid token"}), 401

# @jwt.unauthorized_loader
# def missing_token_callback(error):
#     return jsonify({"error": "Authorization token is required"}), 401


# --- Register Blueprints ---
# This line has been updated to include the URL prefix for all API routes.
app.register_blueprint(api, url_prefix='/api')


# --- Define Main Route ---
@app.route('/')
def index():
    """
    Serves the main index.html file from the 'templates' folder.
    """
    return render_template('index.html')


# --- Application Context ---
with app.app_context():
    db.create_all()


# --- Run the Application ---
if __name__ == '__main__':
    app.run(debug=True)