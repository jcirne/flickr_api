// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»
// Global variables
'use strict';
var dStreamData,
    tStreamTable,
    fFilter = "",
    iTriggerAbout = 0,
    iTriggerWheel = 0,
    iDetailSize = 4,
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

    // Chosen
    $('#selectStream').chosen({
        search_contains: true,
        allow_single_deselect: true,
        width: '180px'
    }).change(function () {
        getStream($('#selectStream').val());
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
    
    // Set image load behaviour
    $('#imgDetail').on('load', function () {
        $('#imgDetail').css('opacity', '1')
        $('html,body').css('cursor', 'default');
    });

    // Draggable divs
    //$('#divDetail').draggable({ handle: '#divDetailHead' });
    $('#divAbout').draggable({ handle: '#divAboutHead' });

    // DataTable
    tStreamTable = $('#tableStreamTable').DataTable({
        pageLength: 10,
        dom: 'rftip'
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

function setDetail(iSet) {

    switch (iSet) {
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
}

function changeDetail(bUp) {
    // Only allow 4 sizes, even though there could be more...
    var iNewDetailSize = bUp ? Math.min(iDetailSize + 1, 5) : Math.max(iDetailSize - 1, 2);

    if (iNewDetailSize != iDetailSize) {
        $('html,body').css('cursor', 'wait');
        iDetailSize = iNewDetailSize;
    }
    setDetail(iDetailSize);

    return false;
}

function showDetail(sIndex) {
            
    $('html,body').css('cursor', 'wait');
    $('#labelDetailTitle').text($('img#' + sIndex).attr("title"));
    $('#imgDetail').attr("data-simple-url", $('img#' + sIndex).attr("data-simple-url")).attr("title", $('img#' + sIndex).attr("title"));
    setDetail(iDetailSize);

    $('#divDetail').fadeIn();

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



// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»
// flickr api methods

// Get stream with default parameters
//
// api_key (Necessário)
//      Your API application key. See here for more details.
// date (Opcional except in Recent Photos)
//      A specific date, formatted as YYYY-MM-DD, to return interesting photos for.
// extras (Opcional)
//      A comma-delimited list of extra information to fetch for each returned record. Currently supported fields are: description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o
// per_page (Opcional)
//      Number of photos to return per page. If this argument is omitted, it defaults to 100. The maximum allowed value is 500.
// page (Opcional)
//      The page of results to return. If this argument is omitted, it defaults to 1.
function getStream(sStream) {

    $('#images').empty();
    $('#images').text("Loading...");
    $('html,body').css('cursor', 'wait');
    tStreamTable.clear();
    $.ajax({
        url: 'https://api.flickr.com/services/rest/',
        data: {
            method: sStream,
            api_key: '3e1dd5433dff3783aa605af9e23548f1',
            format: 'json',
            nojsoncallback: 1,
            extras: 'description, owner_name, tags, views, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'
        },
        type: 'GET',
        cache: false,
        success: function (data, textStatus, jqXHR) {
            if (data.stat === "ok") {
                dStreamData = data;
                $('#images').text("");
                $('html,body').css('cursor', 'default');
                actStream(data);
            }
            else {
                alert("Data status: " + data.stat);
                $('#images').text("No photos found");
                $('html,body').css('cursor', 'default');
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert(errorThrown);
            $('#images').text("No photos found");
            $('html,body').css('cursor', 'default');
        }
    });
}

// Called after get action on stream with default parameters
//
// Inputs: "data"
// {   "photos": {
//         "page": 1,
//         "pages": 5,
//         "perpage": 100,
//         "total": "500", 
//         "photo": [
//                  ...
//              { "id": "35934516601", "owner": "66963975@N06", "secret": "b82661156b", "server": "4329", "farm": 5, "title": "Harvest Mouse", "ispublic": 1, "isfriend": 0, "isfamily": 0, 
//                "description": { "_content": "Harvest Mouse\n\n\nFollow me - <a href=\"https:\/\/www.facebook.com\/nigelhodsonphotography\" rel=\"nofollow\">www.facebook.com\/nigelhodsonphotography<\/a>" },
//                "ownername": "oddie25", "views": "46036", "tags": "canon 1dx 100400mmmk11 mouse harvestmouse wheat mice mammal nature naturephotography wildlife wildlifephotography wales",
 //               "url_sq": "https:\/\/farm5.staticflickr.com\/4329\/35934516601_b82661156b_s.jpg", "height_sq": 75, "width_sq": 75,
 //                "url_t": "https:\/\/farm5.staticflickr.com\/4329\/35934516601_b82661156b_t.jpg", "height_t": 100, "width_t": 76,
 //                "url_s": "https:\/\/farm5.staticflickr.com\/4329\/35934516601_b82661156b_m.jpg", "height_s": "240", "width_s": "183",
 //                "url_q": "https:\/\/farm5.staticflickr.com\/4329\/35934516601_b82661156b_q.jpg", "height_q": "150", "width_q": "150",
 //                "url_m": "https:\/\/farm5.staticflickr.com\/4329\/35934516601_b82661156b.jpg", "height_m": "500", "width_m": "382",
 //                "url_n": "https:\/\/farm5.staticflickr.com\/4329\/35934516601_b82661156b_n.jpg", "height_n": "320", "width_n": "244",
 //                "url_z": "https:\/\/farm5.staticflickr.com\/4329\/35934516601_b82661156b_z.jpg", "height_z": "640", "width_z": "489",
 //                "url_c": "https:\/\/farm5.staticflickr.com\/4329\/35934516601_b82661156b_c.jpg", "height_c": "800", "width_c": "611",
 //                "url_l": "https:\/\/farm5.staticflickr.com\/4329\/35934516601_b82661156b_b.jpg", "height_l": "1024", "width_l": "782",
 //                "url_o": "https:\/\/farm5.staticflickr.com\/4329\/35934516601_f4898fc15f_o.jpg", "height_o": "2946", "width_o": "2250" },
//                  ...
//         ] },
//     "stat": "ok" }
function actStream(data) {
    if (data.stat === "ok") {
        $.each(data.photos.photo, function (i, item) {
            var sSimpleURL = "https://farm" + item.farm + ".staticflickr.com/" + item.server + "/" + item.id + "_" + item.secret;

            $('<img/>')
                .attr("id", i)
                .attr("src", sSimpleURL + "_q.jpg")
                .attr("data-simple-url", sSimpleURL)
                .attr("title", item.title)
                .attr("class", "thumb")
                .attr("onclick", "showDetail('" + i + "');")
                .appendTo('#images');




            if (i === 4) {
                return false;
            }



            $('<span/>')
                .attr("style", "padding-left: 15px;")
                .appendTo('#images');
        });

        $.each(data.photos.photo, function (i, item) {
            tStreamTable.row.add([
                "<span onmousemove='showThumb(" + i + ");' onmouseout='hideThumb();' id='thumb_" + i + "' data-square-url='" + item.url_sq + "' >" + item.ownername + "</span>",
                i + '.2',
                i + '.3',
                i + '.4',
                i + '.5'
            ]).draw(false);
        });
    }
}
