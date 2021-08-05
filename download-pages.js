
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


readFileAsync('./list.json', 'UTF-8')
    .then(content => {
        return (JSON.parse(content).result.entries)
    })
    .catch(err => {
        throw new Error(`Cannot open file = ${err}`)
    })
    .then(data => {
        // console.log(data)
        return data.map((item) => {
            return(item.id)
        })
    })
    .then(data => {
        // console.log(data)
        return data.filter(id => {
            const path = `./pages/${id}.html`
            return !fs.existsSync(path)
        })

    })
    .then(filteredIdList => {
        console.log(`Files to get: ${filteredIdList.length}`)
        return(filteredIdList)
    })
    .then(filteredIdList => {
        let delay = 0;
        for (let i = 0; i < 200 && i < filteredIdList.length; i++) { 
            const delayIncrement = 2000;
            // console.log(`Getting ${filteredIdList[i]} with delay ${delay}`)
            setTimeout(getPage, delay, filteredIdList[i])
            delay += delayIncrement;            
        }
        // let promises = [];
        // const delayIncrement = 1000;
        // let delay = 0;

        // filteredIdList.forEach(id => {
        //     console.log(`Requesting ${id}`)
        //     promises.push(new Promise(resolve => setTimeout(resolve, delay)).then(() =>  
        //             fetch(`http://www.rhra.ca/en/register/homeid/${id.id}/`, { timeout: 10000})
        //         )
        //     );
        //     // promises.push(fetch(`http://www.rhra.ca/en/register/homeid/${id.id}/`))
        //     delay += delayIncrement;

        // });
        // // return promise that is resolved when all images are done loading
        // return Promise.allSettled(promises);

    })


function checkStatus(res) {
    if (res.ok) { // res.status >= 200 && res.status < 300
        return res;
    } else {
        throw new Error(res.statusText);
    }
}
    
// getPage("610a816818960")

function getPage(id) {
    fetch(`http://www.rhra.ca/en/register/homeid/${id}/`, { timeout: 10000})
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
        process.stdout.write("x");
        // console.log(`Couldn't get page`)
        // console.log(err)
    })


}