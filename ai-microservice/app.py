from flask import Flask, request, jsonify
from openai import OpenAI
import os
import json
import requests
import re

app = Flask(__name__)

# It's recommended to set the API key as an environment variable
# for security reasons.
# You can set it in your terminal like this:
# export OPENAI_API_KEY='your-api-key'
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.route('/generate', methods=['POST'])
def generate_test_cases():
    data = request.get_json()
    print("Received data:", data)  # Log incoming data
    api_details = data.get('api_details')
    num_test_cases = api_details.get('numTestCases', 5)
    url = api_details.get('url')
    description = api_details.get('description', '')

    if not api_details or not url:
        return jsonify({"error": "api_details or url not provided"}), 400

    try:
        # Fetch a sample response from the provided API
        sample_response = None
        try:
            res = requests.get(url)
            sample_response = res.json()
        except Exception as e:
            print(f"Could not fetch sample response from {url}: {e}")

        # Truncate the sample response if it's too large
        sample_response_str = json.dumps(sample_response, indent=2)
        if len(sample_response_str) > 4000:
            sample_response_str = sample_response_str[:4000] + "\n... (truncated)"

        prompt = f"""
        Generate a list of {num_test_cases} diverse test cases (positive, negative, and edge cases) for the following API endpoint: {url}.
        The API is for: {description}.
        Here is a sample response from the API: {sample_response_str}
        Provide the output as a JSON array of objects, where each object has 'description', 'method', 'url', 'body', and 'expectedStatus' fields.
        API Details: {api_details}
        """
        print("OpenAI Prompt:", prompt) # Log the prompt being sent

        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that generates test cases for APIs."},
                {"role": "user", "content": prompt}
            ]
        )
        
        test_cases_str = completion.choices[0].message.content
        print("OpenAI Response:", test_cases_str) # Log the response

        # Use regex to robustly extract the JSON part of the response
        json_match = re.search(r"```json\s*([\s\S]*?)\s*```", test_cases_str)
        if json_match:
            json_str = json_match.group(1)
        else:
            # Fallback for cases where the markdown is missing, assuming the whole string is JSON
            json_str = test_cases_str

        test_cases = json.loads(json_str)

        return jsonify(test_cases)

    except Exception as e:
        print("Error:", e) # Log any exceptions
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)