# 🧾 Receiptly

The project aims to build a web-based system where users can upload images of their receipts/bills. It will then store this data and provide insights into spending patterns and suggest budget cuts.

---

## ✅ Project Phases

### 🔍 Phase 1: OCR Setup (Python)
- Setup image preprocessing: resize, grayscale, thresholding.
- Extract raw text using **Tesseract OCR** (`pytesseract`).
- **Output:** Raw receipt text.

---

### 🧠 Phase 2: NLP & Information Extraction (Python)
- Clean and preprocess OCR text.
- Use **rule-based logic** or **ML models** (`spaCy`, `scikit-learn`) to extract:
  - Item name
  - Price
  - Quantity
  - Category
- **Output:** Structured receipt data in JSON format.

---

### ⚙️ Phase 3: Backend + Database (Node.js + Express + MongoDB)
- Setup **Express server** and create REST API endpoints:
  - `POST /upload-receipt`
  - `GET /receipts`
  - `GET /insights`
- Integrate Python ML logic using `python-shell` or `child_process`.
- Connect to **MongoDB Atlas** via `mongoose`.
- Define schemas for:
  - Users
  - Receipts
- Store parsed data and provide APIs for user insights.


## 💡 Example Output
-since u ppl didnot  commit the model structure yet . idk the format assumed moddel format if  u have any specifications after commiting ur ml, i will change accordingly in the backend
[
  {
    "name": "Milk",
    "price": 45,
    "quantity": 1,
    "category": "Grocery"
  }
]

---

### 🎨 Phase 4: Frontend (React.js / Next.js)
- Build **receipt upload UI** with image preview and progress feedback.
- Create **dashboard** to list all uploaded receipts and their parsed data.
- Show insights using **interactive charts** (`Recharts`, `Chart.js`).
- Style the application with **Tailwind CSS** or **Bootstrap**.

---

### 🔗 Phase 5: Integration & Deployment
- Fully connect:
  - Frontend ↔ Backend
  - Backend ↔ Python ML
  - Backend ↔ MongoDB Atlas
- Store uploaded images on **Firebase** or **AWS S3**.
- **Deployment Plan(optional):**
  - Frontend → [Vercel](https://vercel.com)
  - Backend → [Render](https://render.com) or [Railway](https://railway.app)
  - Database → [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

