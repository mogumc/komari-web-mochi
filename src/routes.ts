// routes.js
import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import React from "react";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/404"));

export const routes: RouteObject[] = [
  {
    path: "/",
    element: React.createElement(lazy(() => import("./pages/_layout"))),
    children: [
      { index: true, element: React.createElement(Index) },
      {
        path: "instance/:uuid",
        element: React.createElement(lazy(() => import("./pages/instance"))),
      },
      {
        path: "monitor",
        element: React.createElement(lazy(() => import("./pages/monitor"))),
      },
    ],
  },
  // Catch-all 404 route
  { path: "*", element: React.createElement(NotFound) },
];
