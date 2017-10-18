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
        $(this).on('change', function(event) {
            event.preventDefault();
            var placeholder = $(this).siblings('.placeholder');
        
            if ( this.files.length > 0 ) {
                if ( this.files[0].size < 5000000 ) {
                    var filename = $(this).val().split('/').pop().split('\\').pop();
                    if ( filename == '' ) {
                        filename = placeholder.attr('data-label');
                    }
                    placeholder.text(filename);
                } else {
                    alert('Maximum file size is 5Mb');
                }    
            } else {
                placeholder.text( placeholder.attr('data-label') );
            }
            
        });
    });


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



    /*---------------------------
                                  Google map init
    ---------------------------*/
    var map;
    function googleMap_initialize() {
        var lat = $('#map_canvas').data('lat');
        var long = $('#map_canvas').data('lng');

        var mapCenterCoord = new google.maps.LatLng(lat, long);
        var mapMarkerCoord = new google.maps.LatLng(lat, long);

        var styles = [];

        var mapOptions = {
            center: mapCenterCoord,
            zoom: 16,
            //draggable: false,
            disableDefaultUI: true,
            scrollwheel: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

        var styledMapType=new google.maps.StyledMapType(styles,{name:'Styled'});
        map.mapTypes.set('Styled',styledMapType);
        map.setMapTypeId('Styled');

        var markerImage = new google.maps.MarkerImage('images/location.png');
        var marker = new google.maps.Marker({
            icon: markerImage,
            position: mapMarkerCoord, 
            map: map,
            title:"Site Title"
        });
        
        $(window).resize(function (){
            map.setCenter(mapCenterCoord);
        });
    }

    if ( exist( '#map_canvas' ) ) {
        googleMap_initialize();
    }

}); // end file