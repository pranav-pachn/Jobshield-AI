import json
import hashlib
import re
from datetime import datetime

def generate_hash(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def clean_text(text):
    # Remove blockquote markers
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        line = line.strip()
        if line.startswith('>'):
            line = line[1:].strip()
        cleaned_lines.append(line)
    text = ' '.join(cleaned_lines)
    
    # Remove surrounding quotes
    text = re.sub(r'^"|"$', '', text.strip())
    
    # Remove bold prefixes like "**Fake check scams:**"
    text = re.sub(r'^\*\*.*?\*\*\s*(?:\.\.\.)?\s*', '', text).strip()
    
    # Condense whitespace
    text = re.sub(r'\s+', ' ', text)
    return text

def main():
    try:
        with open('datasets/raw/data.json', 'r', encoding='utf-8') as f:
            raw_data = json.load(f)
    except FileNotFoundError:
        print("Error: datasets/raw/data.json not found.")
        return
        
    source_by_url = {item['url']: item for item in raw_data}
    
    try:
        with open('datasets/raw/source.md', 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print("Error: datasets/raw/source.md not found.")
        return
        
    # Split by URL sections
    sections = re.split(r'\*\*URL:\*\*\s*`?\[?([^\]\s]+)\]?', content)
    
    chunks = []
    seen_hashes = set()
    
    for i in range(1, len(sections), 2):
        url = sections[i].strip()
        url = re.sub(r'\].*$', '', url) # clean up markdown artifacts
        
        section_text = sections[i+1]
        
        source_meta = source_by_url.get(url)
        if not source_meta:
            print(f"Warning: No metadata found for URL {url}")
            continue
            
        blocks = re.split(r'\n\s*\n', section_text)
        for block in blocks:
            if block.strip().startswith('>'):
                cleaned = clean_text(block)
                if not cleaned or len(cleaned) < 20:
                    continue
                    
                content_hash = generate_hash(cleaned)
                if content_hash in seen_hashes:
                    continue
                    
                seen_hashes.add(content_hash)
                
                # Document ID from title
                doc_id = re.sub(r'[^a-z0-9]', '_', source_meta['title'].lower().strip())
                doc_id = re.sub(r'_+', '_', doc_id).strip('_')
                
                chunk_index = len([c for c in chunks if c['documentId'] == doc_id]) + 1
                
                chunk_obj = {
                    "id": f"{doc_id}_chunk_{chunk_index}",
                    "documentId": doc_id,
                    "chunkIndex": chunk_index,
                    "content": cleaned,
                    "contentHash": content_hash,
                    "source": {
                        "title": source_meta.get("title"),
                        "organization": source_meta.get("organization"),
                        "url": url,
                        "type": source_meta.get("source_type"),
                        "country": source_meta.get("country")
                    },
                    "category": source_meta.get("topic"),
                    "scamTypes": source_meta.get("scam_types", []),
                    "indicators": source_meta.get("scam_indicators", []),
                    "severity": source_meta.get("severity"),
                    "evidenceQuality": source_meta.get("evidence_quality"),
                    "createdAt": datetime.utcnow().isoformat() + "Z",
                    "updatedAt": datetime.utcnow().isoformat() + "Z"
                }
                chunks.append(chunk_obj)
                
    print(f"Extracted {len(chunks)} unique chunks from {len(set(c['documentId'] for c in chunks))} sources.")
    
    with open('datasets/processed/threat_chunks.json', 'w', encoding='utf-8') as f:
        json.dump(chunks, f, indent=2)
    print("Successfully wrote datasets/processed/threat_chunks.json")

if __name__ == "__main__":
    main()
