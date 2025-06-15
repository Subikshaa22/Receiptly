#Reading a receipt image, extracting text from it using OCR, structuring the data in JSON format, and categorizing each item using a ML model or Gemini AI.

import argparse
import os
import cv2
import imutils
import pytesseract
from imutils.perspective import four_point_transform
from google import genai
import json

import pickle

# Load your ML model
with open("category_model.pkl", "rb") as f:
    pipeline = pickle.load(f)


# enter your gemini api key here
client = genai.Client(api_key="AIzaSyB_MvXtjTtI5Ekqa0KyPlIXVXrTuzDbmPE")
def categorize_with_gemini(item_name):
    prompt = f"""
    Categorize the following shopping item into one of these categories:
    grocery, dairy, beverages, personal_care, medicines, stationery, electronics, fast_food, snacks,
    cleaning_supplies, baby_products, frozen_food, bakery, fruits_vegetables, home_appliances, pet_supplies,
    clothing, cosmetics, meat, miscellaneous.

    Item: {item_name}

    Just reply with the category name. If unknown, use 'miscellaneous'.
    """
    response = client.models.generate_content(
        model="gemini-2.0-flash", contents=prompt
    )
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
    except Exception as e:
        return categorize_with_gemini(item_name)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-i", "--image", type=str, required=True, help="path to input image"
    )
    args = parser.parse_args()

    # check if image with given path exists
    if not os.path.exists(args.image):
        raise Exception("The given image does not exist.")

    # load the image, resize and compute ratio
    img_orig = cv2.imread(args.image)
    image = img_orig.copy()
    image = imutils.resize(image, width=500)
    ratio = img_orig.shape[1] / float(image.shape[1])

    # convert the image to grayscale, blur it slightly, and then apply edge detection
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(
        gray,
        (
            5,
            5,
        ),
        0,
    )
    edged = cv2.Canny(blurred, 75, 200)
    # cv2.imwrite("edged.jpg", edged)

    # find contours in the edge map and sort them by size in descending order
    cnts = cv2.findContours(edged.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnts = imutils.grab_contours(cnts)
    cnts = sorted(cnts, key=cv2.contourArea, reverse=True)

    # initialize a contour that corresponds to the receipt outline
    receiptCnt = None
    # loop over the contours
    for c in cnts:
        # approximate the contour
        peri = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, 0.02 * peri, True)
        # if our approximated contour has four points, then we can assume we have found the outline of the receipt
        if len(approx) == 4:
            receiptCnt = approx
            break

    # cv2.drawContours(image, [receiptCnt], -1, (0, 255, 0), 2)
    # cv2.imwrite('image_with_outline.jpg', image)
    # cv2.imshow("Receipt Outline", image)
    # cv2.waitKey(0)

    # if the receipt contour is empty then our script could not find the outline and we should be notified
    if receiptCnt is None:
        raise Exception(
            (
                "Could not find receipt outline. "
                "Try debugging your edge detection and contour steps."
            )
        )

    # apply a four-point perspective transform to the *original* image to obtain a top-down bird's-eye view of the receipt
    receipt = four_point_transform(img_orig, receiptCnt.reshape(4, 2) * ratio)
    # cv2.imwrite('transformed_receipt.jpg', receipt)

    # apply OCR to the receipt image by assuming column data, ensuring the text is concatenated across the row
    options = "--psm 6"
    text = pytesseract.image_to_string(
        cv2.cvtColor(receipt, cv2.COLOR_BGR2RGB), config=options
    )

    # show the raw output of the OCR process
    '''print("[INFO] raw output:")
    print("==================")
    print(text)
    print("\n")'''

    json_format = '''{
    "merchant_name": "",
    "address": "",
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
        },
        {
        "name": "",
        "quantity": ,
        "unit_price": ,
        "total_price": 
        }
    ]
    }
    '''

    prompt = f"""Extract structured JSON data in the given format from the following receipt text. If there is no transaction id, mention the bill number in the transaction id field.\n\n Json format:\n {json_format}\n\nReceipt text:\n{text}"""

    response = client.models.generate_content(
        model = "gemini-2.0-flash", contents = prompt
    )

    json_str = response.text.strip("```json")

    
    data = json.loads(json_str)

    for item in data.get("items", []):
        name = item.get("name", "")
        category = predict_category(name)
        item["category"] = category

    print(json.dumps(data, indent=2))

if __name__ == "__main__":
    main()
