supervisor -n exit -i clientjs,test,public,data,./node_modules/jsharmony-db-mssql/node_modules,./node_modules/jsharmony-db-pgsql/node_modules,./node_modules/jsharmony-db-sqlite/node_modules,./node_modules/jsharmony-db/node_modules,./node_modules/jsharmony-cms/node_modules,./node_modules/jsharmony-factory/node_modules,./node_modules/jsharmony/node_modules -w "./node_modules/jsharmony-cms/models/sql,./models/sql,./node_modules/jsharmony-db,./node_modules/jsharmony-db-mssql,./node_modules/jsharmony-db-pgsql,./node_modules/jsharmony-db-sqlite,./recreate-db.js" -e "node,js,json,css,ejs,sql" node "./recreate-db.js"
