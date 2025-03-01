from google import genai

# Google Gemini API key
API_KEY = 'AIzaSyBpJRu2HI1MXcpx5ORIcrErnaWFFTb9p6k'

client = genai.Client(api_key=API_KEY)

def analyze_ingredients(ingredients, age_bracket, disease, dummy_option):
    prompt = f"Analyze the following ingredients for a toddler in the age bracket {age_bracket}. Consider the following chronic or acute diseases: {disease}. Also, take into account the following information: {dummy_option}. Provide a detailed report on their suitability and suggest alternatives for any unsuitable ingredients:\n\n" + "\n".join(ingredients)
    
    response = client.models.generate_content(
        model="gemini-2.0-flash", 
        contents=prompt
    )
    
    analysis = response.text.strip()
    
    formatted_analysis = analysis.replace('\n', '<br/>').replace('**', '<strong>').replace('**', '</strong>')
    
    return formatted_analysis
