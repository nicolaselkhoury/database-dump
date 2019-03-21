# database-dump
Database dumps are essential data recovery mechanisms, provided by taking snapshots of databases regularly. Following any unfortunate event, or for any reason whatsoever, these snapshots can be used to restore the database to the point in time at which the snapshot was taken. Every database has its own syntax and command line interface, and learning each of them can become cumbersome. In this regard, this repository aims to unify this syntax, and to simultaneously perform dumps on different instances, and different types of databases, whether hosted locally or remotely, through one JSON file.

## Prerequisites
Currently, this repository supports [MongoDB](https://www.mongodb.com/) and [ArangoDB](https://www.arangodb.com/). However, we have plans to integrate as many databases as possible. This repository abstracts the commands of the databases used in order to perform dumps. Therefore, for each type of database, the corresponding CLI must be installed on the machine on which this script will run. To further illustrate, if this script is supposed to run on machine A, and the database which data will be dumped is on machine B, the CLI of this database must be installed on machine A.

## Installation
In order to install this repository on your machine, perform the following commands:
```bash
# Download the repository
https://github.com/nicolaselkhoury/database-dump.git
# Navigate to the directory of the script
cd database-dump/
# Install the dependencies
npm install
```

## Config file
The databases to be dumped must be fed to the script through a configuration file called _config.js_, which can be located anywhere on the machine. The location of this file must be supplied as an environment variable. Assuming the file is location in _/opt/config/config.js_:

```bash
# Export the location of the config file as environment variable
export CONFIG_FILE=/opt/config/config.js
# Run the script
node index.js
```

Below is a example of a configuration file that contains information of a MongoDB database, and an ArangoDB database:

```javascript
module.exports = {
    "connections" : [
        {
            "database" : {
                "host" : "localhost", //database host (required)
                "port" : 27017, //database port (required)
                "type" : "mongodb", //database type ("mongodb" | "arangodb") (required)
                "dbName" : "testDb", //name of the database to be dumped (Only required if a specific collection is to be dumped)
                "collections" : "newCollection" //name of the collection to be dumped (not required)
            },
            "dumpName" : "mongodb-" + new Date().toISOString(), //name of the file containing the dump
            "dumpDirectory" : "/opt/personal/data" //directory in which the dump file must be stored
        },
        {
            "database" : {
                "host" : "<remote host>", //database host (required)
                "port" : 8530, //database port (required)
                "type" : "arangodb", //database type ("mongodb" | "arangodb") (required)
                "dbName" : "testDb", //name of the database to be dumped (required)
                "collections" : ["testCollection", "anotherCollection"] //array of collections to be dumped. It can also be a string specifying only one collection (not required)
            },
            "dumpName" : "arangodb-" + new Date().toISOString(), //name of the file containing the dump
            "dumpDirectory" : "/opt/personal/data" //directory in which the dump file must be stored
        }
    ]
}
```

## Algorithm
This section explains how the code behaves as soon as it is triggered:
* Try to require the configuration file. In case of failure, an error is generated.
* Perform all necessary checks to ensure that the configuration file is valid. In case of failure an error is generated.
* Loop over the database instances present in the configuration file, perform a database dump, compress the dump (.tar), and store it in the specified directory

## Future work
Below is a list of points that will be implemented in the future:
* Integrate as many databases as possible.
* Allow multiple compression types, specified by the user (e.g., zip, tar, etc).
* Upload the dump to a storage location (e.g., AWS S3).

Contributions and feedback are always welcomed in order to further enhance this repository.
