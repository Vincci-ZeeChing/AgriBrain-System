import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Login from "./component/authentication/Login";
import Agribrain from "./page/agribrain/Agribrain";
import Dashboard from "./page/dashboard/Dashboard";

function App() {
  return (
    <div>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login/>}/>

                {/*Main Page*/}
                <Route path="/agribrain" element={<Agribrain/>}/>
                <Route path="/dashboard" element={<Dashboard/>}/>

            </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
