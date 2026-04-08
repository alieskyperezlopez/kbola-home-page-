import { google } from 'googleapis';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Types (mirror client) ─────────────────────────────────────────────────────

interface EmploymentEntry { address: string; city: string; zip: string; from: string; to: string; }
interface LicenseEntry    { state: string; number: string; expiration: string; }
interface DrivingEntry    { vehicleType: string; from: string; to: string; }
interface AccidentEntry   { date: string; description: string; injuries: string; }
interface ViolationEntry  { date: string; violation: string; }
interface CriminalEntry   { date: string; offense: string; location: string; vehicleType: string; }

interface AppData {
  lastName: string; firstName: string; middleName: string;
  dob: string; experience: string; state: string;
  cdlNumber: string; cdlExpiration: string; phone: string;
  ssn: string; email: string; address: string;
  city: string; personalState: string; zip: string;
  employmentHistory: EmploymentEntry[];
  ecName: string; ecRelation: string; ecPhone: string;
  school: string; schoolCityState: string;
  licenses: LicenseEntry[];
  hasSuspension: string; suspensionExplanation: string;
  drivingHistory: DrivingEntry[];
  accidents: AccidentEntry[];
  violations: ViolationEntry[];
  signatureDate: string; idNumber: string;
  additionalDriverName: string; additionalDlNumber: string;
  medDriverName: string; medIdNumber: string;
  medExpiration: string; nationalRegistry: string;
  criminalHistory: CriminalEntry[];
}

// ─── Google Sheets ─────────────────────────────────────────────────────────────

async function writeToSheets(data: AppData) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const row = [
    new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }),
    data.lastName,
    data.firstName,
    data.middleName,
    data.dob,
    data.experience,
    data.state,
    data.cdlNumber,
    data.cdlExpiration,
    data.phone,
    data.ssn,
    data.email,
    data.address,
    data.city,
    data.personalState,
    data.zip,
    // Employment history as JSON
    JSON.stringify(data.employmentHistory),
    data.ecName,
    data.ecRelation,
    data.ecPhone,
    data.school,
    data.schoolCityState,
    JSON.stringify(data.licenses),
    data.hasSuspension,
    data.suspensionExplanation,
    JSON.stringify(data.drivingHistory),
    JSON.stringify(data.accidents),
    JSON.stringify(data.violations),
    data.signatureDate,
    data.idNumber,
    data.additionalDriverName,
    data.additionalDlNumber,
    data.medDriverName,
    data.medIdNumber,
    data.medExpiration,
    data.nationalRegistry,
    JSON.stringify(data.criminalHistory),
  ];

  // Insert at row 2 so newest entry is always first (below header)
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Sheet1!A2',
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });
}

// ─── Email HTML ────────────────────────────────────────────────────────────────

function buildEmailHtml(d: AppData): string {
  const section = (title: string, rows: [string, string][]) => `
    <h3 style="background:#021a2a;color:#fff;padding:8px 12px;margin:24px 0 0;border-radius:4px 4px 0 0;font-size:13px;text-transform:uppercase;letter-spacing:1px">${title}</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:4px">
      ${rows.map(([label, val]) => `
        <tr>
          <td style="padding:7px 12px;font-weight:600;background:#f8fafc;border:1px solid #e2e8f0;width:40%;font-size:13px;color:#475569">${label}</td>
          <td style="padding:7px 12px;border:1px solid #e2e8f0;font-size:13px;color:#021a2a">${val || '—'}</td>
        </tr>`).join('')}
    </table>`;

  const listSection = (title: string, items: Record<string, string>[]) => `
    <h3 style="background:#021a2a;color:#fff;padding:8px 12px;margin:24px 0 0;border-radius:4px 4px 0 0;font-size:13px;text-transform:uppercase;letter-spacing:1px">${title}</h3>
    ${items.map((item, i) => `
      <p style="padding:6px 12px;margin:0;background:#f1f5f9;border-left:3px solid #E87722;font-weight:600;font-size:12px;color:#64748b">Entry ${i + 1}</p>
      <table style="width:100%;border-collapse:collapse">
        ${Object.entries(item).map(([k, v]) => `
          <tr>
            <td style="padding:6px 12px;font-weight:600;background:#f8fafc;border:1px solid #e2e8f0;width:40%;font-size:12px;color:#475569">${k.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase())}</td>
            <td style="padding:6px 12px;border:1px solid #e2e8f0;font-size:12px;color:#021a2a">${v || '—'}</td>
          </tr>`).join('')}
      </table>`).join('')}`;

  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;background:#fff">
    <div style="background:#021a2a;padding:24px 32px;text-align:center">
      <h1 style="color:#E87722;margin:0;font-size:22px;letter-spacing:2px">KBOLA LLC</h1>
      <p style="color:#94a3b8;margin:4px 0 0;font-size:13px">New Driver Application Received</p>
    </div>
    <div style="padding:24px 32px">
      <p style="background:#fef3c7;border-left:4px solid #E87722;padding:10px 14px;color:#92400e;font-size:13px;margin-bottom:24px">
        📧 New application from <strong>${d.firstName} ${d.lastName}</strong> — received ${new Date().toLocaleString('en-US',{timeZone:'America/Chicago'})} (CT)
      </p>
      ${section('1. Hiring Information', [
        ['Last Name', d.lastName], ['First Name', d.firstName], ['Middle Name', d.middleName],
        ['Date of Birth', d.dob], ['Years of Experience', d.experience], ['State', d.state],
        ['CDL License #', d.cdlNumber], ['CDL Expiration', d.cdlExpiration], ['Phone', d.phone],
      ])}
      ${section('2. Personal Information', [
        ['SSN', d.ssn], ['Email', d.email], ['Address', d.address],
        ['City', d.city], ['State', d.personalState], ['Zip Code', d.zip],
      ])}
      ${listSection('3. Employment History', d.employmentHistory.map(e => ({
        Address: e.address, City: e.city, Zip: e.zip, From: e.from, To: e.to,
      })))}
      ${section('4. Emergency Contact', [
        ['Name', d.ecName], ['Relationship', d.ecRelation], ['Phone', d.ecPhone],
      ])}
      ${section('5. Education', [
        ['School', d.school], ['City, State', d.schoolCityState],
      ])}
      ${listSection('6. License Information', d.licenses.map(l => ({
        State: l.state, Number: l.number, Expiration: l.expiration,
      })))}
      ${section('7. License Suspension', [
        ['Has Suspension?', d.hasSuspension.toUpperCase()],
        ['Explanation', d.suspensionExplanation],
      ])}
      ${listSection('8. Driving History', d.drivingHistory.map(h => ({
        VehicleType: h.vehicleType, From: h.from, To: h.to,
      })))}
      ${listSection('9. Accident History', d.accidents.map(a => ({
        Date: a.date, Description: a.description, Injuries: a.injuries,
      })))}
      ${listSection('10. Traffic Violations', d.violations.map(v => ({
        Date: v.date, Violation: v.violation,
      })))}
      ${section('11. Additional Information', [
        ['Signature Date', d.signatureDate], ['ID Number', d.idNumber],
        ["Driver's Name", d.additionalDriverName], ["Driver's License #", d.additionalDlNumber],
      ])}
      ${section('12. Medical Certificate', [
        ["Driver's Name", d.medDriverName], ['ID Number', d.medIdNumber],
        ['Medical Cert. Expiration', d.medExpiration], ['National Registry #', d.nationalRegistry],
      ])}
      ${listSection('13. Criminal History', d.criminalHistory.map(c => ({
        Date: c.date, Offense: c.offense, Location: c.location, VehicleType: c.vehicleType,
      })))}
    </div>
    <div style="background:#021a2a;padding:16px 32px;text-align:center">
      <p style="color:#64748b;font-size:11px;margin:0">kBola LLC — CDL Class A Driver Applications</p>
    </div>
  </body>
  </html>`;
}

// ─── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  let data: AppData;
  try {
    data = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const [sheetsResult, emailResult] = await Promise.allSettled([
    writeToSheets(data),
    resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'applications@kbola.us',
      to: 'kbolallc@gmail.com',
      replyTo: data.email || undefined,
      subject: `New Driver Application – ${data.firstName} ${data.lastName} – ${new Date().toLocaleDateString('en-US')}`,
      html: buildEmailHtml(data),
    }),
  ]);

  const errors: string[] = [];
  if (sheetsResult.status === 'rejected') {
    console.error('Sheets error:', sheetsResult.reason);
    errors.push('Failed to save to Google Sheets.');
  }
  if (emailResult.status === 'rejected') {
    console.error('Email error:', emailResult.reason);
    errors.push('Failed to send notification email.');
  }

  if (errors.length > 0) {
    return Response.json({ error: errors.join(' ') }, { status: 500 });
  }

  return Response.json({ success: true });
}
