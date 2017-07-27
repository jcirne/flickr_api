// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»
// Global variables
'use strict';
var dStreamData = null,
    iStreamPage = 0,
    iStreamPerPage = 100,
    tStreamTable,
    oSlider = null,
    fFilter = "",
    iTriggerAbout = 0,
    iTriggerWheel = 0,
    iDetailSize = 7,
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
        if (oSlider != null) {
            oSlider.refresh();
        }
    });

    // Set detail mouse wheel behaviour (these events are not standard so some browsers only recognize some of them, and others may trigger several...)
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
        showDetail(tStreamTable.row(this).data()[4]);
        if (!bDetailAttached) {
            toggleAttach();
        }
    });

    // Get initial stream
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
        $.each(dStreamData.photos.photo, function (i, item) {
            $('<img/>')
                .attr('id', item.id)
                .attr('src', item.url_q)
                .attr('title', item.title)
                .attr('class', "thumb")
                .attr('onclick', "showDetail('" + item.id + "');")
                .appendTo($('<li/>').appendTo('#lightSlider'));
        });
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

// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»



// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»
// Image detail functions

function onDetailLoad() {

    $('#divDetailInfo').css('width', $('#imgDetail').width() + 45); // Image size plus adjustments for several ui elements (not very pretty)...
    $('#imgDetail').css('opacity', '1')
    $('html,body').css('cursor', 'default');
}

function changeDetail(bUp) {

    iDetailSize = bUp ? Math.min(iDetailSize + 1, 9) : Math.max(iDetailSize - 1, 6); // There are 10 possible sizes, but we're only using 4.
    showDetail($('#imgDetail').attr("data-id"));

    return false;
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
    if (typeof(url) != "undefined") {
        if (iDetailSize === order) {
            link.attr("title", "Photo is shown in " + size).addClass('selected');
            $('html,body').css('cursor', 'wait');
            $('#imgDetail').css('opacity', '0.6').attr("src", url);
        }
        else {
            link.attr("title", "Show photo in " + size).attr("onclick", "iDetailSize = " + order + "; showDetail($('#imgDetail').attr('data-id'));");
        }
    }
    else {
        link.attr("title", "This size is not available").addClass('disabled');
    }
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
            $('#labelDetailTitle').html(preventEmptyTitle(detail.title));
            $('#imgDetail').attr("data-id", detail.id).attr("title", detail.title);
            $('#aDetailTitle').html(preventEmptyTitle(detail.title)).attr("onclick", "openPhotoPage('" + detail.id + "');");
            $('#aDetailAuthor').html(detail.ownername).attr("onclick", "detachLink('https://www.flickr.com/people/" + detail.owner + "/');");
            $('#pDetailDescription').html(detail.description._content);
            $('#pDetailTags').html(isEmptyString(detail.tags) ? "<em>Photo without tags</em>" : "<b>Tags: </b>" + detail.tags);
            if (typeof(detail.url_o) != "undefined") {
                $('#OriginalIcon').attr("title", "Show original photo in new tab").attr("onclick", "detachLink('" + detail.url_o + "');").removeClass('disabled');
            }
            else {
                $('#OriginalIcon').attr("title", "Original photo not available").attr("onclick", "return false;").addClass('disabled');
            }
            setDetailSize(detail.url_l, 9, detail.width_l + "x" + detail.height_l);
            setDetailSize(detail.url_c, 8, detail.width_c + "x" + detail.height_c);
            setDetailSize(detail.url_z, 7, detail.width_z + "x" + detail.height_z);
            setDetailSize(detail.url_m, 6, detail.width_m + "x" + detail.height_m);

            $('#divDetail').fadeIn();
            if (oSlider != null) {
                oSlider.goToSlide(index);
            }
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
