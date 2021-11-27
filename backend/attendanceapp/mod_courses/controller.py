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

    cursor.execute("insert into course values (%s,%s)",
                   (course_id, course_name,))
    conn.commit()
    db.close_db()
    return {'message': 'Course added'}, 201


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


@applet.route('/<course_id>', methods=['DELETE'])
@jwt_required()
def delete_course(course_id):
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM course where course_id=%s", (course_id,))
    conn.commit()
    db.close_db()
    return {'message': 'Course deleted successfully'}, 204


@applet.route('/<user_id>', methods=['PUT'])
@jwt_required()
def edit_user_details(user_id):
    try:
        user_id = int(user_id)
    except ValueError:
        return {'message': 'Invalid user ID'}, 400
    conn = db.get_db()
    cursor = conn.cursor()
    content = request.get_json(silent=True)
    try:
        name = content['name']
    except:
        return {"message": "Bad Request"}, 400
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id, ))
    user = cursor.fetchone()
    if user and user[1] == get_jwt_identity():
        cursor.execute(
            "UPDATE users set name = %s where id = %s", (name, user_id))
        conn.commit()
        db.close_db()
        return {"message": "Changes saved"}, 200
    db.close_db()
    return {'message': 'Changes not saved'}, 409


@applet.route('/<user_id>', methods=['DELETE'])
@jwt_required()
def delete_user_details(user_id):
    try:
        user_id = int(user_id)
    except ValueError:
        return {'message': 'Invalid user ID'}, 400
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id, ))
    user = cursor.fetchone()
    if user and user[1] == get_jwt_identity():
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id, ))
        conn.commit()
        db.close_db()
        return {'message': 'user deleted successfully'}, 204
    db.close_db()
    return {'message': "User doesn't exist"}, 400


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


@applet.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    response = jsonify({"message": "User logged out"})
    unset_jwt_cookies(response)
    return response


@applet.route('/<user_id>/notes', methods=['GET'])
@jwt_required()
def get_all_notes(user_id):
    try:
        user_id = int(user_id)
    except ValueError:
        return {'message': 'Invalid ID'}, 400
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id, ))
    user = cursor.fetchone()
    if not user:
        db.close_db()
        return {"message": "User doesn't exist"}, 404
    if(user[1] != get_jwt_identity()):
        db.close_db()
        return {"message": "Access Denied"}, 403
    cursor.execute(
        "SELECT * FROM tblNotes WHERE user_id = %s ORDER BY last_edited DESC", (user_id, ))
    notes = cursor.fetchall()
    for i, note in enumerate(notes):
        cursor.execute(
            "SELECT T.tag_name FROM tblTags T, tblTagsNotes TN WHERE TN.note_id = %s AND TN.tag_id = T.id", (note[0], ))
        tags = cursor.fetchall()
        tags_list = []
        for tag in tags:
            tags_list.append(tag[0])
        note = list(note)
        note.append(tags_list)
        notes[i] = note
    db.close_db()
    return json.dumps(notes, default=myconverter), 200


@applet.route('/<user_id>/notes', methods=['POST'])
@jwt_required()
def add_note(user_id):
    content = request.get_json()
    if content['note']:
        note = content['note']
    else:
        note = ""
    if content['title']:
        title = content['title']
    else:
        title = ""
    try:
        tags = list(set(content['tags']))
    except:
        tags = []
    try:
        user_id = int(user_id)
        last_edited = datetime.strptime(
            content['last_edited'], "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
    except ValueError:
        return {'message': 'Bad Request'}, 400
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id, ))
    user = cursor.fetchone()
    if not user:
        db.close_db()
        return {"message": "User doesn't exist"}, 404
    if(user[1] != get_jwt_identity()):
        db.close_db()
        return {"message": "Access Denied"}, 403
    cursor.execute("INSERT INTO tblNotes (user_id, note, last_edited, title) VALUES (%s, %s, %s, %s) RETURNING id",
                   (user_id, note, last_edited, title))
    conn.commit()
    note_id = cursor.fetchone()[0]
    tag_ids = []
    for tag in tags:
        cursor.execute("SELECT id FROM tblTags WHERE tag_name = %s", (tag, ))
        id = cursor.fetchone()
        if(id):
            id = id[0]
        else:
            cursor.execute(
                "INSERT INTO tblTags (tag_name) VALUES (%s) RETURNING id", (tag, ))
            conn.commit()
            id = cursor.fetchone()[0]
        tag_ids.append(id)
    for tag_id in tag_ids:
        cursor.execute(
            "INSERT INTO tblTagsNotes (tag_id, note_id) VALUES (%s, %s)", (tag_id, note_id))
        conn.commit()
    conn.commit()
    db.close_db()
    return {'id': note_id}, 201


@applet.route('/<user_id>/notes/<notes_id>', methods=['PUT'])
@jwt_required()
def edit_note(user_id, notes_id):
    content = request.get_json()
    if content['note']:
        note = content['note']
    else:
        note = ""
    if content['title']:
        title = content['title']
    else:
        title = ""
    try:
        tags = list(set(content['tags']))
    except:
        tags = []
    try:
        user_id = int(user_id)
        last_edited = datetime.strptime(
            content['last_edited'], "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
    except ValueError:
        return {'message': 'Bad Request'}, 400
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id, ))
    user = cursor.fetchone()
    if not user:
        db.close_db()
        return {"message": "User doesn't exist"}, 404
    if(user[1] != get_jwt_identity()):
        db.close_db()
        return {"message": "Access Denied"}, 403
    cursor.execute("UPDATE tblNotes SET note = %s, last_edited = %s, title = %s WHERE id = %s",
                   (note, last_edited, title, notes_id))
    conn.commit()
    tag_ids = []
    cursor.execute("DELETE FROM tblTagsNotes WHERE note_id = %s", (notes_id, ))
    conn.commit()
    for tag in tags:
        cursor.execute("SELECT id FROM tblTags WHERE tag_name = %s", (tag, ))
        id = cursor.fetchone()
        if(id):
            id = id[0]
        else:
            cursor.execute(
                "INSERT INTO tblTags (tag_name) VALUES (%s) RETURNING id", (tag, ))
            conn.commit()
            id = cursor.fetchone()[0]
        tag_ids.append(id)
    for tag_id in tag_ids:
        cursor.execute(
            "INSERT INTO tblTagsNotes (tag_id, note_id) VALUES (%s, %s)", (tag_id, notes_id))
        conn.commit()
    conn.commit()
    db.close_db()
    return {'message': 'note updated succesffully'}, 204
