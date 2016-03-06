// ==UserScript==
// @name        PSNprofiles.net enhancements
// @icon        http://psnprofiles.com/forums/favicon.ico
// @namespace   http://www.loigistal.at/userscripts/
// @updateURL   https://github.com/Barokai/psnprofiles-enhanced/raw/master/psnprofiles-enhanced.user.js
// @version     0.78
// @description On guide pages: adds a button to hide earend trophies, their description and links and uses a new style for earned trophies, On all pages: adds update button
// @match       http://psnprofiles.com/*
// @grant       GM_addStyle
// @require     http://code.jquery.com/jquery-latest.js
// @copyright   2016+, Barokai
// ==/UserScript==

// better visible green for earned trophies, used before: #57FF3B
/*jshint multistr: true */
GM_addStyle ("\
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
function addToggleEarnedButton(){
    // add class earned to all links which match earned trophies in overview-info box
    $('.earned > a').each(function(){
        var trophyName = $(this).text().trim();
        $('nobr > a:contains(' + trophyName + ')').addClass("earned");
    });

    // adds class "earned" to sections to hide them with the same toggle function
    $("img[class*='earned']").each(function(){
        $($(this).closest("div[class*='section-holder']")).addClass("earned");
    });

    // adds button for toggling to overview info box
    $(".overview-info").append('<span class="tag" id="toggleEarned" title="click to toggle visiblity of earned trophies"><span>toggle</span>earned</span>');
    $(document).on("click", "#toggleEarned", toggleEarned);
}

function addToggleTypeButton(){
    // get trophy types (without spaces) - used as classes to toggle them later.
    var trophyTypes = $('table.invisible .tag').map(function(i, el) {
        var type = $(el);
        var typeName = type.text().replace(/\s+/g, '');
        // add toggle visibility to type boxes
        type.click(function(e){
            toggleClass(e, typeName);
        });
        return typeName;
    }).get();

    // get corresponding trophies - start with the ones in overview box
    $('table.invisible td small').each(function(index){
        var typeClassName = trophyTypes[index];
        var trophyHref = $("nobr a",  $(this));
        // add class to all found hrefs for this section
        trophyHref.addClass(typeClassName);

        trophyHref.each(function(){
            var trophyName = $(this).text();

            // contents of roadmap
            $(".roadmap-trophies li:contains("+trophyName+")").addClass(typeClassName);

            // all the sections
            $("div[class*='element section-holder']:contains("+trophyName+")").addClass(typeClassName);

            // next the ones in the guide contents on the right
            $('#TOCList li:contains('+trophyName+')').addClass(typeClassName);

            // add class to trophies which are found in multible type sections
            $('table.invisible nobr a:contains('+trophyName+')').addClass(typeClassName);
        });
    });
}

function toggleEarned(e){
    toggleClass(e, "earned");
}

function toggleClass(e, className){
    var element;

    // get correct element (togglebutton's layout would be destroyed otherwise)
    if(e.target.parentNode.id != "toggleEarned"){
        element = e.target;
    } else {
        element = e.target.parentNode;
    }

    if(element.innerHTML.indexOf(" *") >= 0){
        element.innerHTML = element.innerHTML.slice(0,-2);
    } else {
        element.innerHTML += " *";
    }

    $("." + className).toggle( "slow", function(e) { /* Animation complete. */ });
}
/* Guide enhancements end --------------------------------------------------- */

//profile enhancements
function addSortByRank(){
    $('.dropdown').eq(2).find('.dropdown-menu').append(
        $('<li><a href="">Rank DESC</a></li>').on('click', function(ev) {
            ev.preventDefault();
            var trophyOrder = ['F','E','D','C','B','A','S'];
            for (var r=0; r<=trophyOrder.length; r++){
                jQuery('.'+trophyOrder[r]).each(function() {
                    jQuery('#gamesTable').append(jQuery(this).closest('tr'));
                });
            }
        })
    );
}

/* Global enhancements ------------------------------------------------------ */
function addUpdateButton(){
    $('.navigation > ul').append("<li><a href='/?update'>Update</a></li>");
    // TODO check if successfully updated and redirect to the last visited page (where update was clicked)
}
/* Global enhancements end ---------------------------------------------------*/

/* -------------------------------------------------------------------------- */
/* apply enhancements to correct pages -------------------------------------- */
/* -------------------------------------------------------------------------- */

// add toggle button functionality to all guides (if any earned trophies were found
if (document.location.pathname.indexOf("/guide/") === 0) {
    var earnedTrophies = $('.earned > a').length;
    if(earnedTrophies > 0){
        addToggleEarnedButton();
    }

    addToggleTypeButton();
}

// add update button to navigation on all psnprofile pages
addUpdateButton();

// add only on profile pages and others where a sort dropdown is
addSortByRank();
