#!/bin/bash

on_err(){
	echo "Build error has been detected around:"
	echo "$*"
	echo "Exiting"
	exit 1
}

env_check(){
	if [ "x$AWS_ACCESS_KEY_ID" = "x" ]; then
		on_err "No AWS_ACCESS_KEY_ID defined."
	fi
	if [ "x$AWS_SECRET_ACCESS_KEY" = "x" ]; then
		on_err "No AWS_SECRET_ACCESS_KEY defined.";
	fi
	if [ "x$APP_NAME" = "x" ]; then
		on_err "No APP_NAME defined.";
	fi

	if [ "$1" = "master" ]; then
		export AWS_DEFAULT_REGION="us-west-1"
		export ENV_NAME="indigeweb-env-blue"
		export S3_BUCKET="elasticbeanstalk-us-west-1-213805526570"
		export GOOGLE_CLIENT_ID="277102651227-m80ppab4ler5fo08jle3a2g0vhnjce99.apps.googleusercontent.com"
		export GOOGLE_CLIENT_SECRET="yPiJOniUgxjT94O7M_4tNj_M"
		export STRIPE_PUBLISHABLE_KEY="pk_live_GFldJIgLoRweE8KmZgHc76df"
		export RVLVR_STRIPE_PUBLISHABLE_KEY="pk_live_nmZLNQLPQhMVDWSOrWGsfDk1"
	elif [ "$1" = "develop" ]; then
		export GOOGLE_CLIENT_ID="277102651227-koaeib7b05jjc355thcq3bqtkbuv1o5r.apps.googleusercontent.com"
	  	export GOOGLE_CLIENT_SECRET="lg41TWgRgRfZQ22Y9Qd902pH"
	  	export AWS_DEFAULT_REGION="us-west-1"
        export ENV_NAME="indiwebTestB-env"
        export APP_NAME="indiweb-test-b"
        export S3_BUCKET="elasticbeanstalk-us-west-1-213805526570"
        export GREEN_ENV_NAME=indiwebTestB-Green
	else
		on_err "No environment specified"
	fi

	export APP_VERSION=`git rev-parse --short HEAD`-local
}

main(){
	pip list | grep awscli > /dev/null
	[ $? -ne 0 ] && pip install awscli

	# clean build artifacts and create the application archive (also ignore any files named .git* in any folder)
	#git clean -fd

	# Generate angular constants file
	if [ "$1" = "master" ]; then
	    echo "Generating constants for production."
	    grunt ngconstant:production || on_err "$_"
	    cp public/admin/assets/js/config.js public/js/scripts/config.js
	    export APP_DESCRIPTION="Production Build"
	elif [ "$1" = "develop" ]; then
	    echo "Generating constants for development."
	    grunt ngconstant:development || on_err "$_"
	    cp public/admin/assets/js/config.js public/js/scripts/config.js
	    export APP_DESCRIPTION="Test Build (local)"
	    echo $APP_DESCRIPTION
	    cp public/robots-test.txt public/robots.txt
	else
		echo "No environment specified.  No constants"
	fi
	# precompile assets, ...
	########################
	# remove original main file
	#rm -f public/js/main.js

	# run grunt
	echo Running grunt production
	grunt production --optimize=uglify || on_err "$_"

	cp templates/snippets/index_body_scripts_minimized.jade templates/snippets/index_body_scripts.jade
	cp templates/snippets/admin_body_scripts_minimized.jade templates/snippets/admin_body_scripts.jade

    npm prune --production

	echo Starting zip
	# zip the application
	zip -q -x *.git* "node_modules/phantomj*" "node_modules/grunt*" "node_modules/karma*" "node_modules/eslint*" -r "${APP_NAME}-${APP_VERSION}.zip" . || on_err "$_"

	echo "Using access key $AWS_ACCESS_KEY_ID"
	# delete any version with the same name (based on the short revision)
	aws elasticbeanstalk delete-application-version --application-name "${APP_NAME}" --version-label "${APP_VERSION}"  --delete-source-bundle	|| on_err "$_"

	# Clean up all but the most recent 100 revisions of the application
	echo "Checking for old revisions to clean up..."
	LIMIT_REVISIONS=100
	aws elasticbeanstalk describe-application-versions --application-name "${APP_NAME}" --output text \
	  --query 'ApplicationVersions[*].[VersionLabel,DateCreated,Description]' | \
	  grep -vi sample | tail -n +${LIMIT_REVISIONS} | \
	  while read ver date desc; do aws elasticbeanstalk delete-application-version --application-name "${APP_NAME}" --version-label "${ver}" --delete-source-bundle; done

	echo "Uploading to S3"
	# upload to S3
	aws s3 cp ${APP_NAME}-${APP_VERSION}.zip s3://${S3_BUCKET}/${APP_NAME}-${APP_VERSION}.zip	|| on_err "$_"

	# create a new version and update the environment to use this version
	aws elasticbeanstalk create-application-version --application-name "${APP_NAME}" --version-label "${APP_VERSION}" --description "${APP_DESCRIPTION}" --source-bundle S3Bucket="${S3_BUCKET}",S3Key="${APP_NAME}-${APP_VERSION}.zip"	|| on_err "$_"
    aws elasticbeanstalk create-environment --environment-name "${GREEN_ENV_NAME}" --application-name "${APP_NAME}" --version-label "${APP_VERSION}" --description "${APP_DESCRIPTION}" --solution-stack-name "64bit Amazon Linux 2016.03 v2.1.1 running Node.js"
    # NEED TO ADD A WAIT FOR 'Updating' BEFORE WE WAIT FOR 'Ready'
    interval=5; timeout=90; while [[ ! `aws elasticbeanstalk describe-environments --environment-name "${GREEN_ENV_NAME}" | grep -i status | grep -i updating` && $timeout > 0 ]]; do sleep $interval; timeout=$((timeout - interval)); done

	interval=5; timeout=90; while [[ ! `aws elasticbeanstalk describe-environments --environment-name "${GREEN_ENV_NAME}" | grep -i status | grep -i ready` && $timeout > 0 ]]; do sleep $interval; timeout=$((timeout - interval)); done

	#[ $timeout > 0 ] && aws elasticbeanstalk update-environment --environment-name "${ENV_NAME}" --version-label "${APP_VERSION}" || exit 0



	# Testing?

	if [ "$1" = "master" ]; then
        echo "Put back test dependencies"
        #We have already removed test deps.  Lets put them back.
        npm install
        npm install selenium-webdriver@2.53.2
        echo "Waiting for deploy to finish"

        interval=10; timeout=600; while [[ ! `aws elasticbeanstalk describe-environments --environment-name "${ENV_NAME}" | grep -i status | grep -i ready` && $timeout > 0 ]]; do sleep $interval; timeout=$((timeout - interval)); done

        echo "Running Selenium"

        grunt nodeunit:selenium

        [ $timeout > 0 ] && aws elasticbeanstalk swap-environment-cnames --source-environment-name "${ENV_NAME}" --destination-environment-name "${GREEN_ENV_NAME}" || exit 0
    elif [ "$1" = "develop" ]; then
        npm install selenium-webdriver@2.53.2
        echo "Waiting for deploy to finish"
        interval=10; timeout=600; while [[ ! `aws elasticbeanstalk describe-environments --environment-name "${ENV_NAME}" | grep -i status | grep -i ready` && $timeout > 0 ]]; do sleep $interval; timeout=$((timeout - interval)); done
        echo "Running Selenium"
        grunt nodeunit:selenium
        [ $timeout > 0 ] && aws elasticbeanstalk swap-environment-cnames --source-environment-name "${ENV_NAME}" --destination-environment-name "${GREEN_ENV_NAME}" || exit 0
    else
        [ $timeout > 0 ] && aws elasticbeanstalk swap-environment-cnames --source-environment-name "${ENV_NAME}" --destination-environment-name "${GREEN_ENV_NAME}" || exit 0
    fi
}
export AWS_ACCESS_KEY_ID=AKIAIS2VFA3QL7JVKQQQ
export AWS_SECRET_ACCESS_KEY=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
export APP_NAME=indiweb-test-b
env_check $*
main $*
