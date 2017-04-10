dataCallback = function(){
    //Schedule
    var biggestYear = 0;

    table.html("<table class='table table-hover table-bordered'>"
        + "<thead>"
            + "<tr>"
                + "<th>Week</th>"
                + "<th>Date</th>"
                + "<th>Climb</th>"
                + "<th></th>"
            + "</tr>"
        + "</thead>"
        + "<tbody id='schedule-table-body'></tbody>"
    + "</table>");

    for(const keyYear in data.races){
        var year = parseInt(keyYear);

        for(const keyWeek in data.races[keyYear]){
            const week = data.races[keyYear][keyWeek];
            var info;

            if(week.results){
                info = "<a class='link' href='races.html#" + keyYear + "-" + keyWeek + "'><i class='twa twa-trophy'></i> <span style='font-size: 18px;'>Click to view results.</span></a>";
            } else if(week.signup){
                info = "<a class='link' href='" + week.signup + "' target='blank'><i class='twa twa-clipboard'></i> <span style='font-size: 18px; font-weight: bold; color: #e67e22'>Click to sign up!</span></a>";
            }

            $("#schedule-table-body").append(
                "<tr>"
                  + "<th scope='row'>" + keyWeek + "</th>"
                  + "<td>" + week.date + "</td>"
                  + "<td><a class='link' href='#climbs' onclick='setClimb('" + week.climb + "', true)'>" + week.climb + "</a></td>"
                  + "<td>" + info + "</td>"
                + "</tr>"
            );
        }

        if(year > biggestYear){
            biggestYear = year;
        }
    }

    $(".currentYear").each(function(){
        $(this).text(biggestYear);
    })

    //Climb selection
    var isSet = false;

    for(var climb in data.climbs){
        $("#climbSelection").append(
            "<li id='climbs-" + climb + "' onclick='setClimb(\"" + climb + "\")'><a>" + climb + "</a></li>"
        );

        //$("#climbs-" + climb).click(setClimb(climb)); //Call function setClimb() when it is clicked

        if(hash){
            if(hash === "climbs-" + climb){
                setClimb(climb, true);
            }
        } else if(!isSet){
            setClimb(climb);
            isSet = true;
        }
    }
};

var table = $("#schedule-table");

table.html("Loading...");

var climbData = $("#climbData");
var currentClimb;

function setClimb(climbName, scroll){
    if(currentClimb === climbName) return;

    if(scroll){
        scrollTo($("#climbs"));
    }

    if(scroll || hash){
        window.location.hash = "#climbs-" + climbName;
    }

    $("#climbSelectionButton").html(climbName + " <span class=\"caret\"></span>");

    //Fade out the old one
    const firstUpdate = !currentClimb;
    currentClimb = climbName;

    climbData.animate({ opacity: 0, height:'toggle' }, firstUpdate ? 0 : 750, function(){
        var html = "";
        var climb = data.climbs[climbName];

        if(climb){
            var climbInfo = "<ul style='list-style-type: circle;'>";
            if(climb.distanceMiles) climbInfo += "<li><strong>Distance:</strong> " + round(climb.distanceMiles, 2) + " miles (" + round(climb.distanceMiles * MILES_TO_KM, 2) + " km)</li>";
            if(climb.climbingFeet) climbInfo += "<li><strong>Elevation gain:</strong> " + climb.climbingFeet + " feet (" + round(climb.climbingFeet * FEET_TO_METERS, 0) + " m)</li>";
            if(climb.grade) climbInfo += "<li><strong>Average grade:</strong> " + climb.grade + "%</li>";
            if(climb.stravaSegment) climbInfo += "<li><a class='link' href='https://www.strava.com/segments/" + climb.stravaSegment + "' target='blank'><i class='twa twa-orange-book'></i> Click to view <strong>Strava</strong> segment.</a></li>";
            if(climb.bikeMapRoute) climbInfo += "<li><a class='link' href='https://www.bikemap.net/en/route/" + climb.bikeMapRoute + "' target='blank'><i class='twa twa-green-book'></i> Click to view <strong>BikeMap</strong> route.</a></li>";
            climbInfo += "</ul>";

            if(climb.info){
                html += "<div style='display: inline-block; width: 55%'>";

                for(i in climb.info){
                    html += "<p>" + climb.info[i] + "</p>";
                }

                html += "</div>";
                html += "<div style='display: inline-block: width: 40%; float: right'>";
                html += climbInfo;
                html += "</div>";
            } else {
                html += climbInfo;
            }
        } else {
            html += "<p>No data to display for " + climbName + "! :(</p>";
        }

        climbData.html(html);
    }).animate({ opacity: 1, height:'toggle' }, firstUpdate ? 0 : 750);
}
