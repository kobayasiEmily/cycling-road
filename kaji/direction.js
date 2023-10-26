// Load the Visualization API and the columnchart package.
// @ts-ignore TODO update to newest visualization library
google.load("visualization", "1", { packages: ["columnchart"] });

function initMap() {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
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
      })
      .catch((e) => window.alert("Directions request failed due to " + status));
  }

function displayPathElevation(path, elevator, map) {
  elevator
    .getElevationAlongPath({
      path: path,
      samples: 375,
    })
    .then(plotElevation)
    .catch((e) => {
      const chartDiv = document.getElementById("elevation_chart");

      chartDiv.innerHTML = "Cannot show elevation: request failed because " + e;
    });
}

function plotElevation({ results }) {

  const elevationArray = [];
  const diffEleArray = [];
  for (let i = 0; i < results.length; i++) {
    elevationArray.push(results[i].elevation)
    if (i > 0) {
      // 標高差分を計算
      diffEleArray.push(Math.abs(results[i].elevation - results[i - 1].elevation))
    }
  }

  const emptyLabels = Array.from({ length: results.length }, (_, i) => '');

  // 値を設定
  const datasets = [
    {
      label: '標高',
      data: elevationArray,
      backgroundColor: ['#3F88C5'] // 配列にしておく必要がある
    }
  ]

  console.log(diffEleArray)

  // 各棒グラフの値の大きさが52以上の場合は赤色にする
  for (var i = 0; i < diffEleArray.length; i++) {
    if (diffEleArray[i] > 20) {
      datasets[0].backgroundColor[i] = '#FF5E5B'
    }
  }
  

  // // 各棒グラフの値が正か負かによって色分け
  // for (var i = 0; i < datasets[0].data.length; i++) {
  //   if (datasets[0].data[i] > 0) {
  //     datasets[0].backgroundColor[i] = '#3F88C5' // 値が正の場合は青
  //   } else {
  //     datasets[0].backgroundColor[i] = '#FF5E5B' // 値が負の場合は赤
  //   }
  // }

  // グラフ描画
  const ctx = document.getElementById("myChart").getContext('2d');
  const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: emptyLabels,
      datasets:datasets 
    },
  });

} 

window.initMap = initMap;