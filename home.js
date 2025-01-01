var counter = 0;

var messages = new Array();

var rids = {};

var parsed_messages = false;

function messageRequest() {
  fetch("/get/messages", {
    method: "POST",
    body: JSON.stringify({
      "name": getCookie("name")
    })
  }).then((response) => response.json()).then((json) => parseNewMessages(json));
}

function parseNewMessages(json) {
  for (let i = 0; i < 600; i++) {
    var message = json.messages[i]
    if (message != null) {
      if (!isInRecieved(message.id)) {
        messages.push(message.id);
        
        var from_self = message.sender == getCookie("name")
        
        addMessage(message.sender, message.contents, from_self, message.id);
        console.log(message);
      }
    }
  }
}

function addMessage(sender, content, from_self, id) {
  var container = document.createElement("div");
  container.classList = "message";
  
  var message = document.createElement("p");
  message.classList = "message-content";
  if (from_self) {
    message.classList = "message-content self";
  }
  
  var username = document.createElement("div");
  username.classList = "username"
  username.innerText = sender;

  message.innerText = sender + ": " + content;
  container.append(message);
  
  container.id = id;
  
  message.addEventListener("click", (event) => {
    if (message.classList.contains("clicked")) {
      message.classList.remove("clicked");
      return;
    }
    message.classList.add("clicked");
  })
  
  if (parsed_messages == false) {
    container.id = "first";
  }
  
  document.body.insertBefore(container, document.getElementById("spacer"));
  container.scrollIntoView({behavior: "instant"});
  
  parsed_messages = true;
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

if (getCookie("name") == "" || getCookie("key") == "") {
  window.location.replace("/signin.html");
  //document.getElementById("username").innerText = "younosignin";
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

window.setInterval(messageRequest, 750);

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

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function signout() {
  setCookie("name", "", 3);
  setCookie("key", "", 3);
  window.location.replace("/signin.html");
}