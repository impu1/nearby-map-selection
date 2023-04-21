import React from "react";

// Package för att definera kartan.
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

import { useGeolocated } from "react-geolocated";

const containerStyle = {
  width: "1000px",
  height: "1000px",
};

const svgMarker = {
  path: "M-1.547 12l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM0 0q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
  fillColor: "blue",
  fillOpacity: 0.6,
  strokeWeight: 0,
  rotation: 0,
  scale: 2,
};

const divStyle = {
  background: `white`,
  border: `1px solid #ccc`,
  padding: 22,
};

function Map() {
  const [loading, setLoading] = React.useState(true);
  const [center, setCenter] = React.useState(null);
  const [map, setMap] = React.useState(null);
  const [stores, setStores] = React.useState([]);

  // infobox states
  const [selectedPlace, setSelectedPlace] = React.useState(null);
  const [markerMap, setMarkerMap] = React.useState({});
  const [infoOpen, setInfoOpen] = React.useState(false);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_MAP_API,
  });

  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: false,
      },
      userDecisionTimeout: 5000,
    });

  React.useEffect(() => {
    if (coords && coords.latitude) {
      setCenter({ lat: coords.latitude, lng: coords.longitude });

      setLoading(false);
    }
  }, [coords]);

  const onLoad = React.useCallback(
    function callback(map) {
      // This is just an example of getting and using the map instance!!! don't just blindly copy!
      const bounds = new window.google.maps.LatLngBounds(center);
      map.fitBounds(bounds);

      var location = new google.maps.LatLng(center.lat, center.lng);

      const request = {
        location: location,
        radius: "5000",
        type: ["store"],
        keyword: "gorecery store",
      };

      const service = new google.maps.places.PlacesService(map);

      service.nearbySearch(request, function (results, status) {
        // console.log(
        //   `findPlacesFromQuery(${JSON.stringify(request)})`,
        //   status,
        //   results
        // );
        if (status !== "OK") {
          return console.log("WRONG");
        }
        setStores(results);
      });

      setMap(map);
    },
    [loading]
  );

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  // We have to create a mapping of our places to actual Marker objects
  const markerLoadHandler = (marker, place) => {
    return setMarkerMap((prevState) => {
      return { ...prevState, [place.place_id]: marker };
    });
  };

  const markerClickHandler = (event, place) => {
    console.log("klickade på", place);
    // Remember which place was clicked
    setSelectedPlace(place);

    // Required so clicking a 2nd marker works as expected
    if (infoOpen) {
      setInfoOpen(false);
    }

    setInfoOpen(true);
    // if you want to center the selected Marker
    //setCenter(place.pos)
  };

  return !loading && isLoaded && isGeolocationEnabled ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      <Marker position={center} icon={svgMarker}>
        <InfoWindow>
          <div style={divStyle}>
            <h1 style={{ fontSize: 12 }}>Din position</h1>
          </div>
        </InfoWindow>
      </Marker>

      {stores.map((store) => {
        return (
          <Marker
            key={store.place_id}
            position={store.geometry.location}
            title={store.name}
            onLoad={(marker) => markerLoadHandler(marker, store)}
            onClick={(event) => {
              setInfoOpen(false);
              markerClickHandler(event, store);
            }}
          ></Marker>
        );
      })}
      {infoOpen && selectedPlace && (
        <InfoWindow
          anchor={markerMap[selectedPlace.place_id]}
          onCloseClick={() => setInfoOpen(false)}
        >
          <div>
            <h3>{selectedPlace.place_id}</h3>
            <div>{selectedPlace.name}</div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  ) : (
    <></>
  );
}

export default React.memo(Map);
