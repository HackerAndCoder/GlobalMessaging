from flask import Flask, request
import json, random, os

app = Flask(__name__)

message_q = []

message_id = 0

def get_users_key(username):
    try:
        with open('users.json') as f:
            contents = json.loads(f.read())
            users = contents["users"]
            if username in users.keys():
                return users[username]
            
            return ""
    except:
        print(f"[ERROR] Error retrieving key for user {username}!")
        return ""
        
def set_user_key(username, key):
    with open("users.json") as f:
        contents = json.loads(f.read())
        
    with open("users.json", "w") as f:
        contents["users"][username] = key
        f.write(json.dumps(contents))

online_users = {}

@app.route("/login", methods = ["POST"])
def handle_login():
    d = json.loads(request.get_data())
    
    name = d["name"]
    key = d["key"]
    
    if get_users_key(name) == key:
        return json.dumps(
            {
                "completed": True
            }
        )
    
    if get_users_key(name) == "":
        set_user_key(name, key)
        return json.dumps(
            {
                "completed": True
            }
        )
    
    print(f"{d}")
    return json.dumps(
        {
            "completed": False,
            "error": "Wrong Key!"
        }
    )

@app.route('/')
def home():
    with open('home.html') as f:
        return f.read()
        
@app.route("/signin.html")
def signin():
    with open("signin.html") as f:
        return f.read()
        
@app.route('/home.js')
def js():
    with open("home.js") as f:
        return f.read()

@app.route('/send/message', methods = ["POST"])
def message():
    global message_id, message_q
    d = json.loads(request.get_data())
    
    if (d["name"] in online_users.keys()):
        online_users[d["name"]] += 1
    else:
        online_users[d["name"]] = 1
        
    n = online_users[d["name"]]
    
    message_q.append([message_id, d["name"], d["message"]])
    message_id += 1
    print(f"{d['name']} send the message: {d['message']}")
    
    for message in message_q:
        if (message[0] + 20) < message_id:
            message_q.remove(message)
        
    #print(message_q)
    
    return ""
    
@app.route("/get/messages", methods = ["POST"])
def return_messages():
    m = {}
    
    for message in message_q:
        m[message[0]] = {
            "id": message[0],
            "sender": message[1],
            "contents": message[2]
        }
        
    return json.dumps({"messages": m})


if ('test.txt' in os.listdir()):
    print(f"Running in dev mode")
    app.run(port = random.randint(5000, 5999), host="")
    
else:
    print(f"Running in prod mode")
    app.run(port=5555, host="0.0.0.0")
    