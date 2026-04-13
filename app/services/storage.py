import boto3
import os
from dotenv import load_dotenv

load_dotenv()

s3_client = boto3.client("s3", region_name=os.getenv("AWS_REGION"))
BUCKET = os.getenv("S3_BUCKET_NAME")

def upload_document(file_bytes: bytes, filename: str, doc_type: str) -> str:
    key = f"{doc_type}/{filename}"
    s3_client.put_object(Bucket=BUCKET, Key=key, Body=file_bytes)
    return key

def get_document(key: str) -> bytes:
    response = s3_client.get_object(Bucket=BUCKET, Key=key)
    return response["Body"].read()

def list_documents(doc_type: str) -> list:
    response = s3_client.list_objects_v2(Bucket=BUCKET, Prefix=f"{doc_type}/")
    if "Contents" not in response:
        return []
    return [obj["Key"] for obj in response["Contents"]]
