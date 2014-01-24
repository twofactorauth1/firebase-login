# Bio Indegenious

## Description

**Now it very simple to collect data from best-in-class mobile health apps and devices.**

_It works very easily with your existing system and allows for a simple, one-to-many connection with mobile health apps, wearables and in-home medical devices. Bio indegenious operates behind the scenes to enable your customers to connect and deliver mobile health data into your app or web portal._


## Setup

### Dependencies

All the dependancies are stated with their version requirement in the package.json file. As a best practice ([http://www.futurealoof.com/posts/nodemodules-in-git.html](http://www.futurealoof.com/posts/nodemodules-in-git.html)) the node_modules directory is checked in with the source code.

### Code Repo

Get a code check out from [https://bitbucket.org/donavonguyot/bio.indigenous](https://bitbucket.org/donavonguyot/bio.indigenous)

### Change to checkout directory

```
cd <path to checkout dir>
```

### Rebuild dependencies

```
npm rebuild
```

### Install SailsJS

Sails.js requires a global npm install as root.

```
sudo npm -g sails
```

### Start development server

```
sails lift
```

### Testing

_Test files are placed in the /test directory with a "-test" in the file name e.g. user-api-test.js_

#### Install ChromeDriver

In order to run the jasmine-node tests install the [ChromeDrivers](http://chromedriver.storage.googleapis.com/index.html?path=2.8/) and add the location you installed them to to your PATH environment variable.


#### Start testing server

```
sails lift
```

#### Run all tests

```
npm test
```

#### Run SMTP server

```
sudo node_modules/Haraka/bin/haraka -c haraka
```

