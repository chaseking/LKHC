var body = $("#body");
var subHeader = $("#infoSubHeader");
var infoText = $("#infoText");
var photos = $("#photos");
var volunteers = $("#volunteers");
var resultsContainer = $("#resultsContainer");
var resultsSelectionButton = $("#resultsSelectionButton");
var resultsSelection = $("#resultsSelectionDropdown");
var weekInfo; //Specific week JSON data

dataCallback = function(){
    var lastData;

    for(var keyYear in data.races){
        var year = parseInt(keyYear);

        resultsSelectionButton.html("<span class='caret'></span>");
        resultsSelection.append("<h6 class='dropdown-header'>" + keyYear + ":</h6>");

        for(var keyWeek in data.races[keyYear]){
            var week = parseInt(keyWeek);
            var weekObj = data.races[keyYear][keyWeek];

            if(!weekObj.results){
                continue;
            }

            resultsSelection.append("<li><a onclick='setWeekInfo(getRaceInfo(" + year + ", " + week + "), true)'>" + keyYear + ": Week " + keyWeek + " (" + weekObj.climb + ")</a></li>");

            lastData = weekObj;

            if(hash && hash === keyYear + "-" + keyWeek){
                setWeekInfo(weekObj);
            }
        }
    }

    if(lastData && !weekInfo){
        setWeekInfo(lastData);
    }
};

function setWeekInfo(json, changeURL){
    if(weekInfo === json) return;
    var firstUpdate = !weekInfo;

    weekInfo = json;
    body.animate({ opacity: 0 }, firstUpdate ? 0 : 750, updateData).animate({ opacity: 1 }, firstUpdate ? 2000 : 750); //Fade out the old one

    if(hash || changeURL){
        window.location.hash = "#" + weekInfo.year + "-" + weekInfo.week;
    }

    subHeader.html("<strong>" + weekInfo.year + ": Week " + weekInfo.week + "</strong> &middot; " + weekInfo.date + ", " + weekInfo.year + " &middot; <a class='link light' href='index.html#climbs-" + weekInfo.climb + "'>" + weekInfo.climb + "</a>"); //TODO - Also call function?
    resultsSelectionButton.html(weekInfo.year + ": Week " + weekInfo.week + " <span class='caret'></span>");
}

function updateData(){
    //Info container
    infoText.html("");
    $("#info").css("display", "block");

    if(weekInfo.report){
        infoText.append("<h2 style='margin-bottom: 5px; text-decoration: underline;'>Ride Report:</h2>");

        for(var i in weekInfo.report){
            infoText.append("<p style='margin-bottom: 10px;'>" + weekInfo.report[i] + "</p>");
        }
    }

    if(weekInfo.volunteers){
        var html = "<h2 style='text-decoration: underline;'>Special thanks to our <a class='link light' href='index.html#volunteer'>volunteers</a>:</h2>";

        for(var i in weekInfo.volunteers){
            html += "<li style='list-style: none; font-size: 16px; margin-bottom: 10px; margin-right: 30px; display: inline-block;'>"
            + "<i class='twa twa-heart'></i> " + weekInfo.volunteers[i]
            + "</li>";
        }

        html += "</ul>";
        volunteers.html(html);
    }

    if(weekInfo.photos){
        var html = "<h2 style='margin-bottom: 5px; text-decoration: underline;'>Photos:</h2>" + "<ul>";

        for(var key in weekInfo.photos){
            html += "<li style='list-style: none; font-size: 16px; margin-bottom: 10px;'>"
            + "<i class='twa twa-camera'></i> <a class='link' href='" + weekInfo.photos[key] + "' target='blank'>" + key + "</a>"
            + "</li>";
        }

        html += "</ul>";

        photos.html(html);
        infoText.css("width", "35%")
    } else {
        infoText.css("width", "100%");
    }

    if(!infoText.html()){
        $("#info").css("display", "none");
    }

    //Results container
    resultsContainer.html("");
    var spacing = "<div style='width: 100%; height: 15px;'></div>";
    appendTable("Men", "#2980b9", weekInfo.results.men100PointReference, weekInfo.results.men);

    if(weekInfo.results.women && weekInfo.results.women.length > 0){
        resultsContainer.append(spacing);
        appendTable("Women", "pink", weekInfo.results.women100PointReference, weekInfo.results.women);
    }

    if(weekInfo.results.hybridElectric && weekInfo.results.hybridElectric.length > 0){
        resultsContainer.append(spacing);
        appendTable("<i class='twa twa-high-voltage'></i> Hybrid-Electric", "#f1c40f", weekInfo.results.hybridElectric100PointReference, weekInfo.results.hybridElectric);
    }
}

function appendTable(group, color, pointRef, resultsList){
    var html = newTable(group, color, pointRef);
    var winnerSeconds;

    for(var i in resultsList){
        var resultData = resultsList[i];
        var placeString = resultData.place.toString(); //TODO int to string
        var seconds = stringToSeconds(resultData.time);

        //I love emojis.
        switch(resultData.place){
            case 1:
                winnerSeconds = seconds;
                placeString += " <i class='twa twa-lg twa-first-place-medal'></i><i class='twa twa-lg twa-crown'></i>";
                break;
            case 2:
                placeString += " <i class='twa twa-lg twa-second-place-medal'></i>"
                break;
            case 3:
                placeString += " <i class='twa twa-lg twa-third-place-medal'></i>"
                break;
            default:
                break;
        }

        html += "<tr>"
            + "<th scope='row'>" + placeString + "</th>"
            + "<td>" + resultData.name + "</td>"
            + "<td>" + resultData.time + (resultData.place > 1 ? " <span style='font-size: 13px; font-style: italic;'>(+" + secondsToString(seconds - winnerSeconds) + ")</span>" : "") + "</td>" //TODO - Seconds down from leader: "18:29 (+30s)" / "19:29 (+1:30)"
            + "<td>" + "???" + "</td>" //TODO - Calculate points
            + "<td>" + resultData.category + "</td>"
            + "<td>" + resultData.team + "</td>"
            + "<td>" + (resultData.strava ? "<a class='link' href='" + resultData.strava + "' target='blank'><i class='twa twa-chart-increasing'></i></a>" : "") + "</td>"
        + "</tr>";
    }

    resultsContainer.append(html + "</tbody>");
}

function newTable(group, color, pointRef){
    resultsContainer.append("<h2>" + group + " <span style='font-weight: normal; font-size: 15px;'>(100 point reference: " + pointRef + ")</span></h2>");

    return "<table class='table table-sm table-hover table-bordered' style='font-size: 16px; border: " + color + " 2px solid;'>"
        + "<thead>"
            + "<tr>"
                //+ "<th width='70px'>Place</th>"
                //+ "<th>Name</th>"
                //+ "<th width='80px'>Time</th>"
                //+ "<th width='70px'>Points</th>"
                + "<th>Place</th>"
                + "<th>Name</th>"
                + "<th>Time</th>"
                + "<th>Points</th>"
                + "<th>Category</th>"
                + "<th>Team</th>"
                + "<th width='60px'>Strava</th>"
            + "</tr>"
        + "</thead>"
        + "<tbody>";
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
