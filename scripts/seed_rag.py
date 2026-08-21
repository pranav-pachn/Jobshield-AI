import os
import json
import logging
from datetime import datetime, timezone
from pymongo import MongoClient, UpdateOne
from pymongo.uri_parser import parse_uri
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

# Try loading env vars from both locations
load_dotenv(dotenv_path='backend/.env')
load_dotenv(dotenv_path='.env')

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

MONGODB_URI = os.getenv('MONGODB_URI')

if not MONGODB_URI:
    logging.error("MONGODB_URI is not set. Please check your .env files.")
    exit(1)

logging.info("Loading SentenceTransformer model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
EMBEDDING_DIMENSIONS = 384

def main():
    client = MongoClient(MONGODB_URI)
    uri_info = parse_uri(MONGODB_URI)
    db_name = uri_info.get('database') or 'test'
    db = client[db_name]
    
    threat_chunks_col = db['threatchunks']
    threat_docs_col = db['threatdocuments']
    
    try:
        with open('datasets/processed/threat_chunks.json', 'r', encoding='utf-8') as f:
            chunks = json.load(f)
    except FileNotFoundError:
        logging.error("datasets/processed/threat_chunks.json not found.")
        return

    logging.info(f"Loaded {len(chunks)} chunks for ingestion.")
    
    docs_to_upsert = {}
    
    for chunk in chunks:
        doc_id = chunk['documentId']
        if doc_id not in docs_to_upsert:
            docs_to_upsert[doc_id] = {
                'documentId': doc_id,
                'title': chunk['source']['title'],
                'organization': chunk['source']['organization'],
                'url': chunk['source']['url'],
                'sourceType': chunk['source']['type'],
                'country': chunk['source'].get('country'),
                'updatedAt': datetime.now(timezone.utc)
            }
            
    doc_operations = []
    for doc in docs_to_upsert.values():
        doc_operations.append(
            UpdateOne(
                {'documentId': doc['documentId']},
                {'$set': doc, '$setOnInsert': {'createdAt': datetime.now(timezone.utc)}},
                upsert=True
            )
        )
        
    if doc_operations:
        result = threat_docs_col.bulk_write(doc_operations)
        logging.info(f"Upserted Documents: {result.upserted_count} inserted, {result.modified_count} modified.")
        
    new_chunks = 0
    updated_chunks = 0
    skipped_chunks = 0
    
    chunk_operations = []
    
    for chunk in chunks:
        content_hash = chunk['contentHash']
        
        # Check if exists and has embedding
        existing = threat_chunks_col.find_one({'contentHash': content_hash})
        
        if existing and existing.get('embedding'):
            logging.info(f"Skipping {chunk['id']}, already embedded.")
            skipped_chunks += 1
            update_data = {
                'chunkId': chunk['id'],
                'documentId': chunk['documentId'],
                'chunkIndex': chunk['chunkIndex'],
                'content': chunk['content'],
                'category': chunk.get('category'),
                'scamTypes': chunk.get('scamTypes', []),
                'indicators': chunk.get('indicators', []),
                'severity': chunk.get('severity'),
                'evidenceQuality': chunk.get('evidenceQuality'),
                'updatedAt': datetime.now(timezone.utc)
            }
            chunk_operations.append(
                UpdateOne({'contentHash': content_hash}, {'$set': update_data}, upsert=True)
            )
            continue
            
        logging.info(f"Generating embedding for {chunk['id']}...")
        try:
            # Generate local embedding
            embedding = model.encode(chunk['content']).tolist()
        except Exception as e:
            logging.error(f"Failed to generate embedding for {chunk['id']}: {e}")
            continue
            
        update_data = {
            'chunkId': chunk['id'],
            'documentId': chunk['documentId'],
            'chunkIndex': chunk['chunkIndex'],
            'content': chunk['content'],
            'contentHash': content_hash,
            'category': chunk.get('category'),
            'scamTypes': chunk.get('scamTypes', []),
            'indicators': chunk.get('indicators', []),
            'severity': chunk.get('severity'),
            'evidenceQuality': chunk.get('evidenceQuality'),
            'embedding': embedding,
            'updatedAt': datetime.now(timezone.utc)
        }
        
        chunk_operations.append(
            UpdateOne(
                {'contentHash': content_hash}, 
                {'$set': update_data, '$setOnInsert': {'createdAt': datetime.now(timezone.utc)}}, 
                upsert=True
            )
        )
        new_chunks += 1
        
    if chunk_operations:
        result = threat_chunks_col.bulk_write(chunk_operations)
        logging.info(f"Chunk operations complete: {result.upserted_count} new, {result.modified_count} updated.")
        
    logging.info(f"Summary: {new_chunks} newly embedded, {skipped_chunks} skipped (already embedded).")
    logging.info(f"To configure Atlas Vector Search, create an index on the `threatchunks` collection with dimensions={EMBEDDING_DIMENSIONS}, similarity=cosine, and path=embedding.")

if __name__ == "__main__":
    main()
