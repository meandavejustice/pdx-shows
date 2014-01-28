#! /usr/bin/env node

var Table = require('cli-table');
var request = require('request');
var cheerio = require('cheerio');
var charm = require('charm')(process);
var chunk = '';
var $;

module.exports = function() {
  charm.reset();
  charm.foreground('magenta');
  charm.write('Checking for something todo in Portland for ' + new Date().toDateString());
  charm.display('reset')
  charm.write('\n\n\n')
  request.get('http://pc-pdx.com/show-guide')
    .on('data', function(data) {
      chunk += data.toString();
    })
    .on('end', function() {
      $ = cheerio.load(chunk);
      parseBody();
    })

  function parseBody() {
    var shows = [];
    $('.show-listing').each(function(i, s) {shows.push(parseShow(s))})
      createTable(shows);
  }

  function parseShow(listing) {
    var $listing = $(listing);
    var artists = [];
    $listing.find('.artist-list li').each(function(i, a) {
      artists.push($(a).text());
    });

    var venue = $listing.find('.venues').text();
    var details = $listing.find('.detail').text().split('|');
    var time = details[0];
    var cost = details[1];

    return [artists.join(',\n'), venue, time, cost]
  }

  function createTable(data) {
    var table = new Table({ 
      head:      ['Artists', 'Venue', 'Time', '$'],
      colWidths: [35, 25, 10, 20]
    });

    data.forEach(function(sho) {
      table.push(sho);
    })

    console.log(table.toString());
    process.exit()
  }
}
