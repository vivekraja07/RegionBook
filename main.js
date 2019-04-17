
 var object

d3.json("topo.json", function(error, us) {
  if (error) throw error;

  var svg = d3.select("svg");
  var path = d3.geoPath();

  svg.append("g")
    .attr("class", "regions")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.regions).features)
    .enter().append("path")
      .attr("d", path)

      object = us
      

  svg.append("path")
      .attr("class", "region-borders")
      .attr("d", path(topojson.mesh(us, us.objects.regions, function(a, b) { return a !== b; })));

  d3.csv("colleges.csv", function (csv) {
    
    var populationByRegion = d3.nest()
      .key(function(d) { return d.Region; })
      .rollup(function(v) { return d3.sum(v, function(d) { return d['Undergrad Population']; }); })
      .entries(csv);

    console.log(populationByRegion)


  })
});