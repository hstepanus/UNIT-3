// City population data
var cityPop = [
    { city: 'Madison', population: 233209 },
    { city: 'Milwaukee', population: 594833 },
    { city: 'Green Bay', population: 104057 },
    { city: 'Superior', population: 27244 }
];

// Function to create circles representing city populations
var circles = container.selectAll(".circles")
    .data(cityPop)
    .enter()
    .append("circle")
    .attr("class", "circles")
    .attr("id", d => d.city)
    .attr("r", d => Math.sqrt(d.population * 0.01 / Math.PI))
    .attr("cx", (d, i) => 90 + (i * 180))
    .attr("cy", d => 450 - (d.population * 0.0005));

// Function to add a new column 'City Size' to the table based on population
function addColumns(cityPop) {
    document.querySelectorAll("tr").forEach((row, i) => {
        if (i === 0) {
            row.insertAdjacentHTML('beforeend', '<th>City Size</th>');
        } else {
            var citySize = '';
            if (cityPop[i - 1].population < 100000) citySize = 'Small';
            else if (cityPop[i - 1].population < 500000) citySize = 'Medium';
            else citySize = 'Large';
            row.insertAdjacentHTML('beforeend', `<td>${citySize}</td>`);
        }
    });
}

// Function to handle mouseover and click events on the table
function addEvents() {
    document.querySelector("table").addEventListener("mouseover", function () {
        var color = `rgb(${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)})`;
        document.querySelector("table").style.backgroundColor = color;
    });

    function clickme() {
        alert('Hey, you clicked me!');
    }

    document.querySelector("table").addEventListener("click", clickme);
}

// Function to initialize the changes to the table
function initialize() {
    addColumns(cityPop);
    addEvents();
}

document.addEventListener('DOMContentLoaded', initialize); // Call the initialize function when the DOM content is loaded
