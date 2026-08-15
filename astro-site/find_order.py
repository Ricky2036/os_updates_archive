import json

with open('scripts/monthly-update-reviews.json', 'r') as f:
    reviews = json.load(f)

for order, items in reviews['articles'].items():
    for item in items:
        if "机型适配计划" in item.get('sourceText', ''):
            print(f"Found in order {order}")
