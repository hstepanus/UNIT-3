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

function addColumns(cityPop) {
    document.querySelectorAll("tr").forEach(function (row, i) {
        if (i == 0) {
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

function initialize() {
    // Call the functions to apply changes
    addColumns(cityPop);
    addEvents();
}

// Add event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', initialize);





// Function to handle the response and update the DOM with GeoJSON data
function debugCallback(response) {
    // Parse the response as JSON and return a Promise
    return response.json().then(function (data) {
        // Update the DOM with GeoJSON data
        document.querySelector("#mydiv").insertAdjacentHTML('beforeend', 'GeoJSON data: ' + JSON.stringify(data));
    });
}

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
            // If successful, call the debugCallback function and wait for it to complete
            return debugCallback(response);
        })
        .catch(function (error) {
            // Catch and handle any errors that occur during the fetch operation
            console.error('Error fetching GeoJSON: ', error.message);
        });
}

// Initial insertion of 'GeoJSON data: ' in the DOM
document.querySelector("#mydiv").insertAdjacentHTML('beforeend', 'GeoJSON data: ');

// Call the debugAjax function to initiate the Ajax call and update the DOM
debugAjax();