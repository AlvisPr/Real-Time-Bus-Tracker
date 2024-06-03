// Constants
const ACCESS_TOKEN = '';
const ICON_SIZE = '30px';

// Bus stops coordinates
const busStops = [
  [25.4318199, 57.5272744],
  [25.4301949, 57.5300755],
  [25.4270446, 57.5333783],
  [25.4150248, 57.5378774],
  [25.409242, 57.5367285],
  [25.4052937, 57.5357323],
  [25.3800781, 57.5262837],
  [25.3829648, 57.518766]
];

// Set access token
mapboxgl.accessToken = ACCESS_TOKEN;

// Create map instance
let map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [25.4318199, 57.5272744],
  zoom: 12,
});

// Add a marker to the map at the first coordinates in the array busStops.
let marker = new mapboxgl.Marker({ color: '#b40219' })
  .setLngLat(busStops[0])
  .addTo(map);

// Counter represents the index of the current bus stop
let counter = 0;

// Function to update marker position
function updateMarkerPosition() {
  if (counter < busStops.length) {
    marker.setLngLat(busStops[counter]);
    counter++;
  } else {
    counter = 0; 
  }
}

// Function to move marker
function move() {
  if (counter < busStops.length) {
    marker.setLngLat(busStops[counter]);
    map.flyTo({center: busStops[counter], zoom: 12});
    counter++;
  } else {
    counter = 0; 
  }
  setTimeout(move, 3000);
}

// Iterate through bus stops and add bus stop icons
busStops.forEach((coordinates) => {
  const busStopIcon = document.createElement('div');
  busStopIcon.className = 'bus-stop-icon';
  busStopIcon.style.backgroundImage = "url('busstop.png')";
  busStopIcon.style.width = ICON_SIZE;
  busStopIcon.style.height = ICON_SIZE;
  busStopIcon.style.backgroundSize = 'cover';

  new mapboxgl.Marker(busStopIcon)
    .setLngLat(coordinates)
    .addTo(map);
});

move();

// Function to get directions between two points
async function getDirections(start, end) {
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${ACCESS_TOKEN}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.routes[0].geometry.coordinates;
  } catch (error) {
    console.error('Failed to get directions:', error);
  }
}


// Function to add route
async function addRoute() {
  let allCoordinates = [];
  for (let i = 0; i < busStops.length - 1; i++) {
    const start = busStops[i];
    const end = busStops[i + 1];
    const segment = await getDirections(start, end);
    allCoordinates = allCoordinates.concat(segment);
  }
  
  const routeGeoJSON = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: allCoordinates
    }
  };

  map.addSource('route', {
    type: 'geojson',
    data: routeGeoJSON
  });

  map.addLayer({
    id: 'route',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#FFA500',
      'line-width': 4
    }
  });
}

map.on('load', () => {
  addRoute();
});