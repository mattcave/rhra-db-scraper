const fetch = require('node-fetch');

let facility = { id: "6107de65b64a8" }

console.log(`Requesting http://www.rhra.ca/en/register/homeid/${facility.id}/`)
fetch(`http://www.rhra.ca/en/register/homeid/${facility.id}/`)
.then(res => {
    console.log("Received a response")
    if (!res.ok) { // res.status >= 200 && res.status < 300
        console.log("Was an error")
        return(new Error(res.statusText));
    }
    else {
        console.log("Was good")
        return(res.text)
    }
})
.catch(error => {
    console.log(`Whoops! ${error}`)
})
