// Let op, dit is allemaal geript en kapot. HET WERKT NIET!

function MeetHueLookup() {
    console.log('PhilipsHue :: MeetHue NUPNP lookup startet');
    $.ajax('http://www.meethue.com/api/nupnp', {
        type: 'GET',
        dataType: 'json',
        crossDomain: true,
        timeout: 500,
        success: function (data) {
            console.log('PhilipsHue :: apiLocalIpLookup');
            console.log(data);
            //console.log('Error in data: '+(data[0].hasOwnProperty("error")));

        },
        error: function (data) {
            console.log('error: ', data);
            //console.log(data);		 
        },
        statusCode: {
            404: function () {
                // console.log("Not found: "+ip);
            }
        }
    });

}

function hueFindRange(ip, continueAfter, percent, nointerval) {
    // Connect
    nointerval = nointerval;
    var obj = new Object();
    obj.username = username;
    obj.devicetype = "Hue Connect API Client";
    console.log('hueFindRange :: ' + ip);

    if (!stopSearching) {
        /*
		$.mobile.loading( 'show', {
			text: percent+'%',
			textVisible: true,
			theme: 'a',
			html: '<p>Searching...</p><div class="percent-bar"><div class="percent" style="width: '+percent+'%;">'+percent+'%</div></div>'
		});*/
        $('.percent-bar').html('<div class="percent" style="width: ' + percent + '%;">' + percent + '%</div>');

    }
    $('#ip-lookup').html(ip);


    $.ajax('http://' + ip + '/api/' + username, {
        type: 'GET',
        timeout: 500,
        success: function (data) {

            stopSearching = true;

            console.log('Connect :: Check Hub : Username: ' + username);
            console.log(data);
            //console.log('Error in data: '+(data[0].hasOwnProperty("error")));
            if (data[0] != undefined) {
                if (data[0].hasOwnProperty("error")) {
                    console.log('ERROR from Hub :: HUE Found, press connect : ' + ip);
                    console.log(data.error);
                    connectHubPress(ip, continueAfter, percent, nointerval)
                    //connectHubPress(ip, continueAfter, percent, nointerval)

                }
            }
            if ("lights" in data == true) {
                stopSearching = true;
                console.log('SUCCESS Key exists :: data.lights: ' + username);
                hueDevices(ip, obj.username);
            }
        },
        error: function (data) {
            //console.log('Not found: '+ip);
            if (stopSearching == false) {
                hueFindNext();
            }
            //console.log(data);		 
        },
        statusCode: {
            404: function () {
                // console.log("Not found: "+ip);
            }
        }
    });

}

var currentIPRange = 1;
var stopSearching = false;
function hueFindNext() {
    // 192.168.1.187	

    if (currentIPRange < 254 && settings == undefined && stopSearching == false) {
        currentIPRange++;
        hueFindRange('10.0.1.' + currentIPRange, stopSearching);
        hueFindRange('10.0.0.' + currentIPRange, stopSearching);
        hueFindRange('192.168.1.' + currentIPRange, stopSearching);
        hueFindRange('192.168.123.' + currentIPRange, stopSearching);
        hueFindRange('192.168.1.' + currentIPRange, stopSearching, Math.floor((currentIPRange / 254) * 100));
        //$.mobile.loading('hide');

    } else if (settings != undefined) {
        console.log('Hue found: ' + settings.ip);
        /*
		hueFindComplete();
		hueDevices(settings.ip, settings.username);
		window.clearInterval(connectTimer);		
		$.mobile.changePage( $("#lights"), "slide", true, true);
		alert($('#lights'));
		*/
        //$.mobile.loading('hide');		

    } else {
        console.log('Hue not found...');
        //$.mobile.loading('hide');
        currentIPRange = 1;
        stopSearching = true;

        $.mobile.changePage($("#hub-not-found"), "slide", true, true);


    }
}