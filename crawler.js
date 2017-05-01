var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var START_URL = "";
var pagesVisited = {};
var pagesToVisit = [];
var url = "";
var baseUrl = "";
var urlHost = "";

// get references to elements in DOM
var weburl = document.getElementById("weburl");
var start = document.getElementById("start");
var stop = document.getElementById("stop");
var clear = document.getElementById("clear");
var converted = document.getElementById("converted");

start.addEventListener("click", startScript);
clear.addEventListener("click", clearInput);

function clearInput() {
  weburl.value = "";
}

function startScript() {
  START_URL = weburl.value;
  weburl.value = "";
  url = new URL(START_URL);
  baseUrl = url.protocol + "//" + url.hostname;
  urlHost = url.hostname;
  pagesToVisit.push(START_URL);
  crawl();  
}

function crawl() {
  var nextPage = pagesToVisit.pop();
  if (nextPage in pagesVisited) {
    // We've already visited this page, so repeat the crawl
    crawl();
  } else {
    // New page we haven't visited
    visitPage(nextPage, crawl);
  }
}

function visitPage(url, callback) {
  // Add page to our set
  pagesVisited[url] = true;

  // Make the request
  console.log("Visiting page " + url);
  request(url, function(error, response, body) {
     // Check status code (200 is HTTP OK)
     console.log("Status code: " + response.statusCode);
     if(response.statusCode !== 200) {
       callback();
       return;
     }
     // Parse the document body
     var $ = cheerio.load(body);
     collectInternalLinks($);
	     
     callback();

  });
}

function collectInternalLinks($) {
    var absoluteLinks = $("a[href^='http']");
    var allPages = [];

    // Collect ALL urls
    absoluteLinks.each(function() {
        allPages.push($(this).attr('href'));
    });

    // Filter out urls that are not Host to get Remote
    remoteUrls = allPages.filter( (link) => {
      foundUrl = new URL(link);
      foundHost = foundUrl.hostname;
      return urlHost !== foundHost;
    });

    // These are the Remote URLs
    console.log("Found " + remoteUrls.length + " remote URLs on " + baseUrl);

    // Push Remote links onto the pagesToVisit stack
    remoteUrls.forEach( (link) => {
      pagesToVisit.push(link);
    });
}