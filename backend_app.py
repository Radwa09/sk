import os
import time
import shutil
import base64
import cv2
import numpy as np
import requests
import easyocr
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from pyzbar.pyzbar import decode

# INITIALIZE MODELS GLOBALLY (Only once at startup)
print("Initializing EasyOCR Engine...")
reader = easyocr.Reader(['en'], gpu=False)
print("Models loaded successfully.")

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

SAVE_FOLDER = "captured_faces"
TRAIN_FOLDER = "skin_training_data"
os.makedirs(SAVE_FOLDER, exist_ok=True)
os.makedirs(TRAIN_FOLDER, exist_ok=True)

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

def clear_folder(folder):
    for file in os.listdir(folder):
        path = os.path.join(folder, file)
        if os.path.isfile(path):
            os.remove(path)

# ─────────────────────────────────────────────
# LOCAL PRODUCT DATABASE (curated, always works)
# ─────────────────────────────────────────────
PRODUCT_DATABASE = {
    "3337872411083": {
        "name": "La Roche-Posay Effaclar Purifying Foaming Gel",
        "brand": "La Roche-Posay",
        "ingredients": "Aqua / Water, Coco-Glucoside, Sodium Cocoyl Glutamate, Zinc PCA, Sodium Hydroxide, Polyquaternium-10, Disodium EDTA, Citric Acid, Parfum / Fragrance"
    },
    "3337875520817": {
        "name": "La Roche-Posay Toleriane Hydrating Gentle Cleanser",
        "brand": "La Roche-Posay",
        "ingredients": "Aqua / Water, Glycerin, Cetearyl Alcohol, Ceteareth-20, Ceramide NP, Niacinamide, Thermal Spring Water, Sodium Hyaluronate, Carbomer, Sodium Hydroxide"
    },
    "3337872413018": {
        "name": "La Roche-Posay Anthelios Sunscreen SPF50+",
        "brand": "La Roche-Posay",
        "ingredients": "Aqua / Water, Diisopropyl Sebacate, Glycerin, Methylene Bis-Benzotriazolyl, Drometrizole Trisiloxane, Titanium Dioxide, Silica, Tocopherol, Thermal Spring Water"
    },
    "3600541174481": {
        "name": "La Roche-Posay Lipikar Balm AP+",
        "brand": "La Roche-Posay",
        "ingredients": "Aqua / Water, Glycerin, Paraffinum Liquidum, Shea Butter, Niacinamide, Aqua Posae Filiformis, Bifidobacterium Extract, Ceramide NP, Sodium Hyaluronate"
    },
    "3606000590496": {
        "name": "La Roche-Posay Cicaplast Baume B5",
        "brand": "La Roche-Posay",
        "ingredients": "Aqua / Water, Glycerin, Vaseline, Petrolatum, Panthenol (Vitamin B5), Pantolactone, Manganese Gluconate, Copper Gluconate, Zinc Gluconate, Shea Butter"
    },
    "4005808890507": {
        "name": "Nivea Men Creme",
        "brand": "Nivea",
        "ingredients": "Aqua, Glycerin, Paraffinum Liquidum, Alcohol Denat., Cetyl Alcohol, Glyceryl Stearate, Tocopheryl Acetate, Panthenol, Sodium Carbomer, Phenoxyethanol"
    },
    "6223000551061": {
        "name": "Eva Skin Clinic Collagen",
        "brand": "Eva",
        "ingredients": "Aqua, Soluble Collagen, Glycerin, Panthenol, Phenoxyethanol, Ethylhexylglycerin"
    },
    "0792382405055": {
        "name": "Burt's Bees Cleansing Cream",
        "brand": "Burt's Bees",
        "ingredients": "Aqua, Decyl Glucoside, Cetearyl Alcohol, Glycerin, Stearic Acid, Salix Nigra Bark Extract, Sodium Stearoyl Lactylate, Parfum, Phenoxyethanol"
    }
}

# ─────────────────────────────────────────────
# MULTI-API PRODUCT LOOKUP
# ─────────────────────────────────────────────
def get_product_info(barcode):
    """Try local DB first, then multiple APIs."""
    barcode = barcode.strip()

    # 1. Local database (instant, always works)
    if barcode in PRODUCT_DATABASE:
        print(f"[DB] Found {barcode} in local database")
        return PRODUCT_DATABASE[barcode]

    # 2. UPC Item DB (free tier, works well for cosmetics)
    try:
        url = f"https://api.upcitemdb.com/prod/trial/lookup?upc={barcode}"
        headers = {"Accept": "application/json"}
        resp = requests.get(url, headers=headers, timeout=8)
        if resp.status_code == 200:
            data = resp.json()
            items = data.get("items", [])
            if items:
                item = items[0]
                title = item.get("title", "")
                brand = item.get("brand", "")
                description = item.get("description", "")
                # UPC Item DB rarely has ingredients — use title/description
                print(f"[UPC API] Found: {title}")
                return {
                    "name": title,
                    "brand": brand,
                    "ingredients": description if description else "Please scan the ingredients panel on the product.",
                    "image": item.get("images", [None])[0]
                }
    except Exception as e:
        print(f"[UPC API] Error: {e}")

    # 3. Open Beauty Facts (cosmetics DB)
    try:
        url = f"https://world.openbeautyfacts.org/api/v0/product/{barcode}.json"
        resp = requests.get(url, timeout=8)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("status") == 1:
                product = data.get("product", {})
                ingredients = product.get("ingredients_text") or ""
                if not ingredients.strip():
                    ingredients = "Ingredients not listed in public database. Please scan the ingredients panel."
                print(f"[Beauty API] Found: {product.get('product_name', '')}")
                return {
                    "name": product.get("product_name", "Unknown Product"),
                    "brand": product.get("brands", "Unknown Brand"),
                    "ingredients": ingredients,
                    "image": product.get("image_url")
                }
    except Exception as e:
        print(f"[Beauty API] Error: {e}")

    # 4. Open Food Facts (larger general DB)
    try:
        url = f"https://world.openfoodfacts.org/api/v0/product/{barcode}.json"
        resp = requests.get(url, timeout=8)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("status") == 1:
                product = data.get("product", {})
                name = product.get("product_name", "") or product.get("product_name_en", "")
                if name:
                    print(f"[Food API] Found: {name}")
                    return {
                        "name": name,
                        "brand": product.get("brands", "Unknown Brand"),
                        "ingredients": product.get("ingredients_text", "Ingredients not available."),
                        "image": product.get("image_url")
                    }
    except Exception as e:
        print(f"[Food API] Error: {e}")

    print(f"[Lookup] Barcode {barcode} not found in any database.")
    return None


# ─────────────────────────────────────────────
# OCR HELPERS
# ─────────────────────────────────────────────
INGREDIENT_KEYWORDS = [
    "ingredients", "contains", "inci", "ingrédients", "zutaten",
    "composición", "ingredientes", "zusammensetzung", "aqua", "water"
]

CHEMICAL_HINTS = [
    "-ol", "-one", "-ide", "-ate", "-acid", "extract", "oil",
    "water", "aqua", "sodium", "potassium", "glycol", "glycerin",
    "paraben", "silicone", "ceramide", "hyaluronate", "niacinamide",
    "tocopherol", "panthenol", "retinol", "zinc", "citric"
]

def looks_like_ingredients(text):
    """Returns True only if the OCR text actually resembles an ingredient list."""
    if len(text) < 30:
        return False
    text_lower = text.lower()

    # Must have an ingredient keyword OR at least 3 chemical hints
    has_keyword = any(kw in text_lower for kw in INGREDIENT_KEYWORDS)
    hits = sum(1 for h in CHEMICAL_HINTS if h in text_lower)

    if has_keyword and len(text) > 40:
        return True
    if hits >= 3 and len(text) > 50:
        return True
    # Comma-separated list with enough entries
    if text.count(",") >= 4 and len(text) > 60:
        return True
    return False


def extract_ingredients_from_text(text):
    """Extract the ingredient section from OCR'd text."""
    # Try to isolate after 'ingredients:' keyword
    patterns = [
        r"(?i)(?:ingredients?|inci|contains?|ingrédients)[:\-\s]+(.+)",
        r"(?i)(?:aqua|water)[,\s].+",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.DOTALL)
        if match:
            extracted = match.group(0).strip()
            if len(extracted) > 20:
                return extracted[:1000]

    # If text itself looks like ingredients, return it
    if looks_like_ingredients(text):
        return text.strip()[:1000]

    return None


def extract_barcode_from_text(text):
    """Find 12-14 digit barcode numbers in OCR text."""
    match = re.search(r"\b(\d{12,14})\b", text)
    if match:
        return match.group(1)
    return None


# ─────────────────────────────────────────────
# IMAGE PREPROCESSING
# ─────────────────────────────────────────────
def preprocess_for_barcode(image):
    """Multiple preprocessing versions for reliable barcode detection."""
    resized = cv2.resize(image, (800, 800))
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
    gray_eq = cv2.equalizeHist(gray)
    gray_blur = cv2.GaussianBlur(gray_eq, (3, 3), 0)
    # Return: [color, gray, equalized+blurred], and the high-contrast gray for OCR
    return [resized, gray, gray_blur], gray_blur


# ─────────────────────────────────────────────
# FLASK ROUTES
# ─────────────────────────────────────────────
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "time": time.time()}), 200


@app.route('/api/upload-face', methods=['POST'])
def upload_face():
    data = request.json
    if not data or 'image' not in data:
        return jsonify({"error": "No image data provided"}), 400
    image_data = data['image']
    if ',' in image_data:
        image_data = image_data.split(',')[1]
    try:
        img_bytes = base64.b64decode(image_data)
        clear_folder(SAVE_FOLDER)
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        filename = f"face_{timestamp}.jpg"
        save_path = os.path.join(SAVE_FOLDER, filename)
        train_path = os.path.join(TRAIN_FOLDER, filename)
        with open(save_path, "wb") as f:
            f.write(img_bytes)
        shutil.copy(save_path, train_path)
        return jsonify({"success": True, "filepath": save_path})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/detect-face', methods=['POST'])
def detect_face():
    data = request.json
    if not data or 'image' not in data:
        return jsonify({"error": "No image data"}), 400
    image_data = data['image']
    if ',' in image_data:
        image_data = image_data.split(',')[1]
    try:
        img_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            return jsonify({"error": "Invalid image format"}), 400
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        face_list = [{"x": int(x), "y": int(y), "w": int(w), "h": int(h)} for (x, y, w, h) in faces]
        return jsonify({"faces": face_list, "frame_width": frame.shape[1], "frame_height": frame.shape[0]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/scan-product', methods=['POST'])
def scan_product():
    data = request.json
    if not data or 'image' not in data:
        return jsonify({"error": "No image data"}), 400

    image_data = data['image']
    if ',' in image_data:
        image_data = image_data.split(',')[1]

    try:
        img_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            return jsonify({"error": "Invalid image format"}), 400

        processed_versions, ocr_frame = preprocess_for_barcode(frame)

        # ── STEP 1: Try pyzbar barcode scanning ──
        barcode_number = None
        barcode_type = None
        seen = set()

        for proc in processed_versions:
            for obj in decode(proc):
                raw = obj.data.decode("utf-8").strip()
                if raw not in seen:
                    seen.add(raw)
                    barcode_number = raw
                    barcode_type = obj.type
                    print(f"[pyzbar] Decoded barcode: {raw} ({obj.type})")
                    break
            if barcode_number:
                break

        # ── STEP 2: If pyzbar failed, try OCR to find barcode digits ──
        ocr_text = None
        if not barcode_number:
            print("[OCR] pyzbar failed — running OCR to find barcode digits...")
            text_results = reader.readtext(ocr_frame, detail=0)
            ocr_text = " ".join(text_results)
            print(f"[OCR] Raw text: {ocr_text[:200]}")

            ocr_barcode = extract_barcode_from_text(ocr_text)
            if ocr_barcode:
                barcode_number = ocr_barcode
                barcode_type = "OCR_DIGITS"
                print(f"[OCR] Found barcode digits: {barcode_number}")

        # ── STEP 3: Look up product info from databases ──
        product_info = None
        if barcode_number:
            product_info = get_product_info(barcode_number)

        # ── STEP 4: If DB has no/incomplete ingredients, try OCR on ingredient panel ──
        needs_ingredient_ocr = (
            product_info is None or
            not product_info.get("ingredients") or
            product_info.get("ingredients", "").startswith("Ingredients not") or
            product_info.get("ingredients", "").startswith("Please scan")
        )

        if needs_ingredient_ocr:
            print("[OCR] Running OCR for ingredient text...")
            if ocr_text is None:
                text_results = reader.readtext(ocr_frame, detail=0)
                ocr_text = " ".join(text_results)
                print(f"[OCR] Raw text: {ocr_text[:200]}")

            extracted_ingredients = extract_ingredients_from_text(ocr_text)
            if extracted_ingredients:
                print(f"[OCR] Extracted ingredients: {extracted_ingredients[:100]}...")
                if product_info:
                    product_info["ingredients"] = extracted_ingredients
                else:
                    product_info = {
                        "name": f"Product ({barcode_number})" if barcode_number else "Visual Scan Result",
                        "brand": "AI Analysis",
                        "ingredients": extracted_ingredients
                    }

        # ── STEP 5: Build response ──
        results = []
        if barcode_number and product_info:
            results.append({
                "data": barcode_number,
                "type": barcode_type or "BARCODE",
                "product": product_info
            })
        elif product_info:
            results.append({
                "data": "OCR_DETECTED",
                "type": "TEXT_ANALYSIS",
                "product": product_info
            })

        return jsonify({"success": True, "detected": results})

    except Exception as e:
        print(f"[ERROR] Scanning error: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    print(f"Starting Flask server on port 5000...")
    print(f"Captured Faces directory: {os.path.abspath(SAVE_FOLDER)}")
    print(f"Training Data directory: {os.path.abspath(TRAIN_FOLDER)}")
    app.run(host='0.0.0.0', port=5000, debug=True)
