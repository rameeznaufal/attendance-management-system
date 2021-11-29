from flask import request, Blueprint, jsonify
from flask_jwt_extended import get_jwt, unset_jwt_cookies, create_access_token, get_jwt_identity, jwt_required, set_access_cookies
from attendanceapp import bcrypt
from .. import db
from datetime import datetime, timedelta, timezone
import json

applet = Blueprint('attendance', __name__, url_prefix='/api/attendance')

def myconverter(o):
    if isinstance(o, datetime):
        return o.__str__()

@applet.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=2880))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            set_access_cookies(response, access_token)
        return response
    except (RuntimeError, KeyError):
        return response

@applet.route('/add', methods = ['POST'])
@jwt_required()
def add_class_attendance():
    conn = db.get_db()
    cursor = conn.cursor()
    content = request.get_json(silent=True)
    try:
        course_id = content['course_id']
        class_id = content['class_id']
        reg_no = content['reg_no']
        status = content['status']
    except:
        db.close_db()
        return {"message": "Bad Request"}, 400
    try:
        cursor.execute("UPDATE attendance SET status = %d WHERE course_id = %s AND class_id = %s AND reg_no = %s ", (status, course_id, class_id, reg_no, ))
        conn.commit()
        db.close_db()
        return {'message': 'Class attendance for students added'}, 204   
    except:
        db.close_db()
        return {'message': 'Class attendance could not be added'}, 500
        