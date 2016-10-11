var dotenv = require('dotenv').config();
var request = require("request");
var fs = require("fs");

var args = process.argv.slice(2);

function getRepoContributors (repoOwner, repoName, cb) {

  request.get({
    'url': "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contributors?acces_token="+process.env.AUTH_TOKEN,
    method: 'GET',
    headers: {
      'User-Agent': 'request',
    },
    json: true
  }, cb);
}

getRepoContributors(args[0], args[1], (err, res, body) => {

  body.forEach((element) => {
    downloadImageByURL(element.avatar_url, "./images/" + element.login + "_avatar.jpg");
  });
});

function downloadImageByURL(url, filePath) {

  request(url).pipe(fs.createWriteStream(filePath));
}