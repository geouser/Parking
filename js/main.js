// Global parameters
window.params = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent)
};


/**
     *
     * Check if element exist on page
     *
     * @param el {string} jQuery object (#popup)
     *
     * @return {bool}
     *
*/
function exist(el){
    if ( $(el).length > 0 ) {
        return true;
    } else {
        return false;
    }
}


jQuery(document).ready(function($) {

    /*---------------------------
                                  ADD CLASS ON SCROLL
    ---------------------------*/
    $(function() { 
        var $document = $(document),
            $element = $('.toggle-menu'),
            $element2 = $('header'),
            className = 'hasScrolled';

        $document.scroll(function() {
            $element.toggleClass(className, $document.scrollTop() >= 1);
            $element2.toggleClass(className, $document.scrollTop() >= 1);
        });
    });


    /*---------------------------
                                  File input logic
    ---------------------------*/
    $('input[type=file]').each(function(index, el) {
        var image_holder = $(this).parent().siblings('.file-preview').find('.image_holder');
        var text_holder = $(this).parent().siblings('.file-preview').find('.name_holder');
        $(this).on('change', function(event) {
            event.preventDefault();
        
            if ( this.files.length > 0 ) {
                if ( this.files[0].size < 5000000 ) {

                    var filename = $(this).val().split('/').pop().split('\\').pop();
                    text_holder.text(filename);
                    var ext = getExtension(filename);
                    if ( ext == 'jpg' || ext == 'png' || ext == 'jpeg' ) {
                        var reader = new FileReader();
                        reader.onload = function(frEvent) {
                            image_holder.css({
                                'background-image': 'url('+frEvent.target.result+')',
                                'background-size': 'cover'
                            });
                        }
                        reader.readAsDataURL(this.files[0]);    
                    }

                } else {

                    alert('Maximum file size is 5Mb');

                }   

            } else {
                text_holder.text('');
                image_holder.attr('style', '');
            }
            
        });
    });

    function getExtension(filename) {
        var extension = filename.substr( (filename.lastIndexOf('.') +1) );
        return extension;
    };

    /*---------------------------
                                  Schedule controls
    ---------------------------*/
    $(document).on('click', '.js-delete-schedule-item', function(event) {
        event.preventDefault();
        $(this).parent().fadeOut('400', function() {
            $(this).remove();
        });
    });

    $('.js-add-schedule-item').on('click', function(event) {
        event.preventDefault();
        $('.form-schedule .error').remove();
        var day, start, end, price;
        var day_input = $('.form-schedule input[name="day"]:checked');
        var start_input = $('.form-schedule select[name="start-time"]');
        var end_input = $('.form-schedule select[name="end-time"]');
        var price_input = $('.form-schedule input[name="price"]');


        if ( day_input.val() ) {
            day = day_input.val();
        } else {
            $('.day-select').append('<span class="error">Select day</span>')
        }

        if ( start_input.val() ) {
            start = start_input.val()
        } else {
            start_input.parents('.form-group').append('<span class="error">Select start hour</span>')
        }

        if ( end_input.val() ) {
            end = end_input.val()
        } else {
            end_input.parents('.form-group').append('<span class="error">Select end hour</span>')
        }

        if ( price_input.val() ) {
            price = price_input.val()
        } else {
            price_input.parents('.form-group').append('<span class="error">Set price</span>')
        }
        

        if ( day && start && end && price ) {
            $('.form-schedule-list ul').append(
                '<li class="item">'+
                    '<input type="hidden" name="schedule[][day]" value="'+day+'">'+
                    '<input type="hidden" name="schedule[][start-hour]" value="'+start+'">'+
                    '<input type="hidden" name="schedule[][end-hour]" value="'+end+'">'+
                    '<input type="hidden" name="schedule[][price]" value="'+price+'">'+
                    '<span class="item-content">'+day+'    '+start+' - '+end+'    $'+price+'/hr. </span>'+
                    '<button class="js-delete-schedule-item">Delete</button>'+
                '</li>'
            );
            $('.form-schedule input[name="day"]').prop('checked', false);
            start_input.find('option').first().prop('selected', true);
            end_input.find('option').first().prop('selected', true);
            price_input.val('');
        }
    });



    /*---------------------------
                                jQuery UI accordion
    ---------------------------*/
    $('.accordion').accordion({
        heightStyle: "content",
        collapsible: true,
    });


    /*---------------------------
                                jQuery UI tabs
    ---------------------------*/
    $( ".tabs" ).tabs();

    
    /*---------------------------
                                PAGE ANCHORS
    ---------------------------*/
    $('.page-menu a, .anchor').click(function() {
        $('html, body').animate({
            scrollTop: $($(this).attr('href')).offset().top - 50
        }, 800);
        return false;
    });

    /*---------------------------
                                  MENU TOGGLE
    ---------------------------*/
    $('.js-toggle-menu').on('click', function(event) {
        event.preventDefault();
        $(this).toggleClass('is-active');
        $(this).siblings('header').toggleClass('open');
    });



    /*---------------------------
                                  Fancybox
    ---------------------------*/
    $('.fancybox').fancybox({
        
    });


    /**
     *
     * Open popup
     *
     * @param popup {String} jQuery object (#popup)
     *
     * @return n/a
     *
    */
    function openPopup(popup){
        $.fancybox.open([
            {
                src  : popup,
                type: 'inline',
                opts : {}
            }
        ], {
            loop : false
        });
    }



    /*---------------------------
                                  Form submit
    ---------------------------*/
    $('.ajax-form').on('submit', function(event) {
        event.preventDefault();
        var data = new FormData(this);
        $(this).find('button').prop('disabled', true);
        $.ajax({
            url: theme.url + '/forms.php',
            type: 'POST',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            success: function(result) {
                if (result.status == 'ok') {
                    openPopup('#modal-popup-ok')
                } else {
                    openPopup('#modal-popup-error')
                }
            },
            error: function(result) {
                openPopup('#modal-popup-error');
            }
        }).always(function() {
            $('form').each(function(index, el) {
                $(this)[0].reset();
                $(this).find('button').prop('disabled', false);
            });
        });
    });



    $('.map-controls__change').click(function(){
        $('#pac-input').toggleClass('open');
    });
    /*---------------------------
                                  Google map init
    ---------------------------*/
    var locations = [
        [{
            address: 'Recto Station, Manila, Philippines',
            image: 'http://www.zastavki.com/pictures/originals/2015/Auto_Neat_old_car_102050_.jpg',
            minimumcost: '5$',
            time: '8am -12hrs, weekly, monthly',
            size: 'Compact',
            attendent: 'yes',
            verified: 'yes',
            valvet: 'no'
        }, 51.503510, -0.119434, 1],
        [{
            address: 'Recto Station, Manila, Philippines',
            image: 'https://s-media-cache-ak0.pinimg.com/originals/5e/6f/34/5e6f342a8fc53f122714f9e386fac37a.jpg',
            minimumcost: '5$',
            time: '8am -12hrs, weekly, monthly',
            size: 'Compact',
            attendent: 'yes',
            verified: 'yes',
            valvet: 'no'
        }, 51.507383, -0.127202, 2],
        [{
            address: 'Recto Station, Manila, Philippines',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoS4SyUW413jp9Giv5ECsqpICLzAyCzrGis65T9WwnpzI9pamz',
            minimumcost: '5$',
            time: '8am -12hrs, weekly, monthly',
            size: 'Compact',
            attendent: 'yes',
            verified: 'yes',
            valvet: 'no'
        }, 51.511336, -0.128361, 3]
    ];

    var map = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 18,
        center: new google.maps.LatLng(51.530616, -0.123125),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false
    });

    // Create the search box and link it to the UI element.
    var input = (document.getElementById('pac-input'));
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    var searchBox = new google.maps.places.SearchBox((input));

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length === 0) {
            return;
        }

        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
        var newAddress = $('#pac-input').val();
        $('#new-location').val(newAddress);
        $('#pac-input').removeClass('open');
    });

    var infowindow = new google.maps.InfoWindow();

    var marker, i;
    var markers = new Array();

    for (i = 0; i < locations.length; i++) {
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(locations[i][1], locations[i][2]),
            map: map
        });

        markers.push(marker);

        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                infowindow.setContent(
                                    '<div class="parking-info"><div class="marker-row mr-address marker-row--flex"><div><span>Parking Address: </span><p> ' + locations[i][0].address + '</p></div><div><img src="' + locations[i][0].image + '"></div></div>' +
                                    '<div class="marker-row mr-cost"><span>Minimum Cost: </span><p> ' + locations[i][0].minimumcost + '</p></div>' + 
                                    '<div class="marker-row mr-time"><span>Parking Hours: </span><p> ' + locations[i][0].time + '</p></div>' +   
                                    '<div class="marker-row mr-size"><span>Max Size: </span><p> ' + locations[i][0].size + '</p></div>' +   
                                    '<div class="marker-row mr-attendent"><span>Attendent Availability: </span><p> ' + locations[i][0].attendent + '</p></div>' +   
                                    '<div class="marker-row mr-verified"><span>Verified Owner: </span><p> ' + locations[i][0].verified + '</p></div>'  +
                                    '<div class="marker-row mr-valvet"><span>Valvet Parking: </span><p> ' + locations[i][0].valvet + '</p></div></div>'
                                    );
                infowindow.open(map, marker);
            }
        })(marker, i));
    }

    function AutoCenter() {
        //  Create a new viewpoint bound
        var bounds = new google.maps.LatLngBounds();
        //  Go through each...
        $.each(markers, function(index, marker) {
            bounds.extend(marker.position);
        });
        //  Fit these bounds to the map
        map.fitBounds(bounds);
    }
    AutoCenter();


}); // end file