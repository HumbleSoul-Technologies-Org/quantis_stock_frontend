import { Activity } from "./types";
import { format } from "date-fns";

/**
 * Export utilities for audit reports
 * Provides CSV and JSON export functionality for audit data
 */

export interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
}

/**
 * Export activities to CSV format
 */
export function exportActivitiesToCSV(
  activities: Activity[],
  options: ExportOptions = {}
): void {
  const {
    filename = `audit-report-${format(new Date(), "yyyy-MM-dd")}.csv`,
    includeHeaders = true,
    dateFormat = "yyyy-MM-dd HH:mm:ss",
  } = options;

  const headers = [
    "Date",
    "Action",
    "Entity Type",
    "Entity ID",
    "Reference ID",
    "Title",
    "Description",
    "User",
    "Status",
    "IP Address",
    "User Agent",
    "Resulting Action",
    "Changed Fields",
    "Before Values",
    "After Values",
  ];

  const csvData = activities.map((activity) => [
    format(new Date(activity.createdAt), dateFormat),
    activity.action,
    activity.entityType || "",
    activity.entityId || "",
    activity.referenceId || "",
    `"${activity.title.replace(/"/g, '""')}"`,
    `"${activity.description.replace(/"/g, '""')}"`,
    getUserDisplayName(activity.createdBy),
    activity.status,
    activity.ipAddress || "",
    `"${(activity.userAgent || "").replace(/"/g, '""')}"`,
    activity.resultingAction || "",
    activity.changeLog?.changedFields?.join("; ") || "",
    formatChangeLogValues(activity.changeLog?.before),
    formatChangeLogValues(activity.changeLog?.after),
  ]);

  const csvContent = includeHeaders
    ? [headers, ...csvData]
    : csvData;

  const csvString = csvContent
    .map((row) => row.map((cell) => String(cell)).join(","))
    .join("\n");

  downloadFile(csvString, filename, "text/csv");
}

/**
 * Export activities to JSON format
 */
export function exportActivitiesToJSON(
  activities: Activity[],
  options: ExportOptions = {}
): void {
  const {
    filename = `audit-report-${format(new Date(), "yyyy-MM-dd")}.json`,
  } = options;

  // Clean and format the activities for export
  const exportData = {
    exportInfo: {
      generatedAt: new Date().toISOString(),
      totalRecords: activities.length,
      dateRange: activities.length > 0 ? {
        from: activities[activities.length - 1].createdAt,
        to: activities[0].createdAt,
      } : null,
    },
    activities: activities.map((activity) => ({
      id: activity.id,
      createdAt: activity.createdAt,
      action: activity.action,
      entityType: activity.entityType,
      entityId: activity.entityId,
      referenceId: activity.referenceId,
      title: activity.title,
      description: activity.description,
      createdBy: activity.createdBy,
      status: activity.status,
      ipAddress: activity.ipAddress,
      userAgent: activity.userAgent,
      resultingAction: activity.resultingAction,
      changeLog: activity.changeLog,
      metadata: activity.metadata,
    })),
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  downloadFile(jsonString, filename, "application/json");
}

/**
 * Export activities to PDF format (placeholder for future implementation)
 */
export function exportActivitiesToPDF(
  activities: Activity[],
  options: ExportOptions = {}
): void {
  // PDF export would require additional libraries like jsPDF
  // For now, we'll export as CSV and note that PDF export is not implemented
  console.warn("PDF export not yet implemented. Exporting as CSV instead.");
  exportActivitiesToCSV(activities, {
    ...options,
    filename: options.filename?.replace('.pdf', '.csv') || `audit-report-${format(new Date(), "yyyy-MM-dd")}.csv`
  });
}

/**
 * Get user display name from createdBy field
 */
function getUserDisplayName(createdBy: string | any): string {
  if (typeof createdBy === "string") {
    return "Unknown";
  }

  if (createdBy && typeof createdBy === "object") {
    return createdBy.name || createdBy.username || createdBy.email || "Unknown";
  }

  return "Unknown";
}

/**
 * Format change log values for CSV export
 */
function formatChangeLogValues(values: any): string {
  if (!values) return "";

  try {
    // For CSV, we'll create a simple key:value format
    const entries = Object.entries(values);
    if (entries.length === 0) return "";

    return entries
      .map(([key, value]) => `${key}:${String(value).replace(/"/g, '""')}`)
      .join("; ");
  } catch (error) {
    return "Error formatting values";
  }
}

/**
 * Create and trigger file download
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Generate audit summary report
 */
export function generateAuditSummary(activities: Activity[]): string {
  const summary = {
    totalActivities: activities.length,
    dateRange: activities.length > 0 ? {
      from: new Date(Math.min(...activities.map(a => new Date(a.createdAt).getTime()))),
      to: new Date(Math.max(...activities.map(a => new Date(a.createdAt).getTime()))),
    } : null,
    byAction: activities.reduce((acc, activity) => {
      acc[activity.action] = (acc[activity.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byEntityType: activities.reduce((acc, activity) => {
      const type = activity.entityType || "unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byStatus: activities.reduce((acc, activity) => {
      acc[activity.status] = (acc[activity.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byUser: activities.reduce((acc, activity) => {
      const userName = getUserDisplayName(activity.createdBy);
      acc[userName] = (acc[userName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return JSON.stringify(summary, null, 2);
}