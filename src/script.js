// ==UserScript==
// @name        smf-notifications
// @namespace   nohponex
// @description  'Live' notifications in-browser notifications for smf bulletin boards
// @include     https://www.thmmy.gr/smf/*
// @exclude     https://www.thmmy.gr/smf/*;wap
// @exclude     https://www.thmmy.gr/smf/*;wap2
// @exclude     https://www.thmmy.gr/smf/index.php?action=admin*
// @version     1
// @grant       none
// ==/UserScript==
var x;
(function () {
  var FORUM_BASE = 'https://www.thmmy.gr/smf/';
  var initialize = function () {
    console.log('initialize');
     //setInterval(req, 10000);
    setTimeout(req, 1000);
  };
  var parse_posts = function (doc) {
    x = doc;
    var post_el = doc.querySelectorAll('body card p>a[href^="' + FORUM_BASE + 'index.php?topic="]');
    
    var posts = [];
    [].forEach.call(post_el, function (item, i) {
      var href = item.getAttribute('href');
      var text = item.innerHTML.trim();
      posts.push({'text': text, 'href': href});
    });
    return posts;
  };
  var req = function () {
    console.log('request');
    var request = new XMLHttpRequest();
    request.open('GET', FORUM_BASE + 'index.php?action=unreadreplies;wap', true);
    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(request.responseText, 'text/html');
        
        var posts = parse_posts(doc);
        console.table(posts);
      }
    };
    request.onerror = function () {
      console.error('error');
    };
    request.send();
  };
  initialize();
}) ();

console.log('script');

