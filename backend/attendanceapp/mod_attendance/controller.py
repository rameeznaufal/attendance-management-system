from flask import request, Blueprint, jsonify
from flask.wrappers import Response
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


#This API is used to mark the attendance for the class of a particular course. A student can mark any of three options, namely, absent(0), present(1), or late(2). The marked attendance details will be updated in the corresponding database table by this API
@applet.route('/mark', methods = ['POST'])
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
        cursor.execute("UPDATE attendance SET status = %s WHERE course_id = %s AND class_id = %s AND reg_no = %s ", (status, course_id, class_id, reg_no, ))
        conn.commit()
        db.close_db()
        return {'message': 'Class attendance for students added'}, 204   
    except:
        db.close_db()
        return {'message': 'Class attendance could not be added'}, 500
        

#This API will give us the attendace details of a particular student enrolled in a particular course for a given class of that course along with the details of that class like its start and end time and date
@applet.route('/courses/<course_id>/classes/<class_id>/students/<reg_no>', methods = ['GET'])
@jwt_required()
def check_class_attendance(course_id, class_id, reg_no):
    conn = db.get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM attendance WHERE reg_no = %s AND class_id = %s AND course_id = %s", (reg_no, class_id, course_id, ))
        attendance = cursor.fetchone()
        cursor.execute("SELECT c.class_id, c.course_id, c.class_date, c.slot_id, s.start_time, s.end_time FROM class c JOIN slot s ON c.slot_id = s.slot_id WHERE c.course_id=%s AND c.class_id = %s", (course_id,class_id, ))
        class_details = cursor.fetchone()
        db.close_db()
        return {'attendance_status': attendance[3], 'class_date': class_details[2], 'slot_id': class_details[3], 'start_time': str(class_details[4]), 'end_time': str(class_details[5])}, 200
    except:
        db.close_db()
        return {'message': 'Attendance details could not be verified'}, 500
        