import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("chords",       "routes/chords.tsx"),
  route("scales",       "routes/scales.tsx"),
  route("identifier",   "routes/identifier.tsx"),
  route("progressions", "routes/progressions.tsx"),
  route("arpeggios",    "routes/arpeggios.tsx"),
] satisfies RouteConfig;
