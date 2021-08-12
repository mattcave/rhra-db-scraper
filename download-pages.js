
const fs = require('fs')
const fetch = require('node-fetch')

const appconfig = require('dotenv').config()

if (appconfig.error) {
    console.log("No config file, using defaults")
}

const dataDir = process.env.dataDir || './data'
const batchSize = Number(process.env.batchSize) || 200
const requestInterval = Number(process.env.requestInterval) || 2000
const requestTimeout = Number(process.env.requestTimeout) || 10000

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
            const path = `./${dataDir}/${id}.html`
            return !fs.existsSync(path)
        })
    })
    .then(filteredIdList => {
        console.log(`Homes still to retrieve: ${filteredIdList.length}`)
        return (filteredIdList)
    })
    .then(filteredIdList => {
        let delay = 0;
        for (let i = 0; i < batchSize && i < filteredIdList.length; i++) {
            // console.log(`Getting ${filteredIdList[i]} with delay ${delay}`)
            setTimeout(getPage, delay, filteredIdList[i])
            delay += requestInterval;
        }
    })
    .catch(err => {
        // console.error(err)
    })

function getPage(id) {
    fetch(`http://www.rhra.ca/en/register/homeid/${id}/`, { timeout: requestTimeout })
        .then(checkStatus)
        .then(res => res.text())
        .then(body => {
            // console.log(id)
            // console.log(body)
            fs.writeFile(`./${dataDir}/${id}.html`, body, err => {
                if (err) {
                    console.error(err)
                    return
                }
            })
            // console.log("File written successfully")
        })
        .catch(err => {
            process.stdout.write("x");
            // console.error (err)
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
            process.stdout.write("x");
            throw new Error(res.statusText)
    }
}