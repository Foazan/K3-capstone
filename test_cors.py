import requests

def main():
    base_url = "http://localhost:8090"
    print("Testing GET OPTIONS...")
    resp = requests.options(f"{base_url}/api/users?page_size=100", headers={
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "Authorization"
    })
    print("GET OPTIONS STATUS:", resp.status_code)
    print("GET OPTIONS HEADERS:", resp.headers)
    
    print("\nTesting DELETE OPTIONS...")
    resp2 = requests.options(f"{base_url}/api/users/1", headers={
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "DELETE",
        "Access-Control-Request-Headers": "Authorization"
    })
    print("DELETE OPTIONS STATUS:", resp2.status_code)
    print("DELETE OPTIONS HEADERS:", resp2.headers)

if __name__ == "__main__":
    main()
