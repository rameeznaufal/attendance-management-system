from flask import request, Blueprint, jsonify
from flask_jwt_extended import get_jwt, unset_jwt_cookies, create_access_token, get_jwt_identity, jwt_required, set_access_cookies
from attendanceapp import bcrypt
from .. import db
from datetime import datetime, timedelta, timezone
import json

applet = Blueprint('classes', __name__, url_prefix='/api/classes')


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

@applet.route('/add', methods=['POST'])
@jwt_required()
def add_class():

    conn = db.get_db()
    cursor = conn.cursor()

    content = request.get_json(silent=True)
    try:
        course_id = content['course_id']
        class_date = content['class_date']
        slot_id = content['slot_id']
    except:
        return {"message": "Bad Request"}, 400

    cursor.execute("select max(class_id) from class where course_id=%s",(course_id,))
    class_id=cursor.fetchone()
    class_id=class_id[0]
    if not class_id:
        class_id=1
    else:
        class_id=class_id+1
    cursor.execute("insert into class values (%s,%s,%s,%s)",(class_id,course_id,class_date,slot_id,))
    cursor.execute("select * from enrolled where course_id=%s",(course_id,))
    students_list=cursor.fetchall()
    if (students_list):
        student_ins=[]
        for student in students_list:
            student_ins.append(tuple([student[0],class_id,course_id,0]))
        student_ins=str(tuple(student_ins))[1:-1]
        if len(students_list)==1:
            student_ins=student_ins[:-1]
        cursor.execute("insert into attendance values "+ student_ins )
    conn.commit()
    db.close_db()
    return {'message': 'Class added'}, 201

@applet.route('/<class_id>/course/<course_id>', methods=['PUT'])
@jwt_required()
def edit_class_details(class_id,course_id):

    conn = db.get_db()
    cursor = conn.cursor()

    content = request.get_json(silent=True)
    
    try:
        cursor.execute("select * from class where class_id=%s and course_id=%s",(class_id,course_id,))
        classes_list=cursor.fetchall()

        if not classes_list:
            return{'message': 'Class not found'}, 404
    except:
        return {"message": "Bad Request"}, 400

    try:
        class_date = content['class_date']
        slot_id = content['slot_id']
    except:
        return {"message": "Bad Request"}, 400
    cursor.execute("update class set class_date=%s,slot_id=%s where class_id=%s and course_id=%s",( class_date,slot_id,class_id,course_id,))
    conn.commit()
    db.close_db()
    return {'message': 'Class details edited'}, 200

@applet.route('/<class_id>/course/<course_id>', methods=['GET'])
@jwt_required()
def get_class_details(class_id,course_id):
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("select slot_id, class_date from class where class_id=%s and course_id=%s",( class_id, course_id,))
    class_ = cursor.fetchone()
    db.close_db()
    return {'slot_id': class_[0], 'class_date': class_[1]}, 200

@applet.route('/<class_id>/course/<course_id>', methods=['DELETE'])
@jwt_required()
def delete_class(class_id,course_id):

    conn = db.get_db()
    cursor = conn.cursor()

    content = request.get_json(silent=True)
    
    try:
        cursor.execute("select * from class where class_id=%s and course_id=%s",(class_id,course_id,))
        classes_list=cursor.fetchall()

        if not classes_list:
            return{'message': 'Class not found'}, 404
    except:
        return {"message": "Bad Request"}, 400

    cursor.execute("delete from class where class_id=%s and course_id=%s",(class_id,course_id,))
    conn.commit()
    db.close_db()
    return {'message': 'Class deleted'}, 204

@applet.route('/<class_id>/course/<course_id>', methods=['GET'])
@jwt_required()
def get_student_class_details_in_course(class_id,course_id):

    conn = db.get_db()
    cursor = conn.cursor()

    content = request.get_json(silent=True)
    
    try:
        cursor.execute("select * from class c,attendance a where class_id=%s and course_id=%s",(class_id,course_id,))
        classes_list=cursor.fetchall()

        if not classes_list:
            return{'message': 'Class not found'}, 404
    except:
        return {"message": "Bad Request"}, 400

    cursor.execute("delete from class where class_id=%s and course_id=%s",(class_id,course_id,))
    conn.commit()
    db.close_db()
    return {'message': 'Class deleted'}, 204

@applet.route('/<course_id>/classes/student/<reg_no>', methods=['GET'])
@jwt_required()
def get_classes_in_course(course_id,reg_no):
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT a.reg_no, c.class_id,  c.class_date, s.start_time, s.end_time FROM attendance a, class c, slot s WHERE c.class_id=a.class_id and c.course_id=a.course_id and c.slot_id=s.slot_id and  a.reg_no =%s and a.course_id=%s", (reg_no,course_id,))
    class_details = cursor.fetchall()
    if not class_details:
        return{'message': 'Student Not enrolled or Invalid details entered'}, 404
    response = []
    for class_ in class_details:
        response.append({'reg_no': class_[0], 'class_id': class_[1], 'class_date': str(class_[2]), 'start_time': str(class_[3]), 'end_time': str(class_[4])})
    db.close_db()
    return json.dumps(response, default=myconverter), 200