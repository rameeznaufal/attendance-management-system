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
        course_id = content['name']
        class_id = content['email']
    except:
        db.close_db()
        return {"message": "Bad Request"}, 400
    try:
        cursor.execute("SELECT reg_no FROM student")
        students = cursor.fetchall()
        for student in students:
            cursor.execute("INSERT INTO attendance VALUES(%s,%s,%s,0)", (student, class_id, course_id))
        conn.commit()
        db.close_db()
        return {'message': 'Class attendance for students added'}, 204   
    except:
        db.close_db()
        return {'message': 'Class attendance could not be added'}, 500

@applet.route('/mark', methods = ['PUT'])
@jwt_required()
def mark_attendance():
    conn = db.get_db()
    cursor = conn.cursor()
    content = request.get_json(silent=True)
    try:
        course_id = content['name']
        class_id = content['email']
        status =  int(content['status'])
    except:
        db.close_db()
        return {"message": "Bad Request"}, 400
    try:
        reg_no = get_jwt_identity()
        cursor.execute("UPDATE attendance SET status = %d WHERE course_id = %s AND class_id = %s AND reg_no = %s ", (status, course_id, class_id, reg_no, ))
        conn.commit()
        db.close_db()
        return {'message': 'Attendance marked'}, 204   
    except:
        db.close_db()
        return {'message': 'Attendance could not be marked'}, 500




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
