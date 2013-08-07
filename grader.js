#!/usr/bin/env node
var util = require('util');
var fs = require('fs');
var csv = require('csv');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var csvfile = 'tempcsv.csv';
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://peaceful-bayou-4941.herokuapp.com/"; 

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var getURL = function(url){
   rest.get(url).on('complete', function(result) {
     if (result instanceof Error) {
       console.error('Error: ' + util.format(response.message));
   } else { 
     fs.writeFileSync(csvfile,result);  
     return fs.readFileSync(csvfile);
   }});
}

var cheerioURL = function(url){
    return cheerio.load(getURL(url));
}

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkURL = function(url, checksfile) {
    $ = cheerioURL(url);
    var checks2 = loadChecks(checksfile).sort();
    var out2 = {};
    for(var jj in checks2) {
        var present2 = $(checks2[jj]).length > 0;
        out2[checks2[jj]] = present2;
    }
    return out2;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url_address>', 'URL address', URL_DEFAULT)
        .parse(process.argv);
    //var checkJson = checkHtmlFile(program.file, program.checks);
    //var outJson = JSON.stringify(checkJson, null, 4);
   //console.log(outJson);
    var checkJson2 = checkURL(program.url, program.checks);
    var outJson2 = JSON.stringify(checkJson2, null, 4);
   console.log(outJson2);

} else {
    exports.checkHtmlFile = checkHtmlFile;
}
