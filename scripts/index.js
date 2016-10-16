var Place = function(data) {
    var self = this;
    this.infowindowContent = ko.observable('');
    this.name = ko.observable(data.name);
    this.venueID = ko.observable(data.venueID);
    this.address = ko.observable(data.address);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
    this.isSelected = ko.observable(false);
    //Function called if a place is selected either through the list or by the marker
    this.toggleSelected = function() {
        //Unselect all other places
        for (var i = 0; i < placeArray.length; i++) {
            if (placeArray[i].isSelected()) {
                placeArray[i].isSelected(false);
                placeArray[i].infowindow.close();
                placeArray[i].marker.setAnimation(null);
            }
        }
        self.isSelected(true);
        if (self.infowindowContent() === '') {
            self.infowindow.setContent('Content Loading...');
            loadFourSquare(self);
        }
        //Center above the marker to get the info window
        var center = self.marker.getPosition();
        var span = map.getBounds().toSpan();
        var newCenter = {
            lat: center.lat() + span.lat() * 0.25,
            lng: center.lng()
        };
        map.panTo(newCenter);
        self.infowindow.open(map, self.marker);
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
    };
    this.markerClicked = function() {
        self.toggleSelected();

    };
};
//An array of restaurants in Downtown Des Moines
var placeArray = [
    new Place({
        name: 'Centro',
        venueID: '4b4630eaf964a520951926e3',
        address: '1003 Locust St, Des Moines, IA 50309',
        lat: 41.585909,
        lng: -93.630118
    }),
    new Place({
        name: '801 Chophouse',
        venueID: '4b7c9643f964a520789c2fe3',
        address: '801 Grand Ave #200, Des Moines, IA 50309',
        lat: 41.587454,
        lng: -93.628606
    }),
    new Place({
        name: 'Django',
        venueID: '4b4669fff964a520262026e3',
        address: '210 10th St, Des Moines, IA 50309',
        lat: 41.584315,
        lng: -93.629785
    }),
    new Place({
        name: 'Americana',
        venueID: '4d90ba1ed08559410c2c1c87',
        address: '1312 Locust St, Des Moines, IA 50309',
        lat: 41.584573,
        lng: -93.634264
    }),
    new Place({
        name: 'Fong\'s Pizza',
        venueID: '4b43e42ef964a52058ed25e3',
        address: '223 4th St, Des Moines, IA 50309',
        lat: 41.585902,
        lng: -93.621800
    }),
    new Place({
        name: 'Zombie Burger',
        venueID: '4df4d43522718759f8245edd',
        address: '300 E Grand Ave, Des Moines, IA 50309',
        lat: 41.590630,
        lng: -93.613437
    }),
    new Place({
        name: 'Malo',
        venueID: '536178e6498e78fa04df1056',
        address: '900 Mulberry St, Des Moines, IA 50309',
        lat: 41.583628,
        lng: -93.628101
    }),
    new Place({
        name: 'Hessen Haus',
        venueID: '4b463ac4f964a520c91a26e3',
        address: '101 4th St, Des Moines, IA 50309',
        lat: 41.583935,
        lng: -93.620605
    }),
    new Place({
        name: 'Royal Mile',
        venueID: '4b6865b3f964a52008762be3',
        address: '210 4th St, Des Moines, IA 50309',
        lat: 41.585425,
        lng: -93.622060
    }),
];

var map;
var markers;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 41.5878,
            lng: -93.6216
        },
        zoom: 15
    });
    for (var i = 0; i < placeArray.length; i++) {
        var place = placeArray[i];
        var marker = new google.maps.Marker({
            position: {
                lat: place.lat(),
                lng: place.lng()
            },
            map: map,
            title: place.name(),
            animation: google.maps.Animation.DROP
        });
        var infowindow = new google.maps.InfoWindow({
            content: ''
        });
        place.marker = marker;
        place.infowindow = infowindow;
        //Select place when marker clicked
        marker.addListener('click', function(where) {
            return function() {
                where.markerClicked();
            };
        }(place));
        //Stop marker animation when info window closed
        infowindow.addListener('closeclick', function(what) {
            return function() {
                what.setAnimation(null);
            };
        }(marker));
    }
}

var ViewModel = function() {
    var self = this;
    //Show or hide the left menu drawer on mobile
    self.showMenu = ko.observable(false);
    self.toggleMenu = function() {
        self.showMenu(!self.showMenu());
    };
    self.startPlaces = ko.observableArray(placeArray);
    self.filter = ko.observable("");
    //The possibly filtered array of places to show on the map
    self.places = ko.computed(function() {
        var filteredArray;
        if (self.filter() === "") {
            filteredArray = self.startPlaces();
        } else {
            filteredArray = ko.utils.arrayFilter(self.startPlaces(), function(place) {
                return place.name().toLowerCase().indexOf(self.filter().toLowerCase()) !== -1;
            });
        }
        console.log(self.filter());
        updatePlaces(filteredArray);
        return filteredArray;
    });
};
ko.applyBindings(new ViewModel());

//Show/Hide markers on map
function updatePlaces(filteredArray) {
    var toAdd = [];
    for (var i = 0; i < placeArray.length; i++) {
        var place = placeArray[i];
        if (place.marker === undefined) continue;
        if (arrayContains(filteredArray, place)) {
            place.marker.setMap(map);
        } else {
            place.marker.setMap(null);
        }
    }
}

function arrayContains(array, obj) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === obj) {
            return true;
        }
    }
    return false;
}

//Load data from Foursquare and set InfoWindow content accordingly
function loadFourSquare(place) {
    var infowindow = place.infowindow;
    // ko.getJSON
    var data = {
        cid: 'SZZDSRYDRM4FVQ05N1SWHPZHNYHCGSAMHXKSCQF40TKEUA4I',
        csecret: 'IQOHK4K0WZPJR1BI3LQUFY5JT544QL5RVHBCGQ51DDC0W5XS',
    };
    var url = 'https://api.foursquare.com/v2/venues/' + place.venueID() + '/?client_id=SZZDSRYDRM4FVQ05N1SWHPZHNYHCGSAMHXKSCQF40TKEUA4I&client_secret=IQOHK4K0WZPJR1BI3LQUFY5JT544QL5RVHBCGQ51DDC0W5XS%20&v=20130815';
    $.getJSON(url).done(function(data) {
        venue = data.response.venue;
        photoData = venue.photos.groups[0].items[0];
        photoSrc = photoData.prefix + photoData.width + 'x' + photoData.height + photoData.suffix;
        var templateString = '<div style="text-align:center;width:300px;"><h2>%%venue-name%%</h2><h3 >%%venue-description%%</h3><img style="height:200px;margin: 0 auto;border:solid black" src="%%venue-image%%" alt="Venue Photo"><br><a href="%%venue-url%%">%%venue-url%%</a></div>';
        if (!venue.description) venue.description = '';
        var contentString = templateString.replace(/%%venue-url%%/g, venue.url).replace('%%venue-name%%', venue.name)
            .replace('%%venue-description%%', venue.description).replace('%%venue-image%%', photoSrc);
        infowindow.setContent(contentString);

    }).fail(function(data) {
        infowindow.setContent('Failure to Load Content From Foursquare');
    });
}
