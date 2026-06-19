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
