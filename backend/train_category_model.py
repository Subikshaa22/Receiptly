import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.naive_bayes import MultinomialNB

# Sample data (expand this list)
data = [
    ("COLGATE DENTAL", "personal_care"),
    ("PATANJALI ANTI", "personal_care"),
    ("GODREJ SOAP", "personal_care"),
    ("EVEREST SABJI MASALA", "grocery"),
    ("COCA COLA", "beverages"),
    ("BREAD", "bakery"),
    ("CETAPHIL CREAM", "cosmetics"),
    ("NOTEBOOK", "stationery"),
    ("MAGGI", "snacks"),
    ("CHICKEN LEG", "meat"),
    ("SURF EXCEL", "cleaning_supplies"),
    ("MILK PACKET", "dairy"),
    ("BABY DIAPER", "baby_products")
]

X, y = zip(*data)

pipeline = Pipeline([
    ('tfidf', TfidfVectorizer()),
    ('clf', MultinomialNB())
])

pipeline.fit(X, y)

with open("category_model.pkl", "wb") as f:
    pickle.dump(pipeline, f)

print("Model trained and saved as category_model.pkl")
