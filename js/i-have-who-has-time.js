var times = [
  "8:55",
  "9:30",
  "10:17",
  "11:03",
  "11:45",
  "12:08",
  "12:55",
  "1:20",
  "1:40",
  "2:08",
  "2:35",
  "3:10",
  "3:38",
  "4:09",
  "4:42",
  "5:05",
  "5:38",
  "5:59",
  "6:11",
  "6:53",
  "7:09",
  "7:27",
  "7:58",
  "8:17",
  "8:49",
  "9:15",
  "9:35",
  "10:06",
  "10:30",
  "11:07",
];

var iHaveWhoHas = d3.select(".worksheet").selectAll(".i-have-who-has").data(times)
      .enter().append("div").classed("i-have-who-has", true)
      .each(function (d, i) {
        d3.select(this).append("div").classed("mascot", true);
        d3.select(this).append("div").classed("ihave", true).attr("id", "clock" + i)
          .each(function(d) {
            var time = d.split(":");
            var theTime = new Date();
            theTime.setHours(time[0]);
            theTime.setMinutes(time[1]);
            d3clock({
              target:'#clock'+i,
              date: theTime,
              face:'braun',
              width:250,
              height:250,
            });
          });
        d3.select(this).append("div").classed("whohas", true)
          .each(function(d) {
            d3.select(this).append("span").text(times[(i+1)%times.length]);
          });;
      });

var answer = d3.select(".answerKey ul").selectAll(".answer").data(times, String);
answer.enter().append("li").classed("answer", true).text(function (d) { return d;});
answer.exit().remove();
