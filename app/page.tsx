'use client';

import { useState } from 'react';
import Image from 'next/image';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

// ─── Constants ───────────────────────────────────────────────────────────────

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

const STEPS = [
  { id: 1,  title: 'Hiring Information',   icon: '🪪' },
  { id: 2,  title: 'Personal Information', icon: '🏠' },
  { id: 3,  title: 'Employment History',   icon: '💼' },
  { id: 4,  title: 'Emergency Contact',    icon: '🚨' },
  { id: 5,  title: 'Education',            icon: '🎓' },
  { id: 6,  title: 'License Information',  icon: '📋' },
  { id: 7,  title: 'License Suspension',   icon: '⚠️' },
  { id: 8,  title: 'Driving History',      icon: '🚛' },
  { id: 9,  title: 'Accident History',     icon: '📝' },
  { id: 10, title: 'Traffic Violations',   icon: '🚦' },
  { id: 11, title: 'Additional Info',      icon: '✍️' },
  { id: 12, title: 'Medical Certificate',  icon: '🏥' },
  { id: 13, title: 'Criminal History',     icon: '⚖️' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmploymentEntry { address: string; city: string; zip: string; from: string; to: string; }
interface LicenseEntry    { state: string; number: string; expiration: string; }
interface DrivingEntry    { vehicleType: string; from: string; to: string; }
interface AccidentEntry   { date: string; description: string; injuries: string; }
interface ViolationEntry  { date: string; violation: string; }
interface CriminalEntry   { date: string; offense: string; location: string; vehicleType: string; }

interface AppData {
  // Step 1
  lastName: string; firstName: string; middleName: string;
  dob: string; experience: string; state: string;
  cdlNumber: string; cdlExpiration: string; phone: string;
  // Step 2
  ssn: string; email: string; address: string;
  city: string; personalState: string; zip: string;
  // Step 3
  employmentHistory: EmploymentEntry[];
  // Step 4
  ecName: string; ecRelation: string; ecPhone: string;
  // Step 5
  school: string; schoolCityState: string;
  // Step 6
  licenses: LicenseEntry[];
  // Step 7
  hasSuspension: string; suspensionExplanation: string;
  // Step 8
  drivingHistory: DrivingEntry[];
  // Step 9
  accidents: AccidentEntry[];
  // Step 10
  violations: ViolationEntry[];
  // Step 11
  signatureDate: string; idNumber: string;
  additionalDriverName: string; additionalDlNumber: string;
  // Step 12
  medDriverName: string; medIdNumber: string;
  medExpiration: string; nationalRegistry: string;
  // Step 13
  criminalHistory: CriminalEntry[];
}

const INITIAL: AppData = {
  lastName: '', firstName: '', middleName: '', dob: '', experience: '',
  state: '', cdlNumber: '', cdlExpiration: '', phone: '',
  ssn: '', email: '', address: '', city: '', personalState: '', zip: '',
  employmentHistory: [{ address: '', city: '', zip: '', from: '', to: '' }],
  ecName: '', ecRelation: '', ecPhone: '',
  school: '', schoolCityState: '',
  licenses: [{ state: '', number: '', expiration: '' }],
  hasSuspension: 'no', suspensionExplanation: '',
  drivingHistory: [{ vehicleType: '', from: '', to: '' }],
  accidents: [{ date: '', description: '', injuries: '' }],
  violations: [{ date: '', violation: '' }],
  signatureDate: '', idNumber: '', additionalDriverName: '', additionalDlNumber: '',
  medDriverName: '', medIdNumber: '', medExpiration: '', nationalRegistry: '',
  criminalHistory: [{ date: '', offense: '', location: '', vehicleType: '' }],
};

// ─── Reusable field components ────────────────────────────────────────────────

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-[#021a2a] mb-1">
      {text}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

function Input({ label, required, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; required?: boolean }) {
  return (
    <div>
      {label && <Label text={label} required={required} />}
      <input
        {...props}
        required={required}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#E87722] focus:ring-2 focus:ring-[#E87722]/20 transition-all"
      />
    </div>
  );
}

function Select({ label, required, options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; required?: boolean; options: string[] }) {
  return (
    <div>
      {label && <Label text={label} required={required} />}
      <select
        {...props}
        required={required}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#E87722] focus:ring-2 focus:ring-[#E87722]/20 bg-white transition-all"
      >
        <option value="">Select state...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function PhoneField({ label, required, value, onChange }: { label?: string; required?: boolean; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      {label && <Label text={label} required={required} />}
      <div className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus-within:border-[#E87722] focus-within:ring-2 focus-within:ring-[#E87722]/20 transition-all bg-white">
        <PhoneInput
          defaultCountry="US"
          value={value}
          onChange={(v) => onChange(v ?? '')}
        />
      </div>
    </div>
  );
}

function Textarea({ label, required, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; required?: boolean }) {
  return (
    <div>
      {label && <Label text={label} required={required} />}
      <textarea
        {...props}
        required={required}
        rows={3}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#E87722] focus:ring-2 focus:ring-[#E87722]/20 transition-all resize-none"
      />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-bold text-[#021a2a] border-l-4 border-[#E87722] pl-3 mb-4 mt-6 first:mt-0">
      {children}
    </h3>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick}
      className="mt-3 flex items-center gap-2 text-sm text-[#E87722] font-semibold hover:text-[#c5641a] transition-colors">
      <span className="text-lg leading-none">+</span> {label}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors text-lg leading-none font-bold">
      ×
    </button>
  );
}

function DynamicCard({ children, onRemove, showRemove }: { children: React.ReactNode; onRemove: () => void; showRemove: boolean }) {
  return (
    <div className="relative bg-gray-50 rounded-xl border border-gray-200 p-4 mb-3">
      {showRemove && <RemoveButton onClick={onRemove} />}
      {children}
    </div>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function Step1({ d, u }: { d: AppData; u: (f: keyof AppData, v: AppData[keyof AppData]) => void }) {
  return (
    <>
      <SectionTitle>Driver Details</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Last Name" required value={d.lastName} onChange={e => u('lastName', e.target.value)} />
        <Input label="First Name" required value={d.firstName} onChange={e => u('firstName', e.target.value)} />
        <Input label="Middle Name" value={d.middleName} onChange={e => u('middleName', e.target.value)} />
        <Input label="Date of Birth" required type="date" value={d.dob} onChange={e => u('dob', e.target.value)} />
        <Input label="Years of Experience" required type="number" min="0" value={d.experience} onChange={e => u('experience', e.target.value)} />
        <Select label="Home State" required options={US_STATES} value={d.state} onChange={e => u('state', e.target.value)} />
      </div>
      <SectionTitle>CDL License</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="CDL Driver's License #" required value={d.cdlNumber} onChange={e => u('cdlNumber', e.target.value)} />
        <Input label="Expiration Date" required type="date" value={d.cdlExpiration} onChange={e => u('cdlExpiration', e.target.value)} />
        <div className="sm:col-span-2">
          <PhoneField label="Phone Number" required value={d.phone} onChange={v => u('phone', v)} />
        </div>
      </div>
    </>
  );
}

function Step2({ d, u }: { d: AppData; u: (f: keyof AppData, v: AppData[keyof AppData]) => void }) {
  return (
    <>
      <SectionTitle>Identification</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Social Security Number" required placeholder="XXX-XX-XXXX" value={d.ssn} onChange={e => u('ssn', e.target.value)} />
        <Input label="Email Address" required type="email" value={d.email} onChange={e => u('email', e.target.value)} />
      </div>
      <SectionTitle>Current Address</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Input label="Street Address" required value={d.address} onChange={e => u('address', e.target.value)} />
        </div>
        <Input label="City" required value={d.city} onChange={e => u('city', e.target.value)} />
        <Select label="State" required options={US_STATES} value={d.personalState} onChange={e => u('personalState', e.target.value)} />
        <Input label="Zip Code" required value={d.zip} onChange={e => u('zip', e.target.value)} />
      </div>
    </>
  );
}

function Step3({ d, u }: { d: AppData; u: (f: keyof AppData, v: AppData[keyof AppData]) => void }) {
  const list = d.employmentHistory;
  const set = (i: number, f: keyof EmploymentEntry, v: string) => {
    const next = list.map((e, idx) => idx === i ? { ...e, [f]: v } : e);
    u('employmentHistory', next);
  };
  const add = () => u('employmentHistory', [...list, { address: '', city: '', zip: '', from: '', to: '' }]);
  const remove = (i: number) => u('employmentHistory', list.filter((_, idx) => idx !== i));
  return (
    <>
      <SectionTitle>Employment History</SectionTitle>
      {list.map((e, i) => (
        <DynamicCard key={i} onRemove={() => remove(i)} showRemove={list.length > 1}>
          <p className="text-xs font-bold text-gray-500 mb-3">Entry {i + 1}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Input label="Address" value={e.address} onChange={ev => set(i, 'address', ev.target.value)} />
            </div>
            <Input label="City" value={e.city} onChange={ev => set(i, 'city', ev.target.value)} />
            <Input label="Zip Code" value={e.zip} onChange={ev => set(i, 'zip', ev.target.value)} />
            <Input label="From" type="date" value={e.from} onChange={ev => set(i, 'from', ev.target.value)} />
            <Input label="To" type="date" value={e.to} onChange={ev => set(i, 'to', ev.target.value)} />
          </div>
        </DynamicCard>
      ))}
      <AddButton onClick={add} label="Add Another Employment" />
    </>
  );
}

function Step4({ d, u }: { d: AppData; u: (f: keyof AppData, v: AppData[keyof AppData]) => void }) {
  return (
    <>
      <SectionTitle>Emergency Contact</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Full Name" required value={d.ecName} onChange={e => u('ecName', e.target.value)} />
        <Input label="Relationship" required value={d.ecRelation} onChange={e => u('ecRelation', e.target.value)} />
        <div className="sm:col-span-2">
          <PhoneField label="Phone Number" required value={d.ecPhone} onChange={v => u('ecPhone', v)} />
        </div>
      </div>
    </>
  );
}

function Step5({ d, u }: { d: AppData; u: (f: keyof AppData, v: AppData[keyof AppData]) => void }) {
  return (
    <>
      <SectionTitle>Education</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Last School Attended" required value={d.school} onChange={e => u('school', e.target.value)} />
        <Input label="City, State" required value={d.schoolCityState} onChange={e => u('schoolCityState', e.target.value)} />
      </div>
    </>
  );
}

function Step6({ d, u }: { d: AppData; u: (f: keyof AppData, v: AppData[keyof AppData]) => void }) {
  const list = d.licenses;
  const set = (i: number, f: keyof LicenseEntry, v: string) => {
    const next = list.map((e, idx) => idx === i ? { ...e, [f]: v } : e);
    u('licenses', next);
  };
  const add = () => u('licenses', [...list, { state: '', number: '', expiration: '' }]);
  const remove = (i: number) => u('licenses', list.filter((_, idx) => idx !== i));
  return (
    <>
      <SectionTitle>License Information</SectionTitle>
      {list.map((e, i) => (
        <DynamicCard key={i} onRemove={() => remove(i)} showRemove={list.length > 1}>
          <p className="text-xs font-bold text-gray-500 mb-3">License {i + 1}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select label="State" options={US_STATES} value={e.state} onChange={ev => set(i, 'state', ev.target.value)} />
            <Input label="License Number" value={e.number} onChange={ev => set(i, 'number', ev.target.value)} />
            <Input label="Expiration Date" type="date" value={e.expiration} onChange={ev => set(i, 'expiration', ev.target.value)} />
          </div>
        </DynamicCard>
      ))}
      <AddButton onClick={add} label="Add Another License" />
    </>
  );
}

function Step7({ d, u }: { d: AppData; u: (f: keyof AppData, v: AppData[keyof AppData]) => void }) {
  return (
    <>
      <SectionTitle>License Suspension History</SectionTitle>
      <div className="mb-4">
        <Label text="Has your license ever been suspended or revoked?" required />
        <div className="flex gap-6 mt-2">
          {['yes', 'no'].map(val => (
            <label key={val} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="suspension" value={val}
                checked={d.hasSuspension === val}
                onChange={() => u('hasSuspension', val)}
                className="w-4 h-4 accent-[#E87722]" />
              <span className="text-sm font-medium capitalize">{val}</span>
            </label>
          ))}
        </div>
      </div>
      {d.hasSuspension === 'yes' && (
        <Textarea label="Please explain the circumstances" required
          value={d.suspensionExplanation}
          onChange={e => u('suspensionExplanation', e.target.value)} />
      )}
    </>
  );
}

function Step8({ d, u }: { d: AppData; u: (f: keyof AppData, v: AppData[keyof AppData]) => void }) {
  const list = d.drivingHistory;
  const set = (i: number, f: keyof DrivingEntry, v: string) => {
    u('drivingHistory', list.map((e, idx) => idx === i ? { ...e, [f]: v } : e));
  };
  const add = () => u('drivingHistory', [...list, { vehicleType: '', from: '', to: '' }]);
  const remove = (i: number) => u('drivingHistory', list.filter((_, idx) => idx !== i));
  return (
    <>
      <SectionTitle>Driving History</SectionTitle>
      {list.map((e, i) => (
        <DynamicCard key={i} onRemove={() => remove(i)} showRemove={list.length > 1}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="Type of Vehicle" value={e.vehicleType} onChange={ev => set(i, 'vehicleType', ev.target.value)} />
            <Input label="From" type="date" value={e.from} onChange={ev => set(i, 'from', ev.target.value)} />
            <Input label="To" type="date" value={e.to} onChange={ev => set(i, 'to', ev.target.value)} />
          </div>
        </DynamicCard>
      ))}
      <AddButton onClick={add} label="Add Another Vehicle" />
    </>
  );
}

function Step9({ d, u }: { d: AppData; u: (f: keyof AppData, v: AppData[keyof AppData]) => void }) {
  const list = d.accidents;
  const set = (i: number, f: keyof AccidentEntry, v: string) => {
    u('accidents', list.map((e, idx) => idx === i ? { ...e, [f]: v } : e));
  };
  const add = () => u('accidents', [...list, { date: '', description: '', injuries: '' }]);
  const remove = (i: number) => u('accidents', list.filter((_, idx) => idx !== i));
  return (
    <>
      <SectionTitle>Accident History</SectionTitle>
      <p className="text-sm text-gray-500 mb-4">List all accidents in the past 3 years. If none, leave the first entry blank.</p>
      {list.map((e, i) => (
        <DynamicCard key={i} onRemove={() => remove(i)} showRemove={list.length > 1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Date" type="date" value={e.date} onChange={ev => set(i, 'date', ev.target.value)} />
            <Input label="Injuries" value={e.injuries} onChange={ev => set(i, 'injuries', ev.target.value)} />
            <div className="sm:col-span-2">
              <Input label="Description" value={e.description} onChange={ev => set(i, 'description', ev.target.value)} />
            </div>
          </div>
        </DynamicCard>
      ))}
      <AddButton onClick={add} label="Add Another Accident" />
    </>
  );
}

function Step10({ d, u }: { d: AppData; u: (f: keyof AppData, v: AppData[keyof AppData]) => void }) {
  const list = d.violations;
  const set = (i: number, f: keyof ViolationEntry, v: string) => {
    u('violations', list.map((e, idx) => idx === i ? { ...e, [f]: v } : e));
  };
  const add = () => u('violations', [...list, { date: '', violation: '' }]);
  const remove = (i: number) => u('violations', list.filter((_, idx) => idx !== i));
  return (
    <>
      <SectionTitle>Traffic Violations</SectionTitle>
      <p className="text-sm text-gray-500 mb-4">List all traffic violations in the past 3 years. If none, leave blank.</p>
      {list.map((e, i) => (
        <DynamicCard key={i} onRemove={() => remove(i)} showRemove={list.length > 1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Date" type="date" value={e.date} onChange={ev => set(i, 'date', ev.target.value)} />
            <Input label="Violation" value={e.violation} onChange={ev => set(i, 'violation', ev.target.value)} />
          </div>
        </DynamicCard>
      ))}
      <AddButton onClick={add} label="Add Another Violation" />
    </>
  );
}

function Step11({ d, u }: { d: AppData; u: (f: keyof AppData, v: AppData[keyof AppData]) => void }) {
  return (
    <>
      <SectionTitle>Additional Information</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Signature Date" required type="date" value={d.signatureDate} onChange={e => u('signatureDate', e.target.value)} />
        <Input label="ID Number" required value={d.idNumber} onChange={e => u('idNumber', e.target.value)} />
        <Input label="Driver's Name" required value={d.additionalDriverName} onChange={e => u('additionalDriverName', e.target.value)} />
        <Input label="Driver's License Number" required value={d.additionalDlNumber} onChange={e => u('additionalDlNumber', e.target.value)} />
      </div>
    </>
  );
}

function Step12({ d, u }: { d: AppData; u: (f: keyof AppData, v: AppData[keyof AppData]) => void }) {
  return (
    <>
      <SectionTitle>Medical Certificate (FMCSA)</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Driver's Name" required value={d.medDriverName} onChange={e => u('medDriverName', e.target.value)} />
        <Input label="Driver's ID Number" required value={d.medIdNumber} onChange={e => u('medIdNumber', e.target.value)} />
        <Input label="Expiration Date of Medical Certificate" required type="date" value={d.medExpiration} onChange={e => u('medExpiration', e.target.value)} />
        <Input label="National Registry Number (10 digits)" required maxLength={10} value={d.nationalRegistry} onChange={e => u('nationalRegistry', e.target.value.replace(/\D/g, '').slice(0, 10))} />
      </div>
    </>
  );
}

function Step13({ d, u }: { d: AppData; u: (f: keyof AppData, v: AppData[keyof AppData]) => void }) {
  const list = d.criminalHistory;
  const set = (i: number, f: keyof CriminalEntry, v: string) => {
    u('criminalHistory', list.map((e, idx) => idx === i ? { ...e, [f]: v } : e));
  };
  const add = () => u('criminalHistory', [...list, { date: '', offense: '', location: '', vehicleType: '' }]);
  const remove = (i: number) => u('criminalHistory', list.filter((_, idx) => idx !== i));
  return (
    <>
      <SectionTitle>Criminal Conviction History</SectionTitle>
      <p className="text-sm text-gray-500 mb-4">List any criminal convictions. If none, leave blank.</p>
      {list.map((e, i) => (
        <DynamicCard key={i} onRemove={() => remove(i)} showRemove={list.length > 1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Date of Conviction" type="date" value={e.date} onChange={ev => set(i, 'date', ev.target.value)} />
            <Input label="Type of Vehicle" value={e.vehicleType} onChange={ev => set(i, 'vehicleType', ev.target.value)} />
            <Input label="Offense" value={e.offense} onChange={ev => set(i, 'offense', ev.target.value)} />
            <Input label="Location" value={e.location} onChange={ev => set(i, 'location', ev.target.value)} />
          </div>
        </DynamicCard>
      ))}
      <AddButton onClick={add} label="Add Another Conviction" />
    </>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round(((current - 1) / (total - 1)) * 100);
  return (
    <div className="px-4 py-3 bg-white border-b border-gray-200">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-[#021a2a]">
            Step {current} of {total} — {STEPS[current - 1].title}
          </span>
          <span className="text-xs text-gray-500">{pct}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: '#E87722' }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────

function SuccessScreen({ name }: { name: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#021a2a] px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-[#021a2a] mb-2">Application Submitted!</h2>
        <p className="text-gray-600 mb-6">
          Thank you, <strong>{name}</strong>. Your application has been received by kBola LLC.
          Our HR team will review it and contact you soon.
        </p>
        <Image src="/logo.png" alt="kBola LLC" width={160} height={40} className="mx-auto object-contain" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<AppData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const TOTAL = STEPS.length;

  function update(field: keyof AppData, value: AppData[keyof AppData]) {
    setData(prev => ({ ...prev, [field]: value }));
  }

  function validateStep(): string | null {
    if (step === 1) {
      if (!data.lastName.trim()) return 'Last name is required.';
      if (!data.firstName.trim()) return 'First name is required.';
      if (!data.dob) return 'Date of birth is required.';
      const age = (Date.now() - new Date(data.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 21) return 'Driver must be at least 21 years old.';
      if (!data.experience) return 'Years of experience is required.';
      if (!data.state) return 'State is required.';
      if (!data.cdlNumber.trim()) return 'CDL number is required.';
      if (!data.cdlExpiration) return 'CDL expiration date is required.';
      if (new Date(data.cdlExpiration) <= new Date()) return 'CDL expiration date must be in the future.';
      if (!data.phone) return 'Phone number is required.';
    }
    if (step === 2) {
      if (!data.ssn.trim()) return 'SSN is required.';
      if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'Valid email is required.';
      if (!data.address.trim()) return 'Address is required.';
      if (!data.city.trim()) return 'City is required.';
      if (!data.personalState) return 'State is required.';
      if (!data.zip.trim()) return 'Zip code is required.';
    }
    if (step === 4) {
      if (!data.ecName.trim()) return 'Emergency contact name is required.';
      if (!data.ecRelation.trim()) return 'Relationship is required.';
      if (!data.ecPhone) return 'Emergency contact phone is required.';
    }
    if (step === 5) {
      if (!data.school.trim()) return 'School name is required.';
      if (!data.schoolCityState.trim()) return 'City, State is required.';
    }
    if (step === 7) {
      if (data.hasSuspension === 'yes' && !data.suspensionExplanation.trim()) return 'Please explain the suspension.';
    }
    if (step === 11) {
      if (!data.signatureDate) return 'Signature date is required.';
      if (!data.idNumber.trim()) return 'ID number is required.';
      if (!data.additionalDriverName.trim()) return "Driver's name is required.";
      if (!data.additionalDlNumber.trim()) return "Driver's license number is required.";
    }
    if (step === 12) {
      if (!data.medDriverName.trim()) return "Driver's name is required.";
      if (!data.medIdNumber.trim()) return 'ID number is required.';
      if (!data.medExpiration) return 'Medical certificate expiration is required.';
      if (new Date(data.medExpiration) <= new Date()) return 'Medical certificate must not be expired.';
      if (data.nationalRegistry.length !== 10) return 'National Registry Number must be exactly 10 digits.';
    }
    return null;
  }

  const [stepError, setStepError] = useState('');

  function handleNext() {
    const err = validateStep();
    if (err) { setStepError(err); return; }
    setStepError('');
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBack() {
    setStepError('');
    setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit() {
    const err = validateStep();
    if (err) { setStepError(err); return; }
    setStepError('');
    setLoading(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const body = await res.json().catch(() => ({}));
        setSubmitError(body.error || 'Submission failed. Please try again.');
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) return <SuccessScreen name={data.firstName} />;

  return (
    <div className="min-h-screen flex flex-col bg-[#f1f5f9]">
      {/* ── Header ── */}
      <header className="relative bg-[#021a2a] text-white overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/1.png" alt="" fill className="object-cover opacity-20" />
        </div>
        <div className="relative max-w-2xl mx-auto px-4 py-6 flex items-center justify-between">
          <Image src="/logo.png" alt="kBola LLC" width={140} height={36} className="object-contain" />
          <div className="text-right">
            <p className="text-xs text-gray-300 uppercase tracking-widest">CDL Class A</p>
            <p className="text-sm font-semibold text-[#E87722]">Driver Application</p>
          </div>
        </div>
        <div className="relative max-w-2xl mx-auto px-4 pb-6">
          <h1 className="text-2xl font-bold">Join the kBola Team</h1>
          <p className="text-gray-300 text-sm mt-1">Fill out this application to apply for a CDL Class A driving position in Texas.</p>
        </div>
      </header>

      {/* ── Progress ── */}
      <ProgressBar current={step} total={TOTAL} />

      {/* ── Form card ── */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">{STEPS[step - 1].icon}</span>
            <div>
              <h2 className="text-lg font-bold text-[#021a2a]">{STEPS[step - 1].title}</h2>
              <p className="text-xs text-gray-500">Section {step} of {TOTAL}</p>
            </div>
          </div>

          {step === 1  && <Step1  d={data} u={update} />}
          {step === 2  && <Step2  d={data} u={update} />}
          {step === 3  && <Step3  d={data} u={update} />}
          {step === 4  && <Step4  d={data} u={update} />}
          {step === 5  && <Step5  d={data} u={update} />}
          {step === 6  && <Step6  d={data} u={update} />}
          {step === 7  && <Step7  d={data} u={update} />}
          {step === 8  && <Step8  d={data} u={update} />}
          {step === 9  && <Step9  d={data} u={update} />}
          {step === 10 && <Step10 d={data} u={update} />}
          {step === 11 && <Step11 d={data} u={update} />}
          {step === 12 && <Step12 d={data} u={update} />}
          {step === 13 && <Step13 d={data} u={update} />}

          {/* Errors */}
          {stepError && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              ⚠️ {stepError}
            </div>
          )}
          {submitError && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              ⚠️ {submitError}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ← Back
            </button>

            {step < TOTAL ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-lg bg-[#E87722] text-white text-sm font-semibold hover:bg-[#c5641a] transition-all shadow-sm"
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-[#021a2a] text-white text-sm font-semibold hover:bg-[#03294a] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  '✓ Submit Application'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Your information is kept confidential and used solely for hiring purposes.
        </p>
      </main>
    </div>
  );
}
