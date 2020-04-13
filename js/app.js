'use strict';

// Setup Mapbox Api
const ACCESS_TOKEN = 'pk.eyJ1Ijoicmlja2RhYWxodWl6ZW45MCIsImEiOiJjazV2ZjRtdXkwYmozM3FuMzM3cDg5dGtnIn0._Vzwm48nomD3zuz20qdBsw';
mapboxgl.accessToken = ACCESS_TOKEN;

// Initialize map
const map = new mapboxgl.Map({
  container: 'map',
  //style: 'mapbox://styles/mapbox/light-v10', // Default style
  style: 'https://raw.githubusercontent.com/mapbox/mapbox-gl-swiss-ski-style/master/cij1zoclj002y8rkkdjl69psd.json',
  center: [380, 50],
  zoom: 3
});

// Fetch Covid-19 Api data
const getData = async url => {
  let response = await fetch(url);
  let data = await response.json();

  return data;
}

// Get Covid-19 summary
getData('https://api.covid19api.com/summary').then(data => {
  document.getElementById('new-confirmed').innerText = data.Global.NewConfirmed;
  document.getElementById('total-confirmed').innerText = data.Global.TotalConfirmed;
  document.getElementById('new-deaths').innerText = data.Global.NewDeaths;
  document.getElementById('total-deaths').innerText = data.Global.TotalDeaths;
  document.getElementById('new-recoverd').innerText = data.Global.NewRecovered;
  document.getElementById('total-recoverd').innerText = data.Global.TotalRecovered;
});

// Get latest Covid-19 Data
getData('https://wuhan-coronavirus-api.laeyoung.endpoint.ainize.ai/jhu-edu/latest').then(data => {
  let datatable = document.querySelector('.data-table tbody');
  let  dataSource = {
    type: "FeatureCollection",
    features: []
  }
 
  data.forEach(item => {
    // Add data to datatable
    let region = item.provincestate ? item.provincestate : item.countryregion;

    let row = datatable.insertRow(0);
    row.insertCell(0).innerText = `${region}`;
    row.insertCell(1).innerText = item.confirmed ?? 0;
    row.insertCell(2).innerText = item.deaths ?? 0;
    row.insertCell(3).innerText = item.recovered ?? 0;

    // Build dataSource   
    dataSource.features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [
            item.location.lng,
            item.location.lat
          ]
        },
        properties: {
          id: Math.random().toString(36),
          mag: item.confirmed,
          time: Date.parse(item.lastupdate),
          country: item.countryregion ?? '',
          province: item.provincestate ?? '',
          cases: item.confirmed,
          deaths: item.deaths
        }
    });
  });

  map.on('load', () => {
    // Data layer
    map.addSource('infected', {
      "type": "geojson",
      "data": dataSource
    });
    // Style layer
    map.addLayer({
      id: 'circles',
      type: 'heatmap',
      source: 'infected',
      maxzoom: 15,
      paint: {
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(0, 0, 255, 0)",
          0.1,
          "#ffffb2",
          0.3,
          "#feb24c",
          0.5,
          "#fd8d3c",
          0.7,
          "#fc4e2a",
          1,
          "#e31a1c"
        ]
      }
    });
  });
})
.catch(errorMsg => {
  console.error(errorMsg);
});
