from flask import request, Blueprint, jsonify
from flask_jwt_extended import get_jwt, unset_jwt_cookies, create_access_token, get_jwt_identity, jwt_required, set_access_cookies
from attendanceapp import bcrypt
from .. import db
from datetime import datetime, timedelta, timezone
import json

applet = Blueprint('courses', __name__, url_prefix='/api/courses')


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


#This API will get the list of all courses that are being taught
@applet.route('/', methods=['GET'])
@jwt_required()
def get_all_courses():

    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM course")
    courses = cursor.fetchall()
    response = []
    for course in courses:
        response.append({'course_id': course[0], 'course_name': course[1]})
    db.close_db()
    return json.dumps(response), 200

#This API will add a new course
@applet.route('/', methods=['POST'])
@jwt_required()
def add_course():

    conn = db.get_db()
    cursor = conn.cursor()

    content = request.get_json(silent=True)
    try:
        course_id = content['course_id']
        course_name = content['course_name']
    except:
        return {"message": "Bad Request"}, 400

    cursor.execute("insert into course values (%s,%s)",(course_id, course_name,))
    conn.commit()
    db.close_db()
    return {'message': 'Course added'}, 201


#This API is used to edit a particular course. It can change the name and staff of that course
@applet.route('/<course_id>', methods=['PUT'])
@jwt_required()
def edit_course_details(course_id):
    conn = db.get_db()
    cursor = conn.cursor()
    content = request.get_json(silent=True)
    try:
        course_name = content['course_name']
        staffs = content['staffs']
    except:
        return {"message": "Bad Request"}, 400
    staffs_del = []
    staffs_ins = []
    count = 0
    for staff in staffs:
        staffs_del.append(staff['value'])
        staffs_ins.append(tuple([staff['value'], course_id]))
        count = count + 1
    staffs_del = tuple(staffs_del)
    staffs_ins = tuple(staffs_ins)
    staffs_ins = str(staffs_ins)[1:-1]
    if count == 1:
        staffs_ins = staffs_ins[:-1]
    cursor.execute("SELECT * FROM course WHERE course_id = %s", (course_id, ))
    course = cursor.fetchone()
    if course:
        cursor.execute(
            "UPDATE course set course_name = %s where course_id = %s", (course_name, course_id,))
        if count == 0:
            cursor.execute(
                "DELETE FROM courses_taught WHERE course_id = %s", (course_id, ))
        else:
            cursor.execute(
                "DELETE FROM courses_taught WHERE course_id = %s AND staff_id NOT IN %s", (course_id, staffs_del, ))
            cursor.execute("INSERT INTO courses_taught VALUES " + staffs_ins +
                           " ON CONFLICT ON CONSTRAINT courses_taught_pkey DO NOTHING")
        conn.commit()
        db.close_db()
        return {"message": "Changes saved"}, 200
    db.close_db()
    return {'message': 'Changes not saved'}, 409


#This API will give the name and reg_no of all students who have enrolled for a particular course 
@applet.route('/<course_id>/students', methods=['GET'])
@jwt_required()
def get_students_in_course(course_id):

    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT s.reg_no,s.name FROM student s, enrolled e where e.course_id=%s AND s.reg_no=e.reg_no", (course_id,))
    student_details = cursor.fetchall()
    if not student_details:
        return{'message': 'Students not enrolled or Invalid Course ID'}, 404

    response = []
    for student in student_details:
        response.append({'reg_no': student[0], 'name': student[1]})
    db.close_db()
    return json.dumps(response), 200


#This API will give the details of all classes that have been created for a particular course
@applet.route('/<course_id>/classes', methods=['GET'])
@jwt_required()
def get_classes_in_course(course_id):
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT c.class_id, c.course_id, c.class_date, c.slot_id, s.start_time, s.end_time FROM class c JOIN slot s ON c.slot_id = s.slot_id WHERE c.course_id=%s ORDER BY c.class_id DESC", (course_id,))
    class_details = cursor.fetchall()
    if not class_details:
        return{'message': 'No classes added or Invalid Course ID'}, 404
    response = []
    for class_ in class_details:
        response.append({'class_id': class_[0], 'class_date': class_[2], 'slot_id': class_[3], 'start_time': str(class_[4]), 'end_time': str(class_[5])})
    db.close_db()
    return json.dumps(response, default=myconverter), 200


#This API will give all the details of a particular course, i.e., the course id, course name and the names of the staff teaching that course
@applet.route('/<course_id>', methods=['GET'])
@jwt_required()
def get_course_details(course_id):

    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT course_id,course_name FROM course where (course_id=%s OR course_name=%s)", (course_id, course_id,))
    course_details = cursor.fetchone()
    if not course_details:
        return{'message': 'Course does not exist'}, 404
    coursef_id = course_details[0]
    coursef_name = course_details[1]

    cursor.execute(
        "SELECT s.staff_id, s.name FROM courses_taught t, staff s where t.course_id=%s AND s.staff_id=t.staff_id", (coursef_id,))
    staffs = cursor.fetchall()
    response = []
    staff_list = []
    for staff in staffs:
        staff_list.append({'staff_id': staff[0], 'staff_name': staff[1]})
    response.append(
        {'course_id': coursef_id, 'course_name': coursef_name, 'staffs': staff_list})
    db.close_db()
    return json.dumps(response[0]), 200


#This API will delete a particular course
@applet.route('/<course_id>', methods=['DELETE'])
@jwt_required()
def delete_course(course_id):
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM course where course_id=%s", (course_id,))
    conn.commit()
    db.close_db()
    return {'message': 'Course deleted successfully'}, 204

#This API will give the attendance details of all the classes of a course for a particular student enrolled for that course 
@applet.route('/<course_id>/classes/student/<reg_no>', methods=['GET'])
@jwt_required()
def get_classes_in_course_student(course_id,reg_no):
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT c.class_id, c.class_date, s.start_time, s.end_time, a.status FROM attendance a, class c, slot s WHERE c.class_id=a.class_id and c.course_id=a.course_id and c.slot_id=s.slot_id and  a.reg_no =%s and a.course_id=%s", (reg_no,course_id,))
    class_details = cursor.fetchall()
    if not class_details:
        return{'message': 'Student Not enrolled or Invalid details entered'}, 404
    response = []
    for class_ in class_details:
        response.append({'status': class_[4], 'class_id': class_[0], 'class_date': str(class_[1]), 'start_time': str(class_[2]), 'end_time': str(class_[3])})
    db.close_db()
    return json.dumps(response, default=myconverter), 200