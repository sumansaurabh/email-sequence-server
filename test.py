import requests
import json

url = "localhost:11000/api/users/register"



def get_auth_token():
    url = "localhost:11000/api/users/login"
    
    payload = json.dumps({
    "email": "ss.sumansaurabh92@gmail.com",
    "password": "helloworld"
    })
    headers = {
    'Content-Type': 'application/json'
    }

    response = requests.request("POST", url, headers=headers, data=payload)

    return response.json()['access_token']

auth_token = get_auth_token()

def add_outreach():
    url = "localhost:11000/api/users/register"
