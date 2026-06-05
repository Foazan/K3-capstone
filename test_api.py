import requests

def main():
    base_url = "http://localhost:8090"
    
    # 1. Login
    print("Logging in as admin_k3...")
    resp = requests.post(f"{base_url}/api/auth/login", data={
        "username": "admin_k3",
        "password": "password123" # assuming password123, wait, what is the password?
    })
    
    if resp.status_code != 200:
        print(f"Login failed: {resp.status_code} {resp.text}")
        return
        
    token = resp.json().get("access_token")
    print("Got token!")
    
    # 2. Fetch users
    print("Fetching users...")
    resp2 = requests.get(f"{base_url}/api/users/?page_size=100", headers={
        "Authorization": f"Bearer {token}"
    })
    
    print(f"Status: {resp2.status_code}")
    print(f"Response: {resp2.text}")

if __name__ == "__main__":
    main()
