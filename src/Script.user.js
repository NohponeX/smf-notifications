// ==UserScript==
// @name        smf-notifications
// @namespace   nohponex
// @description  'Live' notifications in-browser notifications for forum thmmy.gr
// @include     https://www.thmmy.gr/smf/
// @include     https://www.thmmy.gr/smf/index.php*
// @exclude     https://www.thmmy.gr/smf/*;wap
// @exclude     https://www.thmmy.gr/smf/*;wap2
// @exclude     https://www.thmmy.gr/smf/*action=admin*
// @exclude     https://www.thmmy.gr/smf/*action=tpmod*
// @exclude     https://www.thmmy.gr/smf/*;imode*
// @exclude     https://www.thmmy.gr/smf/FCKeditor*
// @exclude     https://www.thmmy.gr/smf/*action=printpage*
// @version     1
// @grant       none
// @noframes
// ==/UserScript==

(function() {
  var FORUM_BASE = 'https://www.thmmy.gr/smf/';
  var NOTIFICATION_BUTTON;

  var last = [];
  //Initialize after some minutes
  var initialize = function() {
    //setInterval(req, 60000);
    //setTimeout(req, 10000);

    var css =
      '#smf_notifications{ z-index=-2; position: fixed; right:10px; top:10px; display:block; /* width:48px; height:48px; background-color:red;*/ } \
.badge1 { \
position:relative; \
} \
.smf_button{ \
font-size: 14pt; \
color: white; \
border-radius: 4px; \
text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2); \
background: rgb(223, 117, 20); \
display: inline-block;  \
line-height: normal; \
white-space: nowrap; \
vertical-align: middle; \
text-align: center; \
cursor: pointer; \
-moz-user-select: none; \
box-sizing: border-box; \
} \
.smf_button:hover{ \
box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.15) inset, 0px 0px 6px rgba(0, 0, 0, 0.2) inset; \
color: #111; \
  } \
.badge1[data-badge]:after { \
   content:attr(data-badge); \
   position:absolute; \
   top:-10px; \
   right:-10px; \
   font-size:.7em; \
   background:green; \
   color:white; \
   width:20px;height:20px; \
   text-align:center; \
   line-height:18px; \
   border-radius:50%; \
   box-shadow:0 0 1px #333; \
  } \
#notifications_panel{ \
  position: fixed;  \
top: 45px;  \
right: 0px;  \
width: 300px;  \
box-shadow: 3px 3px 4px #7A7A7A;  \
background-color: #FFF;  \
border: 1px solid #CCC;  \
border-radius: 5px;  \
z-index: 999;  \
} \
#notifications_panel> ul{ \
max-height: 219px; \
overflow-y: auto; \
overflow-x: hidden; \
  } \
#notifications_panel h3{ \
display:inline-block; \
font-size:12pt; \
margin: 2px 1px; \
} \
#notifications_panel .close{ \
font-size: 10pt; \
cursor: pointer; \
position: absolute; \
    right: 5px; \
    top: 2px; \
margin: 0px; \
padding: 0px; \
border:none; \
} \
#notifications_panel> ul, #notifications_panel > ul li{ \
  list-style: outside none none; \
padding: 0px; \
    margin: 0px; \
  } \
#notifications_panel > ul li{ \
  border-top: 1px solid #CCC; \
} \
#notifications_panel > ul li.active{ \
background-color: #C2FFE0; \
} \
.hidden { \
    display: none; \
}';
    var head = document.getElementsByTagName('head')[0];
    var s = document.createElement('style');
    s.appendChild(document.createTextNode(css));
    head.appendChild(s);

    var body = document.getElementsByTagName('body')[0];
    body.insertAdjacentHTML('beforeend',
      '<div id="smf_notifications" ><button type="smf_button" class="smf_button badge1" data-badge="0" title="New replies to your posts">⚑</button></div> \
<div id="notifications_panel" class="hidden"><h3>New replies to your posts</h3><button type="button" class="close">✖</button><ul></ul></div>'
    );

    NOTIFICATION_BUTTON = body.querySelector('#smf_notifications > .badge1');
    NOTIFICATION_PANEL = body.querySelector('#notifications_panel');
    NOTIFICATION_LIST = body.querySelector('#notifications_panel > ul');

    closeButtons = body.querySelectorAll('#notifications_panel .close');
    [].forEach.call(closeButtons, function(item, i) {
      item.onclick = function() {
        NOTIFICATION_PANEL.className = 'hidden';
      };
    });
    last = cache.get('last') || [];

    NOTIFICATION_BUTTON.setAttribute('data-badge', last.length);

    NOTIFICATION_BUTTON.onclick = function() {
      var hidden = NOTIFICATION_PANEL.classList.contains('hidden');
      if (hidden) {
        NOTIFICATION_PANEL.className = '';
      } else {
        NOTIFICATION_PANEL.className = 'hidden';
      }
    };
  };
  var parsePosts = function(doc) {
    x = doc;
    var postEl = doc.querySelectorAll('body #recent p>a[href^="' +
      FORUM_BASE + 'index.php?topic="]');

    var posts = [];
    [].forEach.call(postEl, function(item, i) {
      var href = item.getAttribute('href').toString().replace(';imode',
        '');
      var text = item.innerHTML.trim();

      var matches = href.match(/topic\=(\d+)\.msg(\d+)/);
      if (matches) {
        var postId = matches[2];
      }
      posts.push({
        'text': text,
        'href': href,
        'postId': postId
      });

      itemClass = (i % 2 ? 'active' : '');
      NOTIFICATION_LIST.insertAdjacentHTML('beforeend', '<li class="' +
        itemClass + '"><a href="' + href + '">' + text + '</a></li>');
      //new notifications have active class or something
    });
    //initialize button from localstorage

    NOTIFICATION_BUTTON.setAttribute('data-badge', posts.length);
    var postIds = posts.map(function(x) {
      return x.postId;
    });
    console.log(postIds);
    cache.set('last', postIds);
    return posts;
  };
  var req = function() {
    console.log('request');
    var request = new XMLHttpRequest();
    request.open('GET', FORUM_BASE + 'index.php?action=unreadreplies;wap',
      true);
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(request.responseText,
          'text/html');

        var posts = parsePosts(doc);
        console.table(posts);
      }
    };
    request.onerror = function() {
      console.error('error');
    };
    request.send();
  };
  var cache = {
    prefix: 'smf-notifications',
    set: function(key, value, permanent) {

      if (typeof(Storage) === 'undefined') {
        return null;
      }
      permanent = typeof(permanent) !== 'undefined' ? permanent : false;

      value = JSON.stringify(value);

      var engine = (permanent ? localStorage : sessionStorage);

      return engine.setItem(cache.prefix + key, value);
    },
    get: function(key) {
      if (typeof(Storage) === 'undefined') {
        return null;
      }
      key = cache.prefix + key;

      var result = localStorage.getItem(key);

      if (result) {

        return JSON.parse(result);
      }
      //Try sessionStorage
      result = sessionStorage.getItem(key);

      return JSON.parse(result);
    }
  };
  setTimeout(initialize, 01000);
})();
