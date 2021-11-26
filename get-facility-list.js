
const fs = require('fs')
const fetch = require('node-fetch')

const appconfig = require('dotenv').config()

if (appconfig.error) {
    console.log("No config file, using defaults")
}

const requestTimeout = Number(process.env.requestTimeout) || 10000
const listFile = process.env.listFile || './list.json'


const fileDate = getFileModifiedTime(listFile)

if (isToday(fileDate)) {
    console.log("Facility list is up to date")
} else {
    console.log(`Grabbing fresh ${listFile}`)
    fetchList('https://www.rhra.ca/wp-admin/admin-ajax.php?action=public_register&language=en')
}

function getFileModifiedTime(filename) {
    let timestamp;
    try {
        timestamp = fs.statSync(filename).mtime
    }
    catch(err) {
        console.log(`${filename} does not exist`)
        timestamp = new Date(0);
    }
    return timestamp;
    return Date.parse(timestamp);
}


function isToday(someDate) {
    const today = new Date()
    return someDate.getDate() == today.getDate() &&
      someDate.getMonth() == today.getMonth() &&
      someDate.getFullYear() == today.getFullYear()
}

function fetchList(url) {
    fetch(url, { timeout: requestTimeout })
        .then(checkStatus)
        .then(res => res.text())
        .then(body => {
            fs.writeFile(listFile, body, err => {
                if (err) {
                    console.error(err)
                    return
                }
            })
            console.log("List written successfully")
        })
        .catch(err => {
            console.error (err)
            console.log(`Couldn't get list`)
        })
}

function checkStatus(res, showProgress) {
    switch (true) {
        case (res.status >= 200 && res.status < 300):
            if (showProgress) process.stdout.write(".");
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