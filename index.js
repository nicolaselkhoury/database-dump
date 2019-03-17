"use strict";
const dump = require("./dump.js");

console.log("============================");
console.log("Database Dump. Date: " + new Date());
console.log("============================");

dump.validateConfigFile(() => {
    dump.performDumps(() => {
        console.log(`Successfully dumped all the specified databases`);
        process.exit(0);
    });
});
