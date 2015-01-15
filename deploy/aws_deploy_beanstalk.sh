#!/bin/sh

if [ "x$AWS_ACCESS_KEY_ID" = "x" ]; then 
	echo "No AWS_ACCESS_KEY_ID defined, exiting.";
	exit 99;
fi
if [ "x$AWS_SECRET_ACCESS_KEY" = "x" ]; then
	echo "No AWS_SECRET_ACCESS_KEY defined, exiting.";
	exit 98;
fi
if [ "x$APP_NAME" = "x" ]; then 
	echo "No APP_NAME defined, exiting."; 
	exit 97;
fi

if [ "$1" = "master" ]; then
	export AWS_DEFAULT_REGION="us-west-2"
	export ENV_NAME="indigeweb-live-env"
	export S3_BUCKET="elasticbeanstalk-us-east-1-213805526570"
	export GOOGLE_CLIENT_ID="277102651227-m80ppab4ler5fo08jle3a2g0vhnjce99.apps.googleusercontent.com"
	export GOOGLE_CLIENT_SECRET="yPiJOniUgxjT94O7M_4tNj_M"
	export STRIPE_PUBLISHABLE_KEY="pk_live_GFldJIgLoRweE8KmZgHc76df"
elif [ "$1" = "develop" ]; then
	export AWS_DEFAULT_REGION="us-west-2"
	export ENV_NAME="indigeweb-test-env"
	export S3_BUCKET="elasticbeanstalk-us-east-1-213805526570"
	export GOOGLE_CLIENT_ID="277102651227-koaeib7b05jjc355thcq3bqtkbuv1o5r.apps.googleusercontent.com"
    export GOOGLE_CLIENT_SECRET="lg41TWgRgRfZQ22Y9Qd902pH"
else
	echo "No environment specified, exiting"
	exit 80
fi

export APP_VERSION=`git rev-parse --short HEAD`

pip list | grep awscli > /dev/null
[ $? -ne 0 ] && pip install awscli

# clean build artifacts and create the application archive (also ignore any files named .git* in any folder)
#git clean -fd

# Generate angular constants file
if [ "$1" = "master" ]; then
    echo "Generating constants for production."
    grunt ngconstant:production
    export APP_DESCRIPTION="Production Build"
elif [ "$1" = "develop" ]; then
    echo "Generating constants for development."
    grunt ngconstant:development
    export APP_DESCRIPTION="Test Build"
    echo $APP_DESCRIPTION
else
	echo "No environment specified.  No constants"
fi
# precompile assets, ...
########################
# remove original main file
rm -f public/js/main.js

# run grunt
echo Running grunt production
grunt production --optimize=uglify
if [ "$1" = "master" ]; then
    # copy the minimized jade file
    mv templates/snippets/index_body_scripts_minimized.jade templates/snippets/index_body_scripts.jade
fi

# rename mainforproduction to main.js
mv public/js/mainforproduction.js public/js/main.js

# Compile all handlebars templates
#grunt compiletemplates



# rename /min to /js directory
#mv public/min public/js
########################
rm -r public/comps

echo Starting zip
# zip the application
zip -q -x *.git* node_modules/ -r "${APP_NAME}-${APP_VERSION}.zip" .

echo Using access key $AWS_ACCESS_KEY_ID
# delete any version with the same name (based on the short revision)
aws elasticbeanstalk delete-application-version --application-name "${APP_NAME}" --version-label "${APP_VERSION}"  --delete-source-bundle

echo Uploading to S3
# upload to S3
aws s3 cp ${APP_NAME}-${APP_VERSION}.zip s3://${S3_BUCKET}/${APP_NAME}-${APP_VERSION}.zip

# create a new version and update the environment to use this version
aws elasticbeanstalk create-application-version --application-name "${APP_NAME}" --version-label "${APP_VERSION}" --description "${APP_DESCRIPTION}" --source-bundle S3Bucket="${S3_BUCKET}",S3Key="${APP_NAME}-${APP_VERSION}.zip"

interval=5; timeout=90; while [[ ! `aws elasticbeanstalk describe-environments --environment-name "${ENV_NAME}" | grep -i status | grep -i ready > /dev/null` && $timeout > 0 ]]; do sleep $interval; timeout=$((timeout - interval)); done

[ $timeout > 0 ] && aws elasticbeanstalk update-environment --environment-name "${ENV_NAME}" --version-label "${APP_VERSION}" || exit 0
