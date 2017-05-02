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
var converted = document.getElementById("converted");

start.addEventListener("click", startScript);

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
    alert("Found " + remoteUrls.length + " remote URLs on " + baseUrl);

    // Add remote URL history to keep track of remote URLs found
    urlHistory.push({[baseUrl]: remoteUrls.length})

    // Generate table for URL History
    generate_table(urlHistory);
    
    // Push Remote links onto the pagesToVisit stack
    remoteUrls.forEach( (link) => {
      pagesToVisit.push(link);
    });
}

function generate_table(urlHistory) {
  console.log(urlHistory);
 
  // creates a <table> element and a <tbody> element
  var tbl = document.createElement("table");
  var tblBody = document.createElement("tbody");
 
  // creating all cells
  for (var i = 0; i < 2; i++) {
    // creates a table row
    var row = document.createElement("tr");
 
    for (var j = 0; j < 2; j++) {
      // Create a <td> element and a text node, make the text
      // node the contents of the <td>, and put the <td> at
      // the end of the table row
      var cell = document.createElement("td");
      var cellText = document.createTextNode("cell in row "+i+", column "+j);
      cell.appendChild(cellText);
      row.appendChild(cell);
    }
 
    // add the row to the end of the table body
    tblBody.appendChild(row);
  }
 
  // put the <tbody> in the <table>
  tbl.appendChild(tblBody);
  // appends <table> into <body>
  converted.appendChild(tbl);
  // sets the border attribute of tbl to 2;
  tbl.setAttribute("border", "2");
}