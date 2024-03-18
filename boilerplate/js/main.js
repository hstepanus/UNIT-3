// Declare the cityPop array
var cityPop = [
    {
        city: 'Madison',
        population: 233209
    },
    {
        city: 'Milwaukee',
        population: 594833
    },
    {
        city: 'Green Bay',
        population: 104057
    },
    {
        city: 'Superior',
        population: 27244
    }
];
var circles = container.selectAll(".circles") //create an empty selection
        .data(cityPop) //here we feed in an array
        .enter() //one of the great mysteries of the universe
        .append("circle") //inspect the HTML--holy crap, there's some circles there
        .attr("class", "circles")
        .attr("id", function(d){
            return d.city;
        })
        .attr("r", function(d){
            //calculate the radius based on population value as circle area
            var area = d.population * 0.01;
            return Math.sqrt(area/Math.PI);
        })
        .attr("cx", function(d, i){
            //use the index to place each circle horizontally
            return 90 + (i * 180);
        })
        .attr("cy", function(d){
            //subtract value from 450 to "grow" circles up from the bottom instead of down from the top of the SVG
            return 450 - (d.population * 0.0005);
        });
// Define a function to add a new column 'City Size' to the table based on population
function addColumns(cityPop) {
    document.querySelectorAll("tr").forEach(function (row, i) {
        if (i === 0) {
            row.insertAdjacentHTML('beforeend', '<th>City Size</th>');
        } else {
            var citySize;
            if (cityPop[i - 1].population < 100000) {
                citySize = 'Small';
            } else if (cityPop[i - 1].population < 500000) {
                citySize = 'Medium';
            } else {
                citySize = 'Large';
            }
            row.insertAdjacentHTML('beforeend', '<td>' + citySize + '</td>');
        }
    });
}

// Define a function to handle mouseover and click events on the table
function addEvents() {
    document.querySelector("table").addEventListener("mouseover", function () {
        var color = "rgb(";
        for (var i = 0; i < 3; i++) {
            var random = Math.round(Math.random() * 255);
            color += random;
            if (i < 2) {
                color += ",";
            } else {
                color += ")";
            }
        }
        document.querySelector("table").style.backgroundColor = color;
    });

    function clickme() {
        alert('Hey, you clicked me!');
    }

    document.querySelector("table").addEventListener("click", clickme);
}

// Define a function to initialize the changes to the table
function initialize() {
    // Call the functions to apply changes
    addColumns(cityPop);
    addEvents();
}

// Call the initialize function when the DOM content is loaded
document.addEventListener('DOMContentLoaded', initialize);

// Function to initiate the Ajax call and handle the result
function debugAjax() {
    // Fetch GeoJSON data from the specified URL
    fetch("data/MegaCities.geojson")
        .then(function (response) {
            // Check if the response is successful (status code in the range 200-299)
            if (!response.ok) {
                // If not successful, throw an error
                throw new Error('Network response was not ok: ' + response.status);
            }
            // If successful, parse the response as JSON and return it
            return response.json();
        })
        .then(function (data) {
            // Update the DOM with GeoJSON data
            document.querySelector("#mydiv").insertAdjacentHTML('beforeend', 'GeoJSON data: ' + JSON.stringify(data));
        })
        .catch(function (error) {
            // Catch and handle any errors that occur during the fetch operation
            console.error('Error fetching GeoJSON: ', error.message);
        });
}

// Call the debugAjax function to initiate the Ajax call and update the DOM
debugAjax();
