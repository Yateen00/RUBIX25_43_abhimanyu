import { Heatmap } from "./heatmaps";
import HomePage from "./home";
import Charts from "./charts";
import CASES from "./cases.json";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PredictCases from "./predict";
import CsvUploadPage from "./csv";

function App() {
  return (
    <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage />}></Route>
                    <Route path="/map" element={<Heatmap />}></Route>
                    <Route path="/charts" element={<Charts casesData={CASES}/>}></Route>
                    <Route path="/predict" element={<PredictCases casesData={CASES}/>}></Route>
                    <Route path="/csv" element={<CsvUploadPage/>}></Route>
                </Routes>
            </BrowserRouter>
        </>
  )
}


export default App;