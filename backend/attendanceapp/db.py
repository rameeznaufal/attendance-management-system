import os
import psycopg2
from flask import g

#This function is used to let us connect to our database and the confidential values are stored in environment variable
def get_db():
    if 'db' not in g: 
        conn = psycopg2.connect(
            database=os.environ.get("DATABASE_NAME"),
            user=os.environ.get('DATABASE_USER'),
            host = os.environ.get('DATABASE_HOST'),
            password = os.environ.get('DATABASE_PASSWORD')
        )
        g.db = conn
    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()
