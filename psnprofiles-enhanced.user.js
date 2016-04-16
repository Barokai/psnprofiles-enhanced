// ==UserScript==
// @name        PSNprofiles.net enhancements
// @author      Barokai | www.loigistal.at
// @icon        http://psnprofiles.com/forums/favicon.ico
// @namespace   http://www.loigistal.at/userscripts/
// @homepage    https://github.com/Barokai/psnprofiles-enhanced/
// @license     https://github.com/Barokai/psnprofiles-enhanced/blob/master/LICENSE
// @updateURL   https://github.com/Barokai/psnprofiles-enhanced/raw/master/psnprofiles-enhanced.user.js
// @version     0.83
// @description On guide pages: adds a button to hide earend trophies, their description and links and uses a new style for earned trophies, On all pages: adds update button, On game pages: persist search string
// @match       http://psnprofiles.com/*
// @grant       GM_addStyle
// @require     http://code.jquery.com/jquery-latest.js
// @copyright   2016+, Barokai
// ==/UserScript==

// better visible green for earned trophies, used before: #57FF3B
/*jshint multistr: true */
GM_addStyle("\
.tableofcontents li.earned {	\
background: #bada55 !important;  \
} \
.roadmap-trophies li.earned { \
background: #bada55 !important; \
} \
#toggleEarned { \
background-color: #bada55; \
} \
#toggleEarnedOld { \
height: 25px; \
background: none;\
border: none;\
color: white;\
margin: 0; \
padding: 0;\
}");


/* Guide enhancements ------------------------------------------------------- */
// TODO barokai: fix scrolling behavior when trophies are hidden and a trophy link is clicked in Guide Contens column (ID="TOCWrapper")
function addToggleEarnedButton() {
  // add class earned to all links which match earned trophies in overview-info box
  $('.earned > a').each(function() {
    var trophyName = $(this).text().trim();
    $('nobr > a:contains(' + trophyName + ')').addClass("earned");
  });

  // adds class "earned" to sections to hide them with the same toggle function
  $("img[class*='earned']").each(function() {
    $($(this).closest("div[class*='section-holder']")).addClass("earned");
  });

  // adds button for toggling to overview info box
  $(".overview-info").append('<span class="tag" id="toggleEarned" title="click to toggle visiblity of earned trophies"><span>toggle</span>earned</span>');
  $(document).on("click", "#toggleEarned", toggleEarned);
}

function addToggleTypeButton() {
  // get trophy types (without spaces) - used as classes to toggle them later.
  var trophyTypes = $('table.invisible .tag').map(function(i, el) {
    var type = $(el);
    var typeName = type.text().replace(/\s+/g, '');
    // add toggle visibility to type boxes
    type.click(function(e) {
      toggleClass(e, typeName);
    });
    return typeName;
  }).get();

  // get corresponding trophies - start with the ones in overview box
  $('table.invisible td small').each(function(index) {
    var typeClassName = trophyTypes[index];
    var trophyHref = $("nobr a", $(this));
    // add class to all found hrefs for this section
    trophyHref.addClass(typeClassName);

    trophyHref.each(function() {
      var trophyName = $(this).text();

      // contents of roadmap
      $(".roadmap-trophies li:contains(" + trophyName + ")").addClass(typeClassName);

      // all the sections
      $("div[class*='element section-holder']:contains(" + trophyName + ")").addClass(typeClassName);

      // next the ones in the guide contents on the right
      $('#TOCList li:contains(' + trophyName + ')').addClass(typeClassName);

      // add class to trophies which are found in multible type sections
      $('table.invisible nobr a:contains(' + trophyName + ')').addClass(typeClassName);
    });
  });
}

function toggleEarned(e) {
  toggleClass(e, "earned");
}

function toggleClass(e, className) {
  var element;

  // get correct element (togglebutton's layout would be destroyed otherwise)
  if (e.target.parentNode.id != "toggleEarned") {
    element = e.target;
  } else {
    element = e.target.parentNode;
  }

  if (element.innerHTML.indexOf(" *") >= 0) {
    element.innerHTML = element.innerHTML.slice(0, -2);
  } else {
    element.innerHTML += " *";
  }

  $("." + className).toggle("slow", function(e) { /* Animation complete */ });
}
/* Guide enhancements end --------------------------------------------------- */

/* Profile enhancements ----------------------------------------------------- */

// thanks to serverTimeout for sort by rank (his profile: http://psnprofiles.com/forums/user/80890-servertimeout/)
// see his post here: http://psnprofiles.com/forums/topic/24324-sort-by-rank/?view=findpost&p=647509
function addSortByRank() {
  var dropdown = $('.dropdown').eq(2).find('.dropdown-menu');
  var buttonNameAsc = "Rank E-S";
  dropdown.append(
    $('<li><a href="">' + buttonNameAsc + '</a></li>').click(function(e) {
      sort(e, '+', buttonNameAsc); // + for ascending sort
    })
  );
  var buttonNameDesc = "Rank S-E";
  dropdown.append(
    $('<li><a href="">' + buttonNameDesc + '</a></li>').click(function(e) {
      sort(e, '-', buttonNameDesc); // - for descending sort
    })
  );
}

function sort(e, order, buttonName) {
  e.preventDefault();
  var trophyOrder = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];
  var r;
  if (order === '+') {
    for (r = 0; r <= trophyOrder.length; r++) {
      // TODO: sort ranks by percent before
      $('.' + trophyOrder[r]).each(function() {
        $('#gamesTable').append($(this).closest('tr'));
      });
    }
  }
  if (order === '-') {
    for (r = trophyOrder.length; r >= 0; r--) {
      // TODO: sort ranks by percent before
      $('.' + trophyOrder[r]).each(function() {
        $('#gamesTable').append($(this).closest('tr'));
      });
    }
  }

  // set dropdown button name when new order was set
  $('.dropdown-toggle.order').text("Order (" + buttonName + ")");
}
/* Profile enhancements end ------------------------------------------------- */

/* Global enhancements ------------------------------------------------------ */
function addUpdateButton() {
  $('.navigation > ul').append("<li><a href='/?update'>Update</a></li>");
  // TODO barokai: check if successfully updated and redirect to the last visited page (where update was clicked)
}
/* Global enhancements end ---------------------------------------------------*/

/* Games page enhancements -------------------------------------------------- */

// thanks to dernop for this searchFix (his profile: http://psnprofiles.com/forums/user/45256-dernop/)
// see his post here: http://psnprofiles.com/forums/topic/32107-bugsoddities-in-the-games-search-feature/#entry777278
function gameSearchFix() {
  $('#searchGames').off('keyup');
  $('#searchGames').keyup(function() {
    window.clearTimeout('searchInt');
    var input = $(this);
    if (input.val().length > 1) {
      $('#loading').show();
      $('#closeButton').hide();

      var searchInt = window.setTimeout(
        function() {
          $('#pagination').hide();
          var q = encodeURIComponent(input.val());
          $.ajax({
            url: "/php/liveSearch.php?t=g&q=" + q,
            success: function(html) {
              window.location.hash = '#!' + q;
              $('#game_list').html(html);
              $('#loading').hide();
              $('#closeButton').show();
            }
          });
        }, 500);
    } else {
      $('#loading').hide();
    }
  });
  var query = decodeURIComponent(window.location.hash.replace('#!', ''));

  if (query.length > 0) {
    $('#searchGames').val(query).keyup();
  }
}

// TODO barokai: integrate other func in psnp
var psnp = {
  id: $('div.user-menu a.dropdown-toggle span').text(),
  _gamesTable: $('table#gamesTable'), // game table on user profile
  _gameList: $('table#game_list'),
  _profileBar: $('div.profile-bar')
};
// add percentage on mouseover or integrate into game row
// add mouse over information like percentage (last row), last played if available etc.
// thanks to dernop (again) - http://psnprofiles.com/forums/topic/35583-add-possibility-to-hide-earned-trophies-in-guides-with-userscript/#entry932561
$(function() {
  // initialize psnp page/DOM information

  // psnp properties
  $.extend(psnp, {
    isProfile: psnp._gamesTable[0] !== undefined && psnp._profileBar[0] !== undefined,
    isOwnProfile: $(psnp._profileBar).find('div.info').text().indexOf(psnp.id) > -1,
    isGameList: psnp._gameList.length == 1,
    myGames: JSON.parse(localStorage.getItem('_mygames')) || {}
  });

  psnp.updateMyGames = function(games) {
    var count = 0;
    $.each(games, function(i, e) {
      psnp.myGames[e.id] = e;
      count++;
    });
    localStorage.setItem('_mygames', JSON.stringify(psnp.myGames));
    console.log(count + " games added/updated to localstorage.");
  };

  // PROFILE / GAME LIST
  psnp.gameList = (function() {
    if (!psnp.isProfile)
      return undefined;
    var _games = [];
    // register mutationobserver for gameList to handle 'load-on-scroll'
    var obs = new MutationObserver(function(mutations) {
      parseGames(); // just re-parse all games if list has changed.
    });
    obs.observe(psnp._gamesTable[0], {
      childList: true,
      subtree: true
    });

    // parse PSNP games table (id, name, completion, # of trophies)
    function parseGames() {
      _games = [];
      psnp._gamesTable.find('tr:has(a.bold)').each(function(i, row) {
        var title = $(row).find('a.bold')[0];
        var game = {
          id: title.href.match(/\/trophies\/([^\/]+)/)[1],
          name: title.innerText,
          progress: $(row).find('div.progress_outer span').text(),
          completed: $(row).hasClass('completed'),
          platinum: $(row).hasClass('platinum'),
          gold: $(row).find('li.gold').text(),
          silver: $(row).find('li.silver').text(),
          bronze: $(row).find('li.bronze').text(),
        };

        if (!psnp.isOwnProfile && psnp.myGames[game.id]) {
          var img = $(row).find('img.trophy_image');
          img.removeClass('no-border').addClass('earned'); // mark owned games
        }
        _games.push(game);
      });

      // if this is our own profile, save the games list.
      if (psnp.isOwnProfile) {
        psnp.updateMyGames(_games);
      }
    }

    // parse game list initially
    parseGames();

    return {
      games: _games
    };
  })();

  // #GAMELIST#  global list of games (psnprofiles.com/games)

  // Mark owned game in "Games" list
  if (psnp.isGameList) {
    psnp._gameList.find('tr:has(a.bold)').each(function(i, row) {
      var title = $(row).find('a.bold')[0];
      var id = title.href.match(/\/trophies\/([^\/"]+)/)[1];
      var img = $(row).find('img.trophy_image');

      // mark owned games
      if (psnp.myGames[id]) {
        if (psnp.myGames[id].platinum)
          $(row).addClass('platinum'); // add platinum row style
        if (psnp.myGames[id].completed)
          $(row).addClass('completed'); // add completed row style

        img.removeClass('no-border').addClass('earned');
        if (psnp.myGames[id].progress != '100%')
          img.css('border-color', 'yellow'); //

        // add completion percentage
        var avgProgress = $(row).children('td:eq(4)').find('span.typo-top');
        console.log(avgProgress);
        avgProgress.text(psnp.myGames[id].progress + " / " + avgProgress.text());

      }
    });
  }
});

/* Games page enhancements end -----------------------------------------------*/

// helperfunction to determine if the url matches a certain segment
function matchesUrl(urlSegment) {
  return document.location.pathname.indexOf(urlSegment) === 0;
}

/* -------------------------------------------------------------------------- */
/* Apply enhancements to correct pages -------------------------------------- */
/* -------------------------------------------------------------------------- */

// add toggle button functionality to all guides (if any earned trophies were found
matchesUrl("/guide/") && addToggleTypeButton();
matchesUrl("/guide/") && $('.earned > a').length > 0 && addToggleEarnedButton();
// add searchFix to games page
matchesUrl("/games") && gameSearchFix();
// add update button to navigation on all psnprofile pages (if logged in)
psnp.id && addUpdateButton();
// add only on profile pages and others where a sort dropdown is
matchesUrl("/" + psnp.id) && addSortByRank();
