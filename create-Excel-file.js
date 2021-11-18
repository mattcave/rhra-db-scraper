const fs = require('fs')
const HTMLParser = require('node-html-parser');
const converter = require('json-2-csv');

const appconfig = require('dotenv').config()

if (appconfig.error) {
    console.log("No config file, using defaults")
}

const dataDir = process.env.dataDir || './data'
const csvFile = process.env.csvFile || './out.csv'

let promises = []

fs.readdir(dataDir, (err, files) => {    
    if (err)
        throw err;

    files.forEach(filename => {
        // Skip non-HTML files
        if (!/.html$/.test(filename)) {
            console.log(`Skipping ${filename}`)
            return
        }
        const promise = new Promise(resolve => {

            fs.readFile(dataDir + "/" + filename, { encoding: 'UTF-8' }, (err, doc) => {
                if (err) throw err;
                const docroot = HTMLParser.parse(doc);
    
                let facility = {};
                
                facility['Facility Name'] = docroot.querySelector('h2.search-detail').text
                facility['Licence Status'] = docroot.querySelector('p.licence-status strong').text
    
                if (docroot.querySelector('p.licence-status strong').text.startsWith("Issued")) {
                    facility['Home Address'] = 
                        docroot.querySelector('h2.search-detail').nextElementSibling.text.replace(/[\s]+/g, " ").trim()
                        + " " +
                        docroot.querySelector('h2.search-detail').nextElementSibling.nextElementSibling.text.replace(/[\s]+/g, " ").trim()       
                    facility['Home Contact'] = docroot.querySelector('#collapseOnePR > div > div:nth-child(10) > div.col-sm-7').text.replace(/[\s]+/g, " ").trim();
                    facility['Home Phone'] = docroot.querySelector('#collapseOnePR > div > div:nth-child(11) > div.col-sm-7').text.replace(/[\s]+/g, " ").trim();
                    facility['Home Fax'] = docroot.querySelector('#collapseOnePR > div > div:nth-child(12) > div.col-sm-7').text.replace(/[\s]+/g, " ").trim();
                    facility['Home Website'] = docroot.querySelector('#collapseOnePR > div > div:nth-child(13) > div.col-sm-7').text.replace(/[\s]+/g, " ").trim();
                    facility['Home Email'] = docroot.querySelector('#collapseOnePR > div > div:nth-child(14) > div.col-sm-7').text.replace(/[\s]+/g, " ").trim();
                    
                    facility['Licence Num'] = docroot.querySelector('#collapseOnePR > div > div:nth-child(1) > div.col-sm-7').text.trim();
                    facility['First Issue Date'] = docroot.querySelector('#collapseOnePR > div > div:nth-child(2) > div.col-sm-7').text.trim();
                    // facility['Licence Conditions'] = docroot.querySelector('#collapseNinePR > div > div > div > p').text.trim();
                    facility['Licencee Name'] = docroot.querySelector('#collapseOnePR > div > div:nth-child(6) > div.col-sm-7').text.replace(/[\s]+/g, " ").trim();
                    facility['Licencee Address'] = docroot.querySelector('#collapseOnePR > div > div:nth-child(7) > div.col-sm-7').text.replace(/[\s]+/g, " ").trim();
                    facility['Licencee Contact'] = docroot.querySelector('#collapseOnePR > div > div:nth-child(8) > div.col-sm-7').text.replace(/[\s]+/g, " ").trim();

                    facility['Number of Suites'] = docroot.querySelector('#collapseFivePR > div > div:nth-child(2) > div.col-sm-7').text.replace(/[\s]+/g, " ").trim();
                    facility['Resident Capacity'] = docroot.querySelector('#collapseFivePR > div > div:nth-child(3) > div.col-sm-7').text.replace(/[\s]+/g, " ").trim();
                    facility['Has Automatic Sprinklers'] = docroot.querySelector('#collapseFivePR > div > div:nth-child(4) > div.col-sm-7').text.replace(/[\s]+/g, " ").trim();
    
                    facility['Service - Bathing'] = docroot.querySelector("#collapseFourPR > div > div > div > ul > li:nth-child(1)").classList.contains("active");
                    facility['Service - Personal Hygiene'] = docroot.querySelector("#collapseFourPR > div > div > div > ul > li:nth-child(2)").classList.contains("active");
                    facility['Service - Ambulation'] = docroot.querySelector("#collapseFourPR > div > div > div > ul > li:nth-child(3)").classList.contains("active");
                    facility['Service - Feeding'] = docroot.querySelector("#collapseFourPR > div > div > div > ul > li:nth-child(4)").classList.contains("active");
                    facility['Service - Skin & Wound Care'] = docroot.querySelector("#collapseFourPR > div > div > div > ul > li:nth-child(5)").classList.contains("active");
                    facility['Service - Continence Care'] = docroot.querySelector("#collapseFourPR > div > div > div > ul > li:nth-child(6)").classList.contains("active");
                    facility['Service - Drug Administration'] = docroot.querySelector("#collapseFourPR > div > div > div > ul > li:nth-child(7)").classList.contains("active");
                    facility['Service - Meal Provisioning'] = docroot.querySelector("#collapseFourPR > div > div > div > ul > li:nth-child(8)").classList.contains("active");
                    facility['Service - Dementia Care'] = docroot.querySelector("#collapseFourPR > div > div > div > ul > li:nth-child(9)").classList.contains("active");
                    facility['Service - Dressing Assistance'] = docroot.querySelector("#collapseFourPR > div > div > div > ul > li:nth-child(10)").classList.contains("active");
                    facility['Service - OCP'] = docroot.querySelector("#collapseFourPR > div > div > div > ul > li:nth-child(11)").classList.contains("active");
                    facility['Service - CPSO'] = docroot.querySelector("#collapseFourPR > div > div > div > ul > li:nth-child(12)").classList.contains("active");
                    facility['Service - CNO'] = docroot.querySelector("#collapseFourPR > div > div > div > ul > li:nth-child(13)").classList.contains("active");
                }
                resolve(facility)
            });
    
        })
        promises.push(promise)

    });

    Promise.all(promises)
    .then(jsondata => {
        converter.json2csv(jsondata, (err, csv) => {
            if (err) {
                throw err;
            } else {
                fs.writeFile(csvFile, csv, err => {
                if (err) {
                    console.error(err)
                    return
                }
                console.log(`CSV file written to ${csvFile}`)
                })
            }
        }, { emptyFieldValue: "", excelBOM: true })
    })
});



