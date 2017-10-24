// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»
// Global variables
'use strict';
var oSlider = null, // Photo slider object
    dStreamData = null, // All the photo information returned from flickr api
    sLastStream = "", // Last requested stream
    tStreamTable, // Photo search table object
    iStreamPage = 0, // Stream loading control - current loaded page
    iStreamPerPage = 15, // Stream loading control - number of photos per page
    sliderBar = { count: 0, start: 0 }, // Slider bar info
    iTriggerLazy = 0, // Deal with multiple Lazy Load events
    iTriggerWheel = 0, // Deal with multiple wheel events
    iTriggerResize = 0, // Deal with multiple resize events
    iTriggerThumb = 0, // Deal with multiple thumb events
    iDetailSize = 0, // Current detail size
    iNewDetailSize = 0, // Intended detail size
    iBoxMargin = 20, // Minimum box distance to document limit 
    dragDif = { X: 0, Y: 0 }, // Helper for the image detail drag
    lastWindowSize = { width: 0, height: 0 },
    bSmallScreen = false, // Small screen mode
    bLastFilter = false, // Last filter toggle
    bDetailAttached = false, // Photo detail state - Attached to page
    bDetailOff = false; // To prevent showing detail on slider drag



// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»
// Initial settings

function onPageLoad() {

    // Esc key event
    $(document).keydown(function (event) {
        if (event.keyCode === 27) {
            hideAbout();
            if (isDetailDetached()) {
                toggleAttach();
            }
            hideFilter();
            hideThumb();
        }
    });

    // Window resize event
    $(window).resize(function () {
        var width = $(document).width(),
            height = $(document).height();

        iTriggerResize++;
        if (iTriggerResize === 1) { // First trigger, even if many events trigger in a row...
            hideAbout(true);
        }
        if (width != lastWindowSize.width) { // Close filter only on width resize
            hideFilter(true);
        }
        lastWindowSize.width = width;
        lastWindowSize.height = height;

        setTimeout(function () {
            iTriggerResize--;
            if (iTriggerResize === 0) { // Last trigger, if many events trigger in a row...
                onDetailLoad();
                verifySmallScreen();
                if (bLastFilter) {
                    showFilter();
                }
            }
        });
    });

    // Set detail mouse wheel behaviour (these events are not standard so some browsers only recognize some of them, and others may trigger several...)
    $('#divDetail').bind('wheel mousewheel DOMMouseScroll', function (e) {
        e.preventDefault();
        e.stopPropagation();
        iTriggerWheel++;
        setTimeout(function () {
            iTriggerWheel--;
            if (iTriggerWheel === 0) { // Only called once if many events trigger in a row...
                changeDetail(mouseWheelUp(e));
            }
        });
    });
    // Set slider mouse wheel behaviour (these events are not standard so some browsers only recognize some of them, and others may trigger several...)
    $('#divImages').bind('wheel mousewheel DOMMouseScroll', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (oSlider != null) {
            iTriggerWheel++;
            setTimeout(function () {
                iTriggerWheel--;
                if (iTriggerWheel === 0) { // Only called once if many events trigger in a row...
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

    // Set image detail load behaviour
    $('#imgDetail').on('load', function () {
        onDetailLoad();
    });

    // Draggable divs
    $('#divDetail').draggable({ // This div makes special calculations because of the transform property
        handle: '#divDetailHead',
        start: function (event, ui) {
            dragDif.X = event.clientX - ui.originalPosition.left;
            dragDif.Y = event.clientY - ui.originalPosition.top;
        },
        drag: function (event, ui) {
            ui.position = {
                left: (event.clientX + ($('#divDetail').width() / 2) - dragDif.X),
                top: (event.clientY + ($('#divDetail').height() / 2) - dragDif.Y)
            };
        }
    });
    $('#divAbout').draggable({
        handle: '#divAboutHead'
    });

    // DataTable creation
    tStreamTable = $('#tableStreamTable').DataTable({
        pageLength: 5,
        columnDefs: [
            { "width": "20%", targets: [1, 2, 4] },
            { targets: [1, 2, 3, 4], visible: true },
            { targets: '_all', visible: false }
        ],
        dom: 'rftip'
    });
    // DataTable onclick event in rows
    $('#tableStreamTable tbody').on('click', 'tr', function () {
        var sID = tStreamTable.row(this).data()[0];

        toggleFilter();
        oSlider.goToSlide(showDetail(sID));
        if (!bDetailAttached) {
            setTimeout(toggleAttach);
        }
        $('img#' + sID).click(); // Seemes redundant because of showDetail above, but solves the issue of image not found
    });

    // Screen size verification
    lastWindowSize = { width: $(document).width(), height: $(document).height() };
    verifySmallScreen();
    iDetailSize = bSmallScreen ? 6 : 7;
    iNewDetailSize = iDetailSize;

    // Initialize thumb with empty image
    hideThumb(true);

    // Load default stream
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

// Crops big strings that can have html stripping then into plain text in those cases
function smartString(sHtmlText) {
    var plainText = $('<div/>').html(sHtmlText).text(),
        maxSize = bSmallScreen ? 50 : 100;
    
    if (plainText.length > maxSize) {
        return plainText.substring(0, maxSize) + "...";
    }
    else {
        return sHtmlText;
    }
}

function verifySmallScreen() {
    var bLastSize = bSmallScreen;
    
    bSmallScreen = $(document).width() < 800 || $(document).height() < 400; // Small screen calculation
    if (bSmallScreen != bLastSize) {
        if (bSmallScreen) {
            $('#labelStream,#labelFilter').hide();
        }
        else {
            $('#labelStream,#labelFilter').show();
        }
        tStreamTable.column(2).visible(!bSmallScreen);
        tStreamTable.column(3).visible(!bSmallScreen);
        tStreamTable.column(4).visible(!bSmallScreen);
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
        return event.originalEvent.deltaY < 0; // Firefox
    }
}

// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»



// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»
// Filter functions

function showFilter() {

    if (isDetailDetached()) {
        toggleAttach();
    }
    $('#divFilter').css('left', iBoxMargin).css('top', $('div.header').outerHeight(true) + iBoxMargin).css('width', $(document).width() - (iBoxMargin * 2)).slideDown();
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

    bLastFilter = $('#divFilter:visible').length === 0;
    if (bLastFilter) {
        showFilter();
    }
    else {
        hideFilter();
    }
}

// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»



// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»
// Thumbnail functions

// Show thumbnail image over table cell
function showThumb(x, y, iThumbIndex) {

    iTriggerThumb++;
    setTimeout(function () {
        if (iTriggerThumb === 1) {
            if ($('#imgThumb').attr("src") != $('#thumb_' + iThumbIndex).attr("data-square-url")) {
                $('#imgThumb').attr("src", $('#thumb_' + iThumbIndex).attr("data-square-url"));
            }
            $('#divThumb').css('left', x + 40).css('top', y).fadeIn();
        }
        if (iTriggerThumb > 0) { // Because a hide could be called in between
            iTriggerThumb--;
        }
    }, 50);
    
    return false;
}

function hideThumb(bInstant) {

    if (bInstant) {
        $('#divThumb').hide();
    }
    else {
        $('#divThumb').fadeOut();
    }
    $('#imgThumb').attr("src", "//:0").css('width', 75).css('height', 75); // Avoids the previous image appearing when a new thumb is still loading
    iTriggerThumb = 0;

    return false;
}

// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»



// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»
// Slider functions

// Builds (or rebuilds) the slider object
function buildSlider() {

    $('#divImages').empty();
    oSlider = null;
    $('#divSliderBarRow').hide();
    if (dStreamData != null) {
        $('<ul id="lightSlider"/>').appendTo('#divImages');
        $.each(dStreamData.photos.photo, addToSlider); // Add all photos in stream to the slider structure
        oSlider = $('#lightSlider').lightSlider({
            controls: true,
            pager: false,
            autoWidth: true,
            keyPress: true,
            onSliderLoad: lazySlider,
            onBeforeSlide: function () {
                bDetailOff = true;
                $('#divSliderBarRow').css('opacity', 0.3);
                iTriggerLazy++;
            },
            onAfterSlide: function () {
                iTriggerLazy--;
                if (iTriggerLazy === 0) { // Only called once if many events trigger in a row...
                    setTimeout(function () {
                        bDetailOff = false;
                        lazySlider();
                    }, 500);
                }
            },
            prevHtml: '<span class="link glyphicon glyphicon-chevron-left" style="font-size: x-large; padding-top: 2px;"></span>',
            nextHtml: '<span class="link glyphicon glyphicon-chevron-right" style="font-size: x-large; padding-top: 2px;"></span>'
        });
    }
}

function addToSlider(i, item) {
    var source = bSmallScreen ? item.url_sq : item.url_q;
    
    $('<img/>')
        .attr('id', item.id)
        .attr('data-src', source ? source : (bSmallScreen ? "imagenotfound_sq.png" : "imagenotfound_q.png"))
        .attr('src', "//:0")
        .attr('title', item.title)
        .attr('class', "thumb")
        .attr('onclick', source ? "if (!bDetailOff) showDetail('" + item.id + "');" : "hideDetail();")
        .css('width', bSmallScreen ? 75 : 150)
        .css('height', bSmallScreen ? 75 : 150)
        .appendTo($('<li class="lslide"/>').appendTo('#lightSlider')); // Class 'lslide' needs to be added if adding to already existing slide...
}

function showSlide(event) {
    var iLocation = event.pageX - $('#divImagesOffset').outerWidth() - (($('#divImages').outerWidth() - $('#divImages').width()) / 2) - ($('#divSliderPosition').width() / 2),
        iSlide = (iLocation / $('#divImages').width()) * dStreamData.photos.photo.length;

    oSlider.goToSlide(Math.min(Math.max(iSlide, 0), dStreamData.photos.photo.length - 1));
}

function lazySlider() {
    var visible = $('#divImages').width(),
        go = true;
    
    sliderBar = { count: 0, start: 0 };
    $.each(dStreamData.photos.photo, function (i, item) {
        var image = $('img#' + item.id);

        if (image.position().left >= 0 && image.position().left <= visible) {
            image.attr('src', image.attr('data-src'));
            go = false;
            sliderBar.count++;
            if (sliderBar.start === 0) sliderBar.start = i + 1;
        }
        else {
            return go; // Breaks after finishing with the group of visible images
        }
    });

    updateSliderBar();
}

function updateSliderBar() {
    var iSize = $('#divImages').width(),
        iOffset = $('#divImagesOffset').outerWidth() + (($('#divImages').outerWidth() - $('#divImages').width()) / 2),
        iWidth = Math.max((sliderBar.count / dStreamData.photos.photo.length) * iSize, 20),
        iLeft = Math.min(iOffset + ((Math.max((sliderBar.start - 1), 0) / dStreamData.photos.photo.length) * iSize), iOffset + iSize - iWidth);
    
    $('#divSliderPosition').css('width', iWidth + 'px').css('left', iLeft + 'px');
    $('#divSliderBarRow').show().css('opacity', 1);;
}

// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»



// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»
// Image detail functions

function onDetailLoad() {

    $('#divDetailInfo').css('width', $('#imgDetail').width() + 45); // Image size plus adjustments for several ui elements (not very pretty)...
    $('#imgDetail').removeClass('old');
    if ($('#divDetail').position().top < iBoxMargin) {
        $('#divDetail').css('top', ($('#divDetail').height() / 2) + iBoxMargin);
    }
    if ($('#divDetail').position().left < iBoxMargin) {
        $('#divDetail').css('left', ($('#divDetail').width() / 2) + iBoxMargin);
    }
}

function changeDetail(bUp) {

    iNewDetailSize = bUp ? Math.min(iDetailSize + 1, 9) : Math.max(iDetailSize - 1, 6); // There are 10 possible sizes, but we're only using 4
    
    return showDetail($('#imgDetail').attr("data-id"));
}

// The 'order' represents the sizes returned by flickr api (10 possible sizes/urls). Here we're only interested in the four sizes below the original
function setDetailSize(url, order, sizeX, sizeY) {
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
    link.removeClass('selected').removeClass('disabled').attr("onclick", "return false;");
    if (typeof(url) != "undefined") { // Size exists
        if (iNewDetailSize === order) { // Sucess, we're trying to show a size that is available
            link.attr("title", "Photo is shown in " + sizeX + "x" + sizeY).addClass('selected');
            $('#imgDetail').addClass('old').attr("src", url); // Show the image
            iDetailSize = iNewDetailSize;
        }
        else { // Size exists but we're not trying to show it
            link.attr("title", "Show photo in " + sizeX + "x" + sizeY).attr("onclick", "iNewDetailSize = " + order + "; showDetail($('#imgDetail').attr('data-id'));");
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
        // Find photo in stream data
        $.each(dStreamData.photos.photo, function (i, item) {
            if (item.id == sID) {
                detail = item;
                index = i;

                return false;
            }
        });
        // Show photo
        if (index >= 0) {
            // Image information
            $('#labelDetailTitle').html(smartString(preventEmptyTitle(detail.title)));
            $('#imgDetail').attr("data-id", detail.id).attr("title", detail.title).attr("ondblclick", "oSlider.goToSlide(" + index + ");");
            $('#aDetailTitle').html(preventEmptyTitle(detail.title)).attr("onclick", "openPhotoPage('" + detail.id + "');");
            $('#aDetailAuthor').html(detail.ownername).attr("onclick", "detachLink('https://www.flickr.com/people/" + detail.owner + "/');");
            $('#pDetailDescription').html(detail.description._content);
            $('#pDetailTags').html(isEmptyString(detail.tags) ? "<em>Photo without tags</em>" : "<b>Tags: </b>" + detail.tags);
            // Image sizes
            if (typeof(detail.url_o) != "undefined") {
                $('#OriginalIcon').attr("title", "Show original photo in new tab").attr("onclick", "detachLink('" + detail.url_o + "');").removeClass('disabled');
            }
            else {
                $('#OriginalIcon').attr("title", "Original photo not available").attr("onclick", "return false;").addClass('disabled');
            }
            while (!(setDetailSize(detail.url_l, 9, detail.width_l, detail.height_l) && // Trying to show a size that is not available
                     setDetailSize(detail.url_c, 8, detail.width_c, detail.height_c) &&
                     setDetailSize(detail.url_z, 7, detail.width_z, detail.height_z) &&
                     setDetailSize(detail.url_m, 6, detail.width_m, detail.height_m))) {
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
        $('#divDetail').css('left', '').css('top', '').hide();
    }
    else {
        $('#divDetail').fadeOut(function () {
            $('#divDetail').css('left', '').css('top', '');
        });
    }

    return false;
}

// Pin icon behavior
function toggleAttach() {

    $('#divDetail').hide();
    if (bDetailAttached) {
        $('#divDetail').removeClass('attached').addClass('detached').draggable('enable');
        $('#divDetailHead').addClass('draggable');
        $('#AttachIconPin').show();
        $('#AttachIconUnpin').hide();
    }
    else {
        $('#divDetail').removeClass('detached').addClass('attached').css('left', '').css('top', '').draggable('disable');
        $('#divDetailHead').removeClass('draggable');
        $('#AttachIconPin').hide();
        $('#AttachIconUnpin').show();
    }
    bDetailAttached = !bDetailAttached;
    $('#divDetail').fadeIn();
}

// Eye icon behavior
function toggleImageInfo() {

    if ($('#divDetailInfo:visible').length > 0) {
        $('#ImageInfoIconOpen').show();
        $('#ImageInfoIconClose').hide();
        $('#divDetailInfo').hide();
    }
    else {
        $('#ImageInfoIconOpen').hide();
        $('#ImageInfoIconClose').show();
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
        // Calculate size and position at the page center
        var docWidth = $(document).width(),
            divWidth = Math.min(600, docWidth - iBoxMargin),
            divX = (docWidth - divWidth) / 2,
            docHeight = $(document).height(),
            divY = (docHeight / 6);

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
