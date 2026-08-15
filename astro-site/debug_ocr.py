import json, re

with open('../raw_ocr_results.json', 'r') as f: data = json.load(f)
blocks = data['ocr_data']['HyperOS_6月更新一览_(2026)/0.webp']['blocks']
blocks.sort(key=lambda b: b['y'])

results = []
TYPE_RE = re.compile(r'^(?:[（(【\[•·.。\s]*)(新增|优化|修复|调整|适配|升级)(?:[）)】\]\s、·.:：；;，,]*)(.*)', re.I)

for b in blocks:
    text = b['text'].strip()
    y = b['y']
    match = TYPE_RE.match(text)
    if match:
        results.append({'text': text, 'desc': match.group(2).strip(), 'y': y})
        print(f"TYPE: {text} | {y}")
    else:
        if results and (y - results[-1]['y'] < 0.025) and not text.startswith('*'):
            print(f"APPENDING to {results[-1]['desc']}: {text} | {y} (diff: {y - results[-1]['y']})")
            results[-1]['desc'] += text
            results[-1]['y'] = y
        else:
            print(f"OTHER: {text} | {y}")
