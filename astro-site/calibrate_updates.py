import json
import re

with open('../raw_ocr_results.json', 'r') as f:
    data = json.load(f)

with open('scripts/monthly-update-reviews.json', 'r') as f:
    reviews = json.load(f)

TYPE_RE = re.compile(r'^(?:[（(【\[•·.。\s]*)(新增|优化|修复|调整|适配|升级)(?:[）)】\]\s、·.:：；;，,]*)(.*)', re.I)

for order in range(30, 44):
    order_str = str(order)
    # Find the article id
    article_id = None
    for k in data.get('article_map', {}):
        if 'HyperOS' in k and '月更新一览' in k:
            # We need to map order to article_id. Let's use monthly-digest-seeds.mjs or just the existing reviews.
            pass

    # Wait, the existing reviews have the old bad items. But they don't have the article_id directly.
    # I can just read src/content/articles/{order}-hyperos.json to get the article_id.
    
    try:
        with open(f'src/content/articles/{order}-hyperos.json', 'r') as af:
            article_info = json.load(af)
            article_id = article_info['articleId']
    except Exception as e:
        print(f"Skipping {order}: {e}")
        continue
    
    files = data.get('article_map', {}).get(article_id, [])
    blocks = []
    for f in files:
        blocks.extend(data.get('ocr_data', {}).get(f, {}).get('blocks', []))
    blocks = sorted(blocks, key=lambda b: b['y'])

    current_module = "系统"
    results = []
    
    for b in blocks:
        text = b['text'].strip()
        y = b['y']
        
        match = TYPE_RE.match(text)
        if match:
            type_str = match.group(1)
            desc = match.group(2).strip()
            # If the description is empty but there's a match, it might be a malformed OCR line
            if desc:
                results.append({
                    'id': f"review-{len(results) + 1:02d}",
                    'module': current_module,
                    'moduleSource': 'explicit-heading',
                    'type': type_str,
                    'typeSource': 'explicit',
                    'sourceText': desc,
                    'description': desc,
                    'y': y
                })
        else:
            # Check if heading
            # Discard common false headings
            if len(text) < 15 and not text.startswith('*') and not text.startswith('温馨提示') \
               and '一览' not in text and 'OS' not in text and '更新亮点' not in text \
               and '其他更新' not in text and not text.endswith('问题'):
                # Valid heading? Usually no punctuation.
                if re.match(r'^[\u4e00-\u9fa5A-Za-z]+$', text.replace(' ', '')):
                    current_module = text
            else:
                # Check for continuation
                if results and (y - results[-1]['y'] < 0.025) and text and not text.startswith('*') and not text.startswith('温馨提示'):
                    # Append it
                    results[-1]['description'] += text
                    results[-1]['sourceText'] += text
                    # Update Y to latest so it can chain
                    results[-1]['y'] = y

    # Replace in reviews dict
    new_items = []
    for r in results:
        del r['y'] # remove temp key
        new_items.append(r)
    
    if new_items:
        reviews['articles'][order_str] = new_items
        print(f"Calibrated Order {order} with {len(new_items)} items.")
    else:
        print(f"Order {order} has NO items?!")

with open('scripts/monthly-update-reviews.json', 'w') as f:
    json.dump(reviews, f, indent=2, ensure_ascii=False)
