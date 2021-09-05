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

   If `jsharmony` doesn't run, ensure the Node.js npm folder is in your system PATH variable.
   
4. Start the server by running:
   ````
   nstart.cmd
   -- or --
   node app.js
   ````
  
5. Browse to http://localhost:8080 and log in using the admin username and password from Step 3

## Usage

1. Watch the Getting Started video tutorials at [jsHarmonyCMS.com :: Getting Started](https://www.jsharmonycms.com/resources/getting-started/) to learn how to create a new site, install or create templates, add pages, and publish.

2. Page and Component Templates can be modified in the local folder `data\site\[site_id]\templates`

    Optionally, update templates via SFTP by enabling SFTP in `app.config.js`, below the line where `configCMS.git` is enabled:

    ````
    configCMS.sftp.enabled = true;
    ````


3. Review the configuration settings in `app.config.js` and `app.config.local.js`. 

    A reference for jsHarmony CMS config options is available at [jsHarmonyCMS.com :: System Config](https://www.jsharmonycms.com/resources/documentation/system-config/).

    Depending on your server, you may need to configure ports and IP addresses to not conflict with other services.
