# JobLens 🔍

An AI-powered job application assistant built on AWS.

Upload your resume and a job description — ask any question and get an intelligent answer that cross-references both documents.

## Tech Stack
- **Backend**: FastAPI + Python
- **AI**: RAG pipeline with FAISS vector search + Llama 3.1 via Groq
- **Storage**: AWS S3 (KMS encrypted)
- **Database**: AWS RDS PostgreSQL (private subnet)
- **Security**: AWS KMS, Secrets Manager, IAM roles
- **Infrastructure**: Custom VPC, public/private subnets, security groups
- **Container**: Docker
- **Deployment**: Kubernetes on AWS EKS (coming soon)

## Architecture
React Frontend → CloudFront → FastAPI (Kubernetes) → Aurora DB
                                      ↓
                                   AWS S3 (documents)
                                   AWS Secrets Manager
                                   FAISS (vector index)

## How it works
1. Upload your resume and job description as text files
2. Documents are stored in S3 and indexed using sentence embeddings
3. Ask any question — the RAG pipeline finds relevant chunks and generates an answer using Llama 3.1
4. Get specific, sourced answers about your fit for the role
