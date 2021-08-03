const fs = require('fs')
// require json-2-csv module
const converter = require('json-2-csv');

fs.readFile('./list.json', 'utf8' , (err, raw) => {
  if (err) {
    console.error(err)
    return
  }
  const data = JSON.parse(raw)

  // Write out resultant data
  converter.json2csv(data.result.entries, (err, csv) => {
    if (err) {
        throw err;
    }

    // print CSV string
    console.log(csv);
  });
})
