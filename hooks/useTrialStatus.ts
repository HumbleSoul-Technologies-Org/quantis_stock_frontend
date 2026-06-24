import { useMemo } from "react";

export function useTrialStatus(trialExpires?: string) {
  return useMemo(() => {
    if (!trialExpires) {
      return {
        daysLeft: 0,
        isActive: false,
        isExpiring: false,
        statusColor: "gray",
        statusText: "No trial",
      };
    }

    const expiryDate = new Date(trialExpires);
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();
    const daysLeft = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));

    const isActive = daysLeft > 0;
    const isExpiring = isActive && daysLeft <= 5;

    let statusColor = "green";
    let statusText = `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`;

    if (!isActive) {
      statusColor = "gray";
      statusText = "Expired";
    } else if (isExpiring) {
      statusColor = daysLeft <= 2 ? "red" : "amber";
    }

    return {
      daysLeft,
      isActive,
      isExpiring,
      statusColor,
      statusText,
    };
  }, [trialExpires]);
}
