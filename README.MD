# INSTRUCTIONS

## Setup
Copy these files into a directory on your computer

Install node from https://nodejs.org/en/download/

Run `npm install`

## Process
* Grab list of Homes from https://www.rhra.ca/wp-admin/admin-ajax.php?action=public_register&language=en
* Save the JSON data as list.json
* Delete any old files from the data directory
* Run `node download-pages.s` (usually multiple times) to save a local copy of the pages
* When you've got them all, run `node process-pages.s` to extract the various fields and save to CSV
* The file will be saved to out.csv

## TODO

* Grab the json file automatically
* Warn if data dir is not empty
* Error checking everywhere
