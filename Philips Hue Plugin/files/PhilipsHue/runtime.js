// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.PhilipsHue = function (runtime) {
    this.runtime = runtime;
};

(function () {
    var pluginProto = cr.plugins_.PhilipsHue.prototype;

    /////////////////////////////////////
    // Object type class
    pluginProto.Type = function (plugin) {
        this.plugin = plugin;
        this.runtime = plugin.runtime;
    };

    var typeProto = pluginProto.Type.prototype;

    /////////////////////////////////////
    // Instance class
    pluginProto.Instance = function (type) {
        this.type = type;
        this.runtime = type.runtime;

        this.username = "NetHeroHueAPI";
        this.user = "NetHeroAPI# Default user";

        // any other properties you need, e.g...
        this.isBridgeConnected = false;
        this.bridgeIP = "<auto>";
        this.isWhitelisted = false;
        this.lights = [];
        this.usedLights = {};

        this.lastID = null;
        this.stopLoop = true;
    };

    var instanceProto = pluginProto.Instance.prototype;

    //////////////////////////////////////
    // Conditions
    function Cnds() { };

    Cnds.prototype.isBridgeConnected = function () {
        return this.isBridgeConnected;
    };

    Cnds.prototype.isWhitelisted = function () {
        return this.isWhitelisted;
    };


    /*  Check if there are sufficient lights to send commands to.
     *  Three modes, mono, duo and triple.
     *  Mono is the middle light, duo are the outer two and triple are all thre lights.
     */
    Cnds.prototype.inLightMode = function (lightMode) {
        var length = Object.keys(this.usedLights).length;
        switch(lightMode) {
            case 0:
                if (length == 1)
                    return true;
                break;
            case 1:
                if (length == 2)
                    return true;
                break;
            case 2:
                if (length == 3)
                    return true;
                break;
        }
        return false;
    };

    Cnds.prototype.lightListRecieved = function () {
        this.stopLoop = false;
        return true;
    };

    Cnds.prototype.trigAutoConnectFailed = function () {
        return true;
    };

    Cnds.prototype.trigManConnectFailed = function () {
        return true;
    };

    Cnds.prototype.trigLinkButton = function () {
        return true;
    };

    Cnds.prototype.trigConnectSucceeded = function () {
        return true;
    };
    
    /*  
     *  This generates a for loop in C5 used to populate all the listboxes
     */
    Cnds.prototype.hasNextLight = function () {
        if(this.stopLoop == true)
            return false;

        if(this.lights == [])
            return false;

        if(this.lastID == null) {
            this.lastID = 0;
            return true;
        } else {
            if (this.lights[this.lastID + 1] != null) {
                this.lastID++;
                return true;
            } else {
                this.stopLoop = true;
            }
        }
        return false;
    };

    // Put all conditions in the plugin
    pluginProto.cnds = new Cnds();

    //////////////////////////////////////
    // Actions
    function Acts() { };

    // ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! \\
    //                                                 \\
    //      All functions can be found in common.js    \\
    //                                                 \\
    // ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! \\

    Acts.prototype.autoConnectHueBridge = function () {
        MeetHueLookup(this);
    };

    Acts.prototype.manualConnectHueBridge = function (ip) {
        if(validIP(ip)){
            this.bridgeIP = ip;
            checkPermission(this);
        } else {
            // Trigger the connection failed trigger in edittime.js
            this.runtime.trigger(cr.plugins_.PhilipsHue.prototype.cnds.trigManConnectFailed, this);
        }
        
    };

    Acts.prototype.gainPermission = function () {
        // nope (deprecated)
    };

    Acts.prototype.setLightSlot = function (lampID, lampSlot) {
        this.usedLights[lampSlot] = lampID;
        //console.log("::setLightSlot::");
        //console.log("lampID: " + lampID + " -- lampSlot: " + lampSlot);
    };

    Acts.prototype.setLightColor = function (lampSlot, Hue, Saturation, Brightness, Time) {
        setColor(this, lampSlot, Hue, Saturation, Brightness, Time);
    };

    
    pluginProto.acts = new Acts();

    //////////////////////////////////////
    // Expressions
    function Exps() { };

    Exps.prototype.BridgeIP = function (ret)
    {
        ret.set_string(this.BridgeIP);		// return IP address of the PhilipsHue bridge
    };

    Exps.prototype.isBridgeConnected = function (ret)
    {
        ret.set_string(this.isBridgeConnected);
    };

    Exps.prototype.isWhitelisted = function (ret)
    {
        ret.set_string(this.isWhitelisted);
    };

    Exps.prototype.lights = function (ret)
    {
        ret.set_string(JSON.stringify(this.lights));
    };

    Exps.prototype.usedLights = function (ret)
    {
        ret.set_string(JSON.stringify(this.usedLights));
    };
    
    Exps.prototype.currentLightID = function (ret)
    {
        // String() used cause apperently set_string doesn't accept integers
        ret.set_string(String(this.lights[this.lastID]));
    };

    pluginProto.exps = new Exps();

}());
