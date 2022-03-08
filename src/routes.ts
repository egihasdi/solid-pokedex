import { lazy } from "solid-js";
import type { RouteDefinition } from "solid-app-router";

import Home from "./pages/home";
import Pokemon from './pages/pokemon';
import AboutData from "./pages/about.data";

export const routes: RouteDefinition[] = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/pokemon/:name",
    component: Pokemon,
  },
  // {
  //   path: "/pokemon",
  //   component: lazy(() => import("./pages/pokemon")),
  //   data: AboutData,
  // },
  {
    path: "**",
    component: lazy(() => import("./errors/404")),
  },
];
