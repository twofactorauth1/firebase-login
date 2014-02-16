# Get current directory, should be root/deploy
dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $dir

# Move up a level to root of app
cd ../

echo $(pwd)

# Compile all handlebars templates
grunt compiletemplates

# run grunt copy - this removes old bio-release dir and copies new one in
grunt copyroot

# run grunt
grunt default

# deploy to modulus
cd ../bio-release

#--modulus deploy
