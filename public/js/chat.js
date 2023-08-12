const socket = io();

//Elements

const $messageForm = document.querySelector("#message-form");
const $messageFormInput = document.querySelector("input");
const $messageFormButton = document.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//Templates
const $messageTemplate = document.querySelector("#message-template").innerHTML;
const $locationTemplate =
  document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

  
///Options
const { username, room } = Qs.parse(location.search , { ignoreQueryPrefix: true})

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      return alert(error);
    }

    console.log("Delivered");
  });
});

const autoScroll = () => {
  //New message element
  const $newMessage = $messages.lastElementChild

  // get height of new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  //visible Height
  const visibleHeight = $messages.offsetHeight
  

  //Height of messages container
  const containerHeight = $messages.scrollHeight

  //how far i have scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight

  if(containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop  = $messages.scrollHeight
  }
}


socket.on("message", (message) => {
  const html = Mustache.render($messageTemplate, {
    username : message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a")
  } );
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll()
});

socket.on("locationMessage", (location) => {
  console.log(location);
  const html = Mustache.render($locationTemplate, {
    username: location.username,
    location: location.url,
    createdAt:  moment(location.createdAt).format("h:mm a") 
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll()
});

socket.on("roomData", ({room, users}) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  })
  document.querySelector("#sidebar").innerHTML = html
})
 

document.querySelector("#send-location").addEventListener("click", () => {
  //disable button when loaction is sent
  $sendLocationButton.setAttribute("disabled", "disabled");

  if (!navigator.geolocation) {
    return alert("geolocation is not suported by your browser");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      (error) => {
        $sendLocationButton.removeAttribute("disabled");
        if (error) {
          return console.log(error);
        }
        console.log(`location sent`);
      }
    );
  });
});

socket.emit("join", {username, room}, (error) => { 
  if(error){ 
    alert(error)
    location.href= "/"
  }
})