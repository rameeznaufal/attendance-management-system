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

@applet.route('/verify', methods = ['GET'])
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

#----------------------------------------------------------STUDENT
@applet.route('/students/<reg_no>', methods = ['GET'])
@jwt_required()
def get_student(reg_no):
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM student WHERE reg_no = %s OR email = %s", (reg_no, reg_no, ))
    user = cursor.fetchone()
    if not user:
        db.close_db()
        return {"message": "Student doesn't exist"}, 404
    response = jsonify({'reg_no': user[0], 'email': user[1], 'name': user[2], 'mobile': user[3]})
    db.close_db()
    return response, 200

@applet.route('/students/<reg_no>', methods = ['PUT'])
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
        cursor.execute("UPDATE student SET name = %s, email = %s, mobile_no = %s WHERE reg_no = %s", (name, email, mobile, reg_no, ))
        conn.commit()
        db.close_db()
        return {'message': 'Changes saved'}, 204   
    except:
        db.close_db()
        return {'message': 'Changes could not be saved'}, 500

@applet.route('/students/<reg_no>', methods = ['DELETE'])
@jwt_required()
def delete_student_details(reg_no):
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM student WHERE reg_no = %s", (reg_no, ))
    conn.commit()
    db.close_db()
    return {'message': 'user deleted successfully'}, 204

@applet.route('/students', methods = ['POST'])
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
        password = password = bcrypt.generate_password_hash(content['reg_no']).decode('utf-8')
    except:
        return {"message": "Bad Request"}, 400
    try:
        cursor.execute("INSERT INTO student VALUES(%s, %s, %s, %s, %s)", (reg_no, email, name, mobile, password, ))
        conn.commit()
        db.close_db()
    except:
        db.close_db()
        return {'message': 'Student already exists'}, 409 
    return {'message': 'Student created successfully'}, 201

@applet.route('/students', methods = ['GET'])
#@jwt_required()
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
        response.append({'reg_no': user[0], 'email': user[1], 'name': user[2], 'mobile': user[3], 'role': "student"})
    db.close_db()
    return json.dumps(response), 200

#----------------------------------------------------------- STAFF
@applet.route('/staffs/<staff_id>', methods = ['GET'])
@jwt_required()
def get_staff(staff_id):
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM staff WHERE staff_id = %s OR email = %s", (staff_id, staff_id, ))
    user = cursor.fetchone()
    if not user:
        db.close_db()
        return {"message": "Staff doesn't exist"}, 404
    response = jsonify({'staff_id': user[0], 'email': user[1], 'name': user[2], 'mobile': user[3]})
    db.close_db()
    return response, 200

@applet.route('/staffs/<staff_id>', methods = ['PUT'])
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
        cursor.execute("UPDATE staff SET name = %s, email = %s, mobile_no = %s WHERE staff_id = %s", (name, email, mobile, staff_id, ))
        conn.commit()
        db.close_db()
        return {'message': 'Changes saved'}, 204   
    except:
        db.close_db()
        return {'message': 'Changes could not be saved'}, 500

@applet.route('/staffs/<staff_id>', methods = ['DELETE'])
@jwt_required()
def delete_staff_details(staff_id):
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM staff WHERE staff_id = %s", (staff_id, ))
    conn.commit()
    db.close_db()
    return {'message': 'user deleted successfully'}, 204

@applet.route('/staffs', methods = ['POST'])
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
        password = password = bcrypt.generate_password_hash(content['staff_id']).decode('utf-8')
    except:
        return {"message": "Bad Request"}, 400
    try:
        cursor.execute("INSERT INTO staff VALUES(%s, %s, %s, %s, %s)", (staff_id, email, name, mobile, password, ))
        conn.commit()
        db.close_db()
    except:
        db.close_db()
        return {'message': 'Staff already exists'}, 409 
    return {'message': 'Staff created successfully'}, 201

@applet.route('/staffs', methods = ['GET'])
#@jwt_required()
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
        response.append({'staff_id': user[0], 'email': user[1], 'name': user[2], 'mobile': user[3], 'role': "staff"})
    db.close_db()
    return json.dumps(response), 200

#----------------------------------------------------AUTHENTICATION
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
            cursor.execute("SELECT * FROM student WHERE reg_no = %s OR email = %s OR mobile_no = %s", (reg_no, email, mobile_no, ))
            user_student = cursor.fetchone()
            if(user_student):
                db.close_db()
                return {'message': 'student exists'}, 409
            cursor.execute("INSERT INTO student (reg_no, email, name, mobile_no, password) VALUES (%s, %s, %s, %s, %s)", (reg_no, email, name, mobile_no, bcrypt.generate_password_hash(reg_no).decode('utf-8')))
            conn.commit()
            db.close_db()
            return {"message": "student added"}, 201

        else:
            cursor.execute("SELECT * FROM staff WHERE staff_id = %s OR email = %s OR mobile_no = %s", (reg_no, email, mobile_no, ))
            user_staff = cursor.fetchone()
            if(user_staff):
                db.close_db()
                return {'message': 'staff exists'}, 409
            cursor.execute("INSERT INTO staff (staff_id, email, name, mobile_no, password) VALUES (%s, %s, %s, %s, %s)", (reg_no, email, name, mobile_no, bcrypt.generate_password_hash(reg_no).decode('utf-8')))
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
            cursor.execute("SELECT * FROM student WHERE reg_no = %s OR email = %s", (reg_no, reg_no, ))
            user = cursor.fetchone()
            if user and bcrypt.check_password_hash(user[4], password):
                response = jsonify({'reg_no': user[0], 'email': user[1], 'name': user[2], 'mobile': user[3], 'role': "student"})
                access_token = create_access_token(identity=reg_no)
                set_access_cookies(response, access_token)
                db.close_db()
                return response
            cursor.execute("SELECT * FROM staff WHERE staff_id = %s OR email = %s", (reg_no, reg_no, ))
            user = cursor.fetchone()
            if user and bcrypt.check_password_hash(user[4], password):
                response = jsonify({'reg_no': user[0], 'email': user[1], 'name': user[2], 'mobile': user[3], 'role': "staff"})
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

@applet.route('/logout', methods = ['POST'])
@jwt_required()
def logout():
    response = jsonify({"message": "User logged out"})
    unset_jwt_cookies(response)
    return response

#Not Implemented
@applet.route('/<user_id>/notes', methods = ['GET'])
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
    cursor.execute("SELECT * FROM tblNotes WHERE user_id = %s ORDER BY last_edited DESC", (user_id, ))
    notes = cursor.fetchall()
    for i, note in enumerate(notes):
        cursor.execute("SELECT T.tag_name FROM tblTags T, tblTagsNotes TN WHERE TN.note_id = %s AND TN.tag_id = T.id", (note[0], ))
        tags = cursor.fetchall()
        tags_list = []
        for tag in tags:
            tags_list.append(tag[0])
        note = list(note)
        note.append(tags_list)
        notes[i] = note
    db.close_db()
    return json.dumps(notes, default = myconverter), 200

#Not Implemented
@applet.route('/<user_id>/notes', methods = ['POST'])
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
    try: tags = list(set(content['tags']))
    except: tags = []
    try:
        user_id = int(user_id)
        last_edited = datetime.strptime(content['last_edited'], "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
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
    cursor.execute("INSERT INTO tblNotes (user_id, note, last_edited, title) VALUES (%s, %s, %s, %s) RETURNING id", (user_id, note, last_edited, title))
    conn.commit()
    note_id = cursor.fetchone()[0]
    tag_ids = []
    for tag in tags:
        cursor.execute("SELECT id FROM tblTags WHERE tag_name = %s", (tag, ))
        id = cursor.fetchone()
        if(id): id = id[0]
        else:
            cursor.execute("INSERT INTO tblTags (tag_name) VALUES (%s) RETURNING id", (tag, ))
            conn.commit()
            id = cursor.fetchone()[0]
        tag_ids.append(id)
    for tag_id in tag_ids:
        cursor.execute("INSERT INTO tblTagsNotes (tag_id, note_id) VALUES (%s, %s)", (tag_id, note_id))
        conn.commit()
    conn.commit()
    db.close_db()
    return {'id': note_id}, 201

#Not Implemented
@applet.route('/<user_id>/notes/<notes_id>', methods = ['PUT'])
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
    try: tags = list(set(content['tags']))
    except: tags = []
    try:
        user_id = int(user_id)
        last_edited = datetime.strptime(content['last_edited'], "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
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
    cursor.execute("UPDATE tblNotes SET note = %s, last_edited = %s, title = %s WHERE id = %s", (note, last_edited, title, notes_id))
    conn.commit()
    tag_ids = []
    cursor.execute("DELETE FROM tblTagsNotes WHERE note_id = %s", (notes_id, ))
    conn.commit()
    for tag in tags:
        cursor.execute("SELECT id FROM tblTags WHERE tag_name = %s", (tag, ))
        id = cursor.fetchone()
        if(id): id = id[0]
        else:
            cursor.execute("INSERT INTO tblTags (tag_name) VALUES (%s) RETURNING id", (tag, ))
            conn.commit()
            id = cursor.fetchone()[0]
        tag_ids.append(id)
    for tag_id in tag_ids:
        cursor.execute("INSERT INTO tblTagsNotes (tag_id, note_id) VALUES (%s, %s)", (tag_id, notes_id))
        conn.commit()
    conn.commit()
    db.close_db()
    return {'message': 'note updated succesffully'}, 204
