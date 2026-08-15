import json
with open('../raw_ocr_results.json', 'r') as f: data = json.load(f)
for k, files in data.get('article_map', {}).items():
    if '6月' in k and '2026' in k and 'Hyper' in k:
        print(f"--- {k} ---")
        blocks = []
        for f2 in files: blocks.extend(data['ocr_data'][f2]['blocks'])
        blocks.sort(key=lambda b: b['y'])
        for b in blocks: print(f"{b['y']:.3f}: {b['text']}")
