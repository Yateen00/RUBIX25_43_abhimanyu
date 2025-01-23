import HomePage from "./home";
import Map from "./map";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage />}></Route>
                    <Route path="/map" element={<Map />}></Route>
                </Routes>
            </BrowserRouter>
        </>
  )
}

export default App;