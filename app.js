const fs = require('fs')
const converter = require('json-2-csv');
const fetch = require('node-fetch');

fs.readFile('./smol-list.json', 'utf8' , (err, raw) => {
  if (err) {
    console.error(err)
    return
  }
  const data = JSON.parse(raw)

  let details = data.result.entries.map(function(facility){

    let promise = new Promise(function(resolve, reject) {

      console.log(`Requesting ${facility.id}`)
      fetch(`http://www.rhra.ca/en/register/homeid/${facility.id}/`)
      .then(res => {
        console.log("Received a response")
        if (!res.ok) { // res.status >= 200 && res.status < 300
          console.log("Was an error")
          reject(new Error(res.statusText));
        }
        else {
          console.log("Was good")
          resolve(res.text)
        }
      })

      // executor (the producing code, "singer")
    });
    return promise
  })

  Promise.all(details) 
    .then(results => {
      console.log("All done");
    })
  })
  // console.log(details)


  // Write out resultant data
  // converter.json2csv(data.result.entries, (err, csv) => {
  //   if (err) {
  //       throw err;
  //   }

  //   // print CSV string
  //   console.log(csv);
  // });
