import React from "react";

interface LoaderProps {
    text?: string;
}

const Loader: React.FC<LoaderProps> = ({ text = "Loading..." }) => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 text-lg">{text}</p>
        </div>
    </div>
);

export default Loader;