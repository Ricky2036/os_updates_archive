import json
with open('../raw_ocr_results.json', 'r') as f:
    data = json.load(f)
amap = data.get('article_map', {})
odata = data.get('ocr_data', {})
for order, name in [(32, 'HyperOS_5月更新一览_(2026)'), (33, 'HyperOS_4月更新一览_(2026)'), (34, 'HyperOS_3月更新一览_(2026)'), (35, 'HyperOS_1月更新一览_(2026)'), (36, 'HyperOS_11月更新一览_(2025)'), (38, 'HyperOS_7月更新一览_(2025)'), (39, 'HyperOS_5月更新一览_(2025)'), (40, 'HyperOS_4月更新一览_(2025)'), (41, 'HyperOS_12月更新一览_(2024)'), (42, 'HyperOS_10月更新一览_(2024)')]:
    print(f"\n--- Order {order}: {name} ---")
    for f in amap.get(name, []):
        blocks = odata.get(f, {}).get('blocks', [])
        print(f"File: {f.split('/')[-1]}")
        for b in blocks:
            text = b['text'].strip()
            if len(text) > 4:
                y = b['y']
                h = b['height']
                print(f"  {y:.3f}-{y+h:.3f}: {text}")
