import React, { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import { Tooltip as ReactTooltip } from "react-tooltip";
import INDIA_TOPO_JSON from "./india.topo.json";
import CASES from "./cases.json";

const PROJECTION_CONFIG = {
    scale: 1200,
    center: [78.9629, 22.5937],
};

const COLOR_RANGE = [
    "#e8f5e9", // Light green
    "#c8e6c9",
    "#a5d6a7",
    "#81c784",
    "#66bb6a", // Medium green
    "#4caf50",
    "#43a047",
    "#388e3c", // Darker green
    "#2e7d32",
];

const DEFAULT_COLOR = "#EEE";
const HOTSPOT_COLOR = "#ff5722"; // Hotspot color (e.g., bright red)

const geographyStyle = {
    default: {
        outline: "none",
    },
    hover: {
        fill: "#ccc",
        transition: "all 250ms",
        outline: "none",
    },
    pressed: {
        outline: "none",
    },
};

const STATE_ID_MAP = {
    "Andaman and Nicobar Islands": "AN",
    "Andhra Pradesh": "AP",
    "Arunachal Pradesh": "AR",
    Assam: "AS",
    Bihar: "BR",
    Chhattisgarh: "CT",
    Goa: "GA",
    Gujarat: "GJ",
    Haryana: "HR",
    "Himachal Pradesh": "HP",
    Jharkhand: "JH",
    Karnataka: "KA",
    Kerala: "KL",
    "Madhya Pradesh": "MP",
    Maharashtra: "MH",
    Manipur: "MN",
    Meghalaya: "ML",
    Mizoram: "MZ",
    Nagaland: "NL",
    Odisha: "OD",
    Punjab: "PB",
    Rajasthan: "RJ",
    Sikkim: "SK",
    "Tamil Nadu": "TN",
    Telangana: "TS",
    Tripura: "TR",
    Uttarakhand: "UK",
    "Uttar Pradesh": "UP",
    "West Bengal": "WB",
    "Jammu and Kashmir": "JK",
    Ladakh: "LA",
    Lakshadweep: "LD",
    Puducherry: "PY",
    Chandigarh: "CH",
    "Dadra and Nagar Haveli": "DN",
    "Daman and Diu": "DD",
    Delhi: "DL",
};

function MapSingle({selectedDate}) {
    const [tooltipContent, setTooltipContent] = useState("");
    const [data, setData] = useState([]);
    const [hoveredState, setHoveredState] = useState(null);
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        if (selectedDate) {
            const heatmapData = Object.keys(CASES).map((stateName) => {
                const stateData = CASES[stateName];

                const pastData = stateData.past.find(([date]) => date === selectedDate);
                const predictionData = stateData.prediction.find(([date]) => date === selectedDate);

                let value = null;
                if (pastData) {
                    value = pastData[1];
                } else if (predictionData) {
                    value = predictionData[1];
                }

                return {
                    id: STATE_ID_MAP[stateName],
                    state: stateName,
                    value: Math.round(value),
                };
            });

            setFilteredData(heatmapData);
        }
    }, [selectedDate]);

    const gradientData = {
        fromColor: COLOR_RANGE[0],
        toColor: COLOR_RANGE[COLOR_RANGE.length - 1],
        min: 0,
        max: Math.max(...filteredData.map((item) => item.value || 0)),
    };

    const colorScale = scaleQuantile()
        .domain(filteredData.map((d) => d.value))
        .range(COLOR_RANGE);

    const highestCaseValue = Math.max(...filteredData.map((d) => d.value));

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-screen px-4">
            <h1 className="text-2xl font-semibold mb-4 mt-4 text-center text-white">Cases by State upto a date</h1>

            <ReactTooltip>{tooltipContent}</ReactTooltip>
            <ComposableMap
                projectionConfig={PROJECTION_CONFIG}
                projection="geoMercator"
                width={1200}
                height={800}
                data-tip=""
            >
                <Geographies geography={INDIA_TOPO_JSON}>
                    {({ geographies }) =>
                        geographies.map((geo) => {
                            const current = filteredData.find((s) => s.id === geo.id);
                            const isHotspot = current && current.value === highestCaseValue;
                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill={isHotspot ? HOTSPOT_COLOR : (current ? colorScale(current.value) : DEFAULT_COLOR)}
                                    style={geographyStyle}
                                    onMouseEnter={() =>
                                        setHoveredState({ name: current.state, value: current.value })
                                    }
                                    onMouseLeave={() => setHoveredState(null)}
                                    data-tip={geo.properties.name}
                                />
                            );
                        })
                    }
                </Geographies>
            </ComposableMap>
            {hoveredState && (
                <div className="bg-white border rounded shadow-md p-3 mt-2 text-base">
                    <strong>{hoveredState.name}</strong>
                    <br />
                    Value: {hoveredState.value}
                </div>
            )}

            {filteredData.length === 0 && (
                <div className="text-white mt-4">No data available for the selected date.</div>
            )}

            <div className="flex items-center gap-4 mt-6 mb-4">
                <span className="text-sm text-white">Low</span>
                <div
                    className="h-5 w-72 rounded border"
                    style={{
                        background: `linear-gradient(to right, ${gradientData.fromColor}, ${gradientData.toColor})`,
                    }}
                ></div>
                <span className="text-sm text-white">High</span>
            </div>
            <div className="text-white mt-4 flex items-center gap-2">
                <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: HOTSPOT_COLOR }}
                ></div>
                <span>Hotspot</span>
            </div>
        </div>
    );
}

export default MapSingle;
