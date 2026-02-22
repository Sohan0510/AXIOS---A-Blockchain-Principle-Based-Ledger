import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

const TOMTOM_API_KEY = "jDlehF7KresUWJ0xPrSrjHQnYmPfTnA3";

interface TomTomMapProps {
  latitude: number;
  longitude: number;
  label?: string;
  height?: string;
}

export function TomTomMap({ latitude, longitude, label, height = "350px" }: TomTomMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<TomTomMap | null>(null);
  const markerRef = useRef<TomTomMarker | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (typeof tt === "undefined") return;

    // Destroy previous map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = tt.map({
      key: TOMTOM_API_KEY,
      container: mapRef.current,
      center: [longitude, latitude], // TomTom uses [lng, lat]
      zoom: 15,
    });

    map.addControl(new tt.NavigationControl());

    // Add marker immediately — TomTom v6 uses `new tt.Marker()`
    const marker = new tt.Marker()
      .setLngLat([longitude, latitude])
      .addTo(map);

    // Attach popup
    const popup = new tt.Popup().setHTML(
      `<div style="padding:6px 10px;font-size:13px;font-weight:500;">
        ${label ?? "Land Location"}<br/>
        <span style="font-size:11px;color:#666;">${latitude.toFixed(6)}, ${longitude.toFixed(6)}</span>
      </div>`
    );
    marker.setPopup(popup);

    markerRef.current = marker;
    mapInstanceRef.current = map;

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, label]);

  // If TomTom SDK isn't loaded, show a fallback
  if (typeof window !== "undefined" && typeof tt === "undefined") {
    return (
      <div className="rounded-xl border border-border bg-card/60 p-6 text-center">
        <MapPin size={24} className="mx-auto text-text-muted mb-2" />
        <p className="text-[13px] text-text-muted">Map unavailable — TomTom SDK not loaded.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card/60 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
        <MapPin size={15} className="text-primary" />
        <h3 className="text-[14px] text-text-primary font-medium">Land Location</h3>
        <span className="ml-auto text-[11px] text-text-muted font-mono">
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </span>
      </div>
      <div ref={mapRef} className="w-full" style={{ height }} />
    </div>
  );
}
