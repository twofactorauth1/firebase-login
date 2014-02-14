# Get current directory, should be root/deploy
dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $dir

# Move up a level to root of app
cd ../

echo $(pwd)

# run grunt
grunt

# deploy to modulus
cd ../bio-release

echo $(pwd)
modulus deploy
