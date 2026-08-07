const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const { computeRiskScore, generateExplanation } = require('./engine/riskEngine');
const { runFraudChecks } = require('./engine/fraudDetector');

const DB_PATH = path.join(__dirname, 'lendai.db');

// Create and open the database
const db = new sqlite3.Database(DB_PATH);

// Promisify helpers
db.runAsync = (sql, params = []) => new Promise((res, rej) => db.run(sql, params, function (err) { err ? rej(err) : res(this); }));
db.getAsync = (sql, params = []) => new Promise((res, rej) => db.get(sql, params, (err, row) => err ? rej(err) : res(row)));
db.allAsync = (sql, params = []) => new Promise((res, rej) => db.all(sql, params, (err, rows) => err ? rej(err) : res(rows)));

// ── Schema & seed ────────────────────────────────────────
async function initDb() {
  await db.runAsync('PRAGMA journal_mode=WAL');
  await db.runAsync('PRAGMA foreign_keys=ON');

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL UNIQUE,
      password   TEXT NOT NULL,
      role       TEXT NOT NULL DEFAULT 'customer',
      avatar     TEXT,
      approved   INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS notifications (
      id         TEXT PRIMARY KEY,
      type       TEXT NOT NULL,
      title      TEXT NOT NULL,
      message    TEXT NOT NULL,
      payload    TEXT DEFAULT '{}',
      is_read    INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);


  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS loan_applications (
      id                    TEXT PRIMARY KEY,
      customer_id           TEXT NOT NULL,
      customer_name         TEXT NOT NULL,
      loan_amount           REAL,
      purpose               TEXT,
      tenure                INTEGER,
      monthly_income        REAL,
      existing_emis         REAL,
      employment_type       TEXT,
      years_employed        REAL,
      education_level       TEXT,
      age                   INTEGER,
      has_linkedin          INTEGER DEFAULT 0,
      linkedin_connections  INTEGER DEFAULT 0,
      has_github            INTEGER DEFAULT 0,
      has_active_social     INTEGER DEFAULT 0,
      avg_online_activity   TEXT,
      utility_payments      INTEGER DEFAULT 0,
      rent_payments         INTEGER DEFAULT 0,
      no_insurance_lapses   INTEGER DEFAULT 0,
      positive_alt_data     INTEGER DEFAULT 0,
      previous_applications INTEGER DEFAULT 0,
      uploaded_docs         TEXT DEFAULT '[]',
      risk_score            INTEGER,
      risk_band             TEXT,
      risk_band_color       TEXT,
      risk_confidence       INTEGER,
      risk_components       TEXT,
      risk_features         TEXT,
      risk_recommendation   TEXT,
      explanation_summary   TEXT,
      explanation_reasons   TEXT,
      fraud_flagged         INTEGER DEFAULT 0,
      fraud_flags           TEXT DEFAULT '[]',
      fraud_score           INTEGER DEFAULT 0,
      fraud_level           TEXT DEFAULT 'LOW',
      status                TEXT DEFAULT 'Submitted',
      admin_notes           TEXT,
      submitted_at          TEXT DEFAULT (datetime('now')),
      reviewed_at           TEXT,
      FOREIGN KEY (customer_id) REFERENCES users(id)
    )
  `);

  // Seed users
  const seedUsers = [
    { id: 'admin-1', name: 'Priya Sharma', email: 'admin@lendai.in', password: 'admin123', role: 'admin', avatar: 'PS', approved: 1 },
    { id: 'cust-1', name: 'Rahul Verma', email: 'rahul@example.com', password: 'pass123', role: 'customer', avatar: 'RV', approved: 1 },
    { id: 'cust-2', name: 'Anjali Singh', email: 'anjali@example.com', password: 'pass123', role: 'customer', avatar: 'AS', approved: 1 },
  ];
  for (const u of seedUsers) {
    const hash = bcrypt.hashSync(u.password, 10);
    await db.runAsync(
      'INSERT OR IGNORE INTO users (id,name,email,password,role,avatar,approved) VALUES (?,?,?,?,?,?,?)',
      [u.id, u.name, u.email, hash, u.role, u.avatar, u.approved]
    );
  }

  // Seed loan applications
  const seedApps = [
    {
      id: 'APP-001', customer_id: 'cust-1', customer_name: 'Rahul Verma',
      loan_amount: 500000, purpose: 'Home Renovation', tenure: 36,
      monthly_income: 85000, existing_emis: 12000, employment_type: 'salaried_private',
      years_employed: 5, education_level: 'bachelor', age: 30,
      has_linkedin: 1, linkedin_connections: 320, has_github: 1,
      has_active_social: 1, avg_online_activity: 'high',
      utility_payments: 1, rent_payments: 1, no_insurance_lapses: 1, positive_alt_data: 1,
      previous_applications: 0, uploaded_docs: JSON.stringify(['Aadhaar Card', 'PAN Card', 'Salary Slip']),
      status: 'Under Review', submitted_at: '2026-08-01T10:30:00', reviewed_at: null,
    },
    {
      id: 'APP-002', customer_id: 'cust-2', customer_name: 'Anjali Singh',
      loan_amount: 200000, purpose: 'Education', tenure: 24,
      monthly_income: 45000, existing_emis: 8000, employment_type: 'salaried_govt',
      years_employed: 3, education_level: 'masters', age: 27,
      has_linkedin: 1, linkedin_connections: 150, has_github: 0,
      has_active_social: 1, avg_online_activity: 'medium',
      utility_payments: 1, rent_payments: 0, no_insurance_lapses: 1, positive_alt_data: 0,
      previous_applications: 1, uploaded_docs: JSON.stringify(['Aadhaar Card', 'Salary Slip']),
      status: 'Approved', submitted_at: '2026-07-28T14:20:00', reviewed_at: '2026-07-29T09:00:00',
    },
    {
      id: 'APP-003', customer_id: 'cust-1', customer_name: 'Rahul Verma',
      loan_amount: 1500000, purpose: 'Business', tenure: 60,
      monthly_income: 30000, existing_emis: 22000, employment_type: 'self_employed',
      years_employed: 1, education_level: 'diploma', age: 42,
      has_linkedin: 0, linkedin_connections: 0, has_github: 0,
      has_active_social: 0, avg_online_activity: 'low',
      utility_payments: 0, rent_payments: 0, no_insurance_lapses: 0, positive_alt_data: 0,
      previous_applications: 4, uploaded_docs: JSON.stringify(['Aadhaar Card']),
      status: 'Rejected', submitted_at: '2026-07-25T09:00:00', reviewed_at: '2026-07-26T11:00:00',
    },
  ];

  for (const app of seedApps) {
    const engineData = {
      monthlyIncome: app.monthly_income, existingEMIs: app.existing_emis,
      employmentType: app.employment_type, yearsEmployed: app.years_employed,
      educationLevel: app.education_level, age: app.age,
      hasLinkedIn: !!app.has_linkedin, linkedInConnections: app.linkedin_connections,
      hasGithub: !!app.has_github, hasActiveSocial: !!app.has_active_social,
      avgOnlineActivity: app.avg_online_activity,
      utilityPaymentsOnTime: !!app.utility_payments, rentPaymentsOnTime: !!app.rent_payments,
      noInsuranceLapses: !!app.no_insurance_lapses, positiveAltData: !!app.positive_alt_data,
      previousApplications: app.previous_applications, loanAmount: app.loan_amount,
      uploadedDocs: JSON.parse(app.uploaded_docs),
    };
    const risk = computeRiskScore(engineData);
    const expl = generateExplanation(risk, engineData);
    const fraud = runFraudChecks(engineData);

    await db.runAsync(
      `INSERT OR IGNORE INTO loan_applications
       (id,customer_id,customer_name,loan_amount,purpose,tenure,
        monthly_income,existing_emis,employment_type,years_employed,
        education_level,age,has_linkedin,linkedin_connections,has_github,
        has_active_social,avg_online_activity,utility_payments,rent_payments,
        no_insurance_lapses,positive_alt_data,previous_applications,uploaded_docs,
        risk_score,risk_band,risk_band_color,risk_confidence,risk_components,
        risk_features,risk_recommendation,explanation_summary,explanation_reasons,
        fraud_flagged,fraud_flags,fraud_score,fraud_level,status,submitted_at,reviewed_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        app.id, app.customer_id, app.customer_name, app.loan_amount, app.purpose, app.tenure,
        app.monthly_income, app.existing_emis, app.employment_type, app.years_employed,
        app.education_level, app.age, app.has_linkedin, app.linkedin_connections,
        app.has_github, app.has_active_social, app.avg_online_activity,
        app.utility_payments, app.rent_payments, app.no_insurance_lapses,
        app.positive_alt_data, app.previous_applications, app.uploaded_docs,
        risk.score, risk.band, risk.bandColor, risk.confidence,
        JSON.stringify(risk.components), JSON.stringify(risk.features), risk.recommendation,
        expl.summary, JSON.stringify(expl.reasons),
        fraud.isFlagged ? 1 : 0, JSON.stringify(fraud.flags), fraud.fraudScore, fraud.riskLevel,
        app.status, app.submitted_at, app.reviewed_at,
      ]
    );
  }

  console.log('✅ Database initialised and seeded');
}

initDb().catch(err => { console.error('DB init error:', err); process.exit(1); });

module.exports = db;
