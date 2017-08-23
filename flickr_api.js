// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»
// Stream methods

function getStream(sStream) {

    hideDetail();
    $('#divImages').empty();
    $('#divStream').css('cursor', 'wait');
    $('#pStreamInfo').text("Loading information from stream...");
    $('#divProgress').css('width', '0%');
    $('#divProgressBarRow').fadeIn();
    dStreamData = null;
    iStreamPage = 0;
    tStreamTable.clear();
    sLastStream = sStream; // Last requested stream
    loadStream(sStream);
}

// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»



// »»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»
// flickr api methods

// Load stream
//
// Inputs:
// api_key (Mandatory)
//      Your API application key. See here for more details.
// date (Optional except in Recent Photos)
//      A specific date, formatted as YYYY-MM-DD, to return interesting photos for.
// extras (Optional)
//      A comma-delimited list of extra information to fetch for each returned record.
//      Currently supported fields are: description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o
// per_page (Optional)
//      Number of photos to return per page. If this argument is omitted, it defaults to 100. The maximum allowed value is 500.
// page (Optional)
//      The page of results to return. If this argument is omitted, it defaults to 1.
//
// Output "data" example:
// {   "photos": {
//         "page": 1,
//         "pages": 5,
//         "perpage": 100,
//         "total": "500", 
//         "photo": [
//              ...
//              { "id": "35934516601", "owner": "66963975@N06", "secret": "b82661156b", "server": "4329", "farm": 5, "title": "Harvest Mouse", "ispublic": 1, "isfriend": 0, "isfamily": 0, 
//                "description": { "_content": "Harvest Mouse\n\n\nFollow me - <a href=\"https:\/\/www.facebook.com\/nigelhodsonphotography\" rel=\"nofollow\">www.facebook.com\/nigelhodsonphotography<\/a>" },
//                "ownername": "oddie25", "views": "46036", "tags": "canon 1dx 100400mmmk11 mouse harvestmouse wheat mice mammal nature naturephotography wildlife wildlifephotography wales",
//                "url_m": "https:\/\/farm5.staticflickr.com\/4329\/35934516601_b82661156b.jpg", "height_m": "500", "width_m": "382",
//                "url_z": "https:\/\/farm5.staticflickr.com\/4329\/35934516601_b82661156b_z.jpg", "height_z": "640", "width_z": "489",
//                "url_c": "https:\/\/farm5.staticflickr.com\/4329\/35934516601_b82661156b_c.jpg", "height_c": "800", "width_c": "611",
//                "url_l": "https:\/\/farm5.staticflickr.com\/4329\/35934516601_b82661156b_b.jpg", "height_l": "1024", "width_l": "782",
//                "url_o": "https:\/\/farm5.staticflickr.com\/4329\/35934516601_f4898fc15f_o.jpg", "height_o": "2946", "width_o": "2250" },
//              ...
//         ] },
//     "stat": "ok" }
function loadStream(sStream) {
    
    iStreamPage++;
    $.ajax({
        url: 'https://api.flickr.com/services/rest/',
        data: {
            method: sStream,
            api_key: '3e1dd5433dff3783aa605af9e23548f1',
            format: 'json',
            nojsoncallback: 1,
            extras: 'description, owner_name, tags, url_q, url_sq, url_m, url_z, url_c, url_l, url_o',
            per_page: iStreamPerPage,
            page: iStreamPage
        },
        type: 'GET',
        cache: false,
        success: function (data, textStatus, jqXHR) {
            if (data.stat === "ok") {
                if (sLastStream === sStream) { // Changing the stream while the previous one is still loading will result in old requests finishing. Do nothing in these cases
                    if (iStreamPage === 1 || dStreamData == null) {
                        dStreamData = data;
                        buildSlider(); // Builds a slider with the first page...
                    }
                    else {
                        // Add photos to slider
                        $.each(data.photos.photo, addToSlider);
                        oSlider.refresh();
                        // Add photos to stream
                        $.merge(dStreamData.photos.photo, data.photos.photo);
                    }

                    // Add new stream data to search table
                    $.each(data.photos.photo, function (i, item) {
                        tStreamTable.row.add([
                            "<span onmousemove='showThumb(event.pageX, event.pageY, " + item.id + ");' onmouseout='hideThumb(true);' id='thumb_" + item.id + "' data-square-url='" + item.url_sq + "' >" + smartString(preventEmptyTitle(item.title)) + "</span>",
                            smartString(item.ownername),
                            smartString(item.description._content),
                            smartString(item.tags),
                            item.id,
                            item.title,
                            item.ownername,
                            item.description._content,
                            item.tags
                        ]).draw(false);
                    });

                    $('#divProgress').css('width', ((iStreamPage / data.photos.pages) * 100) + '%');
                    if (iStreamPage < data.photos.pages) { // Still loading the stream
                        $('#pStreamInfo').text("Loaded information on " + (iStreamPage * iStreamPerPage) + " photos from " + data.photos.total);
                        setTimeout(function () { loadStream(sStream); });
                    }
                    else {
                        finishStream();
                    }
                }
            }
            else {
                finishStream();
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            iStreamPage = 0;
            finishStream();
        }
    });
}

function finishStream() {

    if (dStreamData != null) {
        $('#pStreamInfo').text("Information on " + dStreamData.photos.photo.length + " photos loaded");
    }
    else {
        $('#pStreamInfo').text("No photos found on stream");
    }
    $('#divProgressBarRow').fadeOut();
    $('#divStream').css('cursor', 'default');
}



// Opens the image page in a new tab
//
// Output "data" example:
// {   "photo": { "id": "36083308015", "secret": "0e438221d6", "server": "4309", "farm": 5, "dateuploaded": "1500724244", "isfavorite": 0, "license": 0, "safety_level": 0, "rotation": 0, 
//     "owner": { "nsid": "46170864@N02", "username": "Melissa James Photography", "realname": "", "location": "", "iconserver": "4036", "iconfarm": 5, "path_alias": "melissa_vet" }, 
//     "title": { "_content": "Headliner" }, 
//     "description": { "_content": "<b>Fiery-throated Hummingbird<\/b> <i>(Panterpe insignis)<\/i>\n\nHe appears to be singing away like the star of a show in a spotlight.\n\nNikon D500 - 200-500mm lens - 440mm - ISO 2000 - f\/6.3 - 1\/2500" }, 
//     "visibility": { "ispublic": 1, "isfriend": 0, "isfamily": 0 }, 
//     "dates": { "posted": "1500724244", "taken": "2017-07-22 07:45:56", "takengranularity": 0, "takenunknown": 1, "lastupdate": "1500829727" }, "views": "51507", 
//     "editability": { "cancomment": 1, "canaddmeta": 0 }, 
//     "publiceditability": { "cancomment": 1, "canaddmeta": 0 }, 
//     "usage": { "candownload": 0, "canblog": 1, "canprint": 0, "canshare": 0 }, 
//     "comments": { "_content": "121" }, 
//     "notes": { "note": [ ... ] }, 
//     "people": { "haspeople": 0 }, 
//     "tags": { "tag": [
//         { "id": "46150516-36083308015-3054", "author": "46170864@N02", "authorname": "Melissa James Photography", "raw": "Costa Rica", "_content": "costarica", "machine_tag": 0 },
//         { "id": "46150516-36083308015-1575503", "author": "46170864@N02", "authorname": "Melissa James Photography", "raw": "Panterpe insignis", "_content": "panterpeinsignis", "machine_tag": 0 },
//         { "id": "46150516-36083308015-1575502", "author": "46170864@N02", "authorname": "Melissa James Photography", "raw": "Fiery-throated Hummingbird", "_content": "fierythroatedhummingbird", "machine_tag": 0 } ] }, 
//     "urls": {
//         "url": [ { "type": "photopage", "_content": "https:\/\/www.flickr.com\/photos\/melissa_vet\/36083308015\/" } ] },
//         "media": "photo" },
//     "stat": "ok" }
function openPhotoPage(sID) {

    $.ajax({
        url: 'https://api.flickr.com/services/rest/',
        data: {
            method: 'flickr.photos.getInfo',
            api_key: '3e1dd5433dff3783aa605af9e23548f1',
            format: 'json',
            nojsoncallback: 1,
            photo_id: sID
        },
        type: 'GET',
        cache: false,
        success: function (data, textStatus, jqXHR) {
            if (data.stat === "ok" && data.photo.urls.url.length > 0 ) {
                detachLink(data.photo.urls.url[0]._content.replace(/\\/g, ''));
            }
        }
    });
}
