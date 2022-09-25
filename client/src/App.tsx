import path from "path-browserify";
import React, { useEffect, useState } from "react";
import "./App.css";
import Home from "./pages/Home";
import Login from "./pages/Login";

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

export const App: React.FC<{}> = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkIfAuthenticated = async () => {
    if (apiEndpoint === undefined) {
      throw Error("No REACT_APP_API_ENDPOINT has been set!");
    }
    const url = path.join(apiEndpoint, "User/IsAuthenticated");
    const result = await fetch(url);

    const authenticationResult = await result.json();

    setIsAuthenticated(authenticationResult);
  };

  useEffect(() => {
    checkIfAuthenticated();
  }, []);

  const getPage = () => {
    if (!isAuthenticated) {
      return <Login />;
    }
    return <Home />;
  };

  return <div className="App">{getPage()}</div>;
};

export default App;
