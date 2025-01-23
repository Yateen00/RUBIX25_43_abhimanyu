import MapSingle from "./map_1";
import MapSeven from "./map_2";

export function Heatmap() {
    return (
        <div
            className="flex justify-center items-center min-h-screen bg-black gap-4"
            style={{ padding: "20px" }}
        >
            <div
                className="p-4 bg-gray-800 rounded-lg shadow-lg"
                style={{ flex: "1", maxWidth: "45%" }}
            >
                <MapSingle />
            </div>
            <div
                className="p-4 bg-gray-800 rounded-lg shadow-lg"
                style={{ flex: "1", maxWidth: "45%" }}
            >
                <MapSeven />
            </div>
        </div>
    );
}
