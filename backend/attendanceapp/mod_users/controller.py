from flask import request, Blueprint, jsonify
from flask_jwt_extended import get_jwt, unset_jwt_cookies, create_access_token, get_jwt_identity, jwt_required, set_access_cookies
from attendanceapp import bcrypt
from .. import db
from datetime import datetime, timedelta, timezone
import json

applet = Blueprint('users', __name__, url_prefix='/api/users')


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


#This API will give us the details of all registered students
@applet.route('/students', methods=['GET'])
@jwt_required()
def get_all_students():
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM student")
    users = cursor.fetchall()
    if not users:
        db.close_db()
        return {"message": "No users"}, 404
    response = []
    for user in users:
        response.append({'reg_no': user[0], 'email': user[1],
                        'name': user[2], 'mobile': user[3], 'role': "student"})
    db.close_db()
    return json.dumps(response), 200

#This API will give the course id and course name of all the courses enrolled by a student
@applet.route('/student/<reg_no>/courses', methods=['GET'])
@jwt_required()
def get_courses_of_student(reg_no):

    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT c.course_id, c.course_name FROM enrolled e, course c where e.reg_no=%s AND e.course_id=c.course_id", (reg_no,))
    courses = cursor.fetchall()
    response = []
    for course in courses:
        response.append({'course_id': course[0], 'course_name': course[1]})
    db.close_db()
    return json.dumps(response), 200

#This API is used to enroll a student to a course
@applet.route('/student/<reg_no>/courses/<course_id>/enroll', methods=['POST'])
@jwt_required()
def enroll_student_into_course(reg_no, course_id):

    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * from enrolled where reg_no=%s AND course_id=%s", (reg_no, course_id,))
    enrolled = cursor.fetchall()
    if enrolled:
        db.close_db()
        return {"message": "Already enrolled"}, 404

    cursor.execute("INSERT INTO enrolled VALUES (%s,%s)", (reg_no, course_id,))

    conn.commit()
    cursor.execute("SELECT course_name from course WHERE course_id = %s", (course_id,))
    course_name = cursor.fetchone()
    db.close_db()
    return {"course_name": course_name}, 201


#This API will give the list of all courses taught by a staff
@applet.route('/staff/<staff_id>/courses', methods=['GET'])
@jwt_required()
def get_courses_of_staff(staff_id):

    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT c.course_id, c.course_name FROM courses_taught s, course c where s.staff_id=%s AND s.course_id=c.course_id", (staff_id,))
    courses = cursor.fetchall()
    response = []
    for course in courses:
        response.append({'course_id': course[0], 'course_name': course[1]})
    db.close_db()
    return json.dumps(response), 200


#This API is used to verify if the user is logged in and then gets the details of the user
@applet.route('/verify', methods=['GET'])
@jwt_required()
def user_verify():
    conn = db.get_db()
    cursor = conn.cursor()
    reg_no = get_jwt_identity()
    cursor.execute("SELECT * FROM student WHERE reg_no = %s", (reg_no, ))
    user = cursor.fetchone()
    if(user):
        return {'reg_no': user[0], 'email': user[1], 'name': user[2], 'mobile': user[3], 'role': "student"}, 200
    cursor.execute("SELECT * FROM staff WHERE staff_id = %s", (reg_no, ))
    user = cursor.fetchone()
    if(user):
        return {'reg_no': user[0], 'email': user[1], 'name': user[2], 'mobile': user[3], 'role': "staff"}, 200
    cursor.execute("SELECT * FROM admin WHERE email = %s", (reg_no, ))
    user = cursor.fetchone()
    if(user):
        return {'email': user[0], 'role': "admin"}
    return {'message': 'user doesnt exist'}, 404


# ----------------------------------------------------------STUDENT
#This API will get the details of a student with a particular reg_no
@applet.route('/students/<reg_no>', methods=['GET'])
@jwt_required()
def get_student(reg_no):
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM student WHERE reg_no = %s OR email = %s", (reg_no, reg_no, ))
    user = cursor.fetchone()
    if not user:
        db.close_db()
        return {"message": "Student doesn't exist"}, 404
    response = jsonify(
        {'reg_no': user[0], 'email': user[1], 'name': user[2], 'mobile': user[3]})
    db.close_db()
    return response, 200

#This API allows the admin to edit the details of a student
@applet.route('/students/<reg_no>', methods=['PUT'])
@jwt_required()
def edit_student_details(reg_no):
    conn = db.get_db()
    cursor = conn.cursor()
    content = request.get_json(silent=True)
    try:
        name = content['name']
        email = content['email']
        mobile = content['mobile']
    except:
        return {"message": "Bad Request"}, 400
    try:
        cursor.execute("UPDATE student SET name = %s, email = %s, mobile_no = %s WHERE reg_no = %s",
                       (name, email, mobile, reg_no, ))
        conn.commit()
        db.close_db()
        return {'message': 'Changes saved'}, 204
    except:
        db.close_db()
        return {'message': 'Changes could not be saved'}, 500

#This API allows the admin to delete a particular student
@applet.route('/students/<reg_no>', methods=['DELETE'])
@jwt_required()
def delete_student_details(reg_no):
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM student WHERE reg_no = %s", (reg_no, ))
    conn.commit()
    db.close_db()
    return {'message': 'user deleted successfully'}, 204

#This API allows the admin to create a new student
@applet.route('/students', methods=['POST'])
@jwt_required()
def add_student():
    conn = db.get_db()
    cursor = conn.cursor()
    content = request.get_json(silent=True)
    try:
        name = content['name']
        email = content['email']
        mobile = content['mobile']
        reg_no = content['reg_no']
        password = password = bcrypt.generate_password_hash(
            content['reg_no']).decode('utf-8')
    except:
        return {"message": "Bad Request"}, 400
    try:
        cursor.execute("INSERT INTO student VALUES(%s, %s, %s, %s, %s)",
                       (reg_no, email, name, mobile, password, ))
        conn.commit()
        db.close_db()
    except:
        db.close_db()
        return {'message': 'Student already exists'}, 409
    return {'message': 'Student created successfully'}, 201


#----------------------------------------------------------- STAFF
#This API gets the details of a staff with a particular staff_id
@applet.route('/staffs/<staff_id>', methods=['GET'])
@jwt_required()
def get_staff(staff_id):
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM staff WHERE staff_id = %s OR email = %s", (staff_id, staff_id, ))
    user = cursor.fetchone()
    if not user:
        db.close_db()
        return {"message": "Staff doesn't exist"}, 404
    response = jsonify(
        {'staff_id': user[0], 'email': user[1], 'name': user[2], 'mobile': user[3]})
    db.close_db()
    return response, 200


#This API allows the admin to edit the details of a staff
@applet.route('/staffs/<staff_id>', methods=['PUT'])
@jwt_required()
def edit_staff_details(staff_id):
    conn = db.get_db()
    cursor = conn.cursor()
    content = request.get_json(silent=True)
    try:
        name = content['name']
        email = content['email']
        mobile = content['mobile']
    except:
        return {"message": "Bad Request"}, 400
    try:
        cursor.execute("UPDATE staff SET name = %s, email = %s, mobile_no = %s WHERE staff_id = %s",
                       (name, email, mobile, staff_id, ))
        conn.commit()
        db.close_db()
        return {'message': 'Changes saved'}, 204
    except:
        db.close_db()
        return {'message': 'Changes could not be saved'}, 500


#This API allows the admin to delete a particular staff
@applet.route('/staffs/<staff_id>', methods=['DELETE'])
@jwt_required()
def delete_staff_details(staff_id):
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM staff WHERE staff_id = %s", (staff_id, ))
    conn.commit()
    db.close_db()
    return {'message': 'user deleted successfully'}, 204


#This API allows the admin to create a new staff
@applet.route('/staffs', methods=['POST'])
@jwt_required()
def add_staff():
    conn = db.get_db()
    cursor = conn.cursor()
    content = request.get_json(silent=True)
    try:
        name = content['name']
        email = content['email']
        mobile = content['mobile']
        staff_id = content['staff_id']
        password = password = bcrypt.generate_password_hash(
            content['staff_id']).decode('utf-8')
    except:
        return {"message": "Bad Request"}, 400
    try:
        cursor.execute("INSERT INTO staff VALUES(%s, %s, %s, %s, %s)",
                       (staff_id, email, name, mobile, password, ))
        conn.commit()
        db.close_db()
    except:
        db.close_db()
        return {'message': 'Staff already exists'}, 409
    return {'message': 'Staff created successfully'}, 201


@applet.route('/staffs', methods=['GET'])
@jwt_required()
def get_all_staffs():
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM staff")
    users = cursor.fetchall()
    if not users:
        db.close_db()
        return {"message": "No users"}, 404
    response = []
    for user in users:
        response.append({'staff_id': user[0], 'email': user[1],
                        'name': user[2], 'mobile': user[3], 'role': "staff"})
    db.close_db()
    return json.dumps(response), 200

# ----------------------------------------------------AUTHENTICATION

#This API will add a user(staff/student)
@applet.route('/signup', methods=['POST'])
@jwt_required()
def signup():
    conn = db.get_db()
    cursor = conn.cursor()
    content = request.get_json(silent=True)
    email_admin = get_jwt_identity()
    cursor.execute("SELECT * FROM admin WHERE email = %s", (email_admin, ))
    user_admin = cursor.fetchone()
    if not user_admin:
        return {'message': 'access denied'}, 401

    try:
        name = content['name']
        reg_no = content['reg_no']
        role = content['role']
        email = content['email']
        mobile_no = content['mobile_no']
    except:
        return {"message": "Bad Request"}, 400

    try:
        if role == "student":
            cursor.execute(
                "SELECT * FROM student WHERE reg_no = %s OR email = %s OR mobile_no = %s", (reg_no, email, mobile_no, ))
            user_student = cursor.fetchone()
            if(user_student):
                db.close_db()
                return {'message': 'student exists'}, 409
            cursor.execute("INSERT INTO student (reg_no, email, name, mobile_no, password) VALUES (%s, %s, %s, %s, %s)",
                           (reg_no, email, name, mobile_no, bcrypt.generate_password_hash(reg_no).decode('utf-8')))
            conn.commit()
            db.close_db()
            return {"message": "student added"}, 201

        else:
            cursor.execute(
                "SELECT * FROM staff WHERE staff_id = %s OR email = %s OR mobile_no = %s", (reg_no, email, mobile_no, ))
            user_staff = cursor.fetchone()
            if(user_staff):
                db.close_db()
                return {'message': 'staff exists'}, 409
            cursor.execute("INSERT INTO staff (staff_id, email, name, mobile_no, password) VALUES (%s, %s, %s, %s, %s)",
                           (reg_no, email, name, mobile_no, bcrypt.generate_password_hash(reg_no).decode('utf-8')))
            conn.commit()
            db.close_db()
            return {"message": "staff added"}, 201
    except:
        db.close_db
        return {"message": "server error"}, 500


#This API is used to log in to a user account
@applet.route('/login', methods=['POST'])
def login():
    conn = db.get_db()
    cursor = conn.cursor()
    content = request.get_json()
    try:
        reg_no = content['reg_no']
        password = content['password']
    except:
        return {"message": "Bad Request"}, 400

    try:
        if reg_no:
            cursor.execute(
                "SELECT * FROM student WHERE reg_no = %s OR email = %s", (reg_no, reg_no, ))
            user = cursor.fetchone()
            if user and bcrypt.check_password_hash(user[4], password):
                response = jsonify(
                    {'reg_no': user[0], 'email': user[1], 'name': user[2], 'mobile': user[3], 'role': "student"})
                access_token = create_access_token(identity=reg_no)
                set_access_cookies(response, access_token)
                db.close_db()
                return response
            cursor.execute(
                "SELECT * FROM staff WHERE staff_id = %s OR email = %s", (reg_no, reg_no, ))
            user = cursor.fetchone()
            if user and bcrypt.check_password_hash(user[4], password):
                response = jsonify(
                    {'reg_no': user[0], 'email': user[1], 'name': user[2], 'mobile': user[3], 'role': "staff"})
                access_token = create_access_token(identity=reg_no)
                set_access_cookies(response, access_token)
                db.close_db()
                return response
            cursor.execute("SELECT * FROM admin WHERE email = %s", (reg_no, ))
            user = cursor.fetchone()
            if user and bcrypt.check_password_hash(user[1], password):
                response = jsonify({'email': user[0], 'role': "admin"})
                access_token = create_access_token(identity=reg_no)
                set_access_cookies(response, access_token)
                db.close_db()
                return response
    except:
        db.close_db()
        return {'message': 'Server error'}, 500
    db.close_db()
    return {'message': 'invalid reg_no or password'}, 401

#This API is used to log out from a user account
@applet.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    response = jsonify({"message": "User logged out"})
    unset_jwt_cookies(response)
    return response



#This API is used to get a list of all upcoming classes for a student on the day of viewing
@applet.route('/students/<reg_no>/classes/upcoming', methods=['GET'])
@jwt_required()
def get_upcoming_classes_ofsameday_ofstudent(reg_no):
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute(" SELECT * from attendance a, class c,slot s where a.reg_no=%s and c.class_date=current_date and s.slot_id=c.slot_id and s.end_time>=current_time;", (reg_no,))
    class_details = cursor.fetchall()
    if not class_details:
        return{'message': 'No upcoming class today'}, 404
    response = []
    for class_ in class_details:
        course_id=class_[2]
        cursor.execute("select course_name from course where course_id=%s",(course_id,))
        course_name=cursor.fetchone()
        response.append({"course_name":course_name, "start_time":class_[9], "end_time":class_[10]})
    db.close_db()
    return json.dumps(response), 200

#This API is used to get the profile details of a user
@applet.route('/profile/<reg_no>', methods=['GET'])
@jwt_required()
def profile_display(reg_no):
    conn = db.get_db()
    curr = conn.cursor()
    curr.execute("SELECT * from student where reg_no=%s", (reg_no,))
    user = curr.fetchone()
    if user:
        db.close_db()
        return {"reg_no":user[0],"email":user[1],"name":user[2],"mobile_no":user[3]}

    curr.execute("SELECT * from staff where staff_id=%s", (reg_no,))
    user = curr.fetchone()
    if user:
        db.close_db()
        return {"staff_id":user[0],"email":user[1],"name":user[2],"mobile_no":user[3]}, 200
    
    return {"message":"Invalid UserID"}, 404
        
    
    

    
    

