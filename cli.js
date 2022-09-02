#!/usr/bin/env node

const OCK = require('./index').OCK;

let mainCommand = process.argv[1];
console.log("Running "+mainCommand+"...");
let REPO_OWNER = process.argv[2];
let GITHUB_PERSONAL_TOKEN = process.argv[3];

let options = {};
if(GITHUB_PERSONAL_TOKEN){
    options.GITHUB_PERSONAL_TOKEN = GITHUB_PERSONAL_TOKEN;
}
OCK.contributors.github.archive(REPO_OWNER, options);