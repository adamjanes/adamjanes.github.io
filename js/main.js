var margin = {top: 10, bottom: 10, left: 10, right: 10},
    width = 540 - margin.left - margin.right,
    height = 540 - margin.top - margin.bottom,
    t = d3.transition().duration(200),
    averageLine, lastRadius, newRadius, radiusScale;

var svg = d3.select("#graph-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + ((width / 2) + margin.left) + "," + ((height / 2) + margin.top) + ")");

var color = d3.scaleOrdinal(["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f"]);

var pie = d3.pie();

var arc = d3.arc()
    .innerRadius(0);

d3.csv("data/incomes.csv", function(data) {

    var preparedData = prepareData(data).reverse();

    radiusScale = d3.scaleSqrt()
        .domain([0, preparedData[49].values[4].value])
        .range([0, Math.min(width, height) / 2]);

    redraw(preparedData[49].values, preparedData[0].average);

    preparedData[0].values.forEach(function(d, i){
        svg.append("circle")
            .attr("class", "circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", radiusScale(d.value))
            .attr("stroke", color(i))
            .attr("stroke-dasharray", "4,4");
    });

    svg.append("circle")
        .attr("class", "averageLine")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("stroke", "grey")
        .attr("stroke-width", "2px")
        .attr("fill", "none");

    i = 0;

    d3.interval(function () {
        // Auto reset
        if (i == 50) { i = 0; }
        redraw(preparedData[i].values, preparedData[i].average);
        $("#year")[0].innerText = preparedData[i].name;
        i++;
    }, 200);

});


function redraw(data, average){
    newRadius = radiusScale(average);

    $("#fig1")[0].innerHTML = data[0].value.toLocaleString();
    $("#fig2")[0].innerHTML = data[1].value.toLocaleString();
    $("#fig3")[0].innerHTML = data[2].value.toLocaleString();
    $("#fig4")[0].innerHTML = data[3].value.toLocaleString();
    $("#fig5")[0].innerHTML = data[4].value.toLocaleString();
    $("#avFig")[0].innerHTML = average.toLocaleString();

    pie.value(function (){ return 1; });
    arc.outerRadius(function(d) {
        return radiusScale(d.data.value);
    });

    // join
    var arcs = svg.selectAll(".arc")
        .data(pie(data), function(d){ return d.data.name; });

    // update
    arcs
        .transition(d3.transition().duration(200))
        .attrTween("d", arcTween);

    // enter
    arcs.enter().append("path")
        .attr("class", "arc")
        .attr("fill", function(d, i) { return color(i); })
        .attr("stroke", "white")
        .attr("stroke-width", "2px")
        .attr("d", arc)
        .each(function(d) { this._current = d; });

    svg.select(".averageLine")
        .transition(d3.transition().duration(200))
        .attr("r", radiusScale(average));
}

// Tween between 
function arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) {
        return arc(i(t));
    };
}

function prepareData(data){
    return data.map(function(d){
        return {
            name: d.year,
            average: parseInt(d.average),
            values: [
                {
                    name: "first",
                    value: parseInt(d["1"])
                },
                {
                    name: "second",
                    value: parseInt(d["2"])
                },
                {
                    name: "third",
                    value: parseInt(d["3"])
                },
                {
                    name: "fourth",
                    value: parseInt(d["4"])
                },
                {
                    name: "fifth",
                    value: parseInt(d["5"])
                }
            ]
        }
    });
}