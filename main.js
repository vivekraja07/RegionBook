var color = d3.scaleLinear()
  // .domain([310575, 1893765]) 
  .domain([200000,1900000])  
  .range(["white","#8B008B"])




d3.json("topo.json", function (error, us) {
  if (error) throw error;

  var svg = d3.select("svg");
  var path = d3.geoPath();

  var features = topojson.feature(us, us.objects.regions).features

  // console.log(features)

  d3.csv("colleges.csv", function (csv) {

    var populationByRegion = d3.nest()
      .key(function (d) { return d.Region; })
      .rollup(function (v) { return d3.sum(v, function (d) { return d['Undergrad Population']; }); })
      .entries(csv);

    // console.log(populationByRegion)

    for (region in populationByRegion) {
      val = populationByRegion[region]
      regionName = val['key']
      pop = val['value']

      // console.log(regionName)
      // console.log(pop)

      // Find the corresponding state inside the GeoJSON
      // console.log(us)
      for (var j = 0; j < features.length; j++) {
        var usState = us.objects.regions.geometries[j].name;
        if (regionName == usState) {
          // console.log("success")
          // Copy the data value into the JSON
          features[j].properties.pop = pop;
          features[j].properties.regionName = regionName;

          // Stop looking through the JSON
          break;
        }
      }

    }
    // console.log(us)

    svg.append("g")
    .attr("class", "regions")
    .selectAll("path")
    .data(features)
    .enter().append("path")
    .attr("d", path)
    .attr('fill',function(d) { 
      // console.log(JSON.stringify(d.properties))
      // console.log(d.properties.pop)
      // console.log(d.properties.regionName)
      return color(d.properties.pop); 
    })
    .on("mouseover", function(d) {      
    	div.transition()        
      	   .duration(200)      
           .style("opacity", .9);      
           div.text(d.properties.regionName)
           .style("left", (d3.event.pageX) + "px")     
           .style("top", (d3.event.pageY - 28) + "px");    
	  })   
    // fade out tooltip on mouse out               
    .on("mouseout", function(d) {       
        div.transition()        
           .duration(500)      
           .style("opacity", 0);   
    });

  svg.append("path")
    .attr("class", "region-borders")
    .attr("d", path(topojson.mesh(us, us.objects.regions, function (a, b) { return a !== b; })));

  var div = d3.select("#chart1")
  .append("div")
    .attr("class", "tooltip")               
    .style("opacity", 0);

  })


  



});