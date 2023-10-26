// Load the Visualization API and the columnchart package.
// @ts-ignore TODO update to newest visualization library
google.load("visualization", "1", { packages: ["columnchart"] });

function initMap() {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
  // The following path marks a path from Mt. Whitney, the highest point in the
  // continental United States to Badwater, Death Valley, the lowest point.
  const path = [
    { lat: 36.579, lng: -118.292 },
    { lat: 36.606, lng: -118.0638 },
   
  ]; // Badwater, Death Valley
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 8,
    center: path[1],
    mapTypeId: "terrain",
  });
  directionsRenderer.setMap(map);

  const onChangeHandler = function () {
    calculateAndDisplayRoute(directionsService, directionsRenderer);
  };

  document.getElementById("start").addEventListener("change", onChangeHandler);
  document.getElementById("end").addEventListener("change", onChangeHandler);

  
}

function calculateAndDisplayRoute(directionsService, directionsRenderer) {//
    directionsService
      .route({
        origin: {
          query: document.getElementById("start").value,
        },
        destination: {
          query: document.getElementById("end").value,
        },
        travelMode: google.maps.TravelMode.WALKING,
      })
      .then((response) => {
        console.log(response);
        console.log(response.routes[0].overview_path[0].lat());
        console.log(response.routes[0].overview_path[0].lng());
        directionsRenderer.setDirections(response);
        const path=response.routes[0].overview_path;

        // Create an ElevationService.
        const elevator = new google.maps.ElevationService();
        // Draw the path, using the Visualization API and the Elevation service.
        displayPathElevation(path, elevator, map);

        new google.maps.ElevationService().getElevationAlongPath({
           path: response.routes[0].overview_path,
            samples: response.routes[0].overview_path.length
          })
          .then((response2) => {
            console.log(response2.results)
            
            response2.results.forEach(element => {
                console.log(`軽度${element.location.lat()}`)
                console.log(`軽度${element.location.lng()}`)
            });


          })
      })
      .catch((e) => window.alert("Directions request failed due to " + status));
  }

function displayPathElevation(path, elevator, map) {
  // Display a polyline of the elevation path.
//   new google.maps.Polyline({
//     path: path,
//     strokeColor: "#cc0000",
//     strokeOpacity: 0.4,
//     map: map,
//   });
  // Create a PathElevationRequest object using this array.
  // Ask for 256 samples along that path.
  // Initiate the path request.
  elevator
    .getElevationAlongPath({
      path: path,
      samples: 375,
    })
    .then(plotElevation)
    .catch((e) => {
      const chartDiv = document.getElementById("elevation_chart");

      // Show the error code inside the chartDiv.
      chartDiv.innerHTML = "Cannot show elevation: request failed because " + e;
    });
}

// Takes an array of ElevationResult objects, draws the path on the map
// and plots the elevation profile on a Visualization API ColumnChart.
function plotElevation({ results }) {
  const chartDiv = document.getElementById("elevation_chart");
  // Create a new chart in the elevation_chart DIV.
  const chart = new google.visualization.ColumnChart(chartDiv);
  // Extract the data from which to populate the chart.
  // Because the samples are equidistant, the 'Sample'
  // column here does double duty as distance along the
  // X axis.
  const data = new google.visualization.DataTable();

  data.addColumn("string", "Sample");
  data.addColumn("number", "Elevation");

  //console.log(results)

  let diffElevationTotal=0;
  for (let i = 0; i < results.length; i++) {
    data.addRow(["", results[i].elevation]);
    if(i==results.length-1){
      break;
    }
    diffElevationTotal+=Math.abs(results[i].elevation-results[i+1].elevation)
  }

  console.log(diffElevationTotal)


  // Draw the chart using the data within its DIV.
  chart.draw(data, {
    height: 150,
    legend: "none",
    // @ts-ignore TODO update to newest visualization library
    titleY: "Elevation (m)",
    colors: ["#FF0000"],
  });
} 

window.initMap = initMap;