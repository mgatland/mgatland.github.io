"use strict";

//globals

var formatBriefingString = function (raw) {
  if (raw === undefined) return "";
  var text = raw.replace(/\^1/g, '<br>');
  text = text.replace(/\^2/g, '<br><br>');

  //white is the default, so this white command does nothing
  text = text.replace(/\^w/g, '');

  if (text.lastIndexOf("^r", 0) >= 0) {
    text = "<span class='red'>" + text + "</span>";
    text = text.replace(/\^r/g, '');
  }

  if (text.lastIndexOf("^g", 0) >= 0) {
    text = "<span class='green'>" + text + "</span>";
    text = text.replace(/\^g/g, '');
  }

  if (text.lastIndexOf("^b", 0) >= 0) {
    text = "<span class='blue'>" + text + "</span>";
    text = text.replace(/\^b/g, '');
  }
  return text;
}

var createBriefing = function (rawMissionText) {
  var missionText = [];
  var missionButtons = [];
  for (var j = 0; j < rawMissionText.length; j++) {
    missionButtons[j] = [];
    var text = rawMissionText[j];
    if (text === undefined || text === null) continue; //hack, I don't know why this is needed

    //We have to process buttons first, otherwise the <br> filter corrupts them.
    while (text.lastIndexOf("^[") >= 0) {
      var buttonText = text.match(/\^\[.*?\]/)[0];
      text = text.replace(/\^\[.*?\]/, '');

      var index = toInt(buttonText.substring(2,3));
      var flag = toInt(buttonText.substring(buttonText.length - 3, buttonText.length - 1));
      var label = buttonText.substring(3, buttonText.length - 4);
      missionButtons[j][index] = { flag: flag, label: label};
    }

    text = formatBriefingString(text);
    missionText.push(text);
  }
  return {text: missionText, buttons: missionButtons};
}

var toInt = function (string) {
  return parseInt(string, 10);
}

function CampaignLoader() {

  var lines = [];

  var findSection = function (startTag, lines, i) {
    var skipped = 0;
    while (lines[i].lastIndexOf(startTag, 0) !== 0) {
      i++;
      skipped++;
    }
    console.log("Skipped " + skipped + " lines");
    console.log("Section " + startTag);
    return i+1;
  }

  this.loadNotes = function () {
    var notes = [];
    var i = findSection("[notes]", lines, 0);
    while (lines[i] != "[]") {
      if (lines.length === 0 || lines[i].substring(0,1) === "'") {
        i++;
        continue; //ignore comments and blanks
      }
      var text = CSVToArray(lines[i])[0];
      notes.push({text:formatBriefingString(text), live: false});
      i++;
    }
    return notes;
  };

  this.loadMission = function (level) {
    var mission = 0;
    var i = 0;
    while (i < lines.length) {
      if (lines[i].lastIndexOf("[MISSION", 0) === 0) {
        mission++;
        i++;
        console.log("Looking for level " + level + ", found " + mission);
        if (level != mission) continue;
        console.log("Level " + level);
        console.log("Size: " + lines[i])
        var sizes = CSVToArray(lines[i]); //size string e.g. "23,45"
        var width = toInt(sizes[0]) + 1; //yep, it's inclusive.
        var height = toInt(sizes[1]) + 1; //
        i++;
        //load all the terrain
        console.log("Terrain: ");
        var terrain = {};
        for (var row = 0; row < height; row++) {
          var line = lines[i].substring(1); //cut off leading quotation mark. The quotation mark at the end must also be ignored.
          i++;
          console.log(line);
          for (var col = 0; col < width; col++) {
            var tile = line.substring(col,col+1);
            switch (tile) {
              case ' ':
              case '*':
              case '~':
              case '!':
              case '`':
                terrain[col+":"+row] = 0;
                //ground
                break;
              default:
              var obsticleType = tile.charCodeAt(0) - 48; //a becomes 1?
              terrain[col+":"+row] = obsticleType;
            }
          }
        }
        console.log("ground type: " + lines[i]);
        var groundType = toInt(lines[i]);
        i++;
        var unusedBlankLine = lines[i];
        i++;
        console.log("player position: " + lines[i]);
        var pPos = CSVToArray(lines[i]);
        i++;
        var pX = toInt(pPos[0]);
        var pY = toInt(pPos[1]);
        var pFace = toInt(pPos[2]);

        var enemies = [];
        i = findSection("[enemy]", lines, i);
        //loading enemes:
        //"[]" ends the section
        while (lines[i] != "[]") {
          if (lines.length === 0 || lines[i].substring(0,1) === "'") {
            i++;
            continue; //ignore comments and blanks
          }
          var enemyLine = CSVToArray(lines[i]); //values are: index, x, y, type, state, goaldie, tag
          var x = toInt(enemyLine[1]);
          var y = toInt(enemyLine[2]);
          var type = toInt(enemyLine[3]);
          var state = enemyLine[4];
          var goalDie = toInt(enemyLine[5]) > 0 ? true : false;
          var tag = enemyLine[6];
          enemies.push({x:x, y:y, type:type, state: state, goalDie: goalDie, tag: tag});
          console.log(enemies[enemies.length - 1]);
          i++;
        }

        var triggers = [];
        i = findSection("[trigger]", lines, i);
        while (lines[i] != "[]") {
          if (lines.length === 0 || lines[i].substring(0,1) === "'") {
            i++;
            continue; //ignore comments and blanks
          }
          var line = CSVToArray(lines[i]);
          i++;

          var trigger = {};
          trigger.live = true;
          trigger.repeating = line[1] > 0 ? true: false;
          trigger.actWhen = line[2];
          trigger.cond = [];
          for (var j = 0; j < 2; j++) {
            var cond = {};
            cond.type = line[3+j*4];
            cond.val = [];
            cond.val[0] = line[4+j*4];
            cond.val[1] = line[5+j*4];
            cond.val[2] = line[6+j*4];
            trigger.cond[j] = cond;
          }
          trigger.act = [];
          for (var j = 0; j < 2; j++) {
            var act = {};
            act.type = line[11+j*4];
            act.val = [];
            act.val[0] = line[12+j*4];
            act.val[1] = line[13+j*4];
            act.val[2] = line[14+j*4];
            trigger.act[j] = act;
          }
          triggers.push(trigger);
        }
        console.log(triggers);

        var decs = [];
        var keySquares = [];
        i = findSection("[misc]", lines, i);
        while (lines[i] != "[]") {
          if (lines.length === 0 || lines[i].substring(0,1) === "'") {
            i++;
            continue; //ignore comments and blanks
          }
          var miscLine = CSVToArray(lines[i]);
          if (miscLine[0] === "dec") {
            decs.push({x: toInt(miscLine[1]), y:toInt(miscLine[2]), type:miscLine[3], live:miscLine[4] >= 0});
          } else if (miscLine[0] === "keysq") {
            keySquares.push({x: toInt(miscLine[1]), y:toInt(miscLine[2]), name:miscLine[3]});
          }
          i++;
        }

        i = findSection("[brief]", lines, i);
        var rawMissionText = CSVToArray(lines[i]);
        i++;
        var healAmount = toInt(lines[i]);
        i++;

        var briefing = createBriefing(rawMissionText);

        //now initialize the world and call the callback
        var world = new World(createGrid(width, height));
        world.level = level;
        world.groundType = groundType;
        world.healAmount = healAmount;
        world.setBriefing(briefing);
        world.setTriggers(triggers);
        world.map.forEach(function (pos, value) {
          var tile = terrain[pos.x + ":" + pos.y];
          world.map.set(pos, tile);
        });
        world.createPlayer(new Pos(pX, pY), pFace);
        enemies.forEach(function (e) {
          world.createEnemy(new Pos(e.x, e.y), e.type, e.state, e.goalDie, e.tag);
        });
        decs.forEach(function (d) {
          world.createDecoration(new Pos(d.x, d.y), d.type, d.live ? true : false);
        });
        keySquares.forEach(function (ks) {
          world.createKeySquare(new Pos(ks.x, ks.y), ks.name);
        });
        return world;
      } else {
        i++; //ignore all other lines.
      }
    }
  }

  this.load = function ( url, callback ) {
    var req = new XMLHttpRequest();
    req.open('GET', url);
    req.onreadystatechange = function() {
      if (req.readyState == 4) {
        if (req.status == 200) {
          //normalise different OS line endings
          var responseText = req.responseText.replace(/(\r\n|\n|\r)/gm, "\n");
          lines = responseText.split(/\n/g);
          callback();
        } else {
          throw "Error loading file " + url + ", request status " + req.status;
        }
      }
    };
    req.send();
  }


  //from http://stackoverflow.com/a/1293163
  // This will parse a delimited string into an array
  //The default delimiter is the comma, but this
  // can be overriden in the second argument.
  function CSVToArray( strData, strDelimiter ){
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
      (
        // Delimiters.
        "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

        // Quoted fields.
        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

        // Standard fields.
        "([^\"\\" + strDelimiter + "\\r\\n]*))"
      ),
      "gi"
      );


    // Create an array to hold our data.
    var arrData = [];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec( strData )){

      // Get the delimiter that was found.
      var strMatchedDelimiter = arrMatches[ 1 ];

      // Check to see if the given delimiter has a length
      // (is not the start of string) and if it matches
      // field delimiter. If id does not, then we know
      // that this delimiter is a row delimiter.
      if (
        strMatchedDelimiter.length &&
        (strMatchedDelimiter != strDelimiter)
        ){

        // We have reached a new row of data

      }


      // Now that we have our delimiter out of the way,
      // let's check to see which kind of value we
      // captured (quoted or unquoted).
      if (arrMatches[ 2 ]){

        // We found a quoted value. When we capture
        // this value, unescape any double quotes.
        var strMatchedValue = arrMatches[ 2 ].replace(
          new RegExp( "\"\"", "g" ),
          "\""
          );

      } else {

        // We found a non-quoted value.
        var strMatchedValue = arrMatches[ 3 ];

      }


      // Now that we have our value string, let's add
      // it to the data array.
      arrData.push( strMatchedValue );
    }

    // Return the parsed data.
    return( arrData );
  }

}
