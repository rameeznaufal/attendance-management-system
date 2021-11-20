from flask import request, Blueprint, jsonify
from flask_jwt_extended import get_jwt, unset_jwt_cookies, create_access_token, get_jwt_identity, jwt_required, set_access_cookies
from notesapp import bcrypt
from . import db
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
    email = get_jwt_identity()
    cursor.execute("SELECT * FROM tblUsers WHERE email = %s", (email, ))
    user = cursor.fetchone()
    if(user):
        return {'id': user[0], 'name': user[2], 'email': user[1]}, 200
    return {'message': 'user doesnt exist'}, 404

@applet.route('/<user_id>', methods = ['PUT'])
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
    cursor.execute("SELECT * FROM tblUsers WHERE id = %s", (user_id, ))
    user = cursor.fetchone()
    if user and user[1] == get_jwt_identity():
        cursor.execute("UPDATE tblUsers set name = %s where id = %s", (name, user_id))
        conn.commit()
        db.close_db()
        return {"message": "Changes saved"}, 200
    db.close_db()
    return {'message': 'Changes not saved'}, 409   

@applet.route('/<user_id>', methods = ['DELETE'])
@jwt_required()
def delete_user_details(user_id):
    try:
        user_id = int(user_id)
    except ValueError:
        return {'message': 'Invalid user ID'}, 400    
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tblUsers WHERE id = %s", (user_id, ))
    user = cursor.fetchone()        
    if user and user[1] == get_jwt_identity():
        cursor.execute("DELETE FROM tblUsers WHERE id = %s", (user_id, ))
        conn.commit()
        db.close_db()
        return {'message': 'user deleted successfully'}, 204
    db.close_db()
    return {'message': "User doesn't exist"}, 400

@applet.route('/signup', methods=['POST'])
def signup():
    conn = db.get_db()
    cursor = conn.cursor()
    content = request.get_json(silent=True)
    try:
        name = content['name']
        email = content['email']
        password = bcrypt.generate_password_hash(content['password']).decode('utf-8')
    except:
        return {"message": "Bad Request"}, 400
    cursor.execute("SELECT email FROM tblUsers WHERE email = %s", (email, ))
    user = cursor.fetchone()
    if(user):
        db.close_db()
        return {'message': 'User exists'}, 409

    cursor.execute("INSERT INTO tblUsers (email, name, password) VALUES (%s, %s, %s)", (email, name, password))
    conn.commit()
    
    cursor.execute("SELECT * FROM tblUsers WHERE email = %s", (email, ))
    id, email, name, _ = cursor.fetchone()
    response = jsonify({'id': id, 'name': name, 'email': email})
    access_token = create_access_token(identity=email)
    set_access_cookies(response, access_token)
    db.close_db()
    return response

@applet.route('/login', methods=['POST'])
def login():
    conn = db.get_db()
    cursor = conn.cursor()
    content = request.get_json()
    try:
        email = content['email']
        password = content['password']
    except:
        return {"message": "Bad Request"}, 400
    if email:
        cursor.execute("SELECT * FROM tblUsers WHERE email = %s", (email, ))
        user = cursor.fetchone()
        if user and bcrypt.check_password_hash(user[3], password):
            response = jsonify({'id': user[0], 'name': user[2], 'email': user[1]})
            access_token = create_access_token(identity=email)
            set_access_cookies(response, access_token)
            db.close_db()
            return response
    db.close_db()
    return {'message': 'Invalid email or password'}, 401

@applet.route('/logout', methods = ['POST'])
@jwt_required()
def logout():
    response = jsonify({"message": "User logged out"})
    unset_jwt_cookies(response)
    return response

@applet.route('/<user_id>/notes', methods = ['GET'])
@jwt_required()
def get_all_notes(user_id):
    try:
        user_id = int(user_id)
    except ValueError:
        return {'message': 'Invalid ID'}, 400 
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tblUsers WHERE id = %s", (user_id, ))
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
    cursor.execute("SELECT * FROM tblUsers WHERE id = %s", (user_id, ))
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
    cursor.execute("SELECT * FROM tblUsers WHERE id = %s", (user_id, ))
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

@applet.route('/<user_id>/notes/<notes_id>', methods = ['DELETE'])
@jwt_required()
def delete_note(user_id, notes_id):
    try:
        user_id = int(user_id)
    except ValueError:
        return {'message': 'Bad Request'}, 400 
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tblUsers WHERE id = %s", (user_id, ))
    user = cursor.fetchone()
    if not user:
        db.close_db()
        return {"message": "User doesn't exist"}, 404
    if(user[1] != get_jwt_identity()):
        db.close_db()
        return {"message": "Access Denied"}, 403
    cursor.execute("DELETE FROM tblTagsNotes WHERE note_id = %s", (notes_id, ))
    conn.commit()
    cursor.execute("DELETE FROM tblNotes WHERE id = %s", (notes_id, ))
    conn.commit()
    db.close_db()
    return {'message': 'note deleted successfully'}, 204

