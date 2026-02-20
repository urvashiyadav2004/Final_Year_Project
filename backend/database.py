import sqlite3
from datetime import datetime

DATABASE_NAME = 'users.db'

def init_database():
    """
    Initialize the SQLite database and create necessary tables if they don't exist.
    This function creates two tables: users and health_records.
    """
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS health_records (
            record_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            age INTEGER NOT NULL,
            gender TEXT NOT NULL,
            height REAL NOT NULL,
            weight REAL NOT NULL,
            bmi REAL NOT NULL,
            symptoms TEXT,
            activity_level TEXT,
            predicted_disease TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized successfully!")

def get_db_connection():
    """
    Create and return a connection to the SQLite database.
    """
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def create_user(username, email, hashed_password):
    """
    Insert a new user into the users table.
    Returns the user ID if successful, None if email already exists.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            (username, email, hashed_password)
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        return user_id
    except sqlite3.IntegrityError:
        return None

def get_user_by_email(email):
    """
    Fetch a user from the database by email.
    Returns a Row object if found, None otherwise.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()
    conn.close()
    return user

def get_user_by_id(user_id):
    """
    Fetch a user from the database by user ID.
    Returns a Row object if found, None otherwise.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    user = cursor.fetchone()
    conn.close()
    return user

def save_health_record(user_id, age, gender, height, weight, bmi, symptoms, activity_level, predicted_disease):
    """
    Save a health record for a user in the health_records table.
    Returns the record ID if successful.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO health_records 
        (user_id, age, gender, height, weight, bmi, symptoms, activity_level, predicted_disease)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, age, gender, height, weight, bmi, symptoms, activity_level, predicted_disease))
    conn.commit()
    record_id = cursor.lastrowid
    conn.close()
    return record_id

def get_user_health_records(user_id):
    """
    Retrieve all health records for a specific user, ordered by creation date (most recent first).
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM health_records 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    ''', (user_id,))
    records = cursor.fetchall()
    conn.close()
    return records

def get_latest_health_record(user_id):
    """
    Retrieve the most recent health record for a specific user.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM health_records 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 1
    ''', (user_id,))
    record = cursor.fetchone()
    conn.close()
    return record

if _name_ == '_main_':
    init_database()