(function(window, undefined) {

function chord(options) {

  var width = 960,
      height = 500,
      innerRadius = Math.min(width, height) * .41,
      outerRadius = innerRadius * 1.1;
  var svg = d3.select(options.container).append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
  var handles = svg.append("g").attr("class", "handles");
  var ticks = svg.append("g").attr("class", "ticks");
  var chords = svg.append("g").attr("class", "chords");
  var chord = d3.layout.chord()
      .padding(.05)
      .sortSubgroups(d3.descending)
  var fill = d3.scale.ordinal()
      .domain(d3.range(4))
      .range(["#000000", "#FFDD89", "#957244", "#F26223"]);

  // addHandles
  function addHandles() {
    this.style("fill", function(d) { return fill(d.index); })
        .style("stroke", function(d) { return fill(d.index); })
        .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
        .on("mouseover", fade(.1))
        .on("mouseout", fade(1));
  }

  function addTicks() {

    this.attr("transform", function(d) {
          return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
              + "translate(" + outerRadius + ",0)";
        });

    this.append("line")
      .attr("x1", 1)
      .attr("y1", 0)
      .attr("x2", 5)
      .attr("y2", 0)
      .style("stroke", "#000");

    this.append("text")
      .attr("x", 8)
      .attr("dy", ".35em")
      .attr("transform", function(d) {
        return d.angle > Math.PI ? "rotate(180)translate(-16)" : null;
      })
      .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
      .text(function(d) { return d.label; });
  }

  function addChords() {
    this.attr("d", d3.svg.chord().radius(innerRadius))
        .style("fill", function(d) { return fill(d.target.index); })
        .style("opacity", 1);
  }

  return function(matrix) {

    chord.matrix(matrix);
    svg.selectAll("g").selectAll("g, path").remove();

    handles.selectAll("path")
        .data(chord.groups)
      .enter().append("path")
      .call(addHandles);

    ticks.selectAll("g")
        .data(chord.groups)
      .enter().append("g").selectAll("g")
        .data(groupTicks)
      .enter().append("g").call(addTicks);

    chords.selectAll("path")
        .data(chord.chords)
      .enter().append("path").call(addChords);

  }

  // Returns an array of tick angles and labels, given a group.
  function groupTicks(d) {
    var k = (d.endAngle - d.startAngle) / d.value;
    return d3.range(0, d.value, 1000).map(function(v, i) {
      return {
        angle: v * k + d.startAngle,
        label: i % 5 ? null : v / 1000 + "k"
      };
    });
  }

  // Returns an event handler for fading a given chord group.
  function fade(opacity) {
    return function(g, i) {
      svg.selectAll(".chords path")
          .filter(function(d) { return d.source.index != i && d.target.index != i; })
        .transition()
          .style("opacity", opacity);
    };
  }
}

document.addEventListener( "DOMContentLoaded", function() {
  // From http://mkweb.bcgsc.ca/circos/guide/tables/
  var matrix = [
    [11975,  5871, 8916, 2868],
    [ 1951, 10048, 2060, 6171],
    [ 8010, 16145, 8090, 8045],
    [ 1013,   990,  940, 6907]
  ];
  var myChord = chord({ container: "body" });

  myChord(matrix);

  setInterval(function() {
    matrix.forEach(function(row, idx) {
      row.forEach(function(_, jdx) {
        row[idx] = Math.random() * 3000 * (jdx + 1);
      });
    });
    myChord(matrix);
  }, 1500);

}, false);

}(this));
