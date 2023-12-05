

// Amazon Location Service resource names:
const mapName = "virtualthingmap";
const placesName = "virtualthings_placeindex";
const region = "US-East-1";
const apiKey = "v1.public.eyJqdGkiOiJhODA4NWY5ZS1jOTFiLTQ4MWUtYTU0My0yYTJjZTQxNmFjM2YifVPL73W6FyAf1rN8BLCM34FXc5Z3EJ_cHV_H4fgoIdDaQmpTLqjlyz90QU1DCXKOPWSzvgA63S2DmKGUFo9nmcLrRhjmp5VM7u9aQeYBAkKzARdUQ5-mHdpMKRngcbHHV3_If-vIq9t6uLIW9FswU38V2ClfX5QQELOWcOA5-zXW8kE8jlxxx8J0oVQoUBfNrSa0san1_ZEclE0Bz5Q4zI2ZsQp6A2vo2awrZI-mUXvaJwI7a_h5AG0SR8tW74_Lpvgkbe7AeZDvsAzy4Wnn_wbI-tx087G56zoux7ZLS7jsJ_2NNwk77CeEvbGKCAWmHoOrPk7_EP_x5veBXxs1T78.ZWU0ZWIzMTktMWRhNi00Mzg0LTllMzYtNzlmMDU3MjRmYTkx"
const Tracker ="Virtualthing1_tracker";
// CREATE THE MAP IN THE SPACE YOU PROVIDED IN YOUR HTML CODE (<div id=map> </div>)
async function initializeMap() {
  let mlglMap; // declare a constant to name the map
  mlglMap = new maplibregl.Map({
    container: "map", // HTML element ID of map element
    center: [-102.13332, 41.0189], // Initial map centerpoint
    zoom: 2, // Initial map zoom
    style: `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${mapName}/style-descriptor?key=${apiKey}`, // Defines the appearance of the map and authenticates using an API key
  });
  // Add navigation control to the top left of the map
  mlglMap.addControl(new maplibregl.NavigationControl(), "top-left");



  return mlglMap; // DONE
  }







// the main function is where the execution of the code starts. start the map initialization process.
// it's inside the main function that you'll add your map functionalities

async function main() {
  // Create an authentication helper instance using an API key
  let authHelper;
  authHelper = await amazonLocationAuthHelper.withAPIKey(apiKey);


  // Initialize map and Amazon Location SDK client:
  const map = await initializeMap();
  map.addControl(
        new maplibregl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true
        }));

  const client = new amazonLocationClient.LocationClient({
    region,
    ...authHelper.getLocationClientConfig(), // Provides configuration required to make requests to Amazon Location
  });



  // On mouse click, display marker and get results:
  map.on("click", async function (e) {
    // Set up parameters for search call
    let params = {
      IndexName: placesName,
      Position: [e.lngLat.lng, e.lngLat.lat],
      Language: "en",
      MaxResults: "5",

    };

    {
      let marker = new maplibregl.Marker()
  .setLngLat(params.Position)
  .addTo(map);

      setTimeout(() => {      //ADDS MARKER WHEN YOU CLICK
        marker.remove();
      }, 300)

    };


    // Set up command to search for results around clicked point
    let searchCommand;
    searchCommand = new amazonLocationClient.SearchPlaceIndexForPositionCommand(params);

    try {

      // Make request to search for results around clicked point
      let data;
      data = await client.send(searchCommand);

      // Write JSON response data to HTML
      document.querySelector("#response").textContent = JSON.stringify(data, undefined, 2);

      // Display place label in an alert box
      alert(data.Results[0].Place.Label);



     }
     catch (error) {
      // Write JSON response error to HTML
      document.querySelector("#response").textContent = JSON.stringify(error, undefined, 2);

      // Display error in an alert box
      alert("There was an error searching.");
    }



  });



///TRACKER



// Function to zoom to a specific location
  function zoomToLocation(lat, lng, zoom) {
    map.flyTo({
      center: [lng, lat],
      zoom: zoom,
    });
  };

  // Handle search button click (Added Part)
  document.querySelector("#search-button").addEventListener("click", async () => {
    const placeQuery = document.querySelector("#place-query").value;

    // Set up parameters for search call
    let searchedplace = {
      IndexName: placesName,
      Text: placeQuery,
      MaxResults: 1, // We only want the top result
    };

    // Set up command to search for results based on the query
    const searchCommand = new amazonLocationClient.SearchPlaceIndexForTextCommand(searchedplace);

    try {
      // Make request to search for results based on the query
      const data = await client.send(searchCommand);

      if (data.Results.length > 0) {
        // Get the first result's coordinates and zoom to it
        const result = data.Results[0];
        const coordinates = result.Place.Geometry.Point;
        zoomToLocation(coordinates[1], coordinates[0], 5);

        // Write JSON response data to HTML
        document.querySelector("#response").textContent = JSON.stringify(data, undefined, 2);
      } else {
        alert("No results found for the query.");
      }
    } catch (error) {
      // Write JSON response error to HTML
      document.querySelector("#response").textContent = JSON.stringify(error, undefined, 2);

      // Display error in an alert box
      alert("There was an error searching.");
    }
  });






}
main();


