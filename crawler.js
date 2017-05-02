var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var pagesVisited = {};              // set of pages that have been visited
var pagesToVisit = [];              // pages to visit
var url = "";                       // current URL
var baseUrl = "";                   // current URL from URL(url)
var urlHost = "";                   // current URL host
var urlHistory = [];                // tracks Found x remote URLs on Domain.com

// get references to elements in DOM
var weburl = document.getElementById("weburl");
var start = document.getElementById("start");
var results = document.getElementById("results");

start.addEventListener("click", startScript);
results.addEventListener("click", generateTable);

function startScript() {
  var START_URL = weburl.value;
  url = new URL(weburl.value);
  weburl.value = "";
  baseUrl = url.protocol + "//" + url.hostname;
  urlHost = url.hostname;
  pagesToVisit.push(START_URL);
  crawl();  
}

function crawl() {
  var nextPage = pagesToVisit.pop();
  nextPageUrl = new URL(nextPage);
  if (nextPageUrl.hostname in pagesVisited) {
    // We've already visited this domain, so repeat the crawl
    crawl();
  } else {
    // New page we haven't visited
    visitPage(nextPage, crawl);
  }
}

function visitPage(url, callback) {
  // Add page to our set
  var hostname = new URL(url);
  pagesVisited[hostname.hostname] = true;

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
     collectInternalLinks($, url);
	   
     callback();

  });
}

function collectInternalLinks($, url) {
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
    var hostname = new URL(url);
    alert("Found " + remoteUrls.length + " remote URLs on " + hostname.hostname);

    // Add remote URL history to keep track of remote URLs found
    urlHistory.push({
      "key": hostname.hostname,
      "value": remoteUrls.length
    });
    
    // Push Remote links onto the pagesToVisit stack
    remoteUrls.forEach( (link) => {
      pagesToVisit.push(link);
    });
}

function generateTable() {
  var tbody = document.getElementById('tbody');
  tbody.innerHTML = "";
  for (var i = 0; i < Object.keys(urlHistory).length; i++) {
      var tr = "<tr>";
      tr += "<td>" + urlHistory[i].key + "</td>" + "<td>" + urlHistory[i].value.toString() + "</td></tr>";
      tbody.innerHTML += tr;
  }
}