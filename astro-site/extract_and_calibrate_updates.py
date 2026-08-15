import json
import re

with open('../raw_ocr_results.json', 'r') as f:
    data = json.load(f)

with open('scripts/monthly-update-reviews.json', 'r') as f:
    reviews = json.load(f)

TYPE_RE = re.compile(r'^(?:[（(【\[•·.。\s]*)(新增|优化|修复|调整|适配|其他|未标注)(?:[）)】\]\s、·.:：；;，,]*)(.*)', re.I)
valid_modules = [
    "系统", "相册", "录音机", "笔记", "时钟", "家人守护", "小米超级岛", "跨设备互联", 
    "智能", "安全", "更多体验优化", "无障碍", "计算器", "CarWith", "超级小爱", "互联", 
    "桌面", "地图", "设备互联", "自由窗口", "控制中心", "小米智能卡", "日历", 
    "文件管理", "天气", "主题", "壁纸", "备份"
]

for order in range(30, 44):
    order_str = str(order)
    article_id = None
    try:
        with open(f'src/content/articles/{order}-hyperos.json', 'r') as af:
            article_info = json.load(af)
            article_id = article_info['articleId']
    except Exception as e:
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
            
            item_module = current_module
            # Semantic override for generic modules
            if current_module in ["系统", "更多体验优化", "更多优化", "其他体验优化", "其他", "综合", "基础体验"]:
                for v in valid_modules:
                    if v != "系统" and v != "更多体验优化" and v in desc:
                        item_module = v
                        break
            
            if desc:
                results.append({
                    'id': f"review-{len(results) + 1:02d}",
                    'module': item_module,
                    'moduleSource': 'explicit-heading' if item_module == current_module else 'inferred',
                    'type': type_str,
                    'typeSource': 'explicit',
                    'sourceText': desc,
                    'description': desc,
                    'y': y
                })
        else:
            cleaned_text = re.sub(r'[^a-zA-Z0-9\u4e00-\u9fa5]', '', text)
            if cleaned_text in valid_modules or any(v in text for v in valid_modules):
                for v in valid_modules:
                    if v in text:
                        current_module = v
                        break
            else:
                if results and (y - results[-1]['y'] < 0.025) and not text.startswith('*') and not text.startswith('温馨提示') and '一览' not in text:
                    results[-1]['description'] += text
                    results[-1]['sourceText'] += text
                    results[-1]['y'] = y
                    
                    # Re-evaluate semantic module if it was generic, since we have more text now
                    if results[-1]['moduleSource'] != 'explicit-heading' or results[-1]['module'] in ["系统", "更多体验优化"]:
                        desc = results[-1]['description']
                        for v in valid_modules:
                            if v != "系统" and v != "更多体验优化" and v in desc:
                                results[-1]['module'] = v
                                results[-1]['moduleSource'] = 'inferred'
                                break

    new_items = []
    for r in results:
        del r['y']
        new_items.append(r)
    
    if new_items:
        reviews['articles'][order_str] = new_items

with open('scripts/monthly-update-reviews.json', 'w') as f:
    json.dump(reviews, f, indent=2, ensure_ascii=False)
