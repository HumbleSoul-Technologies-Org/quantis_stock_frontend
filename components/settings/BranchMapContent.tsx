"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Users2 } from "lucide-react";

interface BranchMapContentProps {
  branches: Array<{
    id: string;
    branchName: string;
    branchCode?: string;
    address?: string;
    status?: string;
    latitude?: number | string | null;
    longitude?: number | string | null;
    district?: string;
    country?: string;
    users?: Array<any>;
    salesCount?: number;
    lossCount?: number;
  }>;
}

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

export default function BranchMapContent({ branches }: BranchMapContentProps) {
  const validBranches = branches.filter((branch) => {
    const latitude = Number(branch.latitude);
    const longitude = Number(branch.longitude);
    return (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  });

  const center: [number, number] =
    validBranches.length > 0
      ? [Number(validBranches[0].latitude), Number(validBranches[0].longitude)]
      : [0.3476, 32.5825];

  return (
    <div className="h-88 w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 relative z-0" style={{ isolation: "isolate" }}>
      {validBranches.length === 0 ? (
        <div className="flex h-full items-center justify-center bg-slate-50 px-4 text-center text-sm text-slate-600 dark:bg-slate-900/60 dark:text-slate-300">
          No branch coordinates are available yet. Add latitude and longitude
          values to display branches on the map.
        </div>
      ) : (
        <MapContainer
          center={center}
          zoom={6}
          scrollWheelZoom
          className="h-full w-full"
          style={{ position: "relative", zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {validBranches.map((branch) => (
            <Marker
              key={branch.id}
              position={[Number(branch.latitude), Number(branch.longitude)]}
              icon={markerIcon}
            >
              <Popup>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {branch.branchName}
                  </p>
                  {/* {branch.branchCode ? (
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Code: {branch.branchCode}
                    </p>
                  ) : null} */}
                  {branch.address ? (
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {branch.address},{branch?.district}, {branch?.country}
                    </p>
                  ) : null}
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    <Users2 className="inline-block h-4 w-4" />
                    Users: {branch?.users?.length || 0} | sales:{" "}
                    {branch?.salesCount || 0} | Losses: {branch?.lossCount || 0}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}
