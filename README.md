These directions will assist you in getting your environment set up on your local machine in order to begin code development. 

### Dependencies

Download and install these dependencies to start developing on the application

[Node JS](http://howtonode.org/how-to-install-nodejs)

[Mongo DB](http://docs.mongodb.org/manual/installation/)

[Live Reload Extension](http://feedback.livereload.com/knowledgebase/articles/86242-how-do-i-install-and-use-the-browser-extensions)

### Steps

1. Download the develop branch from the main page here [Main Page](https://github.com/IndigenousIO/indigeweb) and create your own branch based on the develop branch. 

2. Open a Terminal/Command Prompt on the downloaded branch

3. Run 'npm install' to download all the application dependencies

4. Run 'bower install' to install the front-end dependencies.  (If you get an error saying bower is not installed, run 'npm install -g bower' and try again.)

5. Open a new Terminal/Command Prompt and make sure Mongo is running with 'mongo' or 'mongod'

6. Go back to Original Tab and run 'node app.js'

7. Open a new Terminal/Command Prompt and run 'grunt less' which will manually compile all the less files and then run 'grunt watch' which will watch the less folder for any changes and then compile them into css and live reload the browser

8. Go to http://localhost:3000/login

9. Register an Account by going through the sign up pages. The business name needs to be filled out because this will be used to create your account url for example "yourbusinessname.indigenous.io"

10. Create a local redirect on your machines host file for example: 127.0.0.1 yourbusinessname.indigenous.local
   (Windows) [How to Edit Hosts File on Windows](http://www.howtogeek.com/howto/27350/beginner-geek-how-to-edit-your-hosts-file/) (Mac) [How to Edit Hosts File on Mac](http://decoding.wordpress.com/2009/04/06/how-to-edit-the-hosts-file-in-mac-os-x-leopard/)

11. You should now be able to log into the site 

12. To modify the local mongoDB you can use http://robomongo.org/


### Common Issues

• **Application looks ugly** - make sure you compile the less files manually once with 'grunt less' and then you run 'grunt watch' every time you develop to watch for file changes.

• **node-gyp module error** - your node.js on your machine is most likely out of date 

• **winsock2.h error** - http://stackoverflow.com/questions/3623129/winsock2-h-no-such-file-or-directory

## Set up Local Mongo
1. Install mongodb locally if it is not already available
2. Grab a copy of the database from mongohq: 
`mongodump --db indigenous --host kahana.mongohq.com:10077 --username indiweb --password anime1`
3. "Restore" the dumped data into the local instance of mongo:
`mongorestore --db test-indigenous dump/indigenous/`