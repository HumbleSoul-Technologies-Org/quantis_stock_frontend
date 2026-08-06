export interface WorkforceWorker {
  id: string;
  fullName: string;
  department?: string;
  branchId?: string;
  employmentType?: string;
  status?: string;
}

export interface WorkforceAttendanceRecord {
  workerId: string;
  status: "present" | "absent" | "halfDay" | "leave" | "off";
}

export interface WorkforceSummaryStats {
  totalWorkers: number;
  presentToday: number;
  attendanceCoverage: number;
  pendingApprovals: number;
  estimatedPayroll: number;
  estimatedAdvances: number;
}

export function calculateWorkforceStats(
  workers: WorkforceWorker[],
  attendance: WorkforceAttendanceRecord[],
): WorkforceSummaryStats {
  const activeWorkers = workers.filter(
    (worker) => worker.status !== "inactive",
  );
  const presentToday = attendance.filter(
    (record) => record.status === "present" || record.status === "halfDay",
  ).length;

  const attendanceCoverage =
    workers.length > 0 ? Math.round((presentToday / workers.length) * 100) : 0;

  const estimatedPayroll = activeWorkers.length * 15000;
  const estimatedAdvances = activeWorkers.length * 3000;

  return {
    totalWorkers: workers.length,
    presentToday,
    attendanceCoverage,
    pendingApprovals: 0,
    estimatedPayroll,
    estimatedAdvances,
  };
}
