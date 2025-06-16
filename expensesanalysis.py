from pymongo import MongoClient
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import pickle
from sklearn.linear_model import LinearRegression
import google.generativeai as genai

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["Receiptly"]
receipts = db["receipts"]

# Fetch and flatten data
docs = list(receipts.find())
print(f"Number of documents fetched: {len(docs)}")
if docs:
    print(f"Sample document: {docs[0]}")

records = []
for r in docs:
    print(f"Processing receipt: {r}")
    date = pd.to_datetime(r.get("date"))
    # If "items" exists, use that; otherwise build from flat fields
    if "items" in r and r["items"]:
        for item in r["items"]:
            records.append({
                "date": date,
                "merchant_name": r.get("merchant_name", "unknown"),
                "category": item.get("category", "miscellaneous"),
                "item_name": item.get("name"),
                "quantity": item.get("quantity"),
                "amount": item.get("total_price")
            })
    else:
        # Flat structure
        records.append({
            "date": date,
            "merchant_name": r.get("merchant_name", "unknown"),
            "category": r.get("category", "miscellaneous"),
            "item_name": r.get("description"),
            "quantity": r.get("quantity", 1),
            "amount": r.get("amount")
        })

df = pd.DataFrame(records)
print(f"Number of expense records created: {len(df)}")
print(df.head())
print(df.columns)

if not df.empty:
    # Add time features
    df["month"] = df["date"].dt.to_period("M")
    df["weekday"] = df["date"].dt.day_name()

    # Monthly trend
    monthly_trend = df.groupby(["month", "category"])["amount"].sum().reset_index()
    monthly_trend["month_str"] = monthly_trend["month"].astype(str)

    # Line plot
    plt.figure(figsize=(12,6))
    sns.lineplot(data=monthly_trend, x="month_str", y="amount", hue="category", marker="o")
    plt.title("Monthly Spending Trends")
    plt.xlabel("Month")
    plt.ylabel("Amount")
    plt.show()

    # Pie chart for latest month
    latest_month = df["month"].max()
    latest_data = df[df["month"] == latest_month]
    pie_data = latest_data.groupby("category")["amount"].sum()
    pie_data.plot.pie(autopct="%1.1f%%", figsize=(6,6), title=f"Spending Share in {latest_month}")
    plt.ylabel("")
    plt.show()

    # Heatmap
    heat_data = df.pivot_table(index="weekday", columns="month", values="amount", aggfunc="sum").fillna(0)
    heat_data = heat_data.reindex(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])
    heat_data.columns = heat_data.columns.astype(str)

    plt.figure(figsize=(12,6))
    sns.heatmap(heat_data, annot=True, fmt=".0f", cmap="YlGnBu")
    plt.title("Weekday Spending Heatmap")
    plt.show()

    # Excel export
    df.to_excel("monthly_report.xlsx", index=False)
    print("✅ Excel report saved: monthly_report.xlsx")

    # Predict next month
    predictions = {}
    for cat in df["category"].unique():
        sub = monthly_trend[monthly_trend["category"] == cat]
        X = sub["month"].apply(lambda x: x.ordinal).values.reshape(-1,1)
        y = sub["amount"].values
        model = LinearRegression().fit(X,y)
        next_month = sub["month"].max() + 1
        pred_amt = model.predict([[next_month.ordinal]])[0]
        predictions[cat] = round(pred_amt, 2)

    print("📈 Predictions for next month:")
    print(predictions)

    # Tips from Gemini
    genai.configure(api_key="AIzaSyCLAaRIeQ6hP6e7NKe-00R0jYX3XUlRyhA")
    model = genai.GenerativeModel("gemini-1.5-flash-latest")
    prompt = f"Based on these predicted expenses next month: {predictions}. Suggest 3 actionable saving tips."
    response = model.generate_content(prompt)
    print(response.text)

else:
    print("⚠️ No data to process. Please check your MongoDB collection or insertion format.")
