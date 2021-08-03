const fs = require('fs')
const converter = require('json-2-csv');
const fetch = require('node-fetch');
const HTMLParser = require('node-html-parser');

fs.readFile('./smol-list.json', 'utf8' , (err, raw) => {
  if (err) {
    console.error(err)
    return
  }
  const data = JSON.parse(raw)

  let details = data.result.entries.map(function(facility){

    let promise = new Promise(function(resolve, reject) {

      console.log(`Requesting ${facility.id}`)
      fetch(`http://www.rhra.ca/en/register/homeid/${facility.id}/`, {timeout: 30000})
      .then(res => {
        if (!res.ok) { // res.status >= 200 && res.status < 300
          console.log(`Got error for ${facility.id}`)
          reject(new Error(res.statusText));
        }
        else {
          console.log(`Got good response for ${facility.id}`)
          const text = res.text()
          .then(text => {
            const docroot = HTMLParser.parse(text);
            let facility = {};

            facility.facilityName = docroot.querySelector('h2.search-detail').text

            facility.licenceStatus = docroot.querySelector('p.licence-status strong').text
            facility.licenceNum = docroot.querySelector('#collapseOnePR > div > div:nth-child(1) > div.col-sm-7').text.trim();
            facility.firstIssueDate = docroot.querySelector('#collapseOnePR > div > div:nth-child(2) > div.col-sm-7').text.trim();
            facility.licenceConditions = docroot.querySelector('#collapseNinePR > div > div > div > p').text.trim();

            facility.licenceeName = docroot.querySelector('#collapseOnePR > div > div:nth-child(6) > div.col-sm-7').text.replace(/[\s]+/g, " ").trim();
            facility.licenceeAddress = docroot.querySelector('#collapseOnePR > div > div:nth-child(7) > div.col-sm-7').text.replace(/[\s]+/g, " ").trim();
            facility.licenceeContact = docroot.querySelector('#collapseOnePR > div > div:nth-child(8) > div.col-sm-7').text.replace(/[\s]+/g, " ").trim();
          
            facility.homeContact = docroot.querySelector('#collapseOnePR > div > div:nth-child(10) > div.col-sm-7').text.replace(/[\s]+/g, " ").trim();
            facility.homePhone = docroot.querySelector('#collapseOnePR > div > div:nth-child(11) > div.col-sm-7').text.replace(/[\s]+/g, " ").trim();
            facility.homeFax = docroot.querySelector('#collapseOnePR > div > div:nth-child(12) > div.col-sm-7').text.replace(/[\s]+/g, " ").trim();
            facility.homeWebsite = docroot.querySelector('#collapseOnePR > div > div:nth-child(13) > div.col-sm-7').text.replace(/[\s]+/g, " ").trim();
            facility.homeEmail = docroot.querySelector('#collapseOnePR > div > div:nth-child(14) > div.col-sm-7').text.replace(/[\s]+/g, " ").trim();
    
            facility.numberOfSuites = docroot.querySelector('#collapseFivePR > div > div:nth-child(2) > div.col-sm-7').text.replace(/[\s]+/g, " ").trim();
            facility.residentCapacity = docroot.querySelector('#collapseFivePR > div > div:nth-child(3) > div.col-sm-7').text.replace(/[\s]+/g, " ").trim();
            facility.hasAutomaticSprinklers = docroot.querySelector('#collapseFivePR > div > div:nth-child(4) > div.col-sm-7').text.replace(/[\s]+/g, " ").trim();

            facility.serviceBathing = docroot.querySelector("#collapseFourPR > div > div > div > ul > li:nth-child(1)").classList.contains("active");
            facility.servicePersonalHygiene = docroot.querySelector("#collapseFourPR > div > div > div > ul > li:nth-child(2)").classList.contains("active");
            facility.serviceAmbulation = docroot.querySelector("#collapseFourPR > div > div > div > ul > li:nth-child(3)").classList.contains("active");
            facility.serviceFeeding = docroot.querySelector("#collapseFourPR > div > div > div > ul > li:nth-child(4)").classList.contains("active");
            facility.serviceSkinAndWoundCare = docroot.querySelector("#collapseFourPR > div > div > div > ul > li:nth-child(5)").classList.contains("active");
            facility.serviceContinenceCare = docroot.querySelector("#collapseFourPR > div > div > div > ul > li:nth-child(6)").classList.contains("active");
            facility.serviceDrugAdministration = docroot.querySelector("#collapseFourPR > div > div > div > ul > li:nth-child(7)").classList.contains("active");
            facility.serviceMealProvisioning = docroot.querySelector("#collapseFourPR > div > div > div > ul > li:nth-child(8)").classList.contains("active");
            facility.serviceDementiaCare = docroot.querySelector("#collapseFourPR > div > div > div > ul > li:nth-child(9)").classList.contains("active");
            facility.serviceDressingAssistance = docroot.querySelector("#collapseFourPR > div > div > div > ul > li:nth-child(10)").classList.contains("active");
            facility.serviceOCP = docroot.querySelector("#collapseFourPR > div > div > div > ul > li:nth-child(11)").classList.contains("active");
            facility.serviceCPSO = docroot.querySelector("#collapseFourPR > div > div > div > ul > li:nth-child(12)").classList.contains("active");
            facility.serviceCNO = docroot.querySelector("#collapseFourPR > div > div > div > ul > li:nth-child(13)").classList.contains("active");
            // let services = docroot.querySelectorAll('#collapseFourPR > div > div > div > ul.careservices_list li')
          
            // services.map(service => {
            //   // console.log(service)
            //   if (service.classList.contains("active")) {
            //     console.log(`${service.text} is available`)
            //   }
            // })

            resolve(facility)
          })
        }
      })
    });
    return promise
  })

  Promise.allSettled(details) 
    .then(results => {

      // Strip errors from result set
      results = results.filter(result => {
        if (result.status != "fulfilled") {
          return false; // skip
        }
        return true;
      })

      // Get just the data, not the status
      results = results.map(result => {
          return result.value
      })


      console.log(results)
      saveResults(results)
      // console.log(csvResults)



    })
  })


  function saveResults(results) {
    // Write out resultant data
    converter.json2csv(results, (err, csv) => {
      if (err) {
          throw err;
      } else {
        fs.writeFile('./out.csv', csv, err => {
          if (err) {
            console.error(err)
            return
          }
          console.log("File written successfully")
        })
      }
    });  
  }
  