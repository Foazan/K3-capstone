import requests

def main():
    base_url = "http://localhost:8090"
    
    # 1. Login
    print("Logging in as admin_k3...")
    resp = requests.post(f"{base_url}/api/auth/login", data={
        "username": "admin_k3",
        "password": "password123"
    })
    
    if resp.status_code != 200:
        print(f"Login failed: {resp.status_code} {resp.text}")
        return
        
    token = resp.json().get("access_token")
    print("Got token!")
    
    # 2. Fetch users
    print("Fetching users...")
    resp2 = requests.get(f"{base_url}/api/users?page_size=100", headers={
        "Authorization": f"Bearer {token}"
    })
    
    print(f"Fetch Status: {resp2.status_code}")
    print(f"Fetch Response: {resp2.text}")
    
    # 3. Create user
    print("Creating user test2...")
    resp3 = requests.post(f"{base_url}/api/users", headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }, json={
        "username": "test2",
        "email": "test2@example.com",
        "password": "password123",
        "role": "manager"
    })
    
    print(f"Create Status: {resp3.status_code}")
    print(f"Create Response: {resp3.text}")
    
    # 4. Delete user test2
    if resp3.status_code == 201:
        uid = resp3.json().get("id")
        print(f"Deleting user {uid}...")
        resp4 = requests.delete(f"{base_url}/api/users/{uid}", headers={
            "Authorization": f"Bearer {token}"
        })
        print(f"Delete Status: {resp4.status_code}")

if __name__ == "__main__":
    main()
