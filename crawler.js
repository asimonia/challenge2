// makes HTTP requests
let request = require('request');

// parse and select HTML elements on the page
let cheerio = require('cheerio');

// parse URLs
let URL = require('url-parse');

pageToVisit = "http://www.arstechnica.com";
console.log("Visiting page " + pageToVisit);
request(pageToVisit, (error, response, body) => {
	if (error) {
		console.log("Error: " + error);
	}
	// Check status code (200 is HTTP OK)
	console.log("Status code: " + response.statusCode);
	if (response.statusCode === 200) {
		let $ = cheerio.load(body);
		console.log("Page title: " + $('title').text());
		collectInternalLinks($);
	}

});


function searchForWord($, word) {
	let bodyText = $('html > body').text();
	if (bodyText.toLowerCase().indexOf(word.toLowerCase()) !== -1) {
		return true;
	}
	return false;
}

function collectInternalLinks($) {
	let allRelativeLinks = [];
	let allAbsoluteLinks = [];

	let relativeLinks = $("a[href^='/']");
	relativeLinks.each( () => {
		allRelativeLinks.push($(this).attr('href'));
	});

	let absoluteLinks = $("a[href^='http']");
	absoluteLinks.each( () => {
		allAbsoluteLinks.push($(this).attr('href'));
	});

	console.log("Found " + allRelativeLinks.length + " relative links");
	console.log("Found " + allAbsoluteLinks.length + " absolute links");
}