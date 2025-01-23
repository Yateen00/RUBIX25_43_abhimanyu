import React, { useState, useEffect } from "react";

const PredictCases = ({ casesData }) => {
    const [inputDate, setInputDate] = useState("");
    const [predictedCases, setPredictedCases] = useState(null);
    const [error, setError] = useState("");
    const [stateName, setStateName] = useState("Andaman and Nicobar Islands");

    const stateNames = Object.keys(casesData || {});

    const handleDateChange = (e) => {
        setInputDate(e.target.value);
    };

    const handleStateChange = (e) => {
        setStateName(e.target.value);
    };

    const handleSubmit = () => {
        if (casesData && stateName in casesData) {
            const stateData = casesData[stateName];
            const predictedData = stateData.prediction;

            const dateData = predictedData.find(([date]) => date === inputDate);
            if (dateData) {
                setPredictedCases(dateData[1]);
                setError("");
            } else {
                setPredictedCases(null);
                setError("Predicted data not available for the entered date.");
            }
        } else {
            setPredictedCases(null);
            setError("State data not available.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 py-8 bg-black text-white">
            <h1 className="text-3xl font-bold mb-6 text-center">Predict Cases for a Given Date</h1>

            <div className="w-full max-w-md bg-gray-900 p-6 rounded-lg shadow-lg">
                <label htmlFor="stateName" className="block mb-2">
                    Select State:
                </label>
                <select
                    id="stateName"
                    value={stateName}
                    onChange={handleStateChange}
                    className="w-full px-4 py-2 mb-4 bg-gray-800 text-white rounded-lg"
                >
                    {stateNames.map((state) => (
                        <option key={state} value={state}>
                            {state}
                        </option>
                    ))}
                </select>

                <label htmlFor="inputDate" className="block mb-2">
                    Enter Date:
                </label>
                <input
                    type="date"
                    id="inputDate"
                    value={inputDate}
                    onChange={handleDateChange}
                    className="w-full px-4 py-2 mb-4 bg-gray-800 text-white rounded-lg"
                />

                <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-full w-full mb-4"
                >
                    Get Predicted Cases
                </button>

                {error && (
                    <p className="text-red-500 font-medium">{error}</p>
                )}

                {predictedCases !== null && (
                    <div className="mt-4">
                        <h2 className="text-lg ">Total Predicted Cases upto {inputDate}:</h2>
                        <p className="text-xl font-bold text-center">{predictedCases.toFixed(0)} cases</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PredictCases;
