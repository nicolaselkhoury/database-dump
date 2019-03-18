"use strict";
const async = require("async");
const databases = require("./databases.js");
let config = {};
try {
    config = require(process.env.CONFIG_FILE);
} catch(err) {
    throw new Error("Unable to find the configuration file");
}

let utils = {
    //creates a dump and saves it locally
    "createDump" : function(connection, cb) {
        if(connection.database.type === "mongodb")  
            databases.createMongoDump(connection, cb);
        else if(connection.database.type === "arangodb") 
            databases.createArangoDump(connection, cb);
    }
};

let lib = {
    /**
     * Validates that the parameters supplied in the configuration file are correct
     */
    "validateConfigFile" : function(cb) {
        console.log("Validating the information of database of the configuration file");
        if(!config) throw new Error("Unable to find the configuration file");
        
        config.connections.forEach((oneConnection) => {
            if(!oneConnection.database) throw new Error("Missing database object.");
            if(!oneConnection.database.type || (oneConnection.database.type !== "mongodb" && oneConnection.database.type !== "arangodb"))
                throw new Error("Missing/Invalid database type.");
            if(!oneConnection.database.host) throw new Error("Missing host.");
            if(!oneConnection.database.port) throw new Error("Missing port.");
            if(!oneConnection.database.dbName && oneConnection.database.type !== "mongodb") throw new Error("Missing database name");
            if(!oneConnection.database.dbName && oneConnection.database.collections) throw new Error("Cannot dump a collection without a specified database");
            if(oneConnection.database.username && !oneConnection.database.password)
                throw new Error("Username supplied but password missing");
            if(oneConnection.database.password && !oneConnection.database.username)
                throw new Error("Password supplied but username missing");
            if(!oneConnection.dumpDirectory) throw new Error("Missing Dump Directory.");
            if(!oneConnection.dumpName) oneConnection.dumpName = "tempDump";
            oneConnection.dumpName = oneConnection.dumpName.replace(/:\s*/g, "-").replace(/ /g, "-");
        });
        console.log("Successfully validated the information of database of the configuration file");
        return cb();
    },
    /**
     * Creates dumps for all the required databases and pushes them to S3
     */
    "performDumps" : function(cb) {
        async.eachSeries(config.connections, (oneConnection, callback) =>{
            utils.createDump(oneConnection, (err, dumpFile) => {
                if(!err) console.log(`The compressed dump of ${oneConnection.database.type} database ${oneConnection.database.dbName} is located at: ${dumpFile}`)
                return callback();
            }); 
        }, () => {
            return cb();
        });
        
    }
};

module.exports = lib;