# Graph Recipes

A small static website in Angular to tinker with networks, based on Graphology.

## Install

### Install the dependencies & build the code

```
# This will install the deps & build the code for production
npm install

# To rebuild the code manually
npm run build
```

### Dev commands

```
# Just watch the files & retranspile (e.g. when serving app with Apache)
npm run watch

# Watch the files & serve the application on localhost:3000
npm run dev
```

## Usage
The website is in the app folder. Browse, upload a GEXF network, pick a script (they are called "recipes") and execute it.

The scripts do a number of things: compute statistics, give informations, draw images, and more.
