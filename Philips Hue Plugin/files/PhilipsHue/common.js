/*
 *  Name:           MeetHueLookup
 *  Description:    Uses the meethue nupnp api to get the internal ip address of the philips hue bridge through an ajax call
 *  Parameters:     app -> this in the function call, used for accessing variables
 */
function MeetHueLookup(app) {
    // console.log('PhilipsHue :: MeetHue NUPNP lookup started');
    $.ajax('https://www.meethue.com/api/nupnp', {
        type: 'GET',
        dataType: 'json',
        crossDomain: true,
        success: function (data) {
            // console.log("MeetHueLookup:: success");
            // console.log(data);

            // if there is data
            if(data.length == 1) {
                // store bridgeIP and let rest of the plugin know about it
                app.bridgeIP = data[0].internalipaddress;
                app.isBridgeConnected = true;
                // go to the next function to check wether there is permission to do stuff
                checkPermission(app);
            } else {
                // no data found, trigger autoconnectfailed trigger so C5 can respond to that
                app.runtime.trigger(cr.plugins_.PhilipsHue.prototype.cnds.trigAutoConnectFailed, app);
            }
            
        },
        error: function (data) {
            // console.log("MeetHueLookup:: error");
            // console.log('error: ', data);
            // only happens when there is no internet or the api is offline
            app.runtime.trigger(cr.plugins_.PhilipsHue.prototype.cnds.trigAutoConnectFailed, app);
        },
        statusCode: {
            404: function () {
                // console.log("MeetHueLookup:: not found 404");
                // same as the error function except specific for the 404 error
                app.runtime.trigger(cr.plugins_.PhilipsHue.prototype.cnds.trigAutoConnectFailed, app);
            }
        }
    });
}


/*  
 *  Name:           checkPermission
 *  Description:    Make firstcall to the bridge and check if the user stored in app.username has permission. 
 *                  If not, trigger is triggered and every x seconds is checked wether the link button is pressed
 *  Parameters:     app -> this in the function call, used for accessing variables
 */
function checkPermission(app) {
    // console.log("checkPermission:: url:");
    // console.log('http://' + app.bridgeIP + '/api/' + app.username);
    // console.log(app);
    $.ajax('http://' + app.bridgeIP + '/api/' + app.username, {
        type: 'GET',
        success: function (data) {
            //console.log("CheckPermission:: response okay");
            //console.log(data);
            //console.log('Error in data: '+(data[0].hasOwnProperty("error")));

            // if first key is defined
            if (data[0] != undefined) {
                // if the bridge says there is an error a.k.a. the user has no permission to show this
                if (data[0].hasOwnProperty("error")) {
                    // console.log("CheckPermission:: No permission, asking permission");
                    // console.log(data.error);

                    // let the user know that the link button must be pressed!
                    app.runtime.trigger(cr.plugins_.PhilipsHue.prototype.cnds.trigLinkButton, app);

                    // check every half a second if the button is pressed.
                    var newUser = setInterval(function() {
                        $.ajax('http://' + app.bridgeIP + '/api', {
                            type: 'POST',
                            dataType: 'json',
                            data: JSON.stringify({
                                "devicetype": app.user,
                                "username": app.username
                            }),
                            success: function(data) {
                                // console.log("CheckPermission:: asking permission success");
                                // console.log(data);

                                // if the userdata got posted, and no error was shown, I call it a victory :D
                                if("success" in data[0] == true) {
                                    // let C5 know about it
                                    app.runtime.trigger(cr.plugins_.PhilipsHue.prototype.cnds.trigConnectSucceeded, app);
                                    // automatically list all the available lights
                                    listLights(app);
                                    // stop this interval
                                    clearInterval(newUser);
                                }
                            },
                            error: function(data) {
                                // console.log("CheckPermission:: asking permission error");
                                // console.log(data);

                                // do nothing, the bridge sometimes just does not respond. 
                                // So you will never know if the bridge went offline or something
                            }
                        });
                    }, 500);
                } else {
                    // if there isn't any error, 
                    app.runtime.trigger(cr.plugins_.PhilipsHue.prototype.cnds.trigConnectSucceeded, app);
                }
            }
            if ("lights" in data == true) {
                //console.log('SUCCESS Key exists :: data.lights: ' + app.username);

                // this get executed no matter what happened in previous statements.
                // if 'lights' exists in data, you are whitelisted and good to go list some lights
                app.runtime.trigger(cr.plugins_.PhilipsHue.prototype.cnds.trigConnectSucceeded, app);
                listLights(app);
            }
        },
        error: function (data) {
            // if there was an error getting permission, throw an error to the user
            app.runtime.trigger(cr.plugins_.PhilipsHue.prototype.cnds.trigManConnectFailed, app);
        },
        statusCode: {
            404: function () {
                // do the same for 404 error
                app.runtime.trigger(cr.plugins_.PhilipsHue.prototype.cnds.trigManConnectFailed, app); 
            }
        }
    });
}


/*  
 *  Name:           listLights
 *  Description:    Push all available lights to an array an trigger an trigger
 *  Parameters:     app -> this in the function call, used for accessing variables
 */
function listLights(app) {
    $.ajax('http://' + app.bridgeIP + '/api/' + app.username + '/lights', {
        type: 'GET',
        success: function(data) {
            //console.log("listLights:: success");
            //console.log(data);

            // only do stuff if there are actually lights
            if(data.length != 0) {
                $.each(data, function(i, val) {
                    // push each light to the lights array if they are reachable
                    if(val.state.reachable == true) {
                        app.lights.push(i);
                    }
                });
                // when done, trigger the lightlistrecieved trigger
                app.runtime.trigger(cr.plugins_.PhilipsHue.prototype.cnds.lightListRecieved, app);
            }
        }, 
        error: function(data) {
            // console.log("listLights:: error");
            // console.log(data);

            // if there was an error getting the url, throw an error
            app.runtime.trigger(cr.plugins_.PhilipsHue.prototype.cnds.trigManConnectFailed, app); 
        }
    });
}


/*  
 *  Name:           setColor
 *  Description:    Set a specific lamp to a specific color and brightness in the specified time
 *  Parameters:     app         -> this in the function call, used for accessing variables
 *                  lampSlot    -> id of the lamp used by C5
 *                  Hue         -> hue of the color (as specified by the Philips Hue documentation)
 *                  Saturation  -> saturation of the color between 0 and 254
 *                  Brightness  -> brightness of the light between 0 and 254
 *                  Time        -> time to fade to the specific color (multiples of 100ms)
 */
function setColor(app, lampSlot, Hue, Saturation, Brightness, Time) {
    // get the light id used by the Philips Hue bridge
    lightID = app.usedLights[lampSlot];
    
    // console.log("::setColor::");
    // console.log(lightID, Hue, Saturation, Brightness, Time);

    // if lightID is not found (wich should never happen, cath this with another event)
    if (lightID == null) {
        alert("::setColor:: Light " + lampSlot + " does not exist!");
    } else {
        $.ajax('http://' + app.bridgeIP + '/api/' + app.username + '/lights/' + lightID + '/state', {
            type: 'PUT',
            dataType: 'json',
            data: JSON.stringify({
                "on": true,
                "bri": Brightness,
                "hue": Hue,
                "sat": Saturation,
                "transitiontime": Time
            }),
            success: function(data) {
                // well, when in-game, you don't wanna bother anyone would you
                if(data[0].hasOwnProperty("error")) {
                    // console.log("setColor:: error");
                    // console.log(data);
                }
            },
            error: function(data) {
                // console.log("setColor:: error");
                // console.log(data);
            }
        });
    }
}


// check if the parameter 'ip' is a valid ip address
function validIP (ip) {
    var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;  
    if(ip.match(ipformat)){
        return true;
    } else {
        return false;
    }
}