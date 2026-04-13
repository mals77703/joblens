import boto3
import json
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def get_secret():
    client = boto3.client("secretsmanager", region_name=os.getenv("AWS_REGION"))
    response = client.get_secret_value(SecretId=os.getenv("SECRET_NAME"))
    return json.loads(response["SecretString"])

def get_connection():
    secret = get_secret()
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=5432,
        database=secret["db_name"],
        user=secret["db_username"],
        password=secret["db_password"]
    )
    return conn

def init_db():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id SERIAL PRIMARY KEY,
            filename TEXT NOT NULL,
            doc_type TEXT NOT NULL,
            s3_key TEXT NOT NULL,
            uploaded_at TIMESTAMP DEFAULT NOW()
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS chat_history (
            id SERIAL PRIMARY KEY,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)
    conn.commit()
    cur.close()
    conn.close()
