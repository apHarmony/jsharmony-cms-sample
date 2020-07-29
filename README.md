# jsharmony-cms-sample
jsHarmony CMS Sample Project

## Installation

1. jsharmony create database\
   This will generate the admin username / password
2. node recreate_db.js
3. Generate the local HTTPS certificates by running "cert\gen.cmd" - this requires the openssl executable
4. Optional: Uncomment the Sample Test Site in app.config.js to view the published static files on port 8083
5. Start the server by running:\
  nstart.cmd\
  -- or --\
  node app.js
6. Browse to http://localhost:8080 and log in using the admin username and password from Step 1