import os
import sys
import json
import logging
from collections import defaultdict
import networkx as nx

from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
except Exception as e:
    logging.warning("Could not load SentenceTransformer")
    model = None

def extract_mechanisms(text: str) -> list:
    text = text.lower()
    mechs = []
    
    # Financial/Payment
    if any(w in text for w in ["check", "cheque", "deposit"]):
        mechs.append("fake_check")
    if any(w in text for w in ["crypto", "bitcoin", "usdt", "wallet"]):
        mechs.append("crypto")
    if any(w in text for w in ["transfer", "wire", "zelle", "cashapp", "venmo"]):
        mechs.append("money_transfer")
        
    # Actions
    if any(w in text for w in ["reship", "package", "forward"]):
        mechs.append("reshipping")
    if any(w in text for w in ["app", "download", "install", "software"]):
        mechs.append("software_install")
        
    # Information
    if any(w in text for w in ["ssn", "social security", "bank account", "routing", "passport"]):
        mechs.append("identity_harvest")
        
    # Communication
    if any(w in text for w in ["whatsapp", "telegram", "skype"]):
        mechs.append("unprofessional_comms")
        
    return mechs

def run_clustering(dataset_path: str, output_path: str):
    with open(dataset_path, 'r', encoding='utf-8') as f:
        cases = json.load(f)
        
    texts = [c['text'] for c in cases]
    ids = [c['id'] for c in cases]
    n = len(cases)
    
    # Compute Similarities
    embeddings = model.encode(texts)
    embed_sim = cosine_similarity(embeddings)
    
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(texts)
    tfidf_sim = cosine_similarity(tfidf_matrix)
    
    # Build Graph for connected components
    G = nx.Graph()
    for case_id in ids:
        G.add_node(case_id)
        
    edges_info = {}
    
    for i in range(n):
        for j in range(i + 1, n):
            esim = float(embed_sim[i][j])
            tsim = float(tfidf_sim[i][j])
            
            # Clustering heuristic (do not use expectedRisk/expectedCategories)
            # We require strong semantic similarity AND some lexical overlap
            if esim >= 0.85 and tsim >= 0.20:
                G.add_edge(ids[i], ids[j])
                edges_info[(ids[i], ids[j])] = {"esim": esim, "tsim": tsim}

    components = list(nx.connected_components(G))
    
    candidate_families = []
    
    for idx, comp in enumerate(components, 1):
        comp_list = list(comp)
        comp_list.sort()
        
        family_id = f"family_{idx:03d}"
        
        # Aggregate structural mechanisms for the family
        family_mechs = set()
        for cid in comp_list:
            case_text = next(c['text'] for c in cases if c['id'] == cid)
            family_mechs.update(extract_mechanisms(case_text))
            
        # Get similarities if it's not a singleton
        esim_avg = None
        tsim_avg = None
        
        if len(comp_list) > 1:
            esims = []
            tsims = []
            for i in range(len(comp_list)):
                for j in range(i + 1, len(comp_list)):
                    pair = (comp_list[i], comp_list[j])
                    rev_pair = (comp_list[j], comp_list[i])
                    if pair in edges_info:
                        esims.append(edges_info[pair]["esim"])
                        tsims.append(edges_info[pair]["tsim"])
                    elif rev_pair in edges_info:
                        esims.append(edges_info[rev_pair]["esim"])
                        tsims.append(edges_info[rev_pair]["tsim"])
            
            if esims:
                esim_avg = round(sum(esims) / len(esims), 3)
                tsim_avg = round(sum(tsims) / len(tsims), 3)

        candidate_families.append({
            "template_family_id": family_id,
            "case_ids": comp_list,
            "family_size": len(comp_list),
            "avg_embedding_similarity": esim_avg,
            "avg_tfidf_similarity": tsim_avg,
            "extracted_mechanisms": list(family_mechs),
            "candidate_status": "REVIEW"
        })

    # Sort families by size (descending)
    candidate_families.sort(key=lambda x: x['family_size'], reverse=True)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(candidate_families, f, indent=2)
        
    print(f"Generated {len(candidate_families)} candidate families.")
    print(f"Report saved to {output_path}")
    
    return candidate_families

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    dataset = os.path.join(base_dir, "..", "datasets", "evaluation", "rag_benchmark_cases.json")
    output = os.path.join(base_dir, "phase4_evaluation", "reports", "candidate_template_families.json")
    run_clustering(dataset, output)
