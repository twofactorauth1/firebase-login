##------------------------
##-- Steps to run this:
##-- 1) Ensure you have access to the parent of the root directory of this application.
##--    In this we have a root directory called "indigeweb", taken from the Source Code Repo.
##--    This script will write a new directory called ../indigeweb-release, so you must have
##--    write access to that environment.
##--
##-- 2) Ensure you have the latest version of node installed > 0.10.25
##--
##-- 3) Install the modulus CLI, open terminal and type: "npm install -g modulus"
##--
##-- 4) If you only want to run locally, comment out "modulus deploy" below, and then run this script.
##--    then you can run your node app by CD'ing into the indigeweb-release directory and running node app.js.
##--    This will allow you to test the optimized project before a deploy.
##--
##-- 5) If you want to test a production simulated environment with subdomains, alter your hosts file
##--    /etc/hosts or /private/etc/hosts, and add something "127.0.0.1 {subdomain}.indigenous.local"


# Get current directory, should be root/deploy
dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $dir

# Move up a level to root of app
cd ../

echo $(pwd)

# run grunt copy - this removes old indigeweb-release dir and copies new one in
grunt copyroot

# Get into newly created deploy file
cd ../indigeweb-release

# remove original main file
rm -f public/js/main.js

# rename mainforproduction to main.js
mv public/js/mainforproduction.js public/js/main.js

# Compile all handlebars templates
grunt compiletemplates

# run grunt
grunt production

# rename /min to /js directory
mv public/min public/js

# run tests
grunt tests

# deploy to modulus
modulus deploy
