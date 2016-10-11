var dotenv = require('dotenv').config({silent: true});
var mkdirp = require('mkdirp');
var path = require('path');
var request = require("request");
var fs = require("fs");
var args = process.argv.slice(2);
var repos = [];

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
  var url = "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contributors?access_token="+process.env.AUTH_TOKEN;
  requestGitHub(url, cb);
}

function requestGitHub(url, cb) {
request.get({
      'url': url,
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


function getStarredRepos() {
  var url;
  getRepoContributors(args[0], args[1], (err, res, user) => {
    var k = user.length;
    for (var i = 0; i < user.length; i += 1) {
      url = "https://api.github.com/users/" + user[i].login + "/starred?access_token="+process.env.AUTH_TOKEN;
      requestGitHub(url, (err, res, userList) => {
        for(var j = 0; j < userList.length; j += 1) {
          repos.push(userList[j].full_name);
        }
        k -= 1;
        if (k === 0)
          processList();
      });
    }
  });
}

function processList() {
  var repoStats = {};
  var topRepos = [];
  var name;
  for (var i = 0; i < repos.length; i += 1) {
    name = repos[i];
    if (!repoStats[name]) {
      repoStats[name] = 0;
    }
    repoStats[name] += 1;
  }
  topRepos = sortProperties(repoStats);
  console.log("Recommended repos:\n");
  for (var i = 0; i < 5; i += 1) {
    console.log("[" + topRepos[i][1] + " stars] " + topRepos[i][0]);
  }
}

// Stolen from StackOverflow (SORRY!!!! IT'S 9 PM!!!!)

function sortProperties(obj) {
  // convert object into array
    var sortable=[];
    for(var key in obj)
        if(obj.hasOwnProperty(key))
            sortable.push([key, obj[key]]); // each item is an array in format [key, value]

    // sort items by value
    sortable.sort(function(a, b)
    {
      return b[1] - a[1]; // compare numbers
    });
    return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
}

getStarredRepos();