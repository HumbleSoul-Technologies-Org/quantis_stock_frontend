import { calculateWorkforceStats } from "./workforceData";

describe("calculateWorkforceStats", () => {
  it("summarizes workers, attendance, and payroll readiness", () => {
    const workers = [
      { id: "1", fullName: "Ada", status: "active" },
      { id: "2", fullName: "Grace", status: "active" },
      { id: "3", fullName: "Linus", status: "inactive" },
    ] as any;

    const attendance = [
      { workerId: "1", status: "present" },
      { workerId: "2", status: "halfDay" },
      { workerId: "3", status: "absent" },
    ] as any;

    const stats = calculateWorkforceStats(workers, attendance);

    expect(stats.totalWorkers).toBe(3);
    expect(stats.presentToday).toBe(2);
    expect(stats.attendanceCoverage).toBe(67);
    expect(stats.pendingApprovals).toBe(0);
  });
});
