import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://integrate.api.nvidia.com/v1/chat/completions"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer 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"
}

models = [
    "meta/llama-3.3-70b-instruct",
    "nvidia/llama-3.1-nemotron-70b-instruct",
    "meta/llama-3.1-70b-instruct",
    "meta/llama-3.1-8b-instruct"
]

for model in models:
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": "Say hello in one word"}],
        "max_tokens": 10
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
            res_body = response.read().decode('utf-8')
            print(f"SUCCESS for {model}: status={response.status}, body={res_body[:100]}")
    except Exception as e:
        print(f"ERROR for {model}: {e}")
        if hasattr(e, 'read'):
            print("DETAILS:", e.read().decode('utf-8'))
