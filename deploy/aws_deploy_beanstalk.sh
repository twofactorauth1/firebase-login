#!/bin/sh

if [ "$1" == "develop" ]; then
	export AWS_DEFAULT_REGION="us-east-1"
	export ENV_NAME="indigeweb-develop-env"
	export S3_BUCKET="elasticbeanstalk-us-east-1-213805526570"
elif [ "$1" == "master" ]; then
	echo "Not implemented yet"
	exit 9
else
	echo "No environment specified, exiting"
	exit 80
fi

export APP_VERSION=`git rev-parse --short HEAD`

pip list | grep awscli > /dev/null
[ $? -ne 0 ] && pip install awscli

# clean build artifacts and create the application archive (also ignore any files named .git* in any folder)
#git clean -fd

# precompile assets, ...
########################
# remove original main file
rm -f public/js/main.js

# rename mainforproduction to main.js
mv public/js/mainforproduction.js public/js/main.js

# Compile all handlebars templates
grunt compiletemplates

# run grunt
grunt production --optimize=uglify

# rename /min to /js directory
mv public/min public/js
########################

# zip the application
zip -x *.git* node_modules/ -r "${APP_NAME}-${APP_VERSION}.zip" .

# delete any version with the same name (based on the short revision)
aws elasticbeanstalk delete-application-version --application-name "${APP_NAME}" --version-label "${APP_VERSION}"  --delete-source-bundle

echo Uploading to S3
# upload to S3
aws s3 cp ${APP_NAME}-${APP_VERSION}.zip s3://${S3_BUCKET}/${APP_NAME}-${APP_VERSION}.zip

# create a new version and update the environment to use this version
aws elasticbeanstalk create-application-version --application-name "${APP_NAME}" --version-label "${APP_VERSION}" --source-bundle S3Bucket="${S3_BUCKET}",S3Key="${APP_NAME}-${APP_VERSION}.zip"
aws elasticbeanstalk update-environment --environment-name "${ENV_NAME}" --version-label "${APP_VERSION}"
