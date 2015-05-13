function MeetHueLookup(app) {
    console.log('PhilipsHue :: MeetHue NUPNP lookup started');
    $.ajax('https://www.meethue.com/api/nupnp', {
        type: 'GET',
        dataType: 'json',
        crossDomain: true,
        success: function (data) {
            console.log("MeetHueLookup:: success");
            console.log(data);
            if(data.length == 1) {
                app.bridgeIP = data[0].internalipaddress;
                app.isBridgeConnected = true;
                checkPermission(app);
            } else {
                app.runtime.trigger(cr.plugins_.PhilipsHue.prototype.cnds.trigAutoConnectFailed, app);
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

function checkPermission(app) {
    console.log("checkPermission:: url:");
    console.log('http://' + app.bridgeIP + '/api/' + app.username);
    console.log(app);
    $.ajax('http://' + app.bridgeIP + '/api/' + app.username, {
        type: 'GET',
        success: function (data) {
            console.log("CheckPermission:: response okay");
            console.log(data);
            //console.log('Error in data: '+(data[0].hasOwnProperty("error")));

            if (data[0] != undefined) {
                if (data[0].hasOwnProperty("error")) {
                    console.log("CheckPermission:: No permission, asking permission");
                    console.log(data.error);
                    app.runtime.trigger(cr.plugins_.PhilipsHue.prototype.cnds.trigLinkButton, app);
                    var newUser = setInterval(function() {
                        $.ajax('http://' + app.bridgeIP + '/api', {
                            type: 'POST',
                            dataType: 'json',
                            data: JSON.stringify({
                                "devicetype": app.user,
                                "username": app.username
                            }),
                            success: function(data) {
                                console.log("CheckPermission:: asking permission success");
                                console.log(data);
                                if("success" in data[0] == true) {
                                    app.runtime.trigger(cr.plugins_.PhilipsHue.prototype.cnds.trigConnectSucceeded, app);
                                    listLights();
                                    clearInterval(newUser);
                                }
                            },
                            error: function(data) {
                                console.log("CheckPermission:: asking permission error");
                                console.log(data);
                            }
                        });
                    }, 500);
                } else {
                    app.runtime.trigger(cr.plugins_.PhilipsHue.prototype.cnds.trigConnectSucceeded, app);
                }
            } else {
                app.runtime.trigger(cr.plugins_.PhilipsHue.prototype.cnds.trigConnectSucceeded, app);
            }
            if ("lights" in data == true) {
                console.log('SUCCESS Key exists :: data.lights: ' + app.username);
                app.runtime.trigger(cr.plugins_.PhilipsHue.prototype.cnds.trigConnectSucceeded, app);
                listLights(app);
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

function listLights(app) {
    $.ajax('http://' + app.bridgeIP + '/api/' + app.username + '/lights', {
        type: 'GET',
        success: function(data) {
            console.log("listLights:: success");
            console.log(data);
            if(data.length != 0) {
                $.each(data, function(i, val) {
                    if(val.state.reachable == true) {
                        app.lights.push(i);
                    }
                });
                app.runtime.trigger(cr.plugins_.PhilipsHue.prototype.cnds.lightListRecieved, app);
            }
        }, 
        error: function(data) {
            console.log("listLights:: error");
            console.log(data);
        }
    });
}

function setColor(app, lampSlot, Hue, Saturation, Brightness, Time) {
    console.log("::setColor::");
    console.log(lampSlot, Hue, Saturation, Brightness, Time);
    lightID = 4;
    $.ajax('http://' + app.bridgeIP + '/api/' + app.username + '/lights/' + lightID + '/state', {
        type: 'PUT',
        data: JSON.stringify({
            "on": true,
            "bri": Brightness,
            "hue": Hue,
            "sat": Saturation,
            "transitiontime": Time
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