import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.heat';

const Heatmap = ({ map, issues }) => {
  const heatLayerRef = useRef(null);

  useEffect(() => {
    if (!map || !issues || issues.length === 0) return;

    // Remove existing heat layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    // Prepare heat data: [lat, lng, intensity]
    const heatData = issues.map((issue) => {
      const lat = issue.location.coordinates[1];
      const lng = issue.location.coordinates[0];
      
      // Calculate intensity based on severity and upvotes
      let intensity = 0.5;
      
      switch (issue.severity) {
        case 'critical':
          intensity = 1.0;
          break;
        case 'high':
          intensity = 0.8;
          break;
        case 'medium':
          intensity = 0.6;
          break;
        case 'low':
          intensity = 0.4;
          break;
        default:
          intensity = 0.5;
      }
      
      // Boost intensity based on upvotes
      const upvoteBoost = Math.min((issue.upvotes || 0) * 0.05, 0.3);
      intensity = Math.min(intensity + upvoteBoost, 1.0);
      
      return [lat, lng, intensity];
    });

    // Create heat layer
    const heatLayer = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.0: 'blue',
        0.5: 'yellow',
        0.7: 'orange',
        1.0: 'red',
      },
    });

    heatLayer.addTo(map);
    heatLayerRef.current = heatLayer;

    // Cleanup function
    return () => {
      if (heatLayerRef.current && map) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, issues]);

  return null; // This component doesn't render anything directly
};

export default Heatmap;