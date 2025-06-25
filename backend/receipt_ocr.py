import argparse
import os
import cv2
import imutils
import pytesseract
from imutils.perspective import four_point_transform
import google.generativeai as genai
import json
from dotenv import load_dotenv
import pickle
from pymongo import MongoClient
import datetime
from PIL import Image
import numpy as np
from bson import ObjectId  # ✅ Import to handle ObjectId

# Load environment variables from .env file
load_dotenv()

# Load user email ( make sure your server sets this before calling this script)
USER_EMAIL = os.getenv("CURRENT_USER_EMAIL", "divya@example.com")

# Load your ML model
with open("category_model.pkl", "rb") as f:
    pipeline = pickle.load(f)

# Get the Gemini API key
api_key = os.getenv("API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-2.0-flash")

def categorize_with_gemini(item_name):
    prompt = f"""
    Categorize the following shopping item into one of these categories:
    grocery, dairy, beverages, personal_care, medicines, stationery, electronics, fast_food, snacks,
    cleaning_supplies, baby_products, frozen_food, bakery, fruits_vegetables, home_appliances, pet_supplies,
    clothing, cosmetics, meat, miscellaneous.

    Item: {item_name}

    Just reply with the category name. If unknown, use 'miscellaneous'.
    """
    response = model.generate_content(contents=prompt)
    return response.text.strip().lower()

def predict_category(item_name):
    try:
        proba = pipeline.predict_proba([item_name])[0]
        max_proba = max(proba)
        label = pipeline.classes_[proba.argmax()]
        if max_proba > 0.6:
            return label
        else:
            return categorize_with_gemini(item_name)
    except Exception:
        return categorize_with_gemini(item_name)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("-i", "--image", type=str, required=True, help="path to input image")
    args = parser.parse_args()

    if not os.path.exists(args.image):
        raise Exception("The given image does not exist.")

    img_orig = cv2.imread(args.image)
    image = img_orig.copy()
    image = imutils.resize(image, width=500)
    ratio = img_orig.shape[1] / float(image.shape[1])

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edged = cv2.Canny(blurred, 75, 200)

    cnts = cv2.findContours(edged.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnts = imutils.grab_contours(cnts)
    cnts = sorted(cnts, key=cv2.contourArea, reverse=True)

    receiptCnt = None
    for c in cnts:
        peri = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, 0.02 * peri, True)
        if len(approx) == 4:
            receiptCnt = approx
            break

    if receiptCnt is None:
        raise Exception("Could not find receipt outline.")

    receipt = four_point_transform(img_orig, receiptCnt.reshape(4, 2) * ratio)

    options = "--psm 6"
    text = pytesseract.image_to_string(cv2.cvtColor(image, cv2.COLOR_BGR2RGB), config=options)

    json_format = '''{
        "merchant_name": "",
        "date": "",
        "total_amount": ,
        "subtotal": ,
        "tax_amount": ,
        "discounts": ,
        "payment_method": "",
        "transaction_id": "",
        "total_items": ,
        "items": [
            {
                "name": "",
                "quantity": ,
                "unit_price": ,
                "total_price": 
            }
        ]
    }'''

    prompt = f"""Extract structured JSON data in the given format from the following receipt image.
    If there is no transaction id, mention the bill number in the transaction id field.
    Convert the date to DD/MM/YYYY format.\n\nJson format:\n{json_format}"""

    img_pil = Image.fromarray(img_orig)
    response = model.generate_content(contents=[prompt, img_pil], stream=True)
    response.resolve()

    json_str = response.text.strip("```json").strip("```")
    data = json.loads(json_str)

    for item in data.get("items", []):
        name = item.get("name", "")
        category = predict_category(name)
        item["category"] = category

    data["uploadedAt"] = str(datetime.datetime.now())
    data["userEmail"] = USER_EMAIL

    # Save to MongoDB
    client = MongoClient("mongodb://localhost:27017/")
    db = client["Receiptly"]
    collection = db["receipts"]
    result = collection.insert_one(data)

    # Serialize ObjectId properly
    def convert_obj(obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

    print(json.dumps(data, indent=2, default=convert_obj))

if __name__ == "__main__":
    main()
