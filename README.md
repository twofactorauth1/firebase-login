## Bio Indegenious ##
### Description ###
######Now it simple to collect data from best-in-class mobile health apps and devices.######
_It works seamlessly with your existing system and allows for a simple, one-to-many connection with mobile health apps, wearables and in-home medical devices. Bio indegenious operates behind the scenes to enable your customers to connect and deliver mobile health data into your app or web portal._
###Setup###
######Dependencies######
All the dependancies are stated with their version requirement in the package.json file. As a best practice ([http://www.futurealoof.com/posts/nodemodules-in-git.html](http://www.futurealoof.com/posts/nodemodules-in-git.html)) the node_modules directory is checked in with the source code.
######Code Repo######
Get a code check out from [https://bitbucket.org/donavonguyot/bio.indigenous](https://bitbucket.org/donavonguyot/bio.indigenous)
######Change to checkout directory######
```
cd <path to checkout dir>
```
######Rebuild dependencies######
```
npm rebuild
```
######Start development server######
```
sails lift
```
###Testing###
_Test files are placed in the /test directory with a "-test" in the file name e.g. user-api-test.js_
######Start testing server######
```
sails lift
```
######Run all tests######
```
npm test
```
