"use client";

import dynamic from "next/dynamic";

interface BranchMapProps {
  branches: Array<{
    id: string;
    branchName: string;
    branchCode?: string;
    address?: string;
    status?: string;
    latitude?: number | string | null;
    longitude?: number | string | null;
  }>;
}

const BranchMapContent = dynamic(() => import("./BranchMapContent"), {
  ssr: false,
});

export default function BranchMap({ branches }: BranchMapProps) {
  return <BranchMapContent branches={branches} />;
}
