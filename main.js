var formatComma = d3.format(',')
var formatDecimal = d3.format(".1f")

var selectValue = ''


d3.json("topo.json", function (error, us) {
  if (error) throw error;

  var svg = d3.select("svg");
  var path = d3.geoPath();

  var features = topojson.feature(us, us.objects.regions).features


  // console.log(features)

  var regionSelect = d3.select('#regionSelect')
  var regionSelect_html = document.getElementById('regionSelect');


  d3.csv("colleges.csv", function (csv) {

    ///////////////////////////////////////////////////////////////////////////
    ////////////////////////// Data Aggregation ////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    /* #region Main */


    var populationByRegion = d3.nest()
      .key(function (d) { return d.Region; })
      .rollup(function (v) { return d3.sum(v, function (d) { return d['Undergrad Population']; }); })
      .entries(csv);

    var popObject = d3.nest()
      .key(function (d) { return d.Region; })
      .rollup(function (v) { return d3.sum(v, function (d) { return d['Undergrad Population']; }); })
      .object(csv);


    var total = d3.nest()
      .rollup(function (v) { return d3.sum(v, function (d) { return d['Undergrad Population']; }); })
      .entries(csv);

    for (region in populationByRegion) {
      val = populationByRegion[region]
      regionName = val['key']
      pop = val['value']

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

    /* #endregion */


    ///////////////////////////////////////////////////////////////////////////
    ////////////////////////// Draw the Map ////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    // #region
    var color = d3.scaleLinear()
      // .domain([310575, 1893765]) 
      .domain([200000, 1900000])
      .range(["white", "#8B008B"])


    svg.append("g")
      .attr("class", "regions")
      .selectAll("path")
      .data(features)
      .enter().append("path")
      .attr("d", path)
      .attr('fill', function (d) {
        return color(d.properties.pop);
      })
      .attr("id", function(d) {
        var trim = d.properties.regionName.replace(/\s/g, "");
        return trim
      })
      .on("mouseover", function (d) {

        div.transition()
          .duration(200)
          .style("opacity", .9);
        div.text(formatComma(d.properties.pop))
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      // fade out tooltip on mouse out               
      .on("mouseout", function (d) {
        div.transition()
          .duration(500)
          .style("opacity", 0);
      })
      .on('click', selected)
          

    svg.append("path")
      .attr("class", "region-borders")
      .attr("d", path(topojson.mesh(us, us.objects.regions, function (a, b) { return a !== b; })));

    var div = d3.select("#chart1")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    function selected(d) {
      d3.select('.selectedRegion').classed('selectedRegion', false);
      d3.select(this).classed('selectedRegion', true);



      //need to access the regionName from 
        // console.log(d.properties.regionName)
        for (var i=0; i<regionSelect_html.options.length; i++){
          // console.log(regionSelect_html.options[i].value)
          if (regionSelect_html.options[i].value == d.properties.regionName){
            // console.log(regionSelect_html.options[i].value)
            regionSelect_html.options[i].selected = true;
            onchange()
              break;
          }
      }
    
    }

    // #endregion

    ///////////////////////////////////////////////////////////////////////////
    ////////////////////////// Draw the legend ////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    // #region

    //Color Legend container
    var legendsvg = svg.append("g")
      .attr("transform", "translate(600,20)")



    //Append title
    legendsvg.append("text")
      .attr("class", "legendTitle")
      .attr("x", 0)
      .attr("y", -4)
      .text("Undergraduate Population (100,000's)");

    //Append a defs (for definition) element to your SVG
    var defs = svg.append("defs");

    //Append a linearGradient element to the defs and give it a unique id
    var linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient");


    linearGradient.selectAll("stop")
      .data(color.range())
      .enter().append("stop")
      .attr("offset", function (d, i) { return i / (color.range().length - 1); })
      .attr("stop-color", function (d) { return d; });

    //Draw the rectangle and fill with gradient
    legendsvg.append("rect")
      .attr("width", 300)
      .attr("height", 20)
      .style("fill", "url(#linear-gradient)")

    var colorScale = d3.scaleLinear()
      // .domain([310575, 1893765]) 
      .domain([310575, 1893765])
      .range([0, 300])

    //Define x-axis
    xAxis = d3.axisBottom(colorScale)
      .tickFormat(function (d) {
        return d / 100000
      })

    //Set up X axis
    legendsvg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + (20) + ")")
      .call(xAxis);

    // #endregion
    ///////////////////////////////////////////////////////////////////////////
    ////////////////////////// Labels /////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    // #region

    var labels = svg.append("g").attr("class", "label-group");
    labels.selectAll(".label")
      .data(features)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", function (d) {
        return path.centroid(d)[0];
      })
      .attr("y", function (d) {
        return path.centroid(d)[1];
      })
      .text(function (d) {
          return d.properties.regionName;
      });

      // #endregion

    ///////////////////////////////////////////////////////////////////////////
    ////////////////////////// Select Logic ////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    

    regionSelect
      .on('change', onchange)

    ///////////////////////////////////////////////////////////////////////////
    ////////////////////////// Explanation Logic ////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    function onchange() {
      selectValue = regionSelect.property('value')
      sentence = selectValue + ' has a total undergraduate population of ' + formatComma(popObject[selectValue]) + '. '
      sentence += 'My favorite country, The United States of America, has a total undergrad population of ' + formatComma(total) + '. '
      sentence += 'Math tells us that ' + selectValue + ' makes up ' + formatDecimal(popObject[selectValue] / total * 100) + '% of \'Merica\'s undergrad population'
      
      d3.select('#explanation1')
        .text(sentence)
      
        //select the region which the dropdown selects
      console.log(d3.select('#'+selectValue))
      console.log(selectValue)
      

      d3.select('.selectedRegion').classed('selectedRegion', false);
      d3.select('#'+(selectValue).replace(/\s/g, "")).classed('selectedRegion', true);
    
      
    };

    selectValue = regionSelect.property('value')
    if (selectValue !== '') {
      console.log('going to onchange')
      onchange()
    }

  })






});