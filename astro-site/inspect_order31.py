import json

with open('../raw_ocr_results.json', 'r') as f:
    data = json.load(f)

for f in data.get('article_map', {}).get('HyperOS_6月更新一览_(2026)', []):
    print(f"\n--- {f.split('/')[-1]} ---")
    blocks = data.get('ocr_data', {}).get(f, {}).get('blocks', [])
    for b in blocks:
        text = b['text'].strip()
        y = b['y']
        print(f"  {y:.3f}: {text}")
