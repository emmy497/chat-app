function generateMessages  (message, username)  {
    return {
        username,
        text: message,
        createdAt: new Date().getTime()
    }
}

function locationMessage (latitude, longitude, username) {
    return {
        username,
        url: `https://google.com/maps?q=${latitude},${longitude}`,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessages,
    locationMessage
}