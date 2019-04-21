$("#regionSelect").on('change', function() {
    var selectedRegion = $(this).children("option:selected").val();
    console.log("change happened");

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


});


