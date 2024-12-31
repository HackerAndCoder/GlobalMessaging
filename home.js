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
    var m = json.messages[i]
    if (m != null) {
      if (!isInRecieved(m)) {
        messages.push(m);
        addMessage(m);
        console.log(m);
      }
    }
  }
}

function addMessage(content) {
  var message = document.createElement("p");
  message.innerText = content;
  document.body.insertBefore(message, document.body.children[3]);
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

window.setInterval(messageRequest, 2000);

function send() {
  if (getCookie("name") == "") {
    window.location.replace("/signin.html")
    return;
  }
  
  var t = document.getElementById("messagebox").value;
  document.getElementById("messagebox").value = "";
  fetch("/send/message", {
    method: "POST",
    body: JSON.stringify({
      "name": getCookie("name"),
      "message": t
    })
  });
}