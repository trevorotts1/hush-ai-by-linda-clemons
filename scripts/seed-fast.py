#!/usr/bin/env python3
"""Seed Hush knowledge base — embeds + inserts in small batches."""
import json, sys, os, urllib.request

# Read secrets
def load_env(path):
    env = {}
    with open(path) as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                k, v = line.strip().split('=', 1)
                env[k] = v
    return env

env = {}
for p in [
    os.path.expanduser('~/clawd/secrets/.env'),
    os.path.expanduser('~/.openclaw/.env')
]:
    if os.path.exists(p):
        env.update(load_env(p))

OPENAI_KEY = env.get('OPENAI_API_KEY', '')
SUPABASE_URL = env.get('SUPABASE_URL', '')
SUPABASE_KEY = env.get('SUPABASE_SERVICE_ROLE_KEY', '')

KB = os.path.expanduser('~/Downloads/hush/hush-ai-by-linda-clemons/knowledge-base')

def chunk_text(text, source, size=700, overlap=50):
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + size, len(text))
        chunk = text[start:end]
        if end < len(text):
            bp = max(chunk.rfind('.'), chunk.rfind('\n'), size - 50)
            if bp > size // 2:
                chunk = text[start:start + bp + 1]
        if len(chunk.strip()) > 50:
            chunks.append({"content": chunk.strip(), "source": source})
        start += len(chunk) - overlap
    return chunks

def embed_chunks(chunks, batch_size=10):
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i+batch_size]
        texts = [c['content'] for c in batch]
        
        body = json.dumps({
            "model": "text-embedding-3-small",
            "input": texts,
            "dimensions": 1536
        }).encode()
        
        req = urllib.request.Request(
            "https://api.openai.com/v1/embeddings",
            data=body,
            headers={"Authorization": f"Bearer {OPENAI_KEY}", "Content-Type": "application/json"}
        )
        
        for attempt in range(3):
            try:
                with urllib.request.urlopen(req, timeout=60) as resp:
                    data = json.loads(resp.read())
                for j, d in enumerate(data['data']):
                    batch[j]['embedding'] = '[' + ','.join(str(x) for x in d['embedding']) + ']'
                break
            except Exception as e:
                if attempt == 2:
                    print(f"  FAILED batch {i}: {e}")
                    for c in batch:
                        c['embedding'] = None
                else:
                    import time; time.sleep(2)
        
        print(f"  Embedded {min(i+batch_size, len(chunks))}/{len(chunks)}")
        
        # Insert this batch
        insert_batch([c for c in batch if c.get('embedding')])

    return chunks

def insert_batch(chunks):
    if not chunks:
        return
    rows = [{
        "content": c['content'],
        "source": c['source'],
        "section": None,
        "embedding": c['embedding']
    } for c in chunks]
    
    body = json.dumps(rows).encode()
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/hush_knowledge_chunks",
        data=body,
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        },
        method="POST"
    )
    
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                pass
            print(f"  Inserted {len(rows)} rows")
            break
        except Exception as e:
            if attempt == 2:
                print(f"  INSERT FAILED: {e}")
            else:
                import time; time.sleep(2)

def main():
    print("Reading book text...")
    with open(f"{KB}/book-text.txt") as f:
        book = f.read()
    print(f"  {len(book)} chars")
    
    print("Reading blueprint...")
    with open(f"{KB}/blueprint.md") as f:
        bp = f.read()
    print(f"  {len(bp)} chars")
    
    print("Chunking...")
    chunks = chunk_text(book, 'book') + chunk_text(bp, 'blueprint')
    print(f"  {len(chunks)} total chunks")
    
    print("Embedding + inserting...")
    embed_chunks(chunks)
    
    print(f"\nDONE: {len(chunks)} chunks seeded")
    
    with open('/tmp/hush-seed-done.txt', 'w') as f:
        f.write(f"DONE: {len(chunks)} chunks")

if __name__ == '__main__':
    main()
