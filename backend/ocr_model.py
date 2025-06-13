import sys
import json

# Immediately return dummy items without real OCR
items = [
    {"name": "Test Item", "price": 100, "category": "Misc", "quantity": 1},
    {"name": "Another Item", "price": 200, "category": "Food", "quantity": 2}
]

print(json.dumps(items))
