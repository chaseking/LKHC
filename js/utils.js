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

    //Calculate all points
    for(keyYear in data.races){
        for(keyWeek in data.races[keyYear]){
            var obj = data.races[keyYear][keyWeek];

            for(category in obj.results){
                updateResults(obj.results[category]);
            }
        }
    }

    console.log(data);

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

function updateResults(results){
    if(!results || results.length === 0) return;

    var medianIndex = getMedianIndex(results);
    var median = results[medianIndex];

    median.seconds = stringToSeconds(median.time);
    median.points = 100;

    for(i in results){
        var index = parseInt(i);
        var result = results[i];

        result.place = index + 1;

        if(index !== medianIndex){
            result.seconds = stringToSeconds(result.time);
            result.points = round(median.points + ((median.seconds - result.seconds) / result.seconds * 100), 2);
        }
    }
}

function round(num, places){
    if(places === 0){
        return Math.round(num);
    }

    var mult = Math.pow(10, places);
    var str = new String(Math.round(num * mult) / mult);

    /*
    function pad(str){
        str = str + '.';
        return str.length > places ? str : pad(str + "0");
    }

    //.replace("/(\.\d*)?$/", pad);
    */

    return Number(str);
}

function secondsToString(totalSeconds){
    var min = Math.floor(totalSeconds / 60);
    var sec = totalSeconds % 60;

    return min + ":" + (sec < 10 ? "0" : "") + sec;
}

function stringToSeconds(str){
    var split = str.split(":");
    return (parseInt(split[0]) * 60) + parseInt(split[1]);
}

function getMedianIndex(results){
    return Math.ceil(results.length / 2) - 1;
}

function getLeaderboard(populator){
    var leaderboard = []; //name: "Chase King", team: "Team Swift", totalPoints: 1234, totalSeconds: 1234

    //Populate
    for(week = 1; week <= weekInfo.week; week++){
        console.log("Week " + week);
        var obj = getRaceInfo(weekInfo.year, week);

        populator(obj, leaderboard);
    }

    //Sort
    leaderboard.sort(function(a, b){
        return b.totalPoints - a.totalPoints;
    });

    console.log(leaderboard);

    return leaderboard;
}

function getPlaceString(place){
    var str = place.toString();

    //I love emojis.
    switch(place){
        case 1:
            str += " <i class='twa twa-lg twa-first-place-medal'></i><i class='twa twa-lg twa-crown'></i>";
            break;
        case 2:
            str += " <i class='twa twa-lg twa-second-place-medal'></i>"
            break;
        case 3:
            str += " <i class='twa twa-lg twa-third-place-medal'></i>"
            break;
        default:
            break;
    }

    return str;
}

function newTable(container, header, headerExtras, headings, borderColor){
    container.html("");
    var html;

    //Header
    if(header){
        html = "<h2>" + header;

        if(headerExtras && headerExtras.length > 0){
            html += "<span style='font-weight: normal; font-size: 15px; margin-left: 10px;'>"

            for(i in headerExtras){
                html += "<span style='margin-right: 20px'>" + headerExtras[i] + "</span>"
            }

            html += "</span>";
        }

        html += "</h2>";
        container.append(html);
    }

    html = "<table class='table table-sm table-hover table-bordered' style='font-size: 16px;" + (borderColor ? " border: " + borderColor + " 2px solid;" : "") + "'>";
    html += "<thead><tr>";

    for(i in headings){
        html += "<th>" + headings[i] + "</th>";
    }

    html += "</tr></thead><tbody>";

    return html;
}
