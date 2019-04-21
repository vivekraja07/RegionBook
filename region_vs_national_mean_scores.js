// **** Your JavaScript code goes here ****

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

regionChart = svg.append('g')
    .attr('transform', 'translate('+ [60, 120] +')');
categoryChart = svg.append('g')
    .attr('transform', 'translate('+ [60*2+20+dimensions.width, 120] +')');


// perform operations on data
d3.csv('colleges.csv', function(error, data){

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
        .style('fill', function(d){ return regionColor(d.key); });

    categoryChart.selectAll('.bar') 
        .data(categoryDict)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', function(d) { return categoryScale(d.key); })
        .attr('y', function(d) { return dimensions.height - yScale(d.value); })
        .attr('width', categoryScale.bandwidth())
        .attr('height', function(d) { return yScale(d.value); })
        .style('fill', function(d){ return categoryColor(d.key); });

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
});