﻿// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»
// Global variables
'use strict';
var bSmallScreen = false,
    dStreamData = null,
    iStreamPage = 0,
    iStreamPerPage = 100,
    tStreamTable,
    oSlider = null,
    fFilter = "",
    iTriggerWheel = 0,
    iTriggerResize = 0,
    iDetailSize = 0,
    iNewDetailSize = 0,
    bDetailAttached = false;



// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»
// Initial settings

function onPageLoad() {

    // Esc and Enter keys event
    $(document).keydown(function (event) {
        if (event.keyCode === 27) {
            hideAbout();
            if (!bDetailAttached) {
                hideDetail();
            }
            hideFilter();
            hideThumb();
            $('html,body').css('cursor', 'default');
        }
        // if (event.keyCode === 13) {
        //    event.preventDefault();
        //    event.stopImmediatePropagation();
        // }
    });

    // Window resize event
    $(window).resize(function () {
        iTriggerResize++;
        if (iTriggerResize === 1) {
            hideDetail(true);
            hideAbout(true);
            hideFilter(true);
        }
        setTimeout(function () {
            iTriggerResize--;
            if (iTriggerResize === 0) {
                verifySmallScreen(); // Only called once if many events trigger in a row...
            }
        });
    });

    // Set detail mouse wheel behaviour (these events are not standard so some browsers only recognize some of them, and others may trigger several...)
    $('#divDetail').bind('wheel mousewheel DOMMouseScroll', function (e) {
        iTriggerWheel++;
        setTimeout(function () {
            iTriggerWheel--;
            if (iTriggerWheel === 0) {
                changeDetail(mouseWheelUp(e));
            }
        });
    });
    // Set slider mouse wheel behaviour (these events are not standard so some browsers only recognize some of them, and others may trigger several...)
    $('#divImages').bind('wheel mousewheel DOMMouseScroll', function (e) {
        if (oSlider != null) {
            iTriggerWheel++;
            setTimeout(function () {
                iTriggerWheel--;
                if (iTriggerWheel === 0) {
                    if (mouseWheelUp(e)) {
                        oSlider.goToNextSlide();
                    }
                    else {
                        oSlider.goToPrevSlide();
                    }
                }
            });
        }
    });
 
    // Chosen and change event
    $('#selectStream').chosen({
        search_contains: true,
        allow_single_deselect: true,
        width: 150
    }).change(function () {
        getStream($('#selectStream').val());
    });

    // Set image load behaviour
    $('#imgDetail').on('load', function () {
        onDetailLoad();
    });

    // Draggable divs
    // TODO JC
    //$('#divDetail').draggable({ handle: '#divDetailHead' });
    $('#divAbout').draggable({ handle: '#divAboutHead' });

    // DataTable creation and onclick event in rows
    tStreamTable = $('#tableStreamTable').DataTable({
        pageLength: 5,
        columnDefs: [
            { targets: [0, 1, 3], visible: true},
            { targets: '_all', visible: false }
        ],
        dom: 'rftip'
    });
    $('#tableStreamTable tbody').on('click', 'tr', function () {
        hideFilter();
        oSlider.goToSlide(showDetail(tStreamTable.row(this).data()[4]));
        if (!bDetailAttached) {
            toggleAttach();
        }
    });

    // Screen verification and initial stream
    verifySmallScreen();
    iDetailSize = bSmallScreen ? 6 : 7;
    iNewDetailSize = iDetailSize;
    getStream($('#selectStream').val());
}

// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»



// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»
// Generic functions

function detachLink(sLink) {

    setTimeout(function () {
        window.open(sLink, '_blank');
    });
}

function isEmptyString(str) {

    return (!str || str === "");
}

function preventEmptyTitle(sTitle) {

    return (isEmptyString(sTitle) ? "<em><small>photo without title<small></em>" : sTitle)
}

function verifySmallScreen() {
    var bLastSize = bSmallScreen;
    
    bSmallScreen = $(document).width() < 900 || $(document).height() < 700; // Small screen calculation
    if (bSmallScreen != bLastSize) {
        if (bSmallScreen) {
            $('#labelStream,#labelFilter').hide();
        }
        else {
            $('#labelStream,#labelFilter').show();
        }
        buildSlider();
    }
    else {
        if (oSlider != null) {
            oSlider.refresh();
        }
    }
}

function mouseWheelUp(event) {

    if (typeof(event.originalEvent.wheelDelta) != "undefined") {
        return event.originalEvent.wheelDelta > 0; // Chrome and Edge
    }
    else {
        return event.originalEvent.detail < 0; // Firefox
    }
}

// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»



// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»
// Filter functions

function showFilter() {

    if (isDetailDetached()) {
        toggleAttach();
    }
    $('#divFilter').css('left', 20).css('top', 100).css('width', $(document).width() - 60).slideDown();
    $('#spanFilterIcon').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down').attr("title", "Hide stream filter");
    tStreamTable.columns.adjust().draw();
}

function hideFilter(bInstant) {

    if (bInstant) {
        $('#divFilter').hide();
    }
    else {
        $('#divFilter').slideUp();
    }
    $('#spanFilterIcon').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right').attr("title", "Show stream filter");
    hideThumb();
}

function toggleFilter() {

    if ($('#divFilter:visible').length != 0) {
        hideFilter();
    }
    else {
        showFilter();
    }
}

// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»



// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»
// Thumbnail functions

// Show thumbnail image over table cell
function showThumb(iThumbIndex) {

    setTimeout(function () {
        if ($('#divThumb:visible').length == 0) {
            var oThumb = $('#thumb_' + iThumbIndex),
                oContainerPos = $('#divFilter').position(),
                oThumbPos = oThumb.position();

            $('#imgThumb').attr("src", oThumb.attr("data-square-url"));
            $('#divThumb').css('left', oContainerPos.left + oThumbPos.left + oThumb.width() + 40).css('top', oContainerPos.top + oThumbPos.top + 20).fadeIn();
        }
    });

    return false;
}

function hideThumb(bInstant) {

    if (bInstant) {
        $('#divThumb').hide();
    }
    else {
        $('#divThumb').fadeOut();
    }
    $('#imgThumb').attr("src", "//:0");

    return false;
}

// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»



// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»
// Slider functions

function buildSlider() {

    $('#divImages').empty();
    oSlider = null;
    if (dStreamData != null) {
        $('<ul id="lightSlider"/>').appendTo('#divImages');
        $.each(dStreamData.photos.photo, addToSlider);
        oSlider = $('#lightSlider').lightSlider({
            slideMove: 2,
            controls: true,
            pager: false,
            autoWidth: true,
            keyPress: true,
            prevHtml: '<span class="glyphicon glyphicon-chevron-left" style="font-size: x-large; color: lightgray; padding-top: 2px;"></span>',
            nextHtml: '<span class="glyphicon glyphicon-chevron-right" style="font-size: x-large; color: lightgray; padding-top: 2px;"></span>'
        });
    }
}

function addToSlider(i, item) {
    $('<img/>')
        .attr('id', item.id)
        .attr('src', bSmallScreen ? item.url_sq : item.url_q)
        .attr('title', item.title)
        .attr('class', "thumb")
        .attr('onclick', "showDetail('" + item.id + "');")
        .css('width', bSmallScreen ? 75 : 150)
        .css('height', bSmallScreen ? 75 : 150)
        .appendTo($('<li class="lslide"/>').appendTo('#lightSlider')); // Class 'lslide' needs to be added if adding to already existing slide...
}

// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»



// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»
// Image detail functions

function onDetailLoad() {

    $('#divDetailInfo').css('width', $('#imgDetail').width() + 45); // Image size plus adjustments for several ui elements (not very pretty)...
    $('#imgDetail').removeClass('old');
    $('html,body').css('cursor', 'default');
}

function changeDetail(bUp) {

    iNewDetailSize = bUp ? Math.min(iDetailSize + 1, 9) : Math.max(iDetailSize - 1, 6); // There are 10 possible sizes, but we're only using 4.
    
    return showDetail($('#imgDetail').attr("data-id"));
}

function setDetailSize(url, order, size) {
    var link;

    switch (order) {
        case 6:
            link = $('#url_mIcon');
            break;
        case 7:
            link = $('#url_zIcon');
            break;
        case 8:
            link = $('#url_cIcon');
            break;
        case 9:
            link = $('#url_lIcon');
            break;
    }
    link.removeClass().attr("onclick", "return false;");
    if (typeof(url) != "undefined") { // Size exists
        if (iNewDetailSize === order) { // Sucess, we're trying to show a size that is available
            link.attr("title", "Photo is shown in " + size).addClass('selected');
            $('html,body').css('cursor', 'wait');
            $('#imgDetail').addClass('old').attr("src", url);
            iDetailSize = iNewDetailSize;
        }
        else { // Size exists but we're not trying to show it
            link.attr("title", "Show photo in " + size).attr("onclick", "iNewDetailSize = " + order + "; showDetail($('#imgDetail').attr('data-id'));");
        }

        return true;
    }
    else { // Size not available
        link.attr("title", "This size is not available").addClass('disabled');

        return iNewDetailSize != order; // false if we're trying to show a size that is not available!
    }
}

function showDetail(sID) {
    var detail = null,
        index = -1,
        size = 5;
    
    if (dStreamData != null) {
        $.each(dStreamData.photos.photo, function (i, item) {
            if (item.id == sID) {
                detail = item;
                index = i;

                return false;
            }
        });
        
        if (index >= 0) {
            // Image information
            $('#labelDetailTitle').html(preventEmptyTitle(detail.title));
            $('#imgDetail').attr("data-id", detail.id).attr("title", detail.title);
            $('#aDetailTitle').html(preventEmptyTitle(detail.title)).attr("onclick", "openPhotoPage('" + detail.id + "');");
            $('#aDetailAuthor').html(detail.ownername).attr("onclick", "detachLink('https://www.flickr.com/people/" + detail.owner + "/');");
            $('#pDetailDescription').html(detail.description._content);
            $('#pDetailTags').html(isEmptyString(detail.tags) ? "<em>Photo without tags</em>" : "<b>Tags: </b>" + detail.tags);
            // Image sizes
            if (typeof (detail.url_o) != "undefined") {
                $('#OriginalIcon').attr("title", "Show original photo in new tab").attr("onclick", "detachLink('" + detail.url_o + "');").removeClass('disabled');
            }
            else {
                $('#OriginalIcon').attr("title", "Original photo not available").attr("onclick", "return false;").addClass('disabled');
            }
            while (!(setDetailSize(detail.url_l, 9, detail.width_l + "x" + detail.height_l) && // Trying to show a size that is not available
                     setDetailSize(detail.url_c, 8, detail.width_c + "x" + detail.height_c) &&
                     setDetailSize(detail.url_z, 7, detail.width_z + "x" + detail.height_z) &&
                     setDetailSize(detail.url_m, 6, detail.width_m + "x" + detail.height_m))) {
                if (iNewDetailSize === iDetailSize && size < 9) { // Trying to show an image with the same size as the previous one (thus, not a result of mouse wheel) AND haven't tried all sizes yet
                    iNewDetailSize = ++size; // Then we try a new size
                    iDetailSize = iNewDetailSize;
                }
                else {
                    iNewDetailSize = iDetailSize;
                    break;
                }
            }
            // Show image
            $('#divDetail').fadeIn();
        }
    }

    return index;
}

function hideDetail(bInstant) {

    if (bInstant) {
        $('#divDetail').hide();
    }
    else {
        $('#divDetail').fadeOut();
    }

    return false;
}

function toggleAttach() {

    $('#divDetail').hide();
    if (bDetailAttached) {
        $('#divDetail').removeClass('attached').addClass('detached');
        $('#AttachIcon > span').removeClass('glyphicon-new-window').addClass('glyphicon-pushpin');
        $('#AttachIcon').attr("title", "Pin to page");
    }
    else {
        $('#divDetail').removeClass('detached').addClass('attached');
        $('#AttachIcon > span').removeClass('glyphicon-pushpin').addClass('glyphicon-new-window');
        $('#AttachIcon').attr("title", "Unpin from page");
    }
    bDetailAttached = !bDetailAttached;
    $('#divDetail').fadeIn();
}

function toggleImageInfo() {

    if ($('#divDetailInfo:visible').length > 0) {
        $('#ImageInfoIcon > span').removeClass('glyphicon-eye-close').addClass('glyphicon-eye-open');
        $('#ImageInfoIcon').attr("title", "Show image info");
        $('#divDetailInfo').hide();
    }
    else {
        $('#ImageInfoIcon > span').removeClass('glyphicon-eye-open').addClass('glyphicon-eye-close');
        $('#ImageInfoIcon').attr("title", "Hide image info");
        $('#divDetailInfo').show();
        onDetailLoad();
    }
}

function isDetailDetached() {

    return $('#divDetail:visible').length != 0 && !bDetailAttached;
}

// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»



// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»
// About functions

function showAbout() {

    if ($('#divAbout:visible').length === 0) {
        var docWidth = $(document).width(),
            divWidth = Math.min(400, docWidth),
            divX = (docWidth / 2) - (divWidth / 2),
            docHeight = $(document).height(),
            divY = (docHeight / 4);

        $('#divAboutProtector').css('left', 0).css('top', 0).css('width', docWidth).css('height', docHeight).fadeIn();
        $('#divAbout').css('left', divX).css('top', divY).css('width', divWidth).slideDown();
    }

    return false;
}

function hideAbout(bInstant) {

    if (bInstant) {
        $('#divAbout,#divAboutProtector').hide();
    }
    else {
        $('#divAbout').slideUp();
        $('#divAboutProtector').fadeOut();
    }

    return false;
}

// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»
