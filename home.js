var counter = 0;

var messages = new Array();

var rids = {};

function messageRequest() {
  fetch("/get/messages", {
    method: "POST",
    body: JSON.stringify({
      "name": getCookie("name")
    })
  }).then((response) => response.json()).then((json) => parseNewMessages(json));
}

function parseNewMessages(json) {
  for (let i = 0; i < 40; i++) {
    var message = json.messages[i]
    if (message != null) {
      if (!isInRecieved(message.id)) {
        messages.push(message.id);
        
        var from_self = message.sender == getCookie("name")
        
        addMessage(message.sender + " > " + message.contents, from_self);
        console.log(message);
      }
    }
  }
}

function addMessage(content, from_self) {
  var message = document.createElement("p");
  message.className = "message";
  message.innerText = content;
  message.style.color = "white";
  
  message.style.padding = "10px";
  message.style.borderRadius = "5px";
  
  if (from_self) {
    //message.style.backgroundColor = "lightgray";
  }
  
  var spacer = 0;
  
  for (var a = 0; a < document.body.children.length; a++) {
    if (document.body.children[a].id == "spacer") {
      spacer = a;
    }
  }
  
  document.body.insertBefore(message, document.getElementById("end"));
  message.scrollIntoView({behavior: "instant"});
}

function isInRecieved(text) {
  for (let v = 0; v < messages.length; v++) {
    if (messages[v] == text) {
      return true;
    }
  }
  return false;
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

if (getCookie("name") == "") {
  document.getElementById("username").innerText = "younosignin";
} else {
  document.getElementById("username").innerText = getCookie("name");
}

document.getElementById('messagebox').onkeypress = function(e){
    if (!e) e = window.event;
    var keyCode = e.code || e.key;
    if (keyCode == 'Enter'){
      send();
    }
  }

window.setInterval(messageRequest, 2000);

function send() {
  if (getCookie("name") == "") {
    window.location.replace("/signin.html")
    return;
  }
  
  var t = document.getElementById("messagebox").value;
  
  if (t == "" || t == " ") {
    return;
  }
  
  document.getElementById("messagebox").value = "";
  fetch("/send/message", {
    method: "POST",
    body: JSON.stringify({
      "name": getCookie("name"),
      "message": t
    })
  });
}