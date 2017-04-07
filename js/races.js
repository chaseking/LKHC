const BORDER_MEN = "#2980b9";
const BORDER_WOMEN = "pink";
const BORDER_HYBRID_ELECTRIC = "#f1c40f";

var body = $("#body");
var subHeader = $("#infoSubHeader");
var infoText = $("#infoText");
var photos = $("#photos");
var volunteers = $("#volunteers");
var resultsContainer = $("#resultsContainer");
var resultsSelectionButton = $("#resultsSelectionButton");
var resultsSelection = $("#resultsSelectionDropdown");
var indivLead = $("#individualLeaderboardContainer");
var teamLead = $("#teamLeaderboardContainer");
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

    resultsSelectionButton.html(weekInfo.year + ": Week " + weekInfo.week + " <span class='caret'></span>");

    $(".year").each(function(){
        $(this).html(weekInfo.year);
    });

    $(".week").each(function(){
        $(this).html(weekInfo.week);
    });

    $(".date").each(function(){
        $(this).html(weekInfo.date + ", " + weekInfo.year);
    });

    $(".climbLink").each(function(){
        $(this).html("<a class='link light' href='index.html#climbs-" + weekInfo.climb + "'>" + weekInfo.climb + "</a>");
    });
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

    if(weekInfo.results.men && weekInfo.results.men.length > 0){
        newResultsTable("Men", BORDER_MEN, weekInfo.results.men);
    }

    if(weekInfo.results.women && weekInfo.results.women.length > 0){
        resultsContainer.append(spacing);
        newResultsTable("Women", BORDER_WOMEN, weekInfo.results.women);
    }

    if(weekInfo.results.hybridElectric && weekInfo.results.hybridElectric.length > 0){
        resultsContainer.append(spacing);
        newResultsTable("<i class='twa twa-high-voltage'></i> Hybrid-Electric", BORDER_HYBRID_ELECTRIC, weekInfo.results.hybridElectric);
    }

    //Leaderboard container
    var leaderboard = getLeaderboard(function(obj, leaderboard){
        for(i in obj.results.men){
            var result = obj.results.men[i];
            var entry = null;

            for(x in leaderboard){
                if(leaderboard[x].name === result.name){
                    entry = leaderboard[x];
                }
            }

            if(entry){
                entry.totalPoints += result.points;
                entry.totalSeconds += result.seconds;
                entry.totalRaces += 1;
            } else {
                entry = {
                    name: result.name,
                    team: result.team,
                    totalPoints: result.points,
                    totalSeconds: result.seconds,
                    totalRaces: 1
                };

                leaderboard.push(entry);
            }
        }
    });

    var html = newTable(indivLead, "Overall Individual Standings: Men", [ "Total entries: " + leaderboard.length ], [ "Place", "Name", "Total Points", "Team" ], BORDER_MEN);

    for(i in leaderboard){
        var entry = leaderboard[i];
        var placeString = getPlaceString(parseInt(i) + 1);

        html += "<tr>"
            + "<th scope='row'>" + placeString + "</th>"
            + "<td>" + entry.name + "</td>"
            + "<td>" + round(entry.totalPoints, 2) + "</td>" //TODO - Always two decimals
            + "<td>" + entry.team + "</td>"
        + "</tr>";
    }

    html += "</tbody></table>";
    indivLead.append(html);

    //TODO - Women

    //Team leaderboard
    var teamLeaderboard = getLeaderboard(function(obj, leaderboard){
        function handleResult(result){
            var entry = null;

            for(x in leaderboard){
                if(leaderboard[x].team === result.team){
                    entry = leaderboard[x];
                }
            }

            if(entry){
                entry.totalPoints += result.points;

                //Add if not exists
                if(entry.members.indexOf(result.name) == -1){
                    entry.members.push(result.name);
                }
            } else {
                entry = {
                    team: result.team,
                    totalPoints: result.points,
                    members: [ result.name ]
                };

                leaderboard.push(entry);
            }
        }

        for(i in obj.results.men){
            handleResult(obj.results.men[i]);
        }

        for(i in obj.results.women){
            handleResult(obj.results.men[i]);
        }
    });

    html = newTable(teamLead, "Overall Team Standings", [ "Total teams: " + teamLeaderboard.length ], [ "Place", "Team", "Total Points", "Members" ], "");

    for(i in teamLeaderboard){
        var entry = teamLeaderboard[i];
        var placeString = getPlaceString(parseInt(i) + 1);

        html += "<tr>"
            + "<th scope='row'>" + placeString + "</th>"
            + "<td>" + entry.team + "</td>"
            + "<td>" + round(entry.totalPoints, 2) + "</td>" //TODO - Always two decimals
            + "<td>" + entry.members.join(", ") + "</td>"
        + "</tr>";
    }

    html += "</tbody></table>";
    teamLead.append(html);
}

function newResultsTable(group, borderColor, resultsList){
    var html = newTable(resultsContainer, group, [ "Total participants: " + resultsList.length /*, "100-point reference: " + resultsList[getMedianIndex(resultsList)].time */ ],
    [ "Place", "Name", "Time", "Points", "Team", "Category", "Strava" ], borderColor);
    var winnerSeconds;

    for(var i in resultsList){
        var resultData = resultsList[i];
        var placeString = getPlaceString(resultData.place);

        if(resultData.place === 1){
            winnerSeconds = resultData.seconds;
        }

        html += "<tr>"
            + "<th scope='row'>" + placeString + "</th>"
            + "<td>" + resultData.name + "</td>"
            + "<td>" + resultData.time + (resultData.place > 1 ? " <span style='font-size: 13px; font-style: italic;'>(+" + secondsToString(resultData.seconds - winnerSeconds) + ")</span>" : "") + "</td>"
            + "<td>" + resultData.points + "</td>" //TODO - Always two decimals
            + "<td>" + resultData.team + "</td>"
            + "<td>" + resultData.category + "</td>"
            + "<td>" + (resultData.strava ? "<a class='link' href='" + resultData.strava + "' target='blank'><i class='twa twa-chart-increasing'></i></a>" : "") + "</td>"
        + "</tr>";
    }

    resultsContainer.append(html + "</tbody></table>");
}
