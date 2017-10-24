# flickr [api]
Single page app using the public flickr api

[flickr [api]](http://leiloes.cfportugal.pt/flickr_api/) - See online

## Prerequisites
The complete prerequisites come from [this developer flickr task](https://github.com/holidayextras/culture/blob/master/recruitment/developer-flickr-task.md) by Holiday Extras

The interpretation and design decisions regarding the requisites for this app can differ slightly from what was asked as follows:
### Use the public flickr api to display public photos on a single page app
Instead of the public feed as suggested, this app uses some of the api public methods in a stream like manner to show a slider of photo thumbnails 

### For each photo, show title, author, description and tags
The thumbs in the slider are links to the photo detail. This detail is a minimalist view with bigger image sizes showing only the photo title and action icons. Author, description and tags can be shown by selecting the eye icon

## Using the app
Open the file "index.html" in any modern browser

* This app is responsive and will react accordingly to a window resize. When the screen is/becomes very small, like on mobile devices, further adaptations are made like reducing the thumbnails size on the slider and hidding some labels
* Esc key will close the about ou search boxes, and pin the detail box if it was floating
* Most *ui* elements will show some tooltip information

### Selected stream
The default stream starts loading upon opening the app

It uses a lazy load, fetching a few photos at a time, and updating the stream slider and search table as the photos are loaded as shown on the progress bar

Selecting another stream will discard the current one and start loading the new one

### Slider
The slider shows photos thumbnails that are lazy loaded only when they become visible for the first time 

To move the slider use the the mouse wheel, the slider bar, arrow keys, navigation icons or drag on of the photo thumbnails

Clicking a thumb will open the photo detail box

### Detail box
Clean, minimal photo information and higher resolutions are shown here

When photo information is visible, it will appear under the image with the author name linking to the author page on flickr and the image title linking to the image page on flickr

* Mouse wheel used over the image will jump to the next ou previous available size
* Available sizes can be selected on the different sized box like icons
* When available, the original photo can be seen in a new tab by clicking the picture icon
* Toggle photo information by clicking the eye icon
* Pin or unpin the box to the main page
* The box is draggable on the title area when unpinned
* Double click the photo to find it on the slider

### Search table
Clicking on the top left arrow icon will toggle the search table. This table shows the photo title and if the screen is big enough, author name, description and tags

On the upper right a search text box exists that will search all the stream images with any text contained in the description, tags, author name or photo title

* Clicking the column header will order the contents on the table
* Moving the mouse over the photo title will show a small thumbnail of the photo
* Clicking on a row will close the search table and dispaly a pined detail box of the photo

### About box
Shows basic information on this app and has links that open in new tabs to the frameworks and tools used

The about box is draggable on the title area and can be shown by clicking the question mark icon or the word "About"

## Deployment
Only the four files in the project root are needed to run the app

## Built With
* [jQuery](https://jquery.com/)
* [jQuery UI](https://jqueryui.com/)
* [Bootstrap](http://getbootstrap.com/)
* [Datatables](https://datatables.net/)
* [Choosen](https://harvesthq.github.io/chosen/)
* [lightSlider](http://sachinchoolur.github.io/lightslider/)
* [flickr App Garden](https://www.flickr.com/services/api/)

## Author
[**Jorge Cirne** (jcirne)](https://github.com/jcirne)

## License
This app is licensed under the [MIT License](https://opensource.org/licenses/MIT)
