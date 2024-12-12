import requests
import json
import time
from datetime import datetime

def get_transactions(address):
    # API endpoint
    base_url = "https://explorer.burnt.com/api/v1/xion-mainnet-1"
    endpoint = f"{base_url}/txs"
    
    headers = {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json'
    }
    
    params = {
        'address': address,
        'limit': 100,
        'offset': 0
    }

    max_retries = 3
    retry_delay = 2

    for attempt in range(max_retries):
        try:
            print(f"Fetching transactions for address: {address}")
            response = requests.get(endpoint, params=params, headers=headers)
            
            print(f"Response Status Code: {response.status_code}")
            print(f"Response URL: {response.url}")

            if response.status_code == 200:
                try:
                    data = response.json()
                    if data:
                        # Save to file
                        filename = f"transactions_{address}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                        with open(filename, 'w') as f:
                            json.dump(data, f, indent=2)
                        print(f"\nData saved to {filename}")
                        return data
                    else:
                        print("Empty response received")
                except json.JSONDecodeError as e:
                    print(f"Error parsing JSON: {e}")
                    print(f"Response content: {response.text[:500]}...")
            else:
                print(f"Error response: {response.status_code}")
                
            if attempt < max_retries - 1:
                print(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
                
        except requests.exceptions.RequestException as e:
            print(f"Request error: {e}")
            if attempt < max_retries - 1:
                print(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)

    return None

def main():
    address = "xion1mn0zf2rqvs5m2pw83uzmvnndy3fw5gakxlr08l"
    data = get_transactions(address)
    
    if not data:
        print("No data was retrieved")

if __name__ == "__main__":
    main()