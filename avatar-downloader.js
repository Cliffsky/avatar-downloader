var dotenv = require('dotenv').config({silent: true});
var mkdirp = require('mkdirp');
var path = require('path');
var request = require("request");
var fs = require("fs");
var args = process.argv.slice(2);
var errorScript = [
  "Please make sure you have supplied the git user-name and repository correctly:\nnode avatar-downloader.js <git user-name> <git repository name>\n",
  "Missing or incorrect authentification information.\n",
  "Failed to connect to destination.\nPlease ensure user-name and repository were properly inputted.\n"
  ];

if (args.length !== 2) { // If improper number of arguments supplied, logs instructions to console.
  console.log(errorScript[0]);
} else {  // If proper number of arguments supplied, downloads images from GitHub endpoint.
  getRepoContributors(args[0], args[1], (err, res, body) => {
    if (res.statusCode === 200) { // Checks for successful connection.
        body.forEach((element) => {
          downloadImageByURL(element.avatar_url, "./images/" + element.login + "_avatar.jpg");
        });
    } else if (res.statusCode === 403) {
      console.log(errorScript[1]);
    } else { // Error code received. Aborting Download.
      console.log(errorScript[2]);
    }
  });
}

function getRepoContributors (repoOwner, repoName, cb) {
    request.get({
      'url': "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contributors?access_token="+process.env.AUTH_TOKEN,
      method: 'GET',
      headers: {
        'User-Agent': 'request',
      },
      json: true
    }, cb)
}


function downloadImageByURL(url, filePath) {
  if(fs.exists(filePath)) { // Checks if filePath exists.
    request(url).pipe(fs.createWriteStream(filePath));
  } else { // Else creates folder.
    mkdirp(path.dirname(filePath), function () {
    request(url).pipe(fs.createWriteStream(filePath));
    })
  }
}

