function GetPluginSettings() {
    return {
        "name": "Philips Hue API",
        "id": "PhilipsHue",
        "version": "1.0",
        "description": "This plugin controls Philips Hues Lights",
        "author": "Pascal Drewes - Stenden University - INF1B",
        "help url": "https://github.com/INF1B-Project-Inovate/game",
        "category": "General",
        "type": "object",
        "rotatable": false,
        "flags": 0
			| pf_singleglobal
    };
};

// Conditions that exist in the edit environment

AddCondition(0, cf_none, "Is the Hue bridge connected",
							"Bridge",
							"Is Hue Bridge connected",
							"Check of de Hue bridge verbonden is of niet",
							"isBridgeConnected");

AddCondition(1, cf_none, "Is the game user whitelisted",
							"Bridge",
                            "Has Bridge permission",
							"Check of er permissie is om bepaalde acties uit te voeren (zoals lampen besturen)",
							"isWhitelisted");

AddCondition(2, cf_trigger, "Trigger when list of lights is recieved",
							"Bridge",
							"Light list recieved",
							"Door middel van deze trigger weet de rest van de applicatie wanneer het de lijst van lampen kan weergeven zodat deze ingesteld kunnen worden voor gebruik",
							"lightListRecieved");


AddComboParamOption("Mono (1)");
AddComboParamOption("Stereo (2)");
AddComboParamOption("Trio (3)");
AddComboParam("Choose a lightmode", "Controle of deze specifieke lamp(en) beschikbaar is/zijn om waardes naar toe te sturen. In mono modus is alleen de middelste lamp beschikbaar, in stereo modus zijn de buitenste twee lampen beschikbaar en in trio modus zijn alle 3 de lampen beschikbaar", initial_selection = 2);

AddCondition(3, cf_none, "Which lights are available",
							"Lights",
							"Is in light mode {0}",
							"Controle of deze specifieke lamp(en) beschikbaar is/zijn om waardes naar toe te sturen. In mono modus is alleen de middelste lamp beschikbaar, in stereo modus zijn de buitenste twee lampen beschikbaar en in trio modus zijn alle 3 de lampen beschikbaar",
							"inLightMode");

AddCondition(4, cf_trigger, "Trigger when autoconnect failed",
							"Bridge",
							"Autoconnect failed",
							"Trigger wanneer de auto connect geen Hue Bridge heeft gevonden",
							"trigAutoConnectFailed");

AddCondition(5, cf_trigger, "Trigger when manual connect failed",
							"Bridge",
							"Manual connect failed",
							"Trigger wanneer de manual connect geen response heeft op het ingevulde IP adres",
							"trigManConnectFailed");

AddCondition(6, cf_trigger, "Trigger when link button must be pressed",
                            "Bridge",
                            "Link button must be pressed",
                            "Trigger wanneer de gebruiker op de link knop moet drukken",
                            "trigLinkButton");

AddCondition(7, cf_trigger, "Trigger when connect succeeded",
                            "Bridge",
                            "Connect succeeded",
                            "Trigger wanneer de connect positief is afgerond",
                            'trigConnectSucceeded');

AddCondition(8, cf_looping, "Loop over recieved lights",
                            "Lights",
                            "Loop over lights",
                            "Deze loop gaat elke lamp bij langs om een actie hierop uit te voeren",
                            "hasNextLight");

// Actions that exist in the edit environment

AddStringParam("IP-adres Hue Bridge", "IP-adres van de Hue Bridge");
AddAction(0, af_none, "Manual connect Hue Bridge",
						"Bridge",
						"Connect to bridge on IP {0}",
						"Deze functie maakt verbinding met de Hue bridge op het opgegeven IP adres",
						"manualConnectHueBridge");

AddAction(1, af_deprecated, "Gain permission on the bridge",
						"Bridge",
						"Gain permission on the bridge",
						"Registreer een nieuwe gebruiker op de Philips Hue bridge om lampen mee aan te sturen",
						"gainPermission");

AddNumberParam("Lamp ID", "The ID of the lamp which should go into a slot");
AddComboParamOption("Left");
AddComboParamOption("Middle");
AddComboParamOption("Right");
AddComboParam("Choose a slot to set", "Choose a slot to set a specific lamp to");
AddAction(2, af_none, "Set a light to a specific slot",
						"Bridge",
						"Set light {0} to slot {1}",
						"Deze functie zet een lamp in een van de drie slots zodat het refereren naar deze lamp makkelijker gaat",
						"setLightSlot");

AddComboParamOption("Left");
AddComboParamOption("Middle");
AddComboParamOption("Right");
AddComboParam("Choose a slot", "Choose a slot to send a specific Color to");
AddNumberParam("Hue", "The Color Hue (between 0 & 65535):");
AddNumberParam("Saturation", "The Color saturation (between 0 & 254):");
AddNumberParam("Brightness", "The brightness of the light (between 0 & 254):");
AddNumberParam("Time", "The fade time to switch the light to (multiples of 100ms");
AddAction(3, af_none, "Set a light to a specific Color",
						"Light",
						"Set light {0} to H:{1},S:{2},B:{3} during {4}",
						"Met deze functie is het mogelijk om een lamp een kleur, verzadiging en helderheid mee te geven",
						"setLightColor");

AddAction(4, af_none, "Auto connect Hue Bridge",
                        "Bridge",
                        "Auto connect bridge",
                        "Deze functie maakt verbinding met de Hue bridge door het IP adres te zoeken",
                        "autoConnectHueBridge");

AddAction(5, af_none, "Go to the next light available",
                        "Light",
                        "Go to next light",
                        "Deze loop gaat elke lamp bij langs om een actie hierop uit te voeren",
                        "goToNextLight");

// Expressions used in other events

AddExpression(0, ef_return_string, "(Boolean) Is bridge connected?",
    "Bridge",
    "isBridgeConnected",
    "Geeft een boolean terug die aangeeft of de Hue bridge verbonden is");

AddExpression(1, ef_return_string, "(Boolean) Is bridgeUser whitelisted?",
    "Bridge",
    "isWhitelisted",
    "Geeft een boolean terug of er permissie is om bepaalde acties uit te voeren");

AddExpression(2, ef_return_string, "(JSON) All available lights",
    "Lights",
    "lights",
    "Een JSON string met alle beschikbare lampen op de bridge");

AddExpression(3, ef_return_string, "(JSON) All used lights",
    "Lights",
    "usedLights",
    "Een JSON string met alle beschikbare lampen op de bridge");

AddExpression(4, ef_return_string, "Current light ID (in the loop)",
    "Lights",
    "currentLightID",
    "Dit is de ID van de volgende lamp in de loop");

AddExpression(5, ef_return_string, "Current IP adress of the bridge",
    "Bridge",
    "BridgeIP",
    "Het IP adress van de Philips Hue bridge");


////////////////////////////////////////
ACESDone();

////////////////////////////////////////

var property_list = []; // No properties needed, since this is a global object

// Called by IDE when a new object type is to be created
function CreateIDEObjectType() {
    return new IDEObjectType();
}

// Class representing an object type in the IDE
function IDEObjectType() {
    assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new object instance of this type is to be created
IDEObjectType.prototype.CreateInstance = function (instance) {
    return new IDEInstance(instance);
}

// Class representing an individual instance of an object in the IDE
function IDEInstance(instance, type) {
    assert2(this instanceof arguments.callee, "Constructor called as a function");

    // Save the constructor parameters
    this.instance = instance;
    this.type = type;

    // Set the default property values from the property table
    this.properties = {};

    for (var i = 0; i < property_list.length; i++)
        this.properties[property_list[i].name] = property_list[i].initial_value;
}