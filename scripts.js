﻿// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»
// Global variables
'use strict';
var dStreamData = null,
    tStreamTable,
    fFilter = "",
    iTriggerAbout = 0,
    iTriggerWheel = 0,
    iDetailSize = 3,
    bDetailAttached = false;



// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»
// Initial settings

function onPageLoad() {
    // Esc and Enter keys
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

    // Window resize
    $(window).resize(function () {
        hideThumb(true);
        if (!bDetailAttached) {
            hideDetail(true);
        }
        if ($('#divAbout:visible').length != 0) {
            hideAbout(true);
            iTriggerAbout = 1;
        }
        if (iTriggerAbout > 0) {
            iTriggerAbout++;
            setTimeout(function() {
                iTriggerAbout--;
                if (iTriggerAbout === 1) {
                    showAbout();
                    iTriggerAbout = 0;
                }
            });
        }
        if ($('#divFilter:visible').length != 0) {
            hideFilter(true);
            setTimeout(function () { showFilter(); });
        }
    });

    // Set detail mouse wheel behaviour (these events are not standard so some browsers only recognize some of them, and others my trigger several...)
    $('#divDetail').bind('wheel mousewheel DOMMouseScroll', function (e) {
        iTriggerWheel++;
        setTimeout(function () {
            iTriggerWheel--;
            if (iTriggerWheel === 0) {
                if (typeof(e.originalEvent.wheelDelta) != "undefined") {
                    changeDetail(e.originalEvent.wheelDelta > 0); // Chrome and Edge
                }
                else {
                    
                    changeDetail(e.originalEvent.detail < 0); // Firefox
                }
            }
        });
    });
 
    // Chosen
    $('#selectStream').chosen({
        search_contains: true,
        allow_single_deselect: true,
        width: '180px'
    }).change(function () {
        getStream($('#selectStream').val());
    });

    // Set image load behaviour
    $('#imgDetail').on('load', function () {
        onDetailLoad();
    });

    // Draggable divs
    //$('#divDetail').draggable({ handle: '#divDetailHead' });
    $('#divAbout').draggable({ handle: '#divAboutHead' });

    // DataTable creation and onclick event in rows
    tStreamTable = $('#tableStreamTable').DataTable({
        pageLength: 10,
        columnDefs: [
            { targets: [0, 1, 3, 4], visible: true},
            { targets: '_all', visible: false }
        ],
        dom: 'rftip'
    });
    $('#tableStreamTable tbody').on('click', 'tr', function () {
        showDetail(tStreamTable.row( this ).data()[5]);
    });

    // Get initial stream
    getStream($('#selectStream').val());
}

// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»



// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»
// Generic functions

function stringifyFilter() {
    //return JSON.stringify($('#formFilter').serializeArray());
    //return $('#formFilter').serialize();
    return "";
}



function detachLink(sLink) {

    setTimeout(function () {
        window.open(sLink, '_blank');
    });
}

// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»



// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»
// Filter functions

function showFilter() {

    if (isDetailDetached()) {
        toggleAttach();
    }
    $('#trFilter').removeClass('element_with_changes');
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

// Show thumbnail image over table row
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

    return false;
}

// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»



// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»
// Image detail functions

function changeDetail(bUp) {
    // Only allow 4 sizes, even though there could be more...
    var iNewDetailSize = bUp ? Math.min(iDetailSize + 1, 5) : Math.max(iDetailSize - 1, 2);

    if (iNewDetailSize != iDetailSize) {
        $('html,body').css('cursor', 'wait');
        iDetailSize = iNewDetailSize;
    }
    showDetail($('#imgDetail').attr("data-id"));

    return false;
}

function onDetailLoad() {

    // $('#aDetailTitle').html(detail.title).attr('onclick', "openPhotoPage('" + detail.id + "');");
    // $('#aDetailAuthor').html(detail.ownername).attr('onclick', "detachLink('https://www.flickr.com/people/" + detail.owner + "/');");
    // $('#pDetailDescription').html(detail.description._content);
    // $('#pDetailTags').html("<b>Tags: </b>" + detail.tags);
    $('#imgDetail').css('opacity', '1')
    $('html,body').css('cursor', 'default');
}

function showDetail(sID) {
    var detail = null,
        index = -1;
    
    if (dStreamData != null) {
        $.each(dStreamData.photos.photo, function (i, item) {
            if (item.id == sID) {
                detail = item;
                index = i;

                return false;
            }
        });
        
        if (index >= 0) {
            $('html,body').css('cursor', 'wait');
            $('#labelDetailTitle').html(detail.title);
            $('#imgDetail').attr("data-id", detail.id).attr("title", detail.title).attr("data-simple-url", $('img#' + sID).attr("data-simple-url"));
            $('#aDetailTitle').html(detail.title).attr('onclick', "openPhotoPage('" + detail.id + "');");
            $('#aDetailAuthor').html(detail.ownername).attr('onclick', "detachLink('https://www.flickr.com/people/" + detail.owner + "/');");
            $('#pDetailDescription').html(detail.description._content);
            $('#pDetailTags').html("<b>Tags: </b>" + detail.tags);
            switch (iDetailSize) {
                case 1:
                    $('#imgDetail').css('opacity', '0.7').attr("src", $('#imgDetail').attr("data-simple-url") + "_-.jpg");
                    break;
                case 2:
                    $('#imgDetail').css('opacity', '0.7').attr("src", $('#imgDetail').attr("data-simple-url") + "_z.jpg");
                    break;
                case 3:
                    $('#imgDetail').css('opacity', '0.7').attr("src", $('#imgDetail').attr("data-simple-url") + "_c.jpg");
                    break;
                case 4:
                    $('#imgDetail').css('opacity', '0.7').attr("src", $('#imgDetail').attr("data-simple-url") + "_b.jpg");
                    break;
                case 5:
                    $('#imgDetail').css('opacity', '0.7').attr("src", $('#imgDetail').attr("data-simple-url") + "_h.jpg");
                    break;
                case 6:
                    $('#imgDetail').css('opacity', '0.7').attr("src", $('#imgDetail').attr("data-simple-url") + "_k.jpg");
                    break;
            }
            $('#divDetail').fadeIn();
        }
    }

    return false;
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
