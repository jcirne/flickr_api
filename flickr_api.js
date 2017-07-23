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

    hideDetail();
    $('#images').empty();
    $('#images').text("Loading...");
    $('html,body').css('cursor', 'wait');
    dStreamData = null;
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
                actStream(data);
            }
            else {
                $('#images').text("No photos found");
            }
            $('html,body').css('cursor', 'default');
        },
        error: function (jqXHR, textStatus, errorThrown) {
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
//                "url_sq": "https:\/\/farm5.staticflickr.com\/4329\/35934516601_b82661156b_s.jpg", "height_sq": 75, "width_sq": 75,
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
                .attr('id', item.id)
                .attr('data-index', i)
                .attr('src', sSimpleURL + "_q.jpg")
                .attr('data-simple-url', sSimpleURL)
                .attr('title', item.title)
                .attr('class', "thumb")
                .attr('style', i < 5 ? "" : "display: none;")
                .attr('onclick', "showDetail('" + item.id + "');")
                .appendTo('#images');
            $('<span/>')
                .attr("style", "padding-left: 15px;")
                .appendTo('#images');
        });

        $.each(data.photos.photo, function (i, item) {
            tStreamTable.row.add([
                "<span onmousemove='showThumb(" + item.id + ");' onmouseout='hideThumb();' id='thumb_" + item.id + "' data-square-url='" + item.url_sq + "' >" + item.title + "</span>",
                item.ownername,
                item.description._content,
                item.tags,
                "available sizes...",
                item.id,
                item.url_sq
            ]).draw(false);
        });
    }
}
