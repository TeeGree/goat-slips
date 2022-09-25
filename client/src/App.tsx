import path from "path-browserify";
import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";

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

    console.log(authenticationResult);
  };

  useEffect(() => {
    checkIfAuthenticated();
  }, []);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
