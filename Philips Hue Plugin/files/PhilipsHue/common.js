function MeetHueLookup() {
    console.log('PhilipsHue :: MeetHue NUPNP lookup startet');
    $.ajax('https://www.meethue.com/api/nupnp', {
        type: 'GET',
        dataType: 'json',
        crossDomain: true,
        success: function (data) {
            console.log("MeetHueLookup:: success");
            console.log(data);
            if(data.length == 1) {
                this.bridgeIP = data[0].internalipaddress;
                this.isBridgeConnected = true;
                return true;
            } else {
                return false;
            }
            
        },
        error: function (data) {
            console.log("MeetHueLookup:: error");
            console.log('error: ', data);
            return false; 
        },
        statusCode: {
            404: function () {
                console.log("MeetHueLookup:: not found 404");
                return false;
            }
        }
    });
}

function checkPermission() {
    console.log("checkPermission:: url:");
    console.log('http://' + this.bridgeIP + '/api/' + this.username);
    $.ajax('http://' + this.bridgeIP + '/api/' + this.username, {
        type: 'GET',
        success: function (data) {
            console.log("CheckPermission:: response okay");
            console.log(data);
                //console.log('Error in data: '+(data[0].hasOwnProperty("error")));

                if (data[0] != undefined) {
                    if (data[0].hasOwnProperty("error")) {
                        console.log("CheckPermission:: No permission, asking permission");
                        console.log(data.error);
                        
                        var newUser = setInterval(function() {
                            $.ajax('http://' + this.bridgeIP + '/api', {
                                type: 'POST',
                                dataType: 'json',
                                data: JSON.stringify({
                                    "devicetype": this.user,
                                    "username": this.username
                                }),
                                success: function(data) {
                                    console.log("CheckPermission:: asking permission success");
                                    console.log(data);
                                    if("success" in data[0] == true) {
                                        this.runtime.trigger(trigConnectSucceeded, this);
                                        clearInterval(newUser);
                                    }
                                },
                                error: function(data) {
                                    console.log("CheckPermission:: asking permission error");
                                    console.log(data);
                                }
                            });
                        }, 500);
                        return "link";
                    }
                }
            if ("lights" in data == true) {
                console.log('SUCCESS Key exists :: data.lights: ' + this.username);
                listLights();
            }
        },
        error: function (data) {
            return false;        
        },
        statusCode: {
            404: function () {
                return false;
            }
        }
    });
}

function listLights() {
    $.ajax('http://' + this.bridgeIP + '/api/' + this.username + '/lights', {
        type: 'GET',
        success: function(data) {
            console.log("listLights:: success");
            console.log(data);
            if(data.length != 0) {
                $.each(data, function(i, val) {
                    if(val.state.reachable == true) {
                        lights.push(i);
                        setColor(i);
                    }
                });
            }
        }, 
        error: function(data) {
            console.log("listLights:: error");
            console.log(data);
        }
    });
}

function setColor(light) {
    $.ajax('http://' + this.bridgeIP + '/api/' + this.username + '/lights/' + light + '/state', {
        type: 'PUT',
        data: JSON.stringify({
            "on": true,
            "bri": 20,
            "hue": 46920,
            "sat": 254,
            "transitiontime": 50
        }),
        success: function(data) {
            console.log("setColor:: success");
            console.log(data);
        },
        error: function(data) {
            console.log("setColor:: error");
            console.log(data);
        }
    });
}