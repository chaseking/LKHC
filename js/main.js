const MILES_TO_KM = 1.60934;
const FEET_TO_METERS = 0.3048;
var climbs;
var schedule;

$.getJSON("./json/climbs.json", function(json){
    climbs = json;

    var isSet = false;

    for(var climb in climbs){
        $("#climbSelection").append(
            "<li id='climbSelection" + climb + "'><a>" + climb + "</a></li>"
        );

        $("#climbSelection" + climb).click(setClimb(climb)); //Call function setClimb() when it is clicked

        if(!isSet){
            setClimb(climb);
            isSet = true;
        }
    }
});

var table = $("#schedule-table");

table.html("Loading...");

$.getJSON("./json/schedule.json", function(json){
    schedule = json;

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

    for(const keyYear in schedule){
        var year = parseInt(keyYear);

        for(const keyWeek in schedule[keyYear]){
            const week = schedule[keyYear][keyWeek];

            $("#schedule-table-body").append(
                "<tr>"
                  + "<th scope='row'>" + keyWeek + "</th>"
                  + "<td>" + week.date + "</td>"
                  + "<td><a class='link' href='#climbs' onclick='setClimb('" + week.climb + "')'>" + week.climb + "</a></td>"
                  + "<td id='infoWeek" + keyWeek + "'></td>"
                + "</tr>"
            );

            const infoElement = $("#infoWeek" + keyWeek);

            //Check if results file exists
            $.getJSON("./json/" + keyYear + "-" + keyWeek + ".json", function(json){
                infoElement.html("<a class='link' href='results.html#" + keyYear + "-" + keyWeek + "'><i class='twa twa-trophy'></i> <span style='font-size: 18px;'>Click to view results.</span></a>");
            }).fail(function(){
                if(week.signup){
                    infoElement.html("<a class='link' href='" + week.signup + "' target='blank'><i class='twa twa-clipboard'></i> <span style='font-size: 18px; font-weight: bold; color: #e67e22'>Click to sign up!</span></a>")
                }
            })
        }

        if(year > biggestYear){
            biggestYear = year;
        }
    }

    $(".currentYear").each(function(){
        $(this).text(biggestYear);
    })
});

var climbData = $("#climbData");

function setClimb(climbName){
    $("#climbSelectionButton").html(climbName + " <span class=\"caret\"></span>");

    climbData.html("");

    var climb = climbs[climbName];

    if(climb){
        climbData.append("<ul style=''>")
        climbData.append("<li><strong>Distance:</strong> " + climb.distanceMiles + " miles (" + (climb.distanceMiles * MILES_TO_KM) + " km)</li>"); //TODO - Format decimal
        climbData.append("<li><strong>Elevation gain:</strong> " + climb.climbingFeet + " feet (" + (climb.climbingFeet * FEET_TO_METERS) + " m)</li>");
        climbData.append("<li><strong>Average grade:</strong> " + climb.grade + "%</li>");
        climbData.append("<li><a class='link' href='" + climb.stravaSegment + "'>Click to view Strava segment.</a></li>");

        if(climb.bikeMapRoute){
            climbData.append("<li><a class='link' href='" + climb.bikeMapRoute + "'>Click to view BikeMap route.</a></li>");
        }

        climbData.append("</ul>")
    } else {
        climbData.append("<h2>No data to display for " + climbName + "! :()</h2>")
    }
}
