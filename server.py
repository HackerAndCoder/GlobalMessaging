from flask import Flask, request
import json, random, os

app = Flask(__name__)

message_q = []

message_id = 0

online_users = {}

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
    