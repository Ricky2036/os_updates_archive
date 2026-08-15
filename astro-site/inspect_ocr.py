import json

with open('../raw_ocr_results.json', 'r') as f:
    data = json.load(f)

for k, v in data.get('article_map', {}).items():
    if 'HyperOS_' in k:
        print(f"{k} -> {v[0].split('/')[-2] if v else 'None'}")
