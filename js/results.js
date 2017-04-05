var subHeader = $("#infoSubHeader");
var infoContainer = $("#infoContainer");
var resultsContainer = $("#resultsContainer");
var data; //SPecific week JSON data

subHeader.html("Loading...");
infoContainer.html("Loading...");
resultsContainer.html("Loading...");

$.getJSON("./json/2017-1.json", function(json){
    data = json;
    something();
});

function something(){
    subHeader.html(data.year + " Week " + data.week + " &middot; " + data.date + ", " + data.year + " &middot; <a class='link light' href='index.html#climbs'>" + data.climb + "</a>"); //TODO - Also call function?

    //Info container
    infoContainer.html("");
    var html = "<div style='font-size: 16px; margin-bottom: 5px; width: 55%; display: inline-block;'>"
    html += "<h2>Race Report:</h2>";

    for(var i in data.report){
        html += "<p style='margin-bottom: 5px;'>" + data.report[i] + "</p>";
    }

    infoContainer.append(html + "</div>");

    if(data.photos){
        html = "<div style='display: inline-block; float: right; width: 30%;'>";

        html += "<h2>Photos:</h2>";
        html += "<ul>";

        for(var key in data.photos){
            html += "<li><a class='link light' href='" + data.photos[key] + "' target='blank'>" + key + "</a></li>";
        }

        infoContainer.append(html + "</ul></div>");
    }

    //Results container
    resultsContainer.html("");
    appendTable("Men", data.results.men100PointReference, data.results.men);
    appendTable("Women", data.results.women100PointReference, data.results.women);
    appendTable("Hybrid-Electric", data.results.hybridElectric100PointReference, data.results.hybridElectric);
}

function appendTable(gender, pointRef, resultsList){
    var html = newTable(gender, pointRef);
    var winnerSeconds;

    for(var i in resultsList){
        var resultData = resultsList[i];
        var placeString = resultData.place.toString(); //TODO int to string
        var seconds = stringToSeconds(resultData.time);

        //I love emojis.
        switch(resultData.place){
            case 1:
                winnerSeconds = seconds;
                placeString += " <i class='twa twa-first-place-medal'></i><i class='twa twa-crown'></i>";
                break;
            case 2:
                placeString += " <i class='twa twa-second-place-medal'></i>"
                break;
            case 3:
                placeString += " <i class='twa twa-third-place-medal'></i>"
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
            + "<td>" + (resultData.strava ? "<a class='link' href='" + resultData.strava + "' target='blank'><i class='twa twa-chart-increasing'></i> Click to view.</a>" : "") + "</td>"
        + "</tr>";
    }

    resultsContainer.append(html + "</tbody>");
}

function newTable(gender, pointRef){
    resultsContainer.append("<h2>" + gender + " <span style='font-weight: normal; font-size: 15px;'>(100 point reference: " + pointRef + ")</span></h2>");

    return "<table class='table table-sm table-hover table-bordered' style='font-size: 16px;'>"
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
                + "<th>Strava</th>"
            + "</tr>"
        + "</thead>"
        + "<tbody>";
}

function secondsToString(seconds){
    var min = Math.floor(seconds / 60);
    var sec = seconds % 60;

    return min + ":" + (sec < 10 ? "0" : "") + seconds;
}

function stringToSeconds(str){
    var split = str.split(":");
    return parseInt(split[0]) * 60 + parseInt(split[1])
}
