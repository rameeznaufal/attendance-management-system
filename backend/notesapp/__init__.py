import os
from flask_cors import CORS
from flask import Flask, g
from dotenv import load_dotenv
from flask_jwt_extended import  JWTManager
from flask_bcrypt import Bcrypt
from datetime import timedelta

def create_app():
    app = Flask("notesapp")
    
    global bcrypt
    bcrypt = Bcrypt(app)
    api_cors_config = {
        "origins": ["http://127.0.0.1:3000", "http://localhost:3000"],
        "supports_credentials": True
    }
    cors = CORS(app, resources={
        r"\/api\/.*": api_cors_config
    })

    app.config['JWT_TOKEN_LOCATION'] = ['cookies']
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=10000)
    # app.config['JWT_COOKIE_CSRF_PROTECT'] = True
    app.config['JWT_COOKIE_CSRF_PROTECT'] = False
    # app.config['JWT_CSRF_CHECK_FORM'] = True
    load_dotenv()
    app.url_map.strict_slashes = False

    # Setup the Flask-JWT-Extended extension
    app.config["JWT_SECRET_KEY"] = os.environ.get('JWT_SECRET')
    global jwt
    jwt = JWTManager(app)

    from notesapp.mod_users.controller import applet as users_applet
    # from . import db 
    # db.init_app(app) 
    # db.create_all()
    app.register_blueprint(users_applet)
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)