import React, { useState } from "react";
import MapSingle from "./map_1";
import MapSeven from "./map_2";

export function Heatmap() {
    const [selectedDate, setSelectedDate] = useState("");
    const [showHeatmaps, setShowHeatmaps] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const handleDateSubmit = () => {
        if (selectedDate) {
            const selectedDateObj = new Date(selectedDate);
            const cutoffDate = new Date("2022-04-28");

            if (selectedDateObj > cutoffDate) {
                setLoading(true); 
                setTimeout(() => {
                    setLoading(false); 
                    setShowHeatmaps(true); 
                }, 60000); 
            } else {
                setShowHeatmaps(true); 
            }
        }
    };

    return (
        <div
            className="flex flex-col justify-center items-center min-h-screen bg-black gap-4"
            style={{ padding: "20px" }}
        >
            {!showHeatmaps && !loading ? (
                <div className="flex flex-col items-center">
                    <h1 className="text-2xl font-semibold mb-4 text-center text-white">
                        Select a Date to View Heatmaps
                    </h1>
                    <div className="flex flex-col items-center mb-6">
                        <label htmlFor="date" className="text-white mb-2">
                            Select a Date:
                        </label>
                        <input
                            type="date"
                            id="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="px-4 py-2 rounded-md text-black"
                        />
                    </div>
                    <button
                        onClick={handleDateSubmit}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md"
                    >
                        Show Heatmaps
                    </button>
                </div>
            ) : loading ? (
                <div className="text-white text-2xl">Processing data...</div> 
            ) : (
                <div className="flex justify-center items-center gap-4">
                    <div
                        className="p-4 bg-gray-800 rounded-lg shadow-lg"
                        style={{ flex: "1", maxWidth: "45%" }}
                    >
                        <MapSingle selectedDate={selectedDate} />
                    </div>
                    <div
                        className="p-4 bg-gray-800 rounded-lg shadow-lg"
                        style={{ flex: "1", maxWidth: "45%" }}
                    >
                        <MapSeven selectedDate={selectedDate} />
                    </div>
                </div>
            )}
        </div>
    );
}
