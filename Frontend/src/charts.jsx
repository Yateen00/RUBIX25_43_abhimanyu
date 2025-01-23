import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const Charts = ({ casesData }) => {
    const [selectedStates, setSelectedStates] = useState([]);
    const [chartData, setChartData] = useState({});
    const [allStates, setAllStates] = useState([]);

    useEffect(() => {
        if (casesData) {
            const stateNames = Object.keys(casesData);
            setAllStates(stateNames);
        }
    }, [casesData]);

    const handleStateSelection = (state) => {
        setSelectedStates((prev) =>
            prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
        );
    };

    useEffect(() => {
        if (selectedStates.length > 0) {
            const datasets = selectedStates.map((state) => {
                const pastData = casesData[state].past;
                return {
                    label: state,
                    data: pastData.map((entry) => entry[1]),
                    borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
                    fill: false,
                    tension: 0.3,
                    borderWidth: 2, // increased border width for better visibility
                };
            });

            const labels = casesData[selectedStates[0]].past.map((entry) => entry[0]);

            setChartData({
                labels,
                datasets,
            });
        }
    }, [selectedStates, casesData]);

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 py-8 bg-black text-white overflow-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">Compare Cases by State</h1>
            
            <div className="flex flex-wrap gap-4 justify-center mb-6">
                {allStates.map((state) => (
                    <button
                        key={state}
                        className={`px-6 py-3 rounded-full font-medium shadow-md transform transition-transform duration-300 hover:scale-105 ${
                            selectedStates.includes(state)
                                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                        onClick={() => handleStateSelection(state)}
                    >
                        {state}
                    </button>
                ))}
            </div>

            {chartData.labels && (
                <div className="w-full lg:w-3/4 xl:w-2/3 2xl:w-1/2 bg-gray-900 p-6 rounded-lg shadow-lg mb-8">
                    {/* This ensures the chart div has a max-width for better responsiveness */}
                    <Line
                        data={chartData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    display: true,
                                    labels: {
                                        color: "white",
                                    },
                                    position: "top",
                                },
                                tooltip: {
                                    mode: "index",
                                    intersect: false,
                                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                                    titleColor: "black",
                                    bodyColor: "black",
                                },
                            },
                            scales: {
                                x: {
                                    title: {
                                        display: true,
                                        text: "Date",
                                        color: "white",
                                    },
                                    ticks: {
                                        color: "white",
                                    },
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: "Cases",
                                        color: "white",
                                    },
                                    ticks: {
                                        color: "white",
                                    },
                                },
                            },
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default Charts;
