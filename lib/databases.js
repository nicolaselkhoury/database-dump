const shell = require("shelljs");

let lib = {
    /**
     * Creates a dump of a Mongo database and outputs the dump into a directory
     */
    "createMongoDump" : function(connection, cb) {
        console.log(`Creating a dump for ${connection.database.type} database ${connection.database.dbName}`);
        //add the credentials
        let userPass = ``;
        if(connection.database.username && connection.database.password) {
            userPass = `--username ${connection.database.username} --password ${connection.database.password}`;
            if(connection.database.authDb)
                userPass += ` --authenticationDatabase ${connection.database.authDb}`;
        }
        //add the name of the database to be dumped
        let databaseName = ``;
        if(connection.database.dbName)
            databaseName = `--db ${connection.database.dbName}`;
        let collections = ``;
        //add the collections to be dumped
        if(connection.database.collections) {
            //if more than one collection is needed 
            if(Array.isArray(connection.database.collections)) {
                connection.database.collections.forEach((oneCollection) => {
                    collections += `--collection ${oneCollection} `;
                });
            }
            //if only one collection is needed 
            else collections += `--collection ${connection.database.collections} `;
        }
        //fetch the name of the dump or initialize it to a date
        let dumpName = (connection.dumpName) ? connection.dumpName : "mongodb-" + new Date().toISOString().replace(/ /g,"-");
        //create the arango dump command
        let dumpCommand = `mongodump --host ${connection.database.host} --port ${connection.database.port} ${databaseName} ${userPass} ${collections} --out temp`;
        console.log(dumpCommand);
        //execute it
        shell.exec(dumpCommand, (code, stdout, stderr) => {
            if(code !== 0) {
                console.log(stderr);
                console.log(`Unable to create a dump for ${connection.database.type} database ${connection.database.dbName}`); 
                return cb(stderr);
            }
            else {
                console.log(`Successfully created a dump for ${connection.database.type} database ${connection.database.dbName}`);
                shell.exec(`$(which tar) -zcvf ${dumpName}.tar temp && rm -Rf temp && mv ${dumpName}.tar ${connection.dumpDirectory}`, (code, stdout, stderr) => {
                    if(code !== 0) {
                        console.log(stderr);
                        console.log(`Unable to compress the dump for ${connection.database.type} database ${connection.database.dbName}`); 
                        return cb(stderr);
                    }
                    return cb(null, connection.dumpDirectory + connection.dumpName + ".tar");
                });
            }
        });
    },
    /**
     * Creates a dump of an Arango database and outputs the dump into a directory
     */
    "createArangoDump" : function(connection, cb) {
        console.log(`Creating a dump for ${connection.database.type} database ${connection.database.dbName}`);
        let userPass = `--server.password`;
        if(connection.database.username && connection.database.password)
            userPass = `--server.username ${connection.database.username} --server.password ${connection.database.password}`;
        let dumpName = (connection.dumpName) ? connection.dumpName : "arangodb-" + new Date().toISOString().replace(/ /g,"-");
        //add the collections to be dumped
        let collections = ``;
        if(connection.database.collections) {
            //if more than one collection is needed 
            if(Array.isArray(connection.database.collections)) {
                connection.database.collections.forEach((oneCollection) => {
                    collections += `--collection ${oneCollection} `;
                });
            }
            //if only one collection is needed 
            else collections += `--collection ${connection.database.collections} `;
        }
        //create the arango dump command
        let dumpCommand = `arangodump --server.endpoint tcp://${connection.database.host}:${connection.database.port} ${collections} --server.database ${connection.database.dbName} ${userPass} --output-directory temp`;
        console.log(dumpCommand);
        //execute it
        shell.exec(dumpCommand, (code, stdout, stderr) => {
            if(code !== 0) {
                console.log(stderr);
                console.log(`Unable to create a dump for ${connection.database.type} database ${connection.database.dbName}`); 
                return cb(stderr);
            }
            else {
                console.log(`Successfully created a dump for ${connection.database.type} database ${connection.database.dbName}`);
                shell.exec(`$(which tar) -zcvf ${dumpName}.tar temp && rm -Rf temp && mv ${dumpName}.tar ${connection.dumpDirectory}`, (code, stdout, stderr) => {
                    if(code !== 0) {
                        console.log(stderr);
                        console.log(`Unable to compress the dump for ${connection.database.type} database ${connection.database.dbName}`); 
                        return cb(stderr);
                    }
                    return cb(null, connection.dumpDirectory + connection.dumpName + ".tar");
                });
            }
        });
    }
};

module.exports = lib;