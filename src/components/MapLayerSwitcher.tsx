import { useEffect, useState } from 'react';
import { LayersControl, TileLayer } from 'react-leaflet';
import { mapApi, type MapConfiguration } from '../services/api';

export default function MapLayerSwitcher() {
  const [config, setConfig] = useState<MapConfiguration | null>(null);

  useEffect(() => {
    mapApi.getConfig().then((result) => {
      if (result.ok) {
        setConfig(result.data);
      }
    });
  }, []);

  if (!config) {
    return (
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    );
  }

  return (
    <LayersControl position="topright">
      {config.baseLayers.map((layer) => (
        <LayersControl.BaseLayer
          key={layer.id}
          checked={layer.isDefault}
          name={layer.name}
        >
          <TileLayer
            url={layer.urlTemplate}
            attribution={layer.attribution}
            minZoom={layer.minZoom}
            maxZoom={layer.maxZoom}
            opacity={layer.opacity}
          />
        </LayersControl.BaseLayer>
      ))}
      {config.overlayLayers.map((layer) => (
        <LayersControl.Overlay key={layer.id} name={layer.name}>
          <TileLayer
            url={layer.urlTemplate}
            attribution={layer.attribution}
            minZoom={layer.minZoom}
            maxZoom={layer.maxZoom}
            opacity={layer.opacity}
          />
        </LayersControl.Overlay>
      ))}
    </LayersControl>
  );
}
