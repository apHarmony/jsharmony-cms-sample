# jsharmony-cms-sample
jsHarmony CMS Sample Project

## Prerequisites

* Node.js

## Installation

1. Install the jsHarmony CLI, if not already installed
   ````
   npm install -g jsharmony-cli
   ````
   
2. Create an empty folder for the project
   ````
   mkdir cms-sample
   cd cms-sample
   ````
   
3. Install jsharmony-cms-sample:
   ````
   jsharmony create project https://github.com/apHarmony/jsharmony-cms-sample/archive/master.zip
   ````
   This will download the project from GitHub and install in the current folder
   The installer will generate the admin username and password

   If jsharmony doesn't run, ensure the Node.js npm folder is in your system PATH variable.
   
4. Start the server by running:
   ````
   nstart.cmd
   -- or --
   node app.js
   ````
  
5. Browse to http://localhost:8080 and log in using the admin username and password from Step 3