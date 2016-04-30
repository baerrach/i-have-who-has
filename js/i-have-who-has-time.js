function setupUi() {
  var ui;

  ui = d3.select("#button-manual-generate");
  ui.on('click', generateManually);
}

function generateManually() {
  var manualData = d3.select("#manual-data")[0][0].value;
  var times = manualData.split("\n");
  if (times.length < 2) {
    console.log("ERROR: Needs at least two lines of data");
    return;
  }
  generate(times);
}

//var nums = rangeParser.parse('4,6,8-10,12,14..16,18,20...23');
//console.log(nums.join(", "));

function generate(times) {
  console.log("generating");
  var iHaveWhoHas = d3.select(".worksheet").selectAll(".i-have-who-has").data(times);
  var newOnes = iHaveWhoHas.enter().append("div").classed("i-have-who-has", true);
  newOnes.append("div").classed("mascot", true);
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
          width: 250,
          height: 250
        });
      });
    d3.select(this).select(".whohas > span")
      .each(function(d) {
        d3.select(this).text(times[(i+1)%times.length]);
      });;
  });
  iHaveWhoHas.exit().remove();

  var answer = d3.select(".answerKey ul").selectAll(".answer").data(times, String);
  answer.enter().append("li").classed("answer", true);
  answer.text(function (d) { return d;});
  answer.exit().remove();
}
