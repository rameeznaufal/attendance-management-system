import os
from flask_cors import CORS, cross_origin
from flask import Flask, g
from dotenv import load_dotenv
from flask_jwt_extended import  JWTManager
from flask_bcrypt import Bcrypt
from flask.helpers import send_from_directory
from datetime import timedelta

def create_app():
    app = Flask("attendanceapp", static_folder = './../../frontend/build', static_url_path = "")
    
    global bcrypt
    bcrypt = Bcrypt(app)
    api_cors_config = {
        "origins": ["http://127.0.0.1:3000", "http://localhost:3000"],
        "supports_credentials": True
    }
    CORS(app, resources={
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

    from attendanceapp.mod_users.controller import applet as users_applet
    from attendanceapp.mod_courses.controller import applet as courses_applet        
    from attendanceapp.mod_attendance.controller import applet as attendance_applet  
    from attendanceapp.mod_classes.controller import applet as classes_applet
    app.register_blueprint(users_applet)
    app.register_blueprint(courses_applet)
    app.register_blueprint(attendance_applet)
    app.register_blueprint(classes_applet)

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    @cross_origin()
    def serve(path):
        return send_from_directory(app.static_folder, 'index.html')

    return app


app = create_app()

if __name__ == "__main__":
    app.run()