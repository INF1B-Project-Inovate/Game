// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
//          vvvvvvvv
cr.plugins_.PhilipsHue = function (runtime) {
    this.runtime = runtime;
};

(function () {
    /////////////////////////////////////
    // *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
    //                            vvvvvvvv
    var pluginProto = cr.plugins_.PhilipsHue.prototype;

    /////////////////////////////////////
    // Object type class
    pluginProto.Type = function (plugin) {
        this.plugin = plugin;
        this.runtime = plugin.runtime;
    };

    var typeProto = pluginProto.Type.prototype;

    // called on startup for each object type
    typeProto.onCreate = function () {
    };

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
        this.lights = {};
    };

    var instanceProto = pluginProto.Instance.prototype;

    // called whenever an instance is created
    instanceProto.onCreate = function () {
        // note the object is sealed after this call; ensure any properties you'll ever need are set on the object
        // e.g...
    };

    // only called if a layout object - draw to a canvas 2D context
    instanceProto.draw = function (ctx) {
    };

    // only called if a layout object in WebGL mode - draw to the WebGL context
    // 'glw' is not a WebGL context, it's a wrapper - you can find its methods in GLWrap.js in the install
    // directory or just copy what other plugins do.
    instanceProto.drawGL = function (glw) {
    };

    //////////////////////////////////////
    // Conditions
    function Cnds() { };

    // the example condition
    Cnds.prototype.isBridgeConnected = function () {
        return this.isBridgeConnected;
    };

    Cnds.prototype.isWhitelisted = function () {
        return this.isWhitelisted;
    };

    Cnds.prototype.inLightMode = function () {
        alert("Not implemented");
        return this.isHueConnected;
    };

    // ... other conditions here ...

    pluginProto.cnds = new Cnds();

    //////////////////////////////////////
    // Actions
    function Acts() { };

    // the example action
    Acts.prototype.autoConnectHueBridge = function () {
        if(MeetHueLookup()) {
            switch(checkPermission()) {
                case "link":
                    this.runtime.trigger(trigLinkButton, this);
                    break;
                case false:
                    console.log("checkPermission returned false");
                    break;
                default:
                    console.log("Well... this shouldn't be happening. (checkPermission)");
                    break;
            }
        }
    };

    Acts.prototype.manualConnectHueBridge = function (ip) {
        alert("Not yet implemented + IP: '" + ip + "'");
    };

    Acts.prototype.gainPermission = function () {
        alert("Not yet implemented");
    };

    Acts.prototype.setLightSlot = function (lampID, lampSlot) {
        alert("Not yet implemented + ID: '" + lampID + "' + lampSlot: '" + lampSlot + "'");
    };

    Acts.prototype.setLightColor = function (lampSlot, Hue, Saturation, Brightness) {
        alert("Not yet implemented + Slot: '" + lampSlot + "' + HSB:" + Hue + "-" + Saturation + "-" + Brightness);
    };

    // ... other actions here ...

    pluginProto.acts = new Acts();

    //////////////////////////////////////
    // Expressions
    function Exps() { };

    // the example expression
    Exps.prototype.BridgeIP = function (ret)	// 'ret' must always be the first parameter - always return the expression's result through it!
    {
        //ret.set_int(1337);				// return our value
        // ret.set_float(0.5);			// for returning floats
        ret.set_string(this.BridgeIP);		// for ef_return_string
        // ret.set_any("woo");			// for ef_return_any, accepts either a number or string
    };

    // ... other expressions here ...

    pluginProto.exps = new Exps();

}());
