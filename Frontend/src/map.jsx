import React, { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import { Tooltip as ReactTooltip } from "react-tooltip";
import INDIA_TOPO_JSON from "./india.topo.json";

const PROJECTION_CONFIG = {
    scale: 1200,
    center: [78.9629, 22.5937],
};

const COLOR_RANGE = [
    "#ffedea",
    "#ffcec5",
    "#ffad9f",
    "#ff8a75",
    "#ff5533",
    "#e2492d",
    "#be3d26",
    "#9a311f",
    "#782618",
];

const DEFAULT_COLOR = "#EEE";

const getRandomInt = (min = 0, max = 100) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

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

const initialHeatMapData = [
    { id: "AP", state: "Andhra Pradesh", value: getRandomInt() },
    { id: "AR", state: "Arunachal Pradesh", value: getRandomInt() },
    { id: "AS", state: "Assam", value: getRandomInt() },
    { id: "BR", state: "Bihar", value: getRandomInt() },
    { id: "CT", state: "Chhattisgarh", value: getRandomInt() },
    { id: "GA", state: "Goa", value: 21 },
    { id: "GJ", state: "Gujarat", value: 22 },
    { id: "HR", state: "Haryana", value: getRandomInt() },
    { id: "HP", state: "Himachal Pradesh", value: 24 },
    { id: "JH", state: "Jharkhand", value: 26 },
    { id: "KA", state: "Karnataka", value: 27 },
    { id: "KL", state: "Kerala", value: getRandomInt() },
    { id: "MP", state: "Madhya Pradesh", value: getRandomInt() },
    { id: "MH", state: "Maharashtra", value: getRandomInt() },
    { id: "MN", state: "Manipur", value: getRandomInt() },
    { id: "ML", state: "Meghalaya", value: 59 },
    { id: "MZ", state: "Mizoram", value: getRandomInt() },
    { id: "NL", state: "Nagaland", value: 59 },
    { id: "OR", state: "Odisha", value: 59 },
    { id: "PB", state: "Punjab", value: getRandomInt() },
    { id: "RJ", state: "Rajasthan", value: getRandomInt() },
    { id: "SK", state: "Sikkim", value: getRandomInt() },
    { id: "TN", state: "Tamil Nadu", value: getRandomInt() },
    { id: "TG", state: "Telangana", value: getRandomInt() },
    { id: "TR", state: "Tripura", value: 14 },
    { id: "UT", state: "Uttarakhand", value: getRandomInt() },
    { id: "UP", state: "Uttar Pradesh", value: 15 },
    { id: "WB", state: "West Bengal", value: 17 },
    { id: "AN", state: "Andaman and Nicobar Islands", value: getRandomInt() },
    { id: "CH", state: "Chandigarh", value: getRandomInt() },
    { id: "DN", state: "Dadra and Nagar Haveli", value: 19 },
    { id: "DD", state: "Daman and Diu", value: 20 },
    { id: "DL", state: "Delhi", value: 59 },
    { id: "JK", state: "Jammu and Kashmir", value: 25 },
    { id: "LA", state: "Ladakh", value: getRandomInt() },
    { id: "LD", state: "Lakshadweep", value: getRandomInt() },
    { id: "PY", state: "Puducherry", value: getRandomInt() },
];

function Map() {
    const [tooltipContent, setTooltipContent] = useState("");
    const [data] = useState(initialHeatMapData);
    const [hoveredState, setHoveredState] = useState(null);

    const gradientData = {
        fromColor: COLOR_RANGE[0],
        toColor: COLOR_RANGE[COLOR_RANGE.length - 1],
        min: 0,
        max: Math.max(...data.map((item) => item.value)),
    };

    const colorScale = scaleQuantile()
        .domain(data.map((d) => d.value))
        .range(COLOR_RANGE);

    return (
        <div className="flex flex-col items-center justify-center w-full h-screen px-4">
            <h1 className="text-2xl font-semibold mb-4 mt-4">Cases according to States</h1>
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
                            const current = data.find((s) => s.id === geo.id);
                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill={current ? colorScale(current.value) : DEFAULT_COLOR}
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
            <div className="flex items-center gap-4 mt-6 mb-4">
                <span className="text-sm">Low</span>
                <div
                    className="h-5 w-72 rounded border"
                    style={{
                        background: `linear-gradient(to right, ${gradientData.fromColor}, ${gradientData.toColor})`,
                    }}
                ></div>
                <span className="text-sm">High</span>
            </div>
        </div>
    );
}

export default Map;
