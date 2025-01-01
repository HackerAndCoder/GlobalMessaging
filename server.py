from flask import Flask, Response, request
import json, random, os

app = Flask(__name__)

print(f"Loading users from users.json...")
if ("users.json" not in os.listdir()):
    with open("users.json", "w") as f: f.write('{"users": {}}')
print(f"Loaded users...")

message_q = []

message_id = 0

print(f"Loading messages...")
if ("messages.json" not in os.listdir()):
    print("No messages file found, creating...")
    with open("messages.json", 'w') as f: f.write(json.dumps({"id": message_id, "messages": message_q}))

with open("messages.json") as f:
    content = json.loads(f.read())
    message_q = content["messages"]
    message_id = int(content["id"])

print(f"Loaded {len(message_q)} messages...")

def get_users_key(username):
    username = username.lower()
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
    username = username.lower()
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
    name = name.lower()
    key = d["key"]
    
    if get_users_key(name) == key:
        print(f"User {name} logged in")
        return json.dumps(
            {
                "completed": True
            }
        )
    
    if get_users_key(name) == "":
        set_user_key(name, key)
        print(f"User {name} signed up")
        return json.dumps(
            {
                "completed": True
            }
        )
    
    #print(f"{d}")
    print(f"User {name} tried logging in with the wrong key")
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
        
@app.route('/style.css')
def return_style():
    with open('style.css') as f:
        return Response(f.read(), content_type='text/css')

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


try:
    if ('.dev' in os.listdir()):
        print(f"Running in dev mode")
        app.run(port = random.randint(5000, 5999), host="")
        
    else:
        print(f"Running in prod mode")
        app.run(port=5555, host="0.0.0.0")

finally:
    print()
    print(f"Saving {len(message_q)} messages...")
    with open('messages.json', 'w') as f:
        f.write(
            json.dumps(
                {
                    "id":message_id,
                    "messages": message_q
                }
            )
        )
    print(f"Exiting...")