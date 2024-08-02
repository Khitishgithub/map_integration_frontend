import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import axios from 'axios';
import cargif from './assests/cargif.png'

const MapComponent = () => {
  const [routes, setRoutes] = useState([]);
  
  useEffect(() => {
   
    const map = L.map('map').setView([20.7967, 85.8317], 7); // Coordinates for Odisha, India

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: 'Leaflet &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>, contribution',
      maxZoom: 18
    }).addTo(map);

    
    const taxiIcon = L.icon({
      iconUrl: cargif, 
      iconSize: [50, 50]
    });

    const marker = L.marker([20.7967, 85.8317], { icon: taxiIcon }).addTo(map);


    const fetchRoutes = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/routes`);
        setRoutes(response.data);
        
        response.data.forEach(route => {
          L.Routing.control({
            waypoints: [
              L.latLng(route.startPoint.lat, route.startPoint.lng),
              L.latLng(route.endPoint.lat, route.endPoint.lng)
            ]
          }).addTo(map);
        });
      } catch (error) {
        console.error('Error fetching routes:', error);
      }
    };

    fetchRoutes();


    map.on('click', async (e) => {
      const newMarker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);

      const control = L.Routing.control({
        waypoints: [
          L.latLng(20.7967, 85.8317), 
          L.latLng(e.latlng.lat, e.latlng.lng)
        ]
      }).on('routesfound', async (e) => {
        const routes = e.routes;
        
       
        try {
          await axios.post(`${process.env.REACT_APP_API_URL}/api/routes`, {
            startPoint: { lat: 20.7967, lng: 85.8317 },
            endPoint: { lat: e.routes[0].coordinates[e.routes[0].coordinates.length - 1].lat, lng: e.routes[0].coordinates[e.routes[0].coordinates.length - 1].lng }
          });
        } catch (error) {
          console.error('Error saving route:', error);
        }

        e.routes[0].coordinates.forEach((coord, index) => {
          setTimeout(() => {
            marker.setLatLng([coord.lat, coord.lng]);
          }, 100 * index);
        });
      }).addTo(map);
    });


    return () => {
      map.remove();
    };
  }, []);

  return <div id="map" style={{ width: '100%', height: '100vh' }}></div>;
};

export default MapComponent;
