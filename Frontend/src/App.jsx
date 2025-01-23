import { Heatmap } from "./heatmaps";
import HomePage from "./home";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage />}></Route>
                    <Route path="/map" element={<Heatmap />}></Route>
                </Routes>
            </BrowserRouter>
        </>
  )
}

export default App;