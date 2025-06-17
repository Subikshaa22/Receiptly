import pymongo
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os
import json
from datetime import datetime
from bson import ObjectId

# Prevent Matplotlib permission error
os.environ['MPLCONFIGDIR'] = os.environ.get('TEMP', '/tmp')

# Connect to MongoDB
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["Receiptly"]
receipts = db["receipts"]

# ✅ Fetch all receipts
data = list(receipts.find())

if not data:
    print(json.dumps({"error": "No receipts found"}))
    exit()

# Convert ObjectId to str and clean numeric fields
for doc in data:
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])
    doc['subtotal'] = float(doc.get('subtotal') or 0)
    doc['tax_amount'] = float(doc.get('tax_amount') or 0)
    doc['discounts'] = float(doc.get('discounts') or 0)
    doc['total_amount'] = float(doc.get('total_amount') or 0)

# Convert to DataFrame
df = pd.DataFrame(data)

# Convert date field
df['uploadedAt'] = pd.to_datetime(df['uploadedAt'], errors='coerce')
df = df.dropna(subset=['uploadedAt'])

# Extract date parts
df['month_str'] = df['uploadedAt'].dt.to_period('M').astype(str)
df['weekday'] = df['uploadedAt'].dt.day_name()

# Flatten the items (explode)
df = df.explode('items')

# Normalize the 'items' field into separate columns
items_df = pd.json_normalize(df['items'])
df = df.drop(columns=['items']).reset_index(drop=True)
df = pd.concat([df, items_df], axis=1)

# Replace NaN in item fields
df['quantity'] = pd.to_numeric(df['quantity'], errors='coerce').fillna(0).astype(int)
df['unit_price'] = pd.to_numeric(df['unit_price'], errors='coerce').fillna(0)
df['total_price'] = pd.to_numeric(df['total_price'], errors='coerce').fillna(0)

# Group by month & category for trends
monthly_trend = df.groupby(['month_str', 'category'])['total_price'].sum().reset_index()

# Spending share pie (latest month)
latest_month = df['month_str'].max()
pie_data = df[df['month_str'] == latest_month].groupby('category')['total_price'].sum()

# Heatmap (weekday vs category)
heat_data = df.groupby(['weekday', 'category'])['total_price'].sum().unstack(fill_value=0)
weekdays_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
heat_data = heat_data.reindex(weekdays_order)

# Create output directory for plots
output_dir = os.path.join("public", "analysis_images")
os.makedirs(output_dir, exist_ok=True)

# Monthly trend plot
plt.figure(figsize=(10, 6))
sns.lineplot(data=monthly_trend, x='month_str', y='total_price', hue='category', marker='o')
plt.title("Monthly Spending Trends")
plt.xlabel("Month")
plt.ylabel("Amount")
plt.xticks(rotation=45)
trend_path = os.path.join(output_dir, "monthly_trend.png")
plt.tight_layout()
plt.savefig(trend_path)
plt.close()

# Pie chart plot
plt.figure(figsize=(6, 6))
pie_data.plot.pie(autopct='%1.1f%%')
plt.title(f"Spending Share in {latest_month}")
pie_path = os.path.join(output_dir, "pie_chart.png")
plt.tight_layout()
plt.savefig(pie_path)
plt.close()

# Heatmap plot
plt.figure(figsize=(10, 6))
sns.heatmap(heat_data, annot=True, fmt=".0f", cmap="YlGnBu")
plt.title("Weekday Spending Heatmap")
heatmap_path = os.path.join(output_dir, "heatmap.png")
plt.tight_layout()
plt.savefig(heatmap_path)
plt.close()

# Convert datetime to string for JSON
df['uploadedAt'] = df['uploadedAt'].dt.strftime('%Y-%m-%d %H:%M:%S')

# Build summary
summary = {
    "receipts": json.loads(df.to_json(orient="records")),
    "analysis": {
        "expense_by_category": json.loads(
            pie_data.reset_index().rename(columns={'total_price': 'amount'}).to_json(orient="records")
        ),
        "monthly_trend": json.loads(
            monthly_trend.rename(columns={'total_price': 'amount'}).to_json(orient="records")
        )
    },
    "image_paths": [
        "/analysis_images/monthly_trend.png",
        "/analysis_images/pie_chart.png",
        "/analysis_images/heatmap.png"
    ]
}

print(json.dumps(summary))
