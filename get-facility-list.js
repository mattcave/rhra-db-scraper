
const fs = require('fs')
const fetch = require('node-fetch')

const appconfig = require('dotenv').config()

if (appconfig.error) {
    console.log("No config file, using defaults")
}

const requestTimeout = Number(process.env.requestTimeout) || 10000
const listFile = process.env.listFile || './list.json'





try {
    if (fs.existsSync(listFile)) {
        //file exists
        const fileDate = getFileModifiedTime(listFile)
        if (isToday(fileDate)) {
            console.log("Facility list is up to date")
        } else {
            console.log("Facility list is old, let\'s fetch a new one")
            fetchList('https://www.rhra.ca/wp-admin/admin-ajax.php?action=public_register&language=en')
        }
    } else {
        console.log('No existing Facility list exists, let\'s fetch one')
        fetchList('https://www.rhra.ca/wp-admin/admin-ajax.php?action=public_register&language=en')
    }
} catch(err) {
    console.log('Error accessing existing Facility file, let\'s try to fetch a new one')
    fetchList('https://www.rhra.ca/wp-admin/admin-ajax.php?action=public_register&language=en')
}




function getFileModifiedTime(filename) {
    let timestamp;
    try {
        timestamp = fs.statSync(filename).mtime
    }
    catch(err) {
        // console.log(`${filename} does not exist`)
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
            console.log("Facility list written successfully")
        })
        .catch(err => {
            console.error (err)
            console.log(`Couldn't get Facility list`)
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