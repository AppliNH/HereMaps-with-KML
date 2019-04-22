var kmlURL = "";
var map;
var HMaps_AppID = '';
var HMaps_AppCODE = '';
var nav = [];
var MarkANDInfoW = [];
var QueryMarker = [];
var storeA = [];
var ListLinkMarker = [];
var ListLinkInfoWindow = [];
var ident = 0;
var StartMPLINK = 'http://www.google.com/maps/place/';

/**
 * Moves the map to display over Strasbourg
 *
 * @param  {H.Map} map      A HERE Map instance within the application
 */
function moveMapToStrasbourg(map){
  map.setCenter({lat:48.583073, lng:7.753258});
  map.setZoom(15);
}

/**
* Creates a new marker and adds it to a group
* @param {H.map.Group} group       The group holding the new marker
* @param {H.geo.Point} coordinate  The location of the marker
* @param {String} html             Data associated with the marker
*/
function addMarkerToGroup(group, coordinate, html) {
  var MarkerSizeW = screen.width * 0.03;
  var MarkerSizeWalt = (screen.width * 0.03)/2;

  var marker = new H.map.Marker(coordinate,{ icon: new H.map.Icon("./img/marker.png", { 
    size: { w: MarkerSizeW, h: MarkerSizeW },         // if you increase the size, you also have to increase other parameters
    anchor: { x: MarkerSizeWalt, y: MarkerSizeWalt }, 
    hitArea: new H.map.HitArea(H.map.HitArea.ShapeType.CIRCLE, [0,0,MarkerSizeW]) }) });
  // add custom data to the marker
  marker.setData(html);
  group.addObject(marker);
}

function addInfoBubble(map,x,y,html) {
  var group = new H.map.Group();

  map.addObject(group);
  
  // add 'tap' event listener, that opens info bubble, to the group
  group.addEventListener('tap', function (evt) {

    map.setCenter({
          lat: evt.target.getPosition().lat,
          lng: evt.target.getPosition().lng
        });

    // event target is the marker itself, group is a parent event target
    // for all objects that it contains
    var bubble =  new H.ui.InfoBubble(evt.target.getPosition(), {
      // read custom data
      content: evt.target.getData()
    });
    // show info bubble
    ui.getBubbles().forEach(bubble => ui.removeBubble(bubble));
    ui.addBubble(bubble);
  }, false);

  addMarkerToGroup(group, {lat:x, lng:y}, html);
}
  
  /**
  * Boilerplate map initialization code starts below:
  */
  
  //Step 1: initialize communication with the platform
  var platform = new H.service.Platform({
    app_id: HMaps_AppID,
    app_code: HMaps_AppCODE,
    useHTTPS: true
  });
  var pixelRatio = window.devicePixelRatio || 1;
  var defaultLayers = platform.createDefaultLayers({
    tileSize: pixelRatio === 1 ? 256 : 512,
    ppi: pixelRatio === 1 ? undefined : 320
  });
  
  //Step 2: initialize a map  - not specificing a location will give a whole world view.
  var map = new H.Map(document.getElementById('map'),
    defaultLayers.normal.map, {pixelRatio: pixelRatio});
  
  //Step 3: make the map interactive
  // MapEvents enables the event system
  // Behavior implements default interactions for pan/zoom (also on mobile touch environments)
  var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
  
  // Create the default UI components
  var ui = H.ui.UI.createDefault(map, defaultLayers, 'fr-FR');
  
  // Now use the map as required...
  moveMapToStrasbourg(map);

  $(document).ready(function(){

// alows us to get into the file which is a .kml linked to my GMaps on my google drive
// kml format is close to xml, and that's with this idea that we fetch it
$.get(kmlURL, function(data){

    html = "";

    //loop through placemarks tags
    $(data).find("Placemark").each(function(index, value){
        //get coordinates and place name
        coords = $(this).find("coordinates").text();
        place = $(this).find("name").text();
        desc = $(this).find("description").text();
        stylurl = $(this).find("styleUrl").text();
        //store as JSON
        var c = coords.split(",")
        // did this because they were strings
        // and I think google.maps.LatLng can't use strings as parameters
        c[0] = parseFloat(c[0]);
        c[1] = parseFloat(c[1]);
        nav.push({
            "place": place,
            "lat": c[1],
            "lng": c[0],
            "desc":desc
        })
        //output as a navigation + identification of each line
        html += "<li id='"+ident+"' >" + place + "</li>";
        
        //building the content of our bubble :)
        var MapsHPLink ='<a target="_blank" href="'+StartMPLINK+c[1]+','+c[0]+'">Voir sur Maps</a>';
        var FinalDesc = '<div id="titleIB">'+place+'</div>'+'<br />'+'<hr class="thinIB"></hr>'+'<br />'+'<div id="textIB">'+desc+'</div>'+'<br />'+'<div id="mapsIB">'+MapsHPLink+'</div>';

        //Store finaldesc for InfoBubble of ListItem purposes
        storeA.push({
          "content":FinalDesc
        })

        addInfoBubble(map,c[1],c[0],FinalDesc);
        
        //Here we kind of manage our markers by arranging them in an array
        //which position corresponds to the id of our list item
        ListLinkMarker[ident] = MarkANDInfoW[0];
        
        //we increase the id, so each list item can have its own id :)
        ident = ident + 1;

    })
    //add the list html code to the <ul> armed with navigation class :D
    $(".navigationMARKERS").append(html);

    //bind clicks on your navigation to scroll to a placemark
    $(".navigationMARKERS li").on("click", function(){
        $(".navigationMARKERS").hide();

        //creating HMaps coordinates for the list element clicked
        var GeoPointList = new H.geo.Point(nav[$(this).index()].lat,nav[$(this).index()].lng);

        //check if previous infowindow is opened, and if yes close it
        ui.getBubbles().forEach(bubble => ui.removeBubble(bubble));

        //creating the InfoBubble
        var bubbleList =  new H.ui.InfoBubble(GeoPointList,{
           content: storeA[$(this).index()].content
        });
        
        ui.addBubble(bubbleList);
        
        //get the id of the list item you clicked on (can be used for anything idk)
        var identclik = $(this).attr('id'); 

        //scroll to marker !
        map.setCenter({
          lat:nav[$(this).index()].lat + 0.0055,
          lng:nav[$(this).index()].lng - 0.0055
        });
        map.setZoom(15);
    })

});
$(".navigationMARKERS").hide();
$(".tog").click(function(){
  $(".navigationMARKERS").toggle(700);
});


})