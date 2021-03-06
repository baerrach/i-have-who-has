// Polyfill
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
    'use strict';
    var O = Object(this);
    var len = parseInt(O.length) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1]) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
          (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        return true;
      }
      k++;
    }
    return false;
  };
}

var defaults = {
  numberOfCards: 30,
  hours: "1-12",
  minutes: "0-59"
};
var ui = {};

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function pickRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function setupUi() {
  d3.select("#button-generate-manually").on('click', generateManually);
  d3.select("#button-generate-randomly").on('click', generateRandomly);
  d3.select("#button-preset-oclock").on('click', presetOclockOnly);
  d3.select("#button-preset-oclock-and-half-hour").on('click', presetOclockAndHalfHour);
  d3.select("#button-preset-oclock-and-quarter-hour").on('click', presetOclockAndQuarterHour);
  d3.select("#button-apply-css").on('click', applyCss);

  // These are unique and we want the html element not the d3 wrapper
  ui.manualData = d3.select("#manual-data")[0][0];
  ui.numberOfCards = d3.select("#numberOfCards")[0][0];
  ui.hours = d3.select("#hours")[0][0];
  ui.minutes = d3.select("#minutes")[0][0];
  ui.css = d3.select("#advanced-css")[0][0];

  if (history.state) {
    setState(history.state);
  }
  else {
    var uri = URI();
    setState(uri.query(true));
  }

  applyCss();
}

function generateManually(ignorePushState) {
  if (undefined === ignorePushState) {
    ignorePushState = false;
  }
  var manualData =  ui.manualData.value;
  var times = manualData.split("\n");
  if (times.length < 2) {
    console.log("ERROR: Needs at least two lines of data");
    return;
  }
  generate(times, ignorePushState);
}

function generateRandomly() {
  var numberOfCards,
      hours,
      minutes,
      generationSpace,
      card,
      cards = [];

  numberOfCards = ui.numberOfCards.value;
  if ("" === numberOfCards) {
    numberOfCards = defaults.numberOfCards;
  }

  hours = ui.hours.value;
  if ("" === hours) {
    hours = defaults.hours;
  }
  hours = rangeParser.parse(hours).filter( onlyUnique );

  minutes = ui.minutes.value;
  if ("" === minutes) {
    minutes = defaults.minutes;
  }
  minutes = rangeParser.parse(minutes).filter( onlyUnique );

  generationSpace = hours.length * minutes.length;
  if (numberOfCards > generationSpace) {
    console.log( "ERROR: number of cards requested more than possible number of cards that can be generated.");
    numberOfCards = generationSpace;
  }

  while (cards.length < numberOfCards) {
    card = pickRandomElement(hours);
    card += ":";
    card += ("0" + pickRandomElement(minutes)).slice(-2); // ensure 0-9 -> 00 - 09

    if (!cards.includes(card)) {
      cards.push(card);
    }
  }

  ui.manualData.value = cards.join("\n");
  generateManually();
}

function presetOclockOnly() {
  ui.hours.value = defaults.hours;
  ui.minutes.value = "00";
  generateRandomly();
}

function presetOclockAndHalfHour() {
  ui.hours.value = defaults.hours;
  ui.minutes.value = "00,30";
  generateRandomly();
}

function presetOclockAndQuarterHour() {
  ui.hours.value = defaults.hours;
  ui.minutes.value = "00,15,30,45";
  generateRandomly();
}

function generate(times, ignorePushState) {
  var iHaveWhoHas = d3.select(".worksheet").selectAll(".i-have-who-has").data(times);
  var newOnes = iHaveWhoHas.enter().append("div").classed("i-have-who-has", true);
  newOnes.append("div").classed("mascot", true).classed("fit-image", true);
  newOnes.append("div").classed("ihave", true);
  newOnes.append("div").classed("whohas", true).append("span");

  iHaveWhoHas.each(function (d, i) {
    d3.select(this).select(".ihave").attr("id", "clock" + i)
      .each(function(d) {
        d3.select(this).select("svg").remove();
        var time = d.split(":");
        var theTime = new Date();
        theTime.setHours(time[0]);
        theTime.setMinutes(time[1]);
        d3clock({
          target: '#clock'+i,
          date: theTime,
          face: 'braun',
          width: 225,
          height: 225
        });
      });
    d3.select(this).select(".whohas > span")
      .each(function(d) {
        d3.select(this).text(times[(i+1)%times.length]);
      });;
  });
  iHaveWhoHas.exit().remove();

  var answer = d3.select(".answer-key ul").selectAll(".answer").data(times);
  answer.enter().append("li").classed("answer", true);
  answer.text(function (d) { return d; });
  answer.exit().remove();

  if (!ignorePushState) {
    updateURL();
  }
}

function updateURL() {
  var uri = URI("");
  var state = {};

  state.manualData = ui.manualData.value;
  state.numberOfCards = ui.numberOfCards.value;
  state.hours = ui.hours.value;
  state.minutes = ui.minutes.value;

  uri.setQuery(state);

  history.pushState(state, "", uri);
}

function setState(state) {
  if (state) {
    if ("manualData" in state) {
      ui.manualData.value = state.manualData;
    }
    if ("numberOfCards" in state) {
      ui.numberOfCards.value = state.numberOfCards;
    }
    if ("hours" in state) {
      ui.hours.value = state.hours;
    }
    if ("minutes" in state) {
      ui.minutes.value = state.minutes;
    }
    if ("css" in state) {
      ui.css.value = state.css;
    }
    generateManually(false);
  }
}

function applyCss() {
  var customStyle = document.head.children[document.head.children.length-1];

  customStyle.innerHTML = ui.css.value;
}

window.onpopstate = function(event) {
  setState(event.state);
};
