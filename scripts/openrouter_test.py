import os
import json
import requests

def test_openrouter():
    api_key = os.environ.get("OPENROUTER_API_KEY", "<OPENROUTER_API_KEY>")
    site_url = os.environ.get("SITE_URL", "https://edworld.co")
    site_name = os.environ.get("SITE_NAME", "Edworld Co")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": site_url,
        "X-OpenRouter-Title": site_name,
        "Content-Type": "application/json"
    }

    payload = {
        "model": "openai/gpt-4o-mini",
        "messages": [
            {
                "role": "user",
                "content": "What is the meaning of life?"
            }
        ]
    }

    print(f"Sending request to OpenRouter API (model: {payload['model']})...")
    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            data=json.dumps(payload),
            timeout=30
        )
        print(f"Status Code: {response.status_code}")
        print("Response Body:")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_openrouter()
