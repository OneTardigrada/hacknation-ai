// Shared Carto Positron (light) raster style — desaturated, minimalist look.
// Used by both the presenter MapboardView and the in-app Nearby mini-map.

import type maplibregl from "maplibre-gl";

export const LIGHT_STYLE = {
  version: 8,
  sources: {
    "carto-light": {
      type: "raster" as const,
      tiles: [
        "https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OSM</a> · © <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [
    { id: "bg", type: "background" as const, paint: { "background-color": "#F4F6F8" } },
    {
      id: "tiles",
      type: "raster" as const,
      source: "carto-light",
      paint: { "raster-saturation": -0.7, "raster-contrast": 0.02, "raster-brightness-max": 0.99 },
    },
  ],
} as unknown as maplibregl.StyleSpecification;
