import React, { useState } from "react";
import { Upload } from "lucide-react";

function CsvUploadPage() {
    const [image, setImage] = useState(null);
    const [fileName, setFileName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            setLoading(true);
            alert("File uploaded successfully!");

            setTimeout(() => {
                setImage("./src/assets/csv-img.jpg");
                setLoading(false);
            }, 3000);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-screen px-4 bg-black text-white overflow-auto">
            <h1 className="text-3xl font-bold mb-6 mt-6 text-center">Upload CSV File</h1>

            <label className="flex flex-col items-center justify-center p-8 bg-gradient-to-r from-indigo-800 via-indigo-900 to-blue-900 text-white rounded-md cursor-pointer shadow-lg transform hover:scale-105 hover:shadow-2xl transition-all duration-300">
                <Upload size={32} className="mb-3" />
                <span className="text-xl">Click or Drag to Upload</span>
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                />
            </label>

            {loading && (
                <div className="mt-6 text-xl font-bold">Loading results...</div> // Simple loader text
            )}

            {image && !loading && (
                <div className="text-center mt-6 p-4">
                    <div className="text-xl font-bold pb-4">Results : </div>
                    <img src={image} alt="Uploaded" />
                </div>
            )}
        </div>
    );
}

export default CsvUploadPage;
