import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import { Button } from 'react-bootstrap';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/dist/styles.min.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker icon creator
const createCustomIcon = (severity) => {
  const colors = {
    low: '#3b82f6',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#991b1b',
  };

  const emojis = {
    low: '📍',
    medium: '⚠️',
    high: '🚨',
    critical: '🔥',
  };

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="custom-marker-icon marker-${severity}" style="background-color: ${colors[severity]}">
        ${emojis[severity]}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Component to handle map clicks
const MapClickHandler = ({ onMapClick, isAddingIssue }) => {
  useMapEvents({
    click: (e) => {
      if (isAddingIssue && onMapClick) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
};

const MapView = ({ 
  issues = [], 
  onIssueClick, 
  onMapClick, 
  isAddingIssue = false,
  center = [20.2961, 85.8245], // Default to Durg, Chhattisgarh
  zoom = 13 
}) => {
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef();

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const handleMarkerClick = (issue) => {
    if (onIssueClick) {
      onIssueClick(issue);
    }
  };

  const flyToUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo(userLocation, 15);
    }
  };

  return (
    <div className="map-container">
      <MapContainer
        center={userLocation || center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler 
          onMapClick={onMapClick} 
          isAddingIssue={isAddingIssue} 
        />

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={L.divIcon({
              className: 'user-location-marker',
              html: '<div style="width: 20px; height: 20px; background: #2563eb; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          >
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {/* Issue markers with clustering */}
        <MarkerClusterGroup>
          {issues.map((issue) => (
            <Marker
              key={issue._id}
              position={[issue.location.coordinates[1], issue.location.coordinates[0]]}
              icon={createCustomIcon(issue.severity)}
              eventHandlers={{
                click: () => handleMarkerClick(issue),
              }}
            >
              <Popup>
                <div className="popup-content">
                  {issue.photos && issue.photos.length > 0 && (
                    <img 
                      src={issue.photos[0]} 
                      alt={issue.title}
                      className="popup-image"
                    />
                  )}
                  <div className="popup-body">
                    <h6 className="popup-title">{issue.title}</h6>
                    <p className="popup-description">{issue.description}</p>
                    <div className="popup-meta">
                      <span className={`badge badge-${issue.severity}`}>
                        {issue.severity}
                      </span>
                      <span className={`badge badge-${issue.status}`}>
                        {issue.status}
                      </span>
                      <span>👍 {issue.upvotes || 0}</span>
                      <span>💬 {issue.comments?.length || 0}</span>
                    </div>
                    <div className="popup-actions">
                      <Button 
                        size="sm" 
                        variant="primary"
                        onClick={() => handleMarkerClick(issue)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Floating controls */}
      {userLocation && (
        <button
          className="btn btn-light shadow position-absolute"
          style={{ 
            bottom: '20px', 
            right: '20px', 
            zIndex: 1000,
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={flyToUserLocation}
          title="Go to my location"
        >
          📍
        </button>
      )}

      {isAddingIssue && (
        <div 
          className="alert alert-info shadow position-absolute"
          style={{ 
            top: '20px', 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: 1000,
            maxWidth: '400px'
          }}
        >
          Click on the map to select issue location
        </div>
      )}
    </div>
  );
};

export default MapView;