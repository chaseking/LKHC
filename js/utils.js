const MILES_TO_KM = 1.60934;
const FEET_TO_METERS = 0.3048;

var hash;
var data;
var dataCallback;

if(window.location.hash){
    hash = window.location.hash.substring(1); //Remove the #
}

$.getJSON("./json/main.json", function(json){
    data = json;

    if(dataCallback){
        dataCallback();
    }
}).fail(function(){
    console.log("[*** WARNING ***] Failed to load JSON data file!")
});

function getRaceInfo(key){
    var split = key.split("-");
    return getRaceInfo(split[0], split[1]);
}

function getRaceInfo(yearStr, weekStr){
    return data.races[yearStr][weekStr];
}

function round(num, places){
    if(places === 0){
        return Math.round(num);
    }

    var mult = Math.pow(10, places);
    return Math.round(num * mult) / mult;
}
