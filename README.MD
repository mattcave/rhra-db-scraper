# INSTRUCTIONS

## Setup
Copy these files into a directory on your computer
Install node
Run `npm install`

## Process
* Grab list of Homes from https://www.rhra.ca/wp-admin/admin-ajax.php?action=public_register&language=en
* Save the JSON data as list.json
* Delete any old files from the data directory
* Run download-pages (usually multiple times) to save a local copy of the pages
* When you've got them all, run process-pages to extract the various fields and save to CSV
* The file will be saved to out.csv

## TODO

* Grab the json file automatically
* Warn if data dir is not empty
* Error checking everywhere
