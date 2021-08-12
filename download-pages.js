
const fs = require('fs')
const fetch = require('node-fetch');

let readFileAsync = function (filename) {
    return new Promise(function (resolve, reject) {
        fs.readFile(filename, (err, data) => {
            if (err) reject(err);
            resolve(data)
        })
    })
}


console.log(`Reading list of homes from list.json`)
readFileAsync('./list.json', 'UTF-8')
    .then(content => {
        return (JSON.parse(content).result.entries)
    })
    .catch(err => {
        // console.log("No list.json found - downloading a fresh copy")
        throw new Error(`Cannot open file = ${err.message}`)
    })
    .then(data => {
        // console.log(data)
        return data.map((item) => {
            return (item.id)
        })
    })
    .then(idList => {
        // console.log(data)
        console.log(`Total homes in database: ${idList.length}`)
        return idList.filter(id => {
            const path = `./pages/${id}.html`
            return !fs.existsSync(path)
        })
    })
    .then(filteredIdList => {
        console.log(`Homes still to retrieve: ${filteredIdList.length}`)
        return (filteredIdList)
    })
    .then(filteredIdList => {
        let delay = 0;
        for (let i = 0; i < 200 && i < filteredIdList.length; i++) {
            const delayIncrement = 2000;
            // console.log(`Getting ${filteredIdList[i]} with delay ${delay}`)
            setTimeout(getPage, delay, filteredIdList[i])
            delay += delayIncrement;
        }
    })
    .catch(err => {
        console.error(err)
    })

function getPage(id) {
    fetch(`http://www.rhra.ca/en/register/homeid/${id}/`, { timeout: 10000 })
        .then(checkStatus)
        .then(res => res.text())
        .then(body => {
            process.stdout.write(".");
            // console.log(id)
            // console.log(body)
            fs.writeFile(`./pages/${id}.html`, body, err => {
                if (err) {
                    console.error(err)
                    return
                }
            })
            // console.log("File written successfully")
        })
        .catch(err => {
            console.err (err)
            // console.log(`Couldn't get page`)
        })
}

function checkStatus(res) {
    switch (true) {
        case (res.status >= 200 && res.status < 300):
            process.stdout.write(".");
            return res
        case (res.status >= 400 && res.status < 500):
            process.stdout.write("4");
            throw new Error(res.statusText)
        case (err.status >= 500 && err.status < 600):
            process.stdout.write("5");
            throw new Error(res.statusText)
        default:
            process.stdout.write("X");
            throw new Error(res.statusText)
    }
}