import json
with open('../raw_ocr_results.json', 'r') as f: data = json.load(f)
for k, files in data.get('article_map', {}).items():
    for f2 in files:
        for b in data['ocr_data'][f2]['blocks']:
            if '青春不落幕' in b['text'] or '毕业季限时水印' in b['text']:
                print(f"Found in {k}")
