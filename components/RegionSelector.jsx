import React, { useState } from "react";
import { Input } from "./ui/input";

const regionOptions = [
    "Region 1: Ilocos Region",
    "Region 2: Cagayan Valley",
    "Region 3: Central Luzon",
    "Region 4-A: CALABARZON",
    "Region 4-B: MIMAROPA",
    "Region 5: Bicol Region",
    "Region 6: Western Visayas",
    "Region 7: Central Visayas",
    "Region 8: Eastern Visayas",
    "Region 9: Zamboanga Peninsula",
    "Region 10: Northern Mindanao",
    "Region 11: Davao Region",
    "Region 12: SOCCSKSARGEN",
    "Region 13: Caraga",
    "CAR (Cordillera Administrative Region)",
    "NCR (National Capital Region)",
    "BARMM (Bangsamoro Autonomous Region in Muslim Mindanao)",
    "NIR (Negros Island Region)"
  ];

const RegionSelector = ({ register, setValue, errors }) => {
  const [query, setQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");

  const filteredRegions =
    query === ""
      ? regionOptions
      : regionOptions.filter((region) =>
          region.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <div>
      <label htmlFor="region" className="text-sm font-medium">
        Region<span className="text-red-600">*</span>
      </label>
      <div className="relative">
        <Input
          id="region"
          type="text"
          placeholder="Region"
          value={selectedRegion}
          onChange={(e) => {
            const inputValue = e.target.value;
            setQuery(inputValue);
            setSelectedRegion(inputValue);
            setValue("region", inputValue);
          }}
          className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
          // {...register("region", { required: "Region is required" })}
        />
        {query && (
          <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            {filteredRegions.length === 0 ? (
              <li className="cursor-default select-none py-2 px-4 text-gray-700">
                No results found.
              </li>
            ) : (
              filteredRegions.map((region) => (
                <li
                  key={region}
                  onClick={() => {
                    setSelectedRegion(region);
                    setQuery("");
                    setValue("region", region);
                  }}
                  className="cursor-pointer select-none py-2 px-4 hover:bg-primary hover:text-white"
                >
                  {region}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      {errors.region && (
        <p className="text-sm text-red-500">{errors.region.message}</p>
      )}
    </div>
  );
};

export default RegionSelector;