var formatComma = d3.format(',')
var formatDecimal = d3.format(".1f")

var selectValue = ''


d3.json("topo.json", function (error, us) {
  if (error) throw error;

  var svg = d3.select("#mapSVG");
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
      // also add in onchange for percentage which one does better

      selectValue = regionSelect.property('value')
      regionSelect_html.value = selectValue
      sentence = selectValue + ' has a total undergraduate population of ' + formatComma(popObject[selectValue]) + '. '
      sentence += 'The United States of America has a total undergrad population of ' + formatComma(total) + '. '
      sentence += selectValue + ' makes up around ' + formatDecimal(popObject[selectValue] / total * 100) + '% of America\'s undergrad population.'
      
      d3.select('#explanation1')
        .text(sentence)
      
      //select the region which the dropdown selects
      console.log(d3.select('#'+selectValue))
      console.log(selectValue)
      

      d3.select('.selectedRegion').classed('selectedRegion', false);
      d3.select('#'+(selectValue).replace(/\s/g, "")).classed('selectedRegion', true);

      var selectedRegion = selectValue

         // d3 code here
    var fileName = "colleges.csv"

    // **** Your JavaScript code goes here ****
    d3.select('#svg1').selectAll("g").remove();

    var svg = d3.select('#svg1');
    var dimensions = {};
    dimensions.width = svg.attr('width') / 2 - 60 - 20;
    dimensions.height = svg.attr('height') - 120 - 80;

    var regionScale = d3.scaleBand()
        .padding(0.3)
        .range([3,dimensions.width]);

    var categoryScale = d3.scaleBand()
        .padding(0.3)
        .range([3,dimensions.width]);

    var yScale = d3.scaleLinear().range([0,dimensions.height]);
    var yScale2 = d3.scaleLinear().range([0, dimensions.height]);
    var regionColor = d3.scaleOrdinal(d3.schemeCategory10);
    var categoryColor = d3.scaleOrdinal(d3.schemeCategory10)

    var selectValue = document.getElementById("regionSelect").value

    regionChart = svg.append('g')
        .attr('transform', 'translate('+ [60, 120] +')');
    categoryChart = svg.append('g')
        .attr('transform', 'translate('+ [60*2+20+dimensions.width, 120] +')');


    d3.csv(fileName, function(error, data) {
        if (error) throw error;

        // key value nest for regions sales
        var regionDict = d3.nest()
            .key(function(d){ return d['Region']; })
            .rollup(function(v){
                var regionSales = d3.mean(v, function(d){ if (d['SAT Average'] != 0) return d['SAT Average']; })
                return regionSales;
            })
            .entries(data);

        // key value nest for category sales
        var categoryDict = d3.nest()
            .key(function(d){ return d['Region']; })
            .rollup(function(v){
                var categorySales = d3.mean(v, function(d){ if (d['SAT Average'] != 0) return d['Average Family Income']; })
                return categorySales;
            })
            .entries(data);

        // separate domain

        var regionKeys = regionDict.map(function(d) {
            return d.key;
        });
        regionScale.domain(regionKeys);

        var categoryKeys = categoryDict.map(function(d) {
            return d.key;
        });
        categoryScale.domain(categoryKeys);

        // so things don't fly over the roof

        var maxSales = d3.max(regionDict.concat(categoryDict), function(d) {
            return d.value;
        });

        yScale.domain([0, maxSales]);
        yScale2.domain([0, 1600]);

        // create bar charts

        regionChart.selectAll('.bar') 
            .data(regionDict)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', function(d) { return regionScale(d.key); })
            .attr('y', function(d) { return dimensions.height - yScale2(d.value); })
            .attr('width', regionScale.bandwidth())
            .attr('height', function(d) { return yScale2(d.value); })
            .style('fill', function(d){ return regionColor(d.key); })
            .style('fill-opacity', function(d) {
                if (d.key == selectValue) return 1;
                else return 0.2
            });

        categoryChart.selectAll('.bar') 
            .data(categoryDict)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', function(d) { return categoryScale(d.key); })
            .attr('y', function(d) { return dimensions.height - yScale(d.value); })
            .attr('width', categoryScale.bandwidth())
            .attr('height', function(d) { return yScale(d.value); })
            .style('fill', function(d){ return categoryColor(d.key); })
            .style('fill-opacity', function(d) {
                if (d.key == selectValue) return 1;
                else return 0.2
            });

        var yAxis = d3.axisLeft(yScale.range([dimensions.height,0]))
            .ticks(4)
            .tickFormat(function(t){ return t;})

        var yAxis2 = d3.axisLeft(yScale2.range([dimensions.height,0]))
            .ticks(4)
            .tickFormat(function(t){ return t;})



        regionChart.append('g')
            .attr('class', 'y axis')
            .call(yAxis2);
        categoryChart
            .attr('class', 'y axis')
            .call(yAxis);
            
        regionChart.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate('+[0, dimensions.height + 10]+')')
            .call(d3.axisBottom(regionScale));
        categoryChart.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate('+[0, dimensions.height + 10]+')')
            .call(d3.axisBottom(categoryScale));

        // calculate the averages for the region
        var counter = 0
        var total = 0
        var regionTotal = 0
        var regionCounter = 0

        // calculate racial percentages for region
        var percentageTotal = 0
        var whiteTotal = 0
        var blackTotal = 0
        var hispanicTotal = 0
        var asianTotal = 0
        var amIndianTotal = 0
        var pacIslandTotal = 0
        var biracialTotal = 0


        data.forEach(function (d) {
            if (d["SAT Average"] > 0) {
                if (d["Region"] == selectedRegion) {
                    regionTotal += parseInt(d["SAT Average"])
                    regionCounter++
                    percentageTotal += parseFloat(d["% White"]) + parseFloat(d["% Black"]) + 
                    parseFloat(d["% Hispanic"]) + parseFloat(d["% Asian"]) + parseFloat(d["% American Indian"]) 
                    + parseFloat(d["% Pacific Islander"]) + parseFloat(d["% Biracial"])
                    whiteTotal += parseFloat(d["% White"])
                    blackTotal += parseFloat(d["% Black"])
                    hispanicTotal += parseFloat(d["% Hispanic"])
                    asianTotal += parseFloat(d["% Asian"])
                    amIndianTotal += parseFloat(d["% American Indian"])
                    pacIslandTotal += parseFloat(d["% Pacific Islander"])
                    biracialTotal += parseFloat(d["% Biracial"])
                }
                if (d["Region"] != "Outlying Areas") {
                    total += parseInt(d["SAT Average"])
                    counter++
                }
                
            }    
        });
        var regionAverage = regionTotal / regionCounter
        var nationalAverage = total / counter
        var comparisonResult = ((regionAverage - nationalAverage) / nationalAverage) * 100
        console.log(comparisonResult)


        whiteTotal = (whiteTotal / percentageTotal) * 100
        blackTotal = (blackTotal / percentageTotal) * 100
        hispanicTotal = (hispanicTotal / percentageTotal) * 100
        asianTotal = (asianTotal / percentageTotal) * 100
        amIndianTotal = (amIndianTotal / percentageTotal) * 100
        pacIslandTotal = (pacIslandTotal / percentageTotal) * 100
        biracialTotal = (biracialTotal / percentageTotal) * 100


        var result = document.getElementById("comparisonResult")
        var poorerOrBetter = comparisonResult >= 0 ? "better" : "worse"
        var color = "green"
        if (poorerOrBetter == "worse") {
            color = "red"
        }
        result.innerHTML = "<h6>The " + selectedRegion + " region does <span style='color:" + color +"'>" + comparisonResult.toFixed(2) + "%</span> " + poorerOrBetter + " than the national average.</h6>"

        var statistics = document.getElementById("statisticsHeader")
        statistics_part1 = "<h6 id='statisticsHeader'><u>Statistics for " + selectedRegion + " region</u></h6>"
        statistics_part2 = "<p>SAT Mean Score (National): "+ nationalAverage.toFixed(2) + "</p>"
        statistics_part3 = "<p>SAT Mean Score ("+ selectedRegion +"): "+ regionAverage.toFixed(2) + "</p>"
        statistics_part4 = "<p><b>White</b>: "+ whiteTotal.toFixed(2) + "%</p>" 
        statistics_part5 = "<p><b>Black</b>: "+ blackTotal.toFixed(2) + "%</p>"
        statistics_part6 = "<p><b>Hispanic</b>: "+ hispanicTotal.toFixed(2) + "%</p>"
        statistics_part7 = "<p><b>Asian</b>: "+ asianTotal.toFixed(2) + "%</p>"
        statistics_part8 = "<p><b>Biracial</b>: "+ biracialTotal.toFixed(2) + "%</p>"
        statistics.innerHTML = statistics_part1 + statistics_part4 + statistics_part5 + statistics_part6
                + statistics_part7 + statistics_part8




        // set the dimensions and margins of the graph
        var width = 450
            height = 450
            margin = 40

        // The radius of the pieplot is half the width or half the height (smallest one). I substract a bit of margin.
        var radius = Math.min(width, height) / 2 - margin

        // empty in case there was already data
        d3.select('#my_dataviz').selectAll("svg").remove();

        // append the svg object to the div called 'my_dataviz'
        var svg = d3.select("#my_dataviz")
          .append("svg")
            .attr("width", width)
            .attr("height", height)
          .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        // Create dummy data
        var data = {Asian: asianTotal, Black: blackTotal, White: whiteTotal, Hispanic: hispanicTotal, Biracial: biracialTotal}

        // set the color scale
        var color = d3.scaleOrdinal()
          .domain(data)
          .range(d3.schemeSet2);

        // Compute the position of each group on the pie:
        var pie = d3.pie()
          .value(function(d) {return d.value; })
        var data_ready = pie(d3.entries(data))
        // Now I know that group A goes from 0 degrees to x degrees and so on.

        // shape helper to build arcs:
        var arcGenerator = d3.arc()
          .innerRadius(0)
          .outerRadius(radius)

        // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
        svg
          .selectAll('mySlices')
          .data(data_ready)
          .enter()
          .append('path')
            .attr('d', arcGenerator)
            .attr('fill', function(d){ return(color(d.data.key)) })
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .style("opacity", 0.7)

        // Now add the annotation. Use the centroid method to get the best coordinates
        svg
          .selectAll('mySlices')
          .data(data_ready)
          .enter()
          .append('text')
          .text(function(d){ return d.data.key})
          .attr("transform", function(d) {
            return "translate(" + 
              ( (radius - 12) * Math.sin( ((d.endAngle - d.startAngle) / 2) + d.startAngle ) ) +
              ", " +
              ( -1 * (radius - 12) * Math.cos( ((d.endAngle - d.startAngle) / 2) + d.startAngle ) ) +
            ")";
           })
          .style("text-anchor", function(d) {
              var rads = ((d.endAngle - d.startAngle) / 2) + d.startAngle;
              if ( (rads > 7 * Math.PI / 4 && rads < Math.PI / 4) || (rads > 3 * Math.PI / 4 && rads < 5 * Math.PI / 4) ) {
                return "middle";
              } else if (rads >= Math.PI / 4 && rads <= 3 * Math.PI / 4) {
                return "start";
              } else if (rads >= 5 * Math.PI / 4 && rads <= 7 * Math.PI / 4) {
                return "end";
              } else {
                return "middle";
              }
            })
          .style("font-size", 12)


    });

    
      
    };

    selectValue = regionSelect.property('value')
    if (selectValue !== '') {
      console.log('going to onchange')
      onchange()
    }

  })






});