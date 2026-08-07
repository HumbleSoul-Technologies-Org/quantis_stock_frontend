"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, CalendarDays, BadgeDollarSign, HandCoins } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { calculateWorkforceStats } from "@/components/workforce/workforceData";
import { WorkforceForms } from "@/components/workforce/WorkforceForms";
import { PayrollAndAdvances } from "@/components/workforce/PayrollAndAdvances";
import { BranchComparison } from "@/components/workforce/BranchComparison";
import { ApprovalQueue } from "@/components/workforce/ApprovalQueue";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  createWorkforceAttendance,
  createWorkforceAttendancePolicy,
  createWorkforceWorker,
  fetchWorkforceAttendance,
  fetchWorkforceAttendancePolicies,
  fetchWorkforceBranches,
  fetchWorkforceWorkers,
  updateWorkforceWorker,
  deleteWorkforceWorker,
  updateWorkforceAttendance,
  deleteWorkforceAttendance,
  updateWorkforceAttendancePolicy,
  deleteWorkforceAttendancePolicy,
} from "@/components/workforce/workforceService";
import {
  createWorkforceAdvance,
  createWorkforcePayrollRun,
  fetchWorkforceAdvances,
  fetchWorkforcePayrollEntries,
  fetchWorkforcePayrollPolicies,
  fetchWorkforcePayslips,
  fetchWorkforceAdvanceDeductions,
  fetchWorkforcePayrollRuns,
} from "@/components/workforce/workforcePayrollService";
import {
  updateWorkforcePayrollRun,
  deleteWorkforcePayrollRun,
  updateWorkforcePayrollEntry,
  deleteWorkforcePayrollEntry,
  updateWorkforcePayslip,
  deleteWorkforcePayslip,
  updateWorkforceAdvance,
  deleteWorkforceAdvance,
  updateWorkforceAdvanceDeduction,
  deleteWorkforceAdvanceDeduction,
  updateWorkforcePayrollPolicy,
  deleteWorkforcePayrollPolicy,
} from "@/components/workforce/workforcePayrollService";
import {
  createWorkforcePayrollPolicy,
  createWorkforcePayrollEntry,
  createWorkforcePayslip,
  createWorkforceAdvanceDeduction,
} from "@/components/workforce/workforcePayrollService";
import type {
  AttendancePolicy,
  AdvanceDeduction,
  PayrollEntry,
  PayrollPolicy,
  Payslip,
  Branch,
  WorkforceAttendanceRecordType,
  WorkforceAdvanceType,
  WorkforcePayrollRunType,
  WorkforceWorkerProfile,
} from "@/lib/types";

const summaryCards = [
  { title: "Total workers", icon: Users, accent: "bg-teal-50 text-teal-700" },
  {
    title: "Present today",
    icon: CalendarDays,
    accent: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Payroll due",
    icon: BadgeDollarSign,
    accent: "bg-amber-50 text-amber-700",
  },
  { title: "Advances", icon: HandCoins, accent: "bg-sky-50 text-sky-700" },
];

export default function WorkforcePage() {
  const router = useRouter();
  const { user } = useAuth();
  const isManufacturer = user?.business?.businessType === "manufacturer";

  useEffect(() => {
    if (user && !isManufacturer) {
      router.replace("/dashboard");
    }
  }, [user, isManufacturer, router]);

  if (user && !isManufacturer) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Unauthorized</h1>
        <p className="mt-2 text-sm text-slate-500">
          Workforce management is only available for manufacturing business
          types.
        </p>
      </div>
    );
  }

  const [branchFilter, setBranchFilter] = useState("all");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [workers, setWorkers] = useState<WorkforceWorkerProfile[]>([]);
  const [attendance, setAttendance] = useState<WorkforceAttendanceRecordType[]>(
    [],
  );
  const [payrollRuns, setPayrollRuns] = useState<WorkforcePayrollRunType[]>([]);
  const [advances, setAdvances] = useState<WorkforceAdvanceType[]>([]);
  const [attendancePolicies, setAttendancePolicies] = useState<
    AttendancePolicy[]
  >([]);
  const [payrollPolicies, setPayrollPolicies] = useState<PayrollPolicy[]>([]);
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [advanceDeductions, setAdvanceDeductions] = useState<
    AdvanceDeduction[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<
    | "worker"
    | "attendance"
    | "payroll"
    | "advance"
    | "attendancePolicy"
    | "payrollPolicy"
    | "payrollEntry"
    | "payslip"
    | "advanceDeduction"
  >("worker");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formInitialData, setFormInitialData] = useState<any | null>(null);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);
  const [deleteRunId, setDeleteRunId] = useState<string | null>(null);
  const [deleteWorkerId, setDeleteWorkerId] = useState<string | null>(null);
  const [deleteAttendanceId, setDeleteAttendanceId] = useState<string | null>(
    null,
  );
  const [deleteAdvanceId, setDeleteAdvanceId] = useState<string | null>(null);
  const [deleteAttendancePolicyId, setDeleteAttendancePolicyId] = useState<
    string | null
  >(null);
  const [deletePayrollPolicyId, setDeletePayrollPolicyId] = useState<
    string | null
  >(null);
  const [deletePayslipId, setDeletePayslipId] = useState<string | null>(null);
  const [deleteAdvanceDeductionId, setDeleteAdvanceDeductionId] = useState<
    string | null
  >(null);

  const loadBranches = async () => {
    if (!user?.token) return;

    try {
      const branchData = await fetchWorkforceBranches(user.token);
      setBranches(branchData as Branch[]);
    } catch (error) {
      console.error("Failed to load branches", error);
    }
  };

  const handleEditPayrollRun = (run: WorkforcePayrollRunType) => {
    setFormMode("payroll");
    setFormInitialData(run);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleDeletePayrollRun = async (id: string) => {
    if (!user?.token) return;
    // open confirmation dialog
    setDeleteRunId(id);
  };

  const confirmDeletePayrollRun = async () => {
    if (!user?.token || !deleteRunId) return;
    try {
      await deleteWorkforcePayrollRun(deleteRunId, user.token);
      await loadData();
    } catch (error) {
      console.error("Failed to delete payroll run", error);
      setErrorMessage("Payroll run could not be deleted. Please try again.");
    } finally {
      setDeleteRunId(null);
    }
  };

  const cancelDeletePayrollRun = () => setDeleteRunId(null);

  const loadData = async () => {
    if (!user?.token || !user?.businessId) return;

    setIsLoading(true);
    setErrorMessage(null);

    const requestedBranchId = branchFilter === "all" ? undefined : branchFilter;
    const effectiveBranchId = requestedBranchId ?? undefined;

    try {
      const [
        workerData,
        attendanceData,
        payrollData,
        advanceData,
        attendancePolicyData,
        payrollPolicyData,
        payrollEntryData,
        payslipData,
        advanceDeductionData,
      ] = await Promise.all([
        fetchWorkforceWorkers(user.token, user.businessId, effectiveBranchId),
        fetchWorkforceAttendance(
          user.token,
          user.businessId,
          effectiveBranchId,
        ),
        fetchWorkforcePayrollRuns(
          user.token,
          user.businessId,
          effectiveBranchId,
        ),
        fetchWorkforceAdvances(user.token, user.businessId, effectiveBranchId),
        fetchWorkforceAttendancePolicies(
          user.token,
          user.businessId,
          effectiveBranchId,
        ),
        fetchWorkforcePayrollPolicies(
          user.token,
          user.businessId,
          effectiveBranchId,
        ),
        fetchWorkforcePayrollEntries(user.token, user.businessId),
        fetchWorkforcePayslips(user.token),
        fetchWorkforceAdvanceDeductions(user.token),
      ]);

      setWorkers(workerData as WorkforceWorkerProfile[]);
      setAttendance(attendanceData as WorkforceAttendanceRecordType[]);
      setPayrollRuns(payrollData as WorkforcePayrollRunType[]);
      setAdvances(advanceData as WorkforceAdvanceType[]);
      setAttendancePolicies(attendancePolicyData as AttendancePolicy[]);
      setPayrollPolicies(payrollPolicyData as PayrollPolicy[]);
      setPayrollEntries(payrollEntryData as PayrollEntry[]);
      setPayslips(payslipData as Payslip[]);
      setAdvanceDeductions(advanceDeductionData as AdvanceDeduction[]);
    } catch (error) {
      console.error("Failed to load workforce data", error);
      setErrorMessage("Unable to load the latest workforce data right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadBranches();
  }, [user?.token]);

  useEffect(() => {
    void loadData();
  }, [user?.token, user?.businessId, branchFilter]);

  const stats = useMemo(
    () =>
      calculateWorkforceStats(
        workers.map((worker) => ({
          id: worker.id || worker._id || "",
          fullName: worker.fullName,
          department: worker.department,
          branchId: worker.branchId || undefined,
          employmentType: worker.employmentType,
          status: worker.status,
        })),
        attendance.map((record) => ({
          workerId: record.workerId,
          status: record.status,
        })),
      ),
    [workers, attendance],
  );

  const filteredWorkers = useMemo(() => {
    if (branchFilter === "all") return workers;
    return workers.filter((worker) => worker.branchId === branchFilter);
  }, [branchFilter, workers]);

  const handleCreateWorker = async (
    payload: Partial<WorkforceWorkerProfile>,
  ) => {
    if (!user?.token || !user?.businessId) return;

    try {
      if (isEditing && formInitialData?.id) {
        await updateWorkforceWorker(
          formInitialData.id,
          {
            ...payload,
            branchId:
              branchFilter === "all"
                ? user.branchId || undefined
                : branchFilter,
            businessId: user.businessId,
          },
          user.token,
        );
      } else {
        await createWorkforceWorker(
          {
            ...payload,
            branchId:
              branchFilter === "all"
                ? user.branchId || undefined
                : branchFilter,
            businessId: user.businessId,
          },
          user.token,
        );
      }
      setIsEditing(false);
      setFormInitialData(null);
      await loadData();
    } catch (error) {
      console.error("Failed to save worker", error);
      setErrorMessage("Worker could not be saved. Please try again.");
    }
  };

  const handleCreateAttendance = async (
    payload: Partial<WorkforceAttendanceRecordType>,
  ) => {
    if (!user?.token || !workers[0] || !user.businessId) return;

    try {
      if (isEditing && formInitialData?.id) {
        await updateWorkforceAttendance(
          formInitialData.id,
          {
            ...payload,
            workerId: payload.workerId || workers[0]._id || workers[0].id || "",
            branchId:
              branchFilter === "all"
                ? user.branchId || undefined
                : branchFilter,
            businessId: user.businessId,
          },
          user.token,
        );
      } else {
        await createWorkforceAttendance(
          {
            ...payload,
            workerId: payload.workerId || workers[0]._id || workers[0].id || "",
            branchId:
              branchFilter === "all"
                ? user.branchId || undefined
                : branchFilter,
            businessId: user.businessId,
          },
          user.token,
        );
      }
      setIsEditing(false);
      setFormInitialData(null);
      await loadData();
    } catch (error) {
      console.error("Failed to save attendance", error);
      setErrorMessage("Attendance could not be saved. Please try again.");
    }
  };

  const handleCreatePayroll = async (
    payload: Partial<WorkforcePayrollRunType>,
  ) => {
    if (!user?.token || !user?.businessId) return;

    try {
      await createWorkforcePayrollRun(
        {
          ...payload,
          branchId:
            branchFilter === "all" ? user.branchId || undefined : branchFilter,
          businessId: user.businessId,
        },
        user.token,
      );
      await loadData();
    } catch (error) {
      console.error("Failed to save payroll run", error);
      setErrorMessage("Payroll run could not be saved. Please try again.");
    }
  };

  const handleSubmitPayroll = async (
    payload: Partial<WorkforcePayrollRunType>,
  ) => {
    if (!user?.token || !user?.businessId) return;
    try {
      if (isEditing && formInitialData?.id) {
        await updateWorkforcePayrollRun(
          formInitialData.id,
          payload,
          user.token,
        );
      } else {
        await createWorkforcePayrollRun(
          {
            ...payload,
            branchId:
              branchFilter === "all"
                ? user.branchId || undefined
                : branchFilter,
            businessId: user.businessId,
          },
          user.token,
        );
      }
      setIsEditing(false);
      setFormInitialData(null);
      await loadData();
    } catch (error) {
      console.error("Failed to save payroll run", error);
      setErrorMessage("Payroll run could not be saved. Please try again.");
    }
  };

  const handleCreateAdvance = async (
    payload: Partial<WorkforceAdvanceType>,
  ) => {
    if (!user?.token || !user?.businessId) return;

    try {
      if (isEditing && formInitialData?.id) {
        await updateWorkforceAdvance(
          formInitialData.id,
          {
            ...payload,
            branchId:
              branchFilter === "all"
                ? user.branchId || undefined
                : branchFilter,
            businessId: user.businessId,
          },
          user.token,
        );
      } else {
        await createWorkforceAdvance(
          {
            ...payload,
            branchId:
              branchFilter === "all"
                ? user.branchId || undefined
                : branchFilter,
            businessId: user.businessId,
          },
          user.token,
        );
      }
      setIsEditing(false);
      setFormInitialData(null);
      await loadData();
    } catch (error) {
      console.error("Failed to save advance", error);
      setErrorMessage("Advance could not be saved. Please try again.");
    }
  };

  const handleCreateAttendancePolicy = async (
    payload: Partial<AttendancePolicy>,
  ) => {
    if (!user?.token || !user?.businessId) return;

    try {
      if (isEditing && formInitialData?.id) {
        await updateWorkforceAttendancePolicy(
          formInitialData.id,
          {
            ...payload,
            branchId:
              branchFilter === "all"
                ? user.branchId || undefined
                : branchFilter,
            businessId: user.businessId,
          },
          user.token,
        );
      } else {
        await createWorkforceAttendancePolicy(
          {
            ...payload,
            branchId:
              branchFilter === "all"
                ? user.branchId || undefined
                : branchFilter,
            businessId: user.businessId,
          },
          user.token,
        );
      }
      setIsEditing(false);
      setFormInitialData(null);
      await loadData();
    } catch (error) {
      console.error("Failed to save attendance policy", error);
      setErrorMessage(
        "Attendance policy could not be saved. Please try again.",
      );
    }
  };

  const handleCreatePayrollPolicy = async (payload: Partial<PayrollPolicy>) => {
    if (!user?.token || !user?.businessId) return;

    try {
      if (isEditing && formInitialData?.id) {
        await updateWorkforcePayrollPolicy(
          formInitialData.id,
          {
            ...payload,
            branchId:
              branchFilter === "all"
                ? user.branchId || undefined
                : branchFilter,
            businessId: user.businessId,
          },
          user.token,
        );
      } else {
        await createWorkforcePayrollPolicy(
          {
            ...payload,
            branchId:
              branchFilter === "all"
                ? user.branchId || undefined
                : branchFilter,
            businessId: user.businessId,
          },
          user.token,
        );
      }
      setIsEditing(false);
      setFormInitialData(null);
      await loadData();
    } catch (error) {
      console.error("Failed to save payroll policy", error);
      setErrorMessage("Payroll policy could not be saved. Please try again.");
    }
  };

  const handleCreatePayrollEntry = async (payload: Partial<PayrollEntry>) => {
    if (!user?.token || !user?.businessId) return;

    try {
      if (isEditing && formInitialData?.id) {
        await updateWorkforcePayrollEntry(
          formInitialData.id,
          payload,
          user.token,
        );
      } else {
        await createWorkforcePayrollEntry(
          {
            ...payload,
            businessId: user.businessId,
          },
          user.token,
        );
      }
      setIsEditing(false);
      setFormInitialData(null);
      await loadData();
    } catch (error) {
      console.error("Failed to save payroll entry", error);
      setErrorMessage("Payroll entry could not be saved. Please try again.");
    }
  };

  const handleEditPayrollEntry = (entry: PayrollEntry) => {
    setFormMode("payrollEntry");
    setFormInitialData(entry);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleDeletePayrollEntry = async (id: string) => {
    if (!user?.token) return;
    setDeleteEntryId(id);
  };

  const confirmDeletePayrollEntry = async () => {
    if (!user?.token || !deleteEntryId) return;
    try {
      await deleteWorkforcePayrollEntry(deleteEntryId, user.token);
      await loadData();
    } catch (error) {
      console.error("Failed to delete payroll entry", error);
      setErrorMessage("Payroll entry could not be deleted. Please try again.");
    } finally {
      setDeleteEntryId(null);
    }
  };

  const cancelDeletePayrollEntry = () => setDeleteEntryId(null);

  const handleCreatePayslip = async (payload: Partial<Payslip>) => {
    if (!user?.token) return;

    try {
      if (isEditing && formInitialData?.id) {
        await updateWorkforcePayslip(formInitialData.id, payload, user.token);
      } else {
        await createWorkforcePayslip(payload, user.token);
      }
      setIsEditing(false);
      setFormInitialData(null);
      await loadData();
    } catch (error) {
      console.error("Failed to save payslip", error);
      setErrorMessage("Payslip could not be saved. Please try again.");
    }
  };

  const handleCreateAdvanceDeduction = async (
    payload: Partial<AdvanceDeduction>,
  ) => {
    if (!user?.token) return;

    try {
      if (isEditing && formInitialData?.id) {
        await updateWorkforceAdvanceDeduction(
          formInitialData.id,
          payload,
          user.token,
        );
      } else {
        await createWorkforceAdvanceDeduction(payload, user.token);
      }
      setIsEditing(false);
      setFormInitialData(null);
      await loadData();
    } catch (error) {
      console.error("Failed to save advance deduction", error);
      setErrorMessage(
        "Advance deduction could not be saved. Please try again.",
      );
    }
  };

  const handleEditWorker = (worker: WorkforceWorkerProfile) => {
    setFormMode("worker");
    setFormInitialData(worker);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleDeleteWorker = (id?: string) => setDeleteWorkerId(id ?? null);

  const confirmDeleteWorker = async () => {
    if (!user?.token || !deleteWorkerId) return;
    try {
      await deleteWorkforceWorker(deleteWorkerId, user.token);
      await loadData();
    } catch (error) {
      console.error("Failed to delete worker", error);
      setErrorMessage("Worker could not be deleted. Please try again.");
    } finally {
      setDeleteWorkerId(null);
    }
  };

  const cancelDeleteWorker = () => setDeleteWorkerId(null);

  const handleEditAttendance = (record: WorkforceAttendanceRecordType) => {
    setFormMode("attendance");
    setFormInitialData(record);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleDeleteAttendance = (id?: string) =>
    setDeleteAttendanceId(id ?? null);

  const confirmDeleteAttendance = async () => {
    if (!user?.token || !deleteAttendanceId) return;
    try {
      await deleteWorkforceAttendance(deleteAttendanceId, user.token);
      await loadData();
    } catch (error) {
      console.error("Failed to delete attendance", error);
      setErrorMessage("Attendance could not be deleted. Please try again.");
    } finally {
      setDeleteAttendanceId(null);
    }
  };

  const cancelDeleteAttendance = () => setDeleteAttendanceId(null);

  const handleEditAdvance = (advance: WorkforceAdvanceType) => {
    setFormMode("advance");
    setFormInitialData(advance);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleDeleteAdvance = (id: string) => setDeleteAdvanceId(id);

  const confirmDeleteAdvance = async () => {
    if (!user?.token || !deleteAdvanceId) return;
    try {
      await deleteWorkforceAdvance(deleteAdvanceId, user.token);
      await loadData();
    } catch (error) {
      console.error("Failed to delete advance", error);
      setErrorMessage("Advance could not be deleted. Please try again.");
    } finally {
      setDeleteAdvanceId(null);
    }
  };

  const cancelDeleteAdvance = () => setDeleteAdvanceId(null);

  const handleEditAttendancePolicy = (policy: AttendancePolicy) => {
    setFormMode("attendancePolicy");
    setFormInitialData(policy);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleDeleteAttendancePolicy = (id: string) =>
    setDeleteAttendancePolicyId(id);

  const confirmDeleteAttendancePolicy = async () => {
    if (!user?.token || !deleteAttendancePolicyId) return;
    try {
      await deleteWorkforceAttendancePolicy(
        deleteAttendancePolicyId,
        user.token,
      );
      await loadData();
    } catch (error) {
      console.error("Failed to delete attendance policy", error);
      setErrorMessage("Policy could not be deleted. Please try again.");
    } finally {
      setDeleteAttendancePolicyId(null);
    }
  };

  const cancelDeleteAttendancePolicy = () => setDeleteAttendancePolicyId(null);

  const handleEditPayrollPolicy = (policy: PayrollPolicy) => {
    setFormMode("payrollPolicy");
    setFormInitialData(policy);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleDeletePayrollPolicy = (id: string) =>
    setDeletePayrollPolicyId(id);

  const confirmDeletePayrollPolicy = async () => {
    if (!user?.token || !deletePayrollPolicyId) return;
    try {
      await deleteWorkforcePayrollPolicy(deletePayrollPolicyId, user.token);
      await loadData();
    } catch (error) {
      console.error("Failed to delete payroll policy", error);
      setErrorMessage("Policy could not be deleted. Please try again.");
    } finally {
      setDeletePayrollPolicyId(null);
    }
  };

  const cancelDeletePayrollPolicy = () => setDeletePayrollPolicyId(null);

  const handleEditPayslip = (payslip: Payslip) => {
    setFormMode("payslip");
    setFormInitialData(payslip);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleDeletePayslip = (id: string) => setDeletePayslipId(id);

  const confirmDeletePayslip = async () => {
    if (!user?.token || !deletePayslipId) return;
    try {
      await deleteWorkforcePayslip(deletePayslipId, user.token);
      await loadData();
    } catch (error) {
      console.error("Failed to delete payslip", error);
      setErrorMessage("Payslip could not be deleted. Please try again.");
    } finally {
      setDeletePayslipId(null);
    }
  };

  const cancelDeletePayslip = () => setDeletePayslipId(null);

  const handleEditAdvanceDeduction = (deduction: AdvanceDeduction) => {
    setFormMode("advanceDeduction");
    setFormInitialData(deduction);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleDeleteAdvanceDeduction = (id: string) =>
    setDeleteAdvanceDeductionId(id);

  const confirmDeleteAdvanceDeduction = async () => {
    if (!user?.token || !deleteAdvanceDeductionId) return;
    try {
      await deleteWorkforceAdvanceDeduction(
        deleteAdvanceDeductionId,
        user.token,
      );
      await loadData();
    } catch (error) {
      console.error("Failed to delete advance deduction", error);
      setErrorMessage("Deduction could not be deleted. Please try again.");
    } finally {
      setDeleteAdvanceDeductionId(null);
    }
  };

  const cancelDeleteAdvanceDeduction = () => setDeleteAdvanceDeductionId(null);

  return (
    <div className="space-y-6">
      <WorkforceForms
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        workers={workers}
        payrollRuns={payrollRuns}
        payrollEntries={payrollEntries}
        advances={advances}
        onSubmitWorker={handleCreateWorker}
        onSubmitAttendance={handleCreateAttendance}
        onSubmitPayroll={handleSubmitPayroll}
        onSubmitAdvance={handleCreateAdvance}
        onSubmitAttendancePolicy={handleCreateAttendancePolicy}
        onSubmitPayrollPolicy={handleCreatePayrollPolicy}
        onSubmitPayrollEntry={handleCreatePayrollEntry}
        onSubmitPayslip={handleCreatePayslip}
        onSubmitAdvanceDeduction={handleCreateAdvanceDeduction}
        initialMode={formMode}
        initialData={formInitialData ?? undefined}
        isEdit={isEditing}
      />

      <ConfirmDialog
        open={Boolean(deleteRunId)}
        title="Delete payroll run"
        description="Delete this payroll run? This will fail if entries exist."
        confirmLabel="Delete run"
        cancelLabel="Cancel"
        onConfirm={confirmDeletePayrollRun}
        onCancel={cancelDeletePayrollRun}
      />

      <ConfirmDialog
        open={Boolean(deleteEntryId)}
        title="Delete payroll entry"
        description="Delete this payroll entry? This action cannot be undone."
        confirmLabel="Delete entry"
        cancelLabel="Cancel"
        onConfirm={confirmDeletePayrollEntry}
        onCancel={cancelDeletePayrollEntry}
      />

      <ConfirmDialog
        open={Boolean(deleteWorkerId)}
        title="Delete worker"
        description="Delete this worker and all related records? This action cannot be undone."
        confirmLabel="Delete worker"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteWorker}
        onCancel={cancelDeleteWorker}
      />

      <ConfirmDialog
        open={Boolean(deleteAttendanceId)}
        title="Delete attendance"
        description="Delete this attendance record? This action cannot be undone."
        confirmLabel="Delete attendance"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteAttendance}
        onCancel={cancelDeleteAttendance}
      />

      <ConfirmDialog
        open={Boolean(deleteAdvanceId)}
        title="Delete advance"
        description="Delete this advance request? This action cannot be undone."
        confirmLabel="Delete advance"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteAdvance}
        onCancel={cancelDeleteAdvance}
      />

      <ConfirmDialog
        open={Boolean(deleteAttendancePolicyId)}
        title="Delete attendance policy"
        description="Delete this attendance policy? This will affect future attendance records."
        confirmLabel="Delete policy"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteAttendancePolicy}
        onCancel={cancelDeleteAttendancePolicy}
      />

      <ConfirmDialog
        open={Boolean(deletePayrollPolicyId)}
        title="Delete payroll policy"
        description="Delete this payroll policy? This may affect payroll calculations."
        confirmLabel="Delete policy"
        cancelLabel="Cancel"
        onConfirm={confirmDeletePayrollPolicy}
        onCancel={cancelDeletePayrollPolicy}
      />

      <ConfirmDialog
        open={Boolean(deletePayslipId)}
        title="Delete payslip"
        description="Delete this payslip? This action cannot be undone."
        confirmLabel="Delete payslip"
        cancelLabel="Cancel"
        onConfirm={confirmDeletePayslip}
        onCancel={cancelDeletePayslip}
      />

      <ConfirmDialog
        open={Boolean(deleteAdvanceDeductionId)}
        title="Delete deduction"
        description="Delete this deduction? This action cannot be undone."
        confirmLabel="Delete deduction"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteAdvanceDeduction}
        onCancel={cancelDeleteAdvanceDeduction}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Workforce</h1>
          <p className="text-sm text-slate-600">
            Manage workers, attendance, payroll, and advances for your
            manufacturing operations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-slate-600">Branch</label>
          <select
            value={branchFilter}
            onChange={(event) => setBranchFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
          >
            <option value="all">All branches</option>
            {branches.map((branch) => (
              <option
                key={branch._id || branch.id}
                value={branch._id || branch.id}
              >
                {branch.branchName || "Unnamed branch"}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setFormMode("worker");
              setIsFormOpen(true);
            }}
            className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700"
          >
            Add worker
          </button>

          <button
            onClick={() => {
              setFormMode("attendance");
              setIsFormOpen(true);
            }}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700"
          >
            Log attendance
          </button>

          <button
            onClick={() => {
              setFormMode("payroll");
              setIsFormOpen(true);
            }}
            className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700"
          >
            New payroll
          </button>

          <button
            onClick={() => {
              setFormMode("advance");
              setIsFormOpen(true);
            }}
            className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700"
          >
            Request advance
          </button>

          <button
            onClick={() => {
              setFormMode("attendancePolicy");
              setIsFormOpen(true);
            }}
            className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700"
          >
            Attendance policy
          </button>

          <button
            onClick={() => {
              setFormMode("payrollPolicy");
              setIsFormOpen(true);
            }}
            className="rounded-full border border-fuchsia-200 bg-fuchsia-50 px-3 py-1.5 text-sm font-medium text-fuchsia-700"
          >
            Payroll policy
          </button>

          <button
            onClick={() => {
              setFormMode("payrollEntry");
              setIsFormOpen(true);
            }}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700"
          >
            Payroll entry
          </button>

          <button
            onClick={() => {
              setFormMode("payslip");
              setIsFormOpen(true);
            }}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700"
          >
            Payslip
          </button>

          <button
            onClick={() => {
              setFormMode("advanceDeduction");
              setIsFormOpen(true);
            }}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700"
          >
            Deduction
          </button>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          const values = [
            stats.totalWorkers,
            stats.presentToday,
            `KES ${stats.estimatedPayroll}`,
            `KES ${stats.estimatedAdvances}`,
          ];
          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{card.title}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {values[index]}
                  </p>
                </div>
                <div className={`rounded-2xl p-3 ${card.accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Worker overview
              </h2>
              <p className="text-sm text-slate-500">
                Branch-aware view for staff and casual labor.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-500">
              Loading workforce data...
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Department
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredWorkers.map((worker) => (
                    <tr key={worker.id || worker._id}>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {worker.fullName}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {worker.department}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {worker.employmentType}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${worker.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                        >
                          {worker.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditWorker(worker)}
                            className="rounded-md bg-slate-50 px-2 py-1 text-sm text-slate-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteWorker(worker.id || worker._id)
                            }
                            className="rounded-md bg-rose-50 px-2 py-1 text-sm text-rose-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredWorkers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-6 text-center text-sm text-slate-500"
                      >
                        No workers found for the selected branch.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Attendance snapshot
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Live summary for present and half-day attendance.
            </p>
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Present today</div>
              <div className="mt-1 text-3xl font-semibold text-slate-900">
                {stats.presentToday}
              </div>
              <div className="mt-2 text-sm text-slate-600">
                Coverage: {stats.attendanceCoverage}%
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent attendance
            </h2>
            <div className="mt-3 space-y-2">
              {attendance.slice(0, 4).map((record) => (
                <div
                  key={record.id || record._id}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-slate-900">
                      {record.date}
                    </div>
                    <div className="capitalize">{record.status}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditAttendance(record)}
                      className="rounded-md bg-slate-50 px-2 py-1 text-sm text-slate-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteAttendance(record.id || record._id)
                      }
                      className="rounded-md bg-rose-50 px-2 py-1 text-sm text-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {attendance.length === 0 ? (
                <div className="text-sm text-slate-500">
                  No attendance logged yet.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <PayrollAndAdvances
        workers={workers}
        payrollRuns={payrollRuns}
        advances={advances}
        payrollEntries={payrollEntries}
        payslips={payslips}
        advanceDeductions={advanceDeductions}
        onEditRun={handleEditPayrollRun}
        onDeleteRun={handleDeletePayrollRun}
        onEditEntry={handleEditPayrollEntry}
        onDeleteEntry={handleDeletePayrollEntry}
        onEditAdvance={handleEditAdvance}
        onDeleteAdvance={handleDeleteAdvance}
        onEditPayslip={handleEditPayslip}
        onDeletePayslip={handleDeletePayslip}
        onEditAdvanceDeduction={handleEditAdvanceDeduction}
        onDeleteAdvanceDeduction={handleDeleteAdvanceDeduction}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Workforce policies
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Policy counts for attendance and payroll settings.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Attendance policies</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">
                {attendancePolicies.length}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Payroll policies</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">
                {payrollPolicies.length}
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Payroll workflow
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Entries, payslips, and deduction tracking loaded from backend.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Payroll entries</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">
                {payrollEntries.length}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Payslips</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">
                {payslips.length}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Deductions</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">
                {advanceDeductions.length}
              </div>
            </div>
          </div>
        </div>
      </div>
      <BranchComparison branches={branches} workers={workers} />
      <ApprovalQueue workers={workers} advances={advances} />
    </div>
  );
}
