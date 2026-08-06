"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type {
  AttendancePolicy,
  AdvanceDeduction,
  Payslip,
  PayrollEntry,
  PayrollPolicy,
  WorkforceAttendanceRecordType,
  WorkforceAdvanceType,
  WorkforcePayrollRunType,
  WorkforceWorkerProfile,
} from "@/lib/types";

interface WorkforceFormsProps {
  isOpen: boolean;
  onClose: () => void;
  workers: WorkforceWorkerProfile[];
  payrollRuns: WorkforcePayrollRunType[];
  payrollEntries: PayrollEntry[];
  advances: WorkforceAdvanceType[];
  initialMode?:
    | "worker"
    | "attendance"
    | "payroll"
    | "advance"
    | "attendancePolicy"
    | "payrollPolicy"
    | "payrollEntry"
    | "payslip"
    | "advanceDeduction";
  onSubmitWorker?: (
    payload: Partial<WorkforceWorkerProfile>,
  ) => Promise<void> | void;
  onSubmitAttendance?: (
    payload: Partial<WorkforceAttendanceRecordType>,
  ) => Promise<void> | void;
  onSubmitPayroll?: (
    payload: Partial<WorkforcePayrollRunType>,
  ) => Promise<void> | void;
  // Optional initial data for edit flows
  initialData?: any;
  isEdit?: boolean;
  onSubmitAdvance?: (
    payload: Partial<WorkforceAdvanceType>,
  ) => Promise<void> | void;
  onSubmitAttendancePolicy?: (
    payload: Partial<AttendancePolicy>,
  ) => Promise<void> | void;
  onSubmitPayrollPolicy?: (
    payload: Partial<PayrollPolicy>,
  ) => Promise<void> | void;
  onSubmitPayrollEntry?: (
    payload: Partial<PayrollEntry>,
  ) => Promise<void> | void;
  onSubmitPayslip?: (payload: Partial<Payslip>) => Promise<void> | void;
  onSubmitAdvanceDeduction?: (
    payload: Partial<AdvanceDeduction>,
  ) => Promise<void> | void;
}

const initialWorkerForm: Partial<WorkforceWorkerProfile> = {
  fullName: "",
  department: "production",
  employmentType: "casual",
  status: "active",
};

const initialAttendanceForm: Partial<WorkforceAttendanceRecordType> = {
  date: new Date().toISOString().slice(0, 10),
  status: "present",
};

const initialPayrollForm: Partial<WorkforcePayrollRunType> = {
  periodStart: new Date().toISOString().slice(0, 10),
  periodEnd: new Date().toISOString().slice(0, 10),
  totalGross: 0,
  totalDeductions: 0,
  totalNet: 0,
};

const initialAdvanceForm: Partial<WorkforceAdvanceType> = {
  workerId: "",
  amount: 0,
  outstandingBalance: 0,
  status: "pending",
};

const initialAttendancePolicyForm: Partial<AttendancePolicy> = {
  name: "",
  isActive: true,
  workSchedule: {
    daysOfWork: 5,
    workHours: 8,
  },
  pay: {
    payPerDay: 0,
    halfDayPay: 0,
    overtimeEnabled: false,
    overtimeRate: 0,
  },
  publicHolidays: {
    working: false,
    paymentMode: "normal",
    paymentMultiplier: 1,
  },
  leaves: {
    enabled: false,
    maxLeaveDays: 0,
    paymentEnabled: false,
    paymentRules: [
      {
        reason: "other",
        paymentAmount: 0,
        isPaid: false,
      },
    ],
  },
};

const initialPayrollPolicyForm: Partial<PayrollPolicy> = {
  employmentType: "casual",
  payCycle: "monthly",
  basicPayMode: "salary",
  basicRate: 0,
  overtimeRate: 0,
  allowanceRate: 0,
  deductionsRules: [],
};

const initialPayrollEntryForm: Partial<PayrollEntry> = {
  workerId: "",
  runId: "",
  basePay: 0,
  overtimePay: 0,
  allowances: 0,
  deductions: 0,
  advances: 0,
  netPay: 0,
  status: "draft",
};

const initialPayslipForm: Partial<Payslip> = {
  entryId: "",
  pdfUrl: "",
  issuedAt: new Date().toISOString().slice(0, 10),
};

const initialAdvanceDeductionForm: Partial<AdvanceDeduction> = {
  advanceId: "",
  entryId: "",
  amountDeducted: 0,
  remainingBalanceAfterDeduction: 0,
  deductedAt: new Date().toISOString().slice(0, 10),
};

export function WorkforceForms({
  isOpen,
  onClose,
  workers,
  payrollRuns,
  payrollEntries,
  advances,
  initialMode = "worker",
  onSubmitWorker,
  onSubmitAttendance,
  onSubmitPayroll,
  onSubmitAdvance,
  onSubmitAttendancePolicy,
  onSubmitPayrollPolicy,
  onSubmitPayrollEntry,
  onSubmitPayslip,
  onSubmitAdvanceDeduction,
  initialData,
  isEdit,
}: WorkforceFormsProps) {
  const [mode, setMode] = useState<
    | "worker"
    | "attendance"
    | "payroll"
    | "advance"
    | "attendancePolicy"
    | "payrollPolicy"
    | "payrollEntry"
    | "payslip"
    | "advanceDeduction"
  >(initialMode);
  const [workerForm, setWorkerForm] = useState(initialWorkerForm);
  const [attendanceForm, setAttendanceForm] = useState(initialAttendanceForm);
  const [payrollForm, setPayrollForm] = useState(initialPayrollForm);
  const [advanceForm, setAdvanceForm] = useState(initialAdvanceForm);
  const [attendancePolicyForm, setAttendancePolicyForm] = useState(
    initialAttendancePolicyForm,
  );
  const [payrollPolicyForm, setPayrollPolicyForm] = useState(
    initialPayrollPolicyForm,
  );
  const [payrollEntryForm, setPayrollEntryForm] = useState(
    initialPayrollEntryForm,
  );
  const [payslipForm, setPayslipForm] = useState(initialPayslipForm);
  const [advanceDeductionForm, setAdvanceDeductionForm] = useState(
    initialAdvanceDeductionForm,
  );

  const handleWorkerSubmit = async () => {
    if (onSubmitWorker) {
      await onSubmitWorker(workerForm);
    }
    onClose();
  };

  const handleAttendanceSubmit = async () => {
    if (onSubmitAttendance) {
      await onSubmitAttendance(attendanceForm);
    }
    onClose();
  };

  const handlePayrollSubmit = async () => {
    if (onSubmitPayroll) {
      await onSubmitPayroll(payrollForm);
    }
    onClose();
  };

  const handleAdvanceSubmit = async () => {
    if (onSubmitAdvance) {
      await onSubmitAdvance(advanceForm);
    }
    onClose();
  };

  const handleAttendancePolicySubmit = async () => {
    if (onSubmitAttendancePolicy) {
      await onSubmitAttendancePolicy(attendancePolicyForm);
    }
    onClose();
  };

  const handlePayrollPolicySubmit = async () => {
    if (onSubmitPayrollPolicy) {
      await onSubmitPayrollPolicy(payrollPolicyForm);
    }
    onClose();
  };

  const handlePayrollEntrySubmit = async () => {
    if (onSubmitPayrollEntry) {
      await onSubmitPayrollEntry(payrollEntryForm);
    }
    onClose();
  };

  const handlePayslipSubmit = async () => {
    if (onSubmitPayslip) {
      await onSubmitPayslip(payslipForm);
    }
    onClose();
  };

  const handleAdvanceDeductionSubmit = async () => {
    if (onSubmitAdvanceDeduction) {
      await onSubmitAdvanceDeduction(advanceDeductionForm);
    }
    onClose();
  };

  const formTitle = () => {
    switch (mode) {
      case "attendance":
        return "Log attendance";
      case "payroll":
        return "Create payroll run";
      case "advance":
        return "Request advance";
      case "attendancePolicy":
        return "Create attendance policy";
      case "payrollPolicy":
        return "Create payroll policy";
      case "payrollEntry":
        return "Create payroll entry";
      case "payslip":
        return "Create payslip";
      case "advanceDeduction":
        return "Create advance deduction";
      default:
        return "Add worker";
    }
  };

  const submitLabel = () => {
    switch (mode) {
      case "attendance":
        return "Save attendance";
      case "payroll":
        return "Save payroll";
      case "advance":
        return "Save advance";
      case "attendancePolicy":
        return "Save attendance policy";
      case "payrollPolicy":
        return "Save payroll policy";
      case "payrollEntry":
        return "Save payroll entry";
      case "payslip":
        return "Save payslip";
      case "advanceDeduction":
        return "Save deduction";
      default:
        return isEdit ? "Update worker" : "Save worker";
    }
  };

  // initialize form state when opening for edit
  useEffect(() => {
    if (!initialData) return;
    // ensure the current tab matches the incoming mode when editing
    setMode(initialMode);
    switch (initialMode) {
      case "payroll":
        setPayrollForm((prev) => ({ ...prev, ...(initialData || {}) }));
        break;
      case "payrollEntry":
        setPayrollEntryForm((prev) => ({ ...prev, ...(initialData || {}) }));
        break;
      case "advance":
        setAdvanceForm((prev) => ({ ...prev, ...(initialData || {}) }));
        break;
      case "attendance":
        setAttendanceForm((prev) => ({ ...prev, ...(initialData || {}) }));
        break;
      case "payslip":
        setPayslipForm((prev) => ({ ...prev, ...(initialData || {}) }));
        break;
      case "advanceDeduction":
        setAdvanceDeductionForm((prev) => ({
          ...prev,
          ...(initialData || {}),
        }));
        break;
      case "attendancePolicy":
        setAttendancePolicyForm((prev) => ({
          ...prev,
          ...(initialData || {}),
        }));
        break;
      case "payrollPolicy":
        setPayrollPolicyForm((prev) => ({ ...prev, ...(initialData || {}) }));
        break;
      case "worker":
        setWorkerForm((prev) => ({ ...prev, ...(initialData || {}) }));
        break;
      default:
        break;
    }
  }, [initialData, initialMode]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{formTitle()}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 rounded-full bg-slate-100 p-1">
          {[
            { id: "worker", label: "Worker" },
            { id: "attendance", label: "Attendance" },
            { id: "payroll", label: "Payroll" },
            { id: "advance", label: "Advance" },
            { id: "attendancePolicy", label: "Attendance Policy" },
            { id: "payrollPolicy", label: "Payroll Policy" },
            { id: "payrollEntry", label: "Payroll Entry" },
            { id: "payslip", label: "Payslip" },
            { id: "advanceDeduction", label: "Advance Deduction" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`rounded-full px-3 py-1.5 text-sm ${
                mode === tab.id
                  ? "bg-white text-slate-900 shadow"
                  : "text-slate-600"
              }`}
              onClick={() => setMode(tab.id as typeof mode)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {mode === "worker" ? (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={workerForm.fullName || ""}
                onChange={(event) =>
                  setWorkerForm((prev) => ({
                    ...prev,
                    fullName: event.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <select
                id="department"
                value={workerForm.department || "production"}
                onChange={(event) =>
                  setWorkerForm((prev) => ({
                    ...prev,
                    department: event.target
                      .value as WorkforceWorkerProfile["department"],
                  }))
                }
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="production">Production</option>
                <option value="warehouse">Warehouse</option>
                <option value="dispatch">Dispatch</option>
                <option value="admin">Admin</option>
                <option value="support">Support</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="employmentType">Employment type</Label>
              <select
                id="employmentType"
                value={workerForm.employmentType || "casual"}
                onChange={(event) =>
                  setWorkerForm((prev) => ({
                    ...prev,
                    employmentType: event.target
                      .value as WorkforceWorkerProfile["employmentType"],
                  }))
                }
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="permanent">Permanent</option>
                <option value="casual">Casual</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>
          </div>
        ) : mode === "attendance" ? (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="attendanceDate">Date</Label>
              <Input
                id="attendanceDate"
                type="date"
                value={attendanceForm.date || ""}
                onChange={(event) =>
                  setAttendanceForm((prev) => ({
                    ...prev,
                    date: event.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="attendanceStatus">Status</Label>
              <select
                id="attendanceStatus"
                value={attendanceForm.status || "present"}
                onChange={(event) =>
                  setAttendanceForm((prev) => ({
                    ...prev,
                    status: event.target
                      .value as WorkforceAttendanceRecordType["status"],
                  }))
                }
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="present">Present</option>
                <option value="halfDay">Half day</option>
                <option value="absent">Absent</option>
                <option value="leave">Leave</option>
                <option value="off">Off</option>
              </select>
            </div>
          </div>
        ) : mode === "payroll" ? (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="periodStart">Payroll period start</Label>
              <Input
                id="periodStart"
                type="date"
                value={payrollForm.periodStart || ""}
                onChange={(event) =>
                  setPayrollForm((prev) => ({
                    ...prev,
                    periodStart: event.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="periodEnd">Payroll period end</Label>
              <Input
                id="periodEnd"
                type="date"
                value={payrollForm.periodEnd || ""}
                onChange={(event) =>
                  setPayrollForm((prev) => ({
                    ...prev,
                    periodEnd: event.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="totalGross">Total gross</Label>
              <Input
                id="totalGross"
                type="number"
                value={payrollForm.totalGross ?? 0}
                onChange={(event) =>
                  setPayrollForm((prev) => ({
                    ...prev,
                    totalGross: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="totalDeductions">Total deductions</Label>
              <Input
                id="totalDeductions"
                type="number"
                value={payrollForm.totalDeductions ?? 0}
                onChange={(event) =>
                  setPayrollForm((prev) => ({
                    ...prev,
                    totalDeductions: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="totalNet">Total net</Label>
              <Input
                id="totalNet"
                type="number"
                value={payrollForm.totalNet ?? 0}
                onChange={(event) =>
                  setPayrollForm((prev) => ({
                    ...prev,
                    totalNet: Number(event.target.value),
                  }))
                }
              />
            </div>
          </div>
        ) : mode === "advance" ? (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="advanceWorker">Worker</Label>
              <select
                id="advanceWorker"
                value={advanceForm.workerId || ""}
                onChange={(event) =>
                  setAdvanceForm((prev) => ({
                    ...prev,
                    workerId: event.target.value,
                  }))
                }
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="">Select worker</option>
                {workers.map((worker) => (
                  <option
                    key={worker.id || worker._id}
                    value={worker.id || worker._id}
                  >
                    {worker.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="advanceAmount">Advance amount</Label>
              <Input
                id="advanceAmount"
                type="number"
                value={advanceForm.amount ?? 0}
                onChange={(event) =>
                  setAdvanceForm((prev) => ({
                    ...prev,
                    amount: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="advanceNote">Note</Label>
              <Input
                id="advanceNote"
                value={advanceForm.note || ""}
                onChange={(event) =>
                  setAdvanceForm((prev) => ({
                    ...prev,
                    note: event.target.value,
                  }))
                }
              />
            </div>
          </div>
        ) : mode === "attendancePolicy" ? (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="policyName">Policy name</Label>
              <Input
                id="policyName"
                value={attendancePolicyForm.name || ""}
                onChange={(event) =>
                  setAttendancePolicyForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="policyDepartment">Department</Label>
              <Input
                id="policyDepartment"
                value={attendancePolicyForm.department || ""}
                onChange={(event) =>
                  setAttendancePolicyForm((prev) => ({
                    ...prev,
                    department: event.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="policyWorkDays">Days of work</Label>
              <Input
                id="policyWorkDays"
                type="number"
                value={attendancePolicyForm.workSchedule?.daysOfWork ?? 5}
                onChange={(event) =>
                  setAttendancePolicyForm((prev) => ({
                    ...prev,
                    workSchedule: {
                      daysOfWork: Number(event.target.value),
                      workHours: prev.workSchedule?.workHours ?? 8,
                      workingDays: prev.workSchedule?.workingDays ?? [],
                    },
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="policyWorkHours">Work hours</Label>
              <Input
                id="policyWorkHours"
                type="number"
                value={attendancePolicyForm.workSchedule?.workHours ?? 8}
                onChange={(event) =>
                  setAttendancePolicyForm((prev) => ({
                    ...prev,
                    workSchedule: {
                      daysOfWork: prev.workSchedule?.daysOfWork ?? 5,
                      workHours: Number(event.target.value),
                      workingDays: prev.workSchedule?.workingDays ?? [],
                    },
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="policyPayPerDay">Pay per day</Label>
              <Input
                id="policyPayPerDay"
                type="number"
                value={attendancePolicyForm.pay?.payPerDay ?? 0}
                onChange={(event) =>
                  setAttendancePolicyForm((prev) => ({
                    ...prev,
                    pay: {
                      payPerDay: Number(event.target.value),
                      halfDayPay: prev.pay?.halfDayPay ?? 0,
                      overtimeEnabled: prev.pay?.overtimeEnabled ?? false,
                      overtimeRate: prev.pay?.overtimeRate ?? 0,
                    },
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="policyHalfDayPay">Half day pay</Label>
              <Input
                id="policyHalfDayPay"
                type="number"
                value={attendancePolicyForm.pay?.halfDayPay ?? 0}
                onChange={(event) =>
                  setAttendancePolicyForm((prev) => ({
                    ...prev,
                    pay: {
                      payPerDay: prev.pay?.payPerDay ?? 0,
                      halfDayPay: Number(event.target.value),
                      overtimeEnabled: prev.pay?.overtimeEnabled ?? false,
                      overtimeRate: prev.pay?.overtimeRate ?? 0,
                    },
                  }))
                }
              />
            </div>
          </div>
        ) : mode === "payrollPolicy" ? (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="payrollPolicyDepartment">Department</Label>
              <Input
                id="payrollPolicyDepartment"
                value={payrollPolicyForm.department || ""}
                onChange={(event) =>
                  setPayrollPolicyForm((prev) => ({
                    ...prev,
                    department: event.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payrollPolicyEmploymentType">
                Employment type
              </Label>
              <select
                id="payrollPolicyEmploymentType"
                value={payrollPolicyForm.employmentType || "casual"}
                onChange={(event) =>
                  setPayrollPolicyForm((prev) => ({
                    ...prev,
                    employmentType: event.target
                      .value as PayrollPolicy["employmentType"],
                  }))
                }
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="permanent">Permanent</option>
                <option value="casual">Casual</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payrollPolicyPayCycle">Pay cycle</Label>
              <select
                id="payrollPolicyPayCycle"
                value={payrollPolicyForm.payCycle || "monthly"}
                onChange={(event) =>
                  setPayrollPolicyForm((prev) => ({
                    ...prev,
                    payCycle: event.target.value as PayrollPolicy["payCycle"],
                  }))
                }
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Biweekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payrollPolicyBasicPayMode">Basic pay mode</Label>
              <select
                id="payrollPolicyBasicPayMode"
                value={payrollPolicyForm.basicPayMode || "salary"}
                onChange={(event) =>
                  setPayrollPolicyForm((prev) => ({
                    ...prev,
                    basicPayMode: event.target
                      .value as PayrollPolicy["basicPayMode"],
                  }))
                }
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="salary">Salary</option>
                <option value="daily">Daily</option>
                <option value="hourly">Hourly</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payrollPolicyBasicRate">Basic rate</Label>
              <Input
                id="payrollPolicyBasicRate"
                type="number"
                value={payrollPolicyForm.basicRate ?? 0}
                onChange={(event) =>
                  setPayrollPolicyForm((prev) => ({
                    ...prev,
                    basicRate: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payrollPolicyOvertimeRate">Overtime rate</Label>
              <Input
                id="payrollPolicyOvertimeRate"
                type="number"
                value={payrollPolicyForm.overtimeRate ?? 0}
                onChange={(event) =>
                  setPayrollPolicyForm((prev) => ({
                    ...prev,
                    overtimeRate: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payrollPolicyAllowanceRate">Allowance rate</Label>
              <Input
                id="payrollPolicyAllowanceRate"
                type="number"
                value={payrollPolicyForm.allowanceRate ?? 0}
                onChange={(event) =>
                  setPayrollPolicyForm((prev) => ({
                    ...prev,
                    allowanceRate: Number(event.target.value),
                  }))
                }
              />
            </div>
          </div>
        ) : mode === "payrollEntry" ? (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="entryRun">Payroll run</Label>
              <select
                id="entryRun"
                value={payrollEntryForm.runId || ""}
                onChange={(event) =>
                  setPayrollEntryForm((prev) => ({
                    ...prev,
                    runId: event.target.value,
                  }))
                }
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="">Select payroll run</option>
                {payrollRuns.map((run) => (
                  <option key={run.id || run._id} value={run.id || run._id}>
                    {run.periodStart} → {run.periodEnd}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="entryWorker">Worker</Label>
              <select
                id="entryWorker"
                value={payrollEntryForm.workerId || ""}
                onChange={(event) =>
                  setPayrollEntryForm((prev) => ({
                    ...prev,
                    workerId: event.target.value,
                  }))
                }
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="">Select worker</option>
                {workers.map((worker) => (
                  <option
                    key={worker.id || worker._id}
                    value={worker.id || worker._id}
                  >
                    {worker.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="entryBasePay">Base pay</Label>
              <Input
                id="entryBasePay"
                type="number"
                value={payrollEntryForm.basePay ?? 0}
                onChange={(event) =>
                  setPayrollEntryForm((prev) => ({
                    ...prev,
                    basePay: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="entryOvertimePay">Overtime pay</Label>
              <Input
                id="entryOvertimePay"
                type="number"
                value={payrollEntryForm.overtimePay ?? 0}
                onChange={(event) =>
                  setPayrollEntryForm((prev) => ({
                    ...prev,
                    overtimePay: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="entryAllowances">Allowances</Label>
              <Input
                id="entryAllowances"
                type="number"
                value={payrollEntryForm.allowances ?? 0}
                onChange={(event) =>
                  setPayrollEntryForm((prev) => ({
                    ...prev,
                    allowances: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="entryDeductions">Deductions</Label>
              <Input
                id="entryDeductions"
                type="number"
                value={payrollEntryForm.deductions ?? 0}
                onChange={(event) =>
                  setPayrollEntryForm((prev) => ({
                    ...prev,
                    deductions: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="entryAdvances">Advances</Label>
              <Input
                id="entryAdvances"
                type="number"
                value={payrollEntryForm.advances ?? 0}
                onChange={(event) =>
                  setPayrollEntryForm((prev) => ({
                    ...prev,
                    advances: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="entryNetPay">Net pay</Label>
              <Input
                id="entryNetPay"
                type="number"
                value={payrollEntryForm.netPay ?? 0}
                onChange={(event) =>
                  setPayrollEntryForm((prev) => ({
                    ...prev,
                    netPay: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="entryStatus">Status</Label>
              <select
                id="entryStatus"
                value={payrollEntryForm.status || "draft"}
                onChange={(event) =>
                  setPayrollEntryForm((prev) => ({
                    ...prev,
                    status: event.target.value as PayrollEntry["status"],
                  }))
                }
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="entryNotes">Notes</Label>
              <Input
                id="entryNotes"
                value={payrollEntryForm.notes || ""}
                onChange={(event) =>
                  setPayrollEntryForm((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }))
                }
              />
            </div>
          </div>
        ) : mode === "payslip" ? (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="payslipEntry">Payroll entry</Label>
              <select
                id="payslipEntry"
                value={payslipForm.entryId || ""}
                onChange={(event) =>
                  setPayslipForm((prev) => ({
                    ...prev,
                    entryId: event.target.value,
                  }))
                }
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="">Select payroll entry</option>
                {payrollEntries.map((entry) => (
                  <option
                    key={entry.id || entry._id}
                    value={entry.id || entry._id}
                  >
                    {entry.workerId} — {entry.status}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payslipPdfUrl">PDF URL</Label>
              <Input
                id="payslipPdfUrl"
                value={payslipForm.pdfUrl || ""}
                onChange={(event) =>
                  setPayslipForm((prev) => ({
                    ...prev,
                    pdfUrl: event.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payslipIssuedAt">Issued at</Label>
              <Input
                id="payslipIssuedAt"
                type="date"
                value={payslipForm.issuedAt || ""}
                onChange={(event) =>
                  setPayslipForm((prev) => ({
                    ...prev,
                    issuedAt: event.target.value,
                  }))
                }
              />
            </div>
          </div>
        ) : mode === "advanceDeduction" ? (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="deductionAdvance">Advance</Label>
              <select
                id="deductionAdvance"
                value={advanceDeductionForm.advanceId || ""}
                onChange={(event) =>
                  setAdvanceDeductionForm((prev) => ({
                    ...prev,
                    advanceId: event.target.value,
                  }))
                }
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="">Select advance</option>
                {advances.map((advance) => (
                  <option
                    key={advance.id || advance._id}
                    value={advance.id || advance._id}
                  >
                    {advance.workerId} — {advance.status}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deductionEntry">Payroll entry</Label>
              <select
                id="deductionEntry"
                value={advanceDeductionForm.entryId || ""}
                onChange={(event) =>
                  setAdvanceDeductionForm((prev) => ({
                    ...prev,
                    entryId: event.target.value,
                  }))
                }
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="">Select payroll entry</option>
                {payrollEntries.map((entry) => (
                  <option
                    key={entry.id || entry._id}
                    value={entry.id || entry._id}
                  >
                    {entry.workerId} — {entry.status}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deductionAmount">Amount deducted</Label>
              <Input
                id="deductionAmount"
                type="number"
                value={advanceDeductionForm.amountDeducted ?? 0}
                onChange={(event) =>
                  setAdvanceDeductionForm((prev) => ({
                    ...prev,
                    amountDeducted: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="remainingBalance">Remaining balance</Label>
              <Input
                id="remainingBalance"
                type="number"
                value={advanceDeductionForm.remainingBalanceAfterDeduction ?? 0}
                onChange={(event) =>
                  setAdvanceDeductionForm((prev) => ({
                    ...prev,
                    remainingBalanceAfterDeduction: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deductedAt">Deducted at</Label>
              <Input
                id="deductedAt"
                type="date"
                value={advanceDeductionForm.deductedAt || ""}
                onChange={(event) =>
                  setAdvanceDeductionForm((prev) => ({
                    ...prev,
                    deductedAt: event.target.value,
                  }))
                }
              />
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={
              mode === "worker"
                ? handleWorkerSubmit
                : mode === "attendance"
                  ? handleAttendanceSubmit
                  : mode === "payroll"
                    ? handlePayrollSubmit
                    : mode === "advance"
                      ? handleAdvanceSubmit
                      : mode === "attendancePolicy"
                        ? handleAttendancePolicySubmit
                        : mode === "payrollPolicy"
                          ? handlePayrollPolicySubmit
                          : mode === "payrollEntry"
                            ? handlePayrollEntrySubmit
                            : mode === "payslip"
                              ? handlePayslipSubmit
                              : handleAdvanceDeductionSubmit
            }
          >
            {submitLabel()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
