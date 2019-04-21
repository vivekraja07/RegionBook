$("#regionSelect").on('change', function() {
    var selectedRegion = $(this).children("option:selected").val();
    console.log(selectedRegion)

    // d3 code here
    var fileName = "colleges.csv"


    d3.csv(fileName, function(error, data) {
        if (error) throw error;

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
        result.innerHTML = "<h5>The " + selectedRegion + " region does <span style='color:" + color +"'>" + comparisonResult.toFixed(2) + "%</span> " + poorerOrBetter + " than the national average.</h5>"

        var statistics = document.getElementById("statisticsHeader")
        statistics_part1 = "<h6 id='statisticsHeader'><u>Statistics (" + selectedRegion + " vs. Nation)</u></h6>"
        statistics_part2 = "<p>SAT Mean Score (National): "+ nationalAverage.toFixed(2) + "</p>"
        statistics_part3 = "<p>SAT Mean Score ("+ selectedRegion +"): "+ regionAverage.toFixed(2) + "</p>"
        statistics_part4 = "<p>% White ("+ selectedRegion +"): "+ whiteTotal.toFixed(2) + "%</p>" 
        statistics_part5 = "<p>% Black ("+ selectedRegion +"): "+ blackTotal.toFixed(2) + "%</p>"
        statistics_part6 = "<p>% Hispanic ("+ selectedRegion +"): "+ hispanicTotal.toFixed(2) + "%</p>"
        statistics_part7 = "<p>% Asian ("+ selectedRegion +"): "+ asianTotal.toFixed(2) + "%</p>"
        statistics_part8 = "<p>% Biracial ("+ selectedRegion +"): "+ biracialTotal.toFixed(2) + "%</p>"
        statistics.innerHTML = statistics_part4 + statistics_part5 + statistics_part6
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


});

$("#smallregionSelect").on('change', function() {
    var selectedRegion = $(this).children("option:selected").val();
    console.log(selectedRegion)

    // d3 code here
    var fileName = "colleges.csv"


    d3.csv(fileName, function(error, data) {
        if (error) throw error;

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
        result.innerHTML = "<h5>The " + selectedRegion + " region does <span style='color:" + color +"'>" + comparisonResult.toFixed(2) + "%</span> " + poorerOrBetter + " than the national average.</h5>"

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


});