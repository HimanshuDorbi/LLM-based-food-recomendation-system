# optical character recognition

import pytesseract
from PIL import Image

# Set the Tesseract executable path
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def extract_ingredients(image_stream):
    image = Image.open(image_stream)
    text = pytesseract.image_to_string(image)
    return text
