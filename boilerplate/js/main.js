(function(){

    //pseudo-global variables
    var attrArray = ["varA", "varB", "varC", "varD", "varE"]; //list of attributes
    var expressed = attrArray[0]; //initial attribute

    //chart frame dimensions
    var chartWidth = window.innerWidth * 0.425,
    chartHeight = 473,
    leftPadding = 25,
    rightPadding = 2,
    topBottomPadding = 5,
    chartInnerWidth = chartWidth - leftPadding - rightPadding,
    chartInnerHeight = chartHeight - topBottomPadding * 2,
    translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

    //create a scale to size bars proportionally to frame and for axis
    var yScale = d3.scaleLinear()
    .range([463, 0])
    .domain([0, 110]);

    //begin script when window loads
    window.onload = function(){
        setMap();
    };

    function setMap(){
        //map frame dimensions
        var width = window.innerWidth * 0.5,
            height = 460;


        var map = d3.select("body")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height);

        var projection = d3.geoAlbers()
            .center([0, 46.2])
            .rotate([-2, 0])
            .parallels([43, 62])
            .scale(2500)
            .translate([width / 2, height / 2]);

        var path = d3.geoPath()
            .projection(projection);

        var promises = [
            d3.json("data/EuropeCountries.topojson"),
            d3.json("data/FranceRegions.topojson"),
            d3.csv("data/unitsData.csv") // Load your CSV data here
        ];
        Promise.all(promises).then(function(data) {
            var csvData = data[2]; // CSV data is at index 2 in the resolved promise array
            callback(data, csvData, path); // Pass csvData to callback
        }).catch(function(error) {
            console.error('Error loading data:', error);
        });

        function callback(data, csvData, path){    

            var europe = data[0];
            var france = data[1];

            //place graticule on the map
            setGraticule(map, path);

            //translate europe and France TopoJSONs
            var europeCountries = topojson.feature(europe, europe.objects.EuropeCountries),
                franceRegions = topojson.feature(france, france.objects.FranceRegions).features;

            //add Europe countries to map
            var countries = map.append("path")
                .datum(europeCountries)
                .attr("class", "countries")
                .attr("d", path);

            //join csv data to GeoJSON enumeration units
            franceRegions = joinData(franceRegions, csvData);

            //create the color scale
            var colorScale = makeColorScale(csvData);

            //add France regions to map
            setEnumerationUnits(franceRegions, map, path, colorScale);

            //add coordinated visualization to the map
            setChart(csvData, colorScale);
        };
    };

    //function to create coordinated bar chart
        //Example 2.1 line 11...function to create coordinated bar chart
        function setChart(csvData, colorScale){
            //chart frame dimensions
            var chartWidth = window.innerWidth * 0.425,
                chartHeight = 473,
                leftPadding = 25,
                rightPadding = 2,
                topBottomPadding = 5,
                chartInnerWidth = chartWidth - leftPadding - rightPadding,
                chartInnerHeight = chartHeight - topBottomPadding * 2,
                translate = "translate(" + leftPadding + "," + topBottomPadding + ")";
        
            //create a second svg element to hold the bar chart
            var chart = d3.select("body")
                .append("svg")
                .attr("width", chartWidth)
                .attr("height", chartHeight)
                .attr("class", "chart");
        
            //create a rectangle for chart background fill
            var chartBackground = chart.append("rect")
                .attr("class", "chartBackground")
                .attr("width", chartInnerWidth)
                .attr("height", chartInnerHeight)
                .attr("transform", translate);
        
            //create a scale to size bars proportionally to frame and for axis
            var yScale = d3.scaleLinear()
                .range([463, 0])
                .domain([0, 100]);
        
            //set bars for each province
            var bars = chart.selectAll(".bar")
                .data(csvData)
                .enter()
                .append("rect")
                .sort(function(a, b){
                    return b[expressed]-a[expressed]
                })
                .attr("class", function(d){
                    return "bar " + d.adm1_code;
                })
                .attr("width", chartInnerWidth / csvData.length - 1);
        
            //create a text element for the chart title
            var chartTitle = chart.append("text")
                .attr("x", 40)
                .attr("y", 40)
                .attr("class", "chartTitle")
                .text("Number of Variable " + expressed[3] + " in each region");
        
            //create vertical axis generator
            var yAxis = d3.axisLeft()
                .scale(yScale);
        
            //place axis
            var axis = chart.append("g")
                .attr("class", "axis")
                .attr("transform", translate)
                .call(yAxis);
        
            //create frame for chart border
            var chartFrame = chart.append("rect")
                .attr("class", "chartFrame")
                .attr("width", chartInnerWidth)
                .attr("height", chartInnerHeight)
                .attr("transform", translate);
            updateChart(bars, csvData.length, colorScale);
        };

    //function to create color scale generator
    function makeColorScale(data){
        var colorClasses = [
            "#D4B9DA",
            "#C994C7",
            "#DF65B0",
            "#DD1C77",
            "#980043"
        ];

        //create color scale generator
        var colorScale = d3.scaleThreshold()
            .range(colorClasses);

        //build array of all values of the expressed attribute
        var domainArray = [];
        for (var i=0; i<data.length; i++){
            var val = parseFloat(data[i][expressed]);
            domainArray.push(val);
        }

        //cluster data using ckmeans clustering algorithm to create natural breaks
        var clusters = ss.ckmeans(domainArray, 5);
        //reset domain array to cluster minimums
        domainArray = clusters.map(function(d){
            return d3.min(d);
        });
        //remove first value from domain array to create class breakpoints
        domainArray.shift();

        //assign array of last 4 cluster minimums as domain
        colorScale.domain(domainArray);

        return colorScale;
    };

    function setGraticule(map, path){
        var graticule = d3.geoGraticule()
            .step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude

        //create graticule lines
        var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
            .data(graticule.lines()) //bind graticule lines to each element to be created
            .enter() //create an element for each datum
            .append("path") //append each element to the svg as a path element
            .attr("class", "gratLines") //assign class for styling
            .attr("d", path); //project graticule lines
    };

    function joinData(franceRegions, csvData){
        //variables for data join
        var attrArray = ["varA", "varB", "varC", "varD", "varE"];

        //loop through csv to assign each set of csv attribute values to geojson region
        for (var i=0; i<csvData.length; i++){
            var csvRegion = csvData[i]; //the current region
            var csvKey = csvRegion.adm1_code; //the CSV primary key

            //loop through geojson regions to find correct region
            for (var a=0; a<franceRegions.length; a++){

                var geojsonProps = franceRegions[a].properties; //the current region geojson properties
                var geojsonKey = geojsonProps.adm1_code; //the geojson primary key

                //where primary keys match, transfer csv data to geojson properties object
                if (geojsonKey == csvKey){

                    //assign all attributes and values
                    attrArray.forEach(function(attr){
                        var val = parseFloat(csvRegion[attr]); //get csv attribute value
                        geojsonProps[attr] = val; //assign attribute and value to geojson properties
                    });
                };
            };
        };
        return franceRegions;
    };

    function setEnumerationUnits(franceRegions, map, path, colorScale){    
        //add France regions to map    
        var regions = map.selectAll(".regions")        
            .data(franceRegions)        
            .enter()        
            .append("path")        
            .attr("class", function(d){            
                return "regions " + d.properties.adm1_code;        
            })        
            .attr("d", path)        
                .style("fill", function(d){            
                    var value = d.properties[expressed];            
                    if(value) {                
                        return colorScale(d.properties[expressed]);            
                    } else {                
                        return "#ccc";            
                    }    
            });
    }
    //function to create a dropdown menu for attribute selection
    function createDropdown(){
        //add select element
        //add select element
        var dropdown = d3.select("body")
            .append("select")
            .attr("class", "dropdown")
            .on("change", function(){
                changeAttribute(this.value, csvData)
            });

        //add initial option
        var titleOption = dropdown.append("option")
            .attr("class", "titleOption")
            .attr("disabled", "true")
            .text("Select Attribute");

        //add attribute name options
        var attrOptions = dropdown.selectAll("attrOptions")
            .data(attrArray)
            .enter()
            .append("option")
            .attr("value", function(d){ return d })
            .text(function(d){ return d });
    };
    //Example 1.4 line 14...dropdown change event handler
    //Example 1.4 line 14...dropdown change event handler
    function changeAttribute(attribute, csvData){
        //change the expressed attribute
        expressed = attribute;

        //recreate the color scale
        var colorScale = makeColorScale(csvData);

        //recolor enumeration units
        var regions = d3.selectAll(".regions")
            .transition()
            .duration(1000)
            .style("fill", function(d){            
                var value = d.properties[expressed];            
                if(value) {                
                    return colorScale(value);           
                } else {                
                    return "#ccc";            
                }    
        });
        //Sort, resize, and recolor bars
        var bars = d3.selectAll(".bar")
            //Sort bars
            .sort(function(a, b){
                return b[expressed] - a[expressed];
            })
            .transition() //add animation
            .delay(function(d, i){
                return i * 20
            })
            .duration(500)
            //resize bars
            .attr("height", function(d, i){
                return 463 - yScale(parseFloat(d[expressed]));
            })
            .attr("y", function(d, i){
                return yScale(parseFloat(d[expressed])) + topBottomPadding;
            })
            //recolor bars
            .style("fill", function(d){            
                var value = d[expressed];            
                if(value) {                
                    return colorScale(value);            
                } else {                
                    return "#ccc";            
                }    
        });
        updateChart(bars, csvData.length, colorScale);
    };
    //function to position, size, and color bars in chart
    function updateChart(bars, n, colorScale){
        //position bars
        bars.attr("x", function(d, i){
                return i * (chartInnerWidth / n) + leftPadding;
            })
            //size/resize bars
            .attr("height", function(d, i){
                return 463 - yScale(parseFloat(d[expressed]));
            })
            .attr("y", function(d, i){
                return yScale(parseFloat(d[expressed])) + topBottomPadding;
            })
            //color/recolor bars
            .style("fill", function(d){            
                var value = d[expressed];            
                if(value) {                
                    return colorScale(value);            
                } else {                
                    return "#ccc";            
                }    
        });
        var chartTitle = d3.select(".chartTitle")
            .text("Number of Variable " + expressed[3] + " in each region");
    };
    createDropdown()
})();