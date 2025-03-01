from flask import Blueprint, request, jsonify
from .ocr import extract_ingredients
from .gpt import analyze_ingredients

main = Blueprint('main', __name__)

@main.route('/upload', methods=['POST'])
def upload():
    try:
        files = request.files.getlist('productImage')
        age_bracket = request.form['ageBracket']
        disease = request.form['disease']
        dummy_option = request.form['dummyOption']
        
        if not files:
            return jsonify({'error': 'No files uploaded'}), 400
        
        ingredients = []

        for file in files:
            text = extract_ingredients(file.stream)
            ingredients.extend(text.split('\n'))
        
        ingredients = [ingredient.strip() for ingredient in ingredients if ingredient.strip()]
        analysis = analyze_ingredients(ingredients, age_bracket, disease, dummy_option)
        
        response = {
            'age_bracket': age_bracket,
            'disease': disease,
            'dummy_option': dummy_option,
            'ingredients': ingredients,
            'analysis': analysis,
            'message': 'Ingredients analyzed successfully'
        }

        return jsonify(response)

    except Exception as e:
        print(f"Error: {e}")  # Log the error message
        return jsonify({'error': str(e)}), 500
