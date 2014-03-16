##------------------------
##-- Steps to run this:
##--
##-- 1) Ensure you have the latest version of node installed > 0.10.25

# Get current directory, should be root/deploy
dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $dir

# Move up a level to root of app
cd ../

# run tests
grunt tests
