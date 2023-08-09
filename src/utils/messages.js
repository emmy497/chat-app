function generateMessages  (message)  {
    return {
        text: message,
        createdAt: new Date().getTime()
    }
}

function locationMessage (latitude, longitude) {
    return {
        url: `https://google.com/maps?q=${latitude},${longitude}`,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessages,
    locationMessage
}