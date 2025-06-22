import React from "react";

export default function MapPlaceholder({ height = 400 }) {
  return (
    <div className="w-full flex items-center justify-center my-8">
      <div
        className="w-full max-w-4xl bg-blue-900/20 border-2 border-cyan-400/30 rounded-2xl flex items-center justify-center text-cyan-200 text-lg font-semibold"
        style={{ height }}
      >
        [Map will be shown here]
      </div>
    </div>
  );
}
