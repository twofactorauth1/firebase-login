# Get current directory, should be root/deploy
dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $dir

# Move up a level to root of app
cd ../

echo $(pwd)

# run grunt copy - this removes old bio-release dir and copies new one in
grunt copyroot

# Get into newly created deploy file
cd ../bio-release

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

# deploy to modulus
#--modulus deploy
