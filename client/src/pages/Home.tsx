import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

export const Home: React.FC<{}> = () => {
  return (
    <div className="Home">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      Welcome to G.O.A.T. Slips!
    </div>
  );
};

export default Home;
