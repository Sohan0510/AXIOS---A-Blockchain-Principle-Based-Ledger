/* TomTom Maps SDK type declarations (minimal subset used in this project) */

interface TomTomMarker {
  setLngLat(lngLat: [number, number]): TomTomMarker;
  addTo(map: TomTomMap): TomTomMarker;
  setPopup(popup: TomTomPopup): TomTomMarker;
  remove(): void;
}

interface TomTomPopup {
  setHTML(html: string): TomTomPopup;
}

interface TomTomMap {
  addControl(control: unknown): void;
  setCenter(lngLat: [number, number]): void;
  setZoom(zoom: number): void;
  flyTo(options: { center: [number, number]; zoom?: number; speed?: number }): void;
  remove(): void;
  on(event: string, handler: () => void): void;
}

interface TomTomNavigationControl {}

interface TomTomStatic {
  map(options: {
    key: string;
    container: string | HTMLElement;
    center: [number, number];
    zoom: number;
    style?: string;
  }): TomTomMap;
  Marker: new (options?: { element?: HTMLElement; anchor?: string }) => TomTomMarker;
  Popup: new () => TomTomPopup;
  NavigationControl: new () => TomTomNavigationControl;
}

declare const tt: TomTomStatic;
