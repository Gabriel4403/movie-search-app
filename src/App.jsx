import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./App.css";
import RootLayout from "./pages/Root";
import ErrorPage from "./pages/ErrorPage";

import WatchList from "./pages/WatchList";
import WatchedList from "./pages/WatchedList";
import SearchPage from "./pages/SearchPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      // FIX: `index` must be a boolean, not a string. Also removed the
      // redundant `path: "/"` — index routes must not have a path.
      { index: true, element: <WatchList /> },
      { path: "/watched", element: <WatchedList /> },
      { path: "/search", element: <SearchPage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
