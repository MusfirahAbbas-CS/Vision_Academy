import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, CreditCard, Printer, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COURSE_MONTHLY_FEE } from '../data/mockData';
import type { FeeRecord, Payment, PaymentMethod } from '../types';
import toast from 'react-hot-toast';

const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Bank Transfer', 'JazzCash', 'EasyPaisa', 'Cheque', 'Other'];
const FEE_STATUS_COLORS: Record<string, string> = {
  PAID: 'badge-green', PARTIAL: 'badge-yellow', UNPAID: 'badge-red', WAIVED: 'badge-purple',
};

interface ReceiptData {
  receiptNo: string;
  studentName: string;
  admissionNo: string;
  course: string;
  month: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  academyName: string;
  balance: number;
  status: string;
}

export default function CollectFee() {
  const { state, dispatch, getCourse, getStudentFeeRecords, formatCurrency, nextReceiptNo } = useApp();
  const location = useLocation();
  const passedStudentId = (location.state as { studentId?: string } | null)?.studentId;

  const [search, setSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(passedStudentId || '');
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const student = selectedStudentId ? state.students.find(s => s.id === selectedStudentId) : null;
  const enrolledCourses = student?.courseIds.map(courseId => getCourse(courseId)?.name).filter(Boolean) || [];
  const monthOptions = [...new Set([
    ...state.feeRecords.map(record => record.month),
    ...Array.from({ length: 3 }, (_, offset) => {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() + offset);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }),
  ])].sort().reverse();

  const feeRecords = student ? getStudentFeeRecords(student.id) : [];
  const feeRecord = feeRecords.find(r => r.month === selectedMonth);
  const remaining = feeRecord ? feeRecord.remaining : (student?.monthlyFee || 0);

  const filteredStudents = state.students.filter(s => {
    if (!search) return false;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.admissionNo.toLowerCase().includes(q) || s.phone.includes(q);
  }).slice(0, 8);

  // Auto-select month with outstanding balance
  useEffect(() => {
    if (student) {
      const records = getStudentFeeRecords(student.id);
      const unpaid = records.find(r => r.status === 'UNPAID' || r.status === 'PARTIAL');
      if (unpaid) setSelectedMonth(unpaid.month);
    }
  }, [selectedStudentId]);

  const handleCollect = () => {
    if (!student) { toast.error('Select a student'); return; }
    const amt = Number(amount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    if (amt > remaining) { toast.error(`Amount exceeds remaining balance (Rs ${remaining.toLocaleString()})`); return; }

    const receiptNo = nextReceiptNo();
    const today = new Date().toISOString().split('T')[0];

    const payment: Payment = {
      id: `pay-${Date.now()}`,
      feeRecordId: feeRecord?.id || `fr-${student.id}-${selectedMonth}`,
      studentId: student.id,
      amount: amt,
      method,
      date: today,
      receiptNo,
    };

    // If no fee record exists for this month, create one first
    if (!feeRecord) {
      const newRecord: FeeRecord = {
        id: `fr-${student.id}-${selectedMonth}`,
        studentId: student.id,
        month: selectedMonth,
        payable: student.monthlyFee,
        paid: 0,
        remaining: student.monthlyFee,
        status: 'UNPAID',
        payments: [],
      };
      dispatch({ type: 'ADD_FEE_RECORD', payload: newRecord });
    }

    dispatch({ type: 'COLLECT_PAYMENT', payload: { feeRecordId: payment.feeRecordId, payment } });

    const receiptData: ReceiptData = {
      receiptNo,
      studentName: student.name,
      admissionNo: student.admissionNo,
      course: enrolledCourses.join(', '),
      month: selectedMonth,
      amount: amt,
      method,
      date: today,
      academyName: state.settings.academyName,
      balance: Math.max(0, remaining - amt),
      status: (remaining - amt) <= 0 ? 'PAID' : 'PARTIAL',
    };

    setReceipt(receiptData);
    setShowReceipt(true);
    setAmount('');
    toast.success(`Payment of Rs ${amt.toLocaleString()} recorded!`);
  };

  return (
    <div className="max-w-4xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Collect Fee</h1>
          <p className="page-subtitle">Record student fee payments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: Student Search + Fee Info */}
        <div className="lg:col-span-3 space-y-4">
          {/* Student Search */}
          <div className="card p-5">
            <label className="label">Search Student</label>
            <div className="search-bar mb-2">
              <Search size={15} className="search-icon" />
              <input
                id="collect-search"
                className="input"
                placeholder="Name, admission no, phone…"
                value={search}
                onChange={e => { setSearch(e.target.value); setSelectedStudentId(''); }}
              />
            </div>
            {search && filteredStudents.length > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                {filteredStudents.map(s => (
                  <button
                    key={s.id}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
                    onClick={() => { setSelectedStudentId(s.id); setSearch(''); }}
                    id={`select-student-${s.id}`}
                  >
                    <div className="font-medium text-slate-700 text-sm">{s.name}</div>
                    <div className="text-xs text-slate-400">{s.admissionNo} · {s.courseIds.map(courseId => getCourse(courseId)?.name).filter(Boolean).join(', ')}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Student Info + Fee Details */}
          {student && (
            <div className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-700">{student.name}</h3>
                  <p className="text-sm text-slate-500">{student.admissionNo} · {enrolledCourses.join(', ')}</p>
                </div>
                <span className={`badge ${student.status === 'Active' ? 'badge-green' : 'badge-yellow'}`}>{student.status}</span>
              </div>

              {/* Month Selector */}
              <div className="mb-4">
                <label className="label">Fee Month</label>
                <select className="input" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} id="fee-month-select">
                  {monthOptions.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Fee Breakdown */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly Fee ({student.courseIds.length} course(s) × {formatCurrency(COURSE_MONTHLY_FEE)})</span>
                  <span>{formatCurrency(student.monthlyFee)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-600">Payable Amount</span>
                  <span>{formatCurrency(feeRecord?.payable ?? student.monthlyFee)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Already Paid</span>
                  <span>{formatCurrency(feeRecord?.paid ?? 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-800 border-t border-slate-200 pt-2">
                  <span>Remaining Balance</span>
                  <span className={remaining > 0 ? 'text-red-600' : 'text-green-600'}>
                    {formatCurrency(remaining)}
                  </span>
                </div>
                {feeRecord && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>
                    <span className={`badge ${FEE_STATUS_COLORS[feeRecord.status]}`}>{feeRecord.status}</span>
                  </div>
                )}
              </div>

              {feeRecord?.status === 'PAID' && (
                <div className="mt-3 flex items-center gap-2 text-green-600 text-sm bg-green-50 rounded-lg px-3 py-2">
                  <CheckCircle size={15} />
                  <span>Fee fully paid for this month</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Payment Form */}
        <div className="lg:col-span-2">
          <div className="card p-5 sticky top-20">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <CreditCard size={16} className="text-blue-500" /> Record Payment
            </h3>

            {!student && (
              <div className="text-center py-8 text-slate-400">
                <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Search and select a student first</p>
              </div>
            )}

            {student && (
              <div className="space-y-4">
                <div>
                  <label className="label">Amount Received (Rs) *</label>
                  <input
                    id="payment-amount"
                    type="number"
                    className="input"
                    placeholder={`Max: ${remaining}`}
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    max={remaining}
                    min={1}
                    disabled={feeRecord?.status === 'PAID'}
                  />
                  {amount && Number(amount) > remaining && (
                    <p className="text-xs text-red-500 mt-1">
                      Exceeds remaining balance (Rs {remaining.toLocaleString()})
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS.map(m => (
                      <button
                        key={m}
                        type="button"
                        className={`text-xs py-2 px-3 rounded border transition-all ${
                          method === m
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                        }`}
                        onClick={() => setMethod(m)}
                        id={`method-${m.replace(/\s+/g, '-')}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  className="btn btn-primary w-full justify-center"
                  onClick={handleCollect}
                  disabled={!amount || Number(amount) <= 0 || Number(amount) > remaining || feeRecord?.status === 'PAID'}
                  id="collect-btn"
                >
                  <CreditCard size={16} /> Collect Payment
                </button>

                {feeRecord && feeRecord.payments.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Previous Payments</p>
                    <div className="space-y-1.5">
                      {feeRecord.payments.map(p => (
                        <div key={p.id} className="flex justify-between text-xs bg-slate-50 rounded px-3 py-2">
                          <span className="text-slate-600">{p.receiptNo} · {p.method}</span>
                          <span className="font-medium text-green-600">{formatCurrency(p.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && receipt && (
        <div className="modal-overlay" onClick={() => setShowReceipt(false)}>
          <div className="modal max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header no-print">
              <h2 className="text-base font-semibold">Payment Receipt</h2>
              <div className="flex gap-2">
                <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
                  <Printer size={14} /> Print
                </button>
                <button onClick={() => setShowReceipt(false)} className="p-1.5 rounded hover:bg-slate-100">✕</button>
              </div>
            </div>
            <div id="receipt-print" className="p-6">
              {/* Receipt Header */}
              <div className="text-center border-b border-dashed border-slate-300 pb-4 mb-4">
                <h2 className="font-bold text-slate-800 text-lg">{receipt.academyName}</h2>
                <p className="text-xs text-slate-500 mt-0.5">Fee Payment Receipt</p>
              </div>

              {/* Receipt Details */}
              <div className="space-y-2 text-sm mb-4">
                {[
                  ['Receipt No', receipt.receiptNo],
                  ['Date', receipt.date],
                  ['Student', receipt.studentName],
                  ['Admission No', receipt.admissionNo],
                  ['Course', receipt.course],
                  ['Fee Month', receipt.month],
                  ['Payment Method', receipt.method],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-medium text-slate-700">{val}</span>
                  </div>
                ))}
              </div>

              <div className="bg-blue-600 text-white rounded-lg p-3 text-center mb-4">
                <p className="text-xs opacity-80 mb-0.5">Amount Paid</p>
                <p className="text-2xl font-bold">Rs {receipt.amount.toLocaleString()}</p>
              </div>

              {receipt.balance > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center mb-4">
                  <p className="text-xs text-yellow-700">Remaining Balance</p>
                  <p className="text-base font-semibold text-yellow-800">Rs {receipt.balance.toLocaleString()}</p>
                </div>
              )}

              <div className="text-center">
                <span className={`badge ${FEE_STATUS_COLORS[receipt.status]} text-xs`}>
                  Status: {receipt.status}
                </span>
              </div>

              <p className="text-center text-xs text-slate-400 mt-4 border-t border-slate-100 pt-3">
                Thank you for your payment!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
