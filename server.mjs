import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import postgres from 'postgres';
import serverless from 'serverless-http';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Neon Postgres Connection (Standard connection string)
const sql = postgres(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL, { ssl: 'require' });
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
const SESSION_ACTIVITY_TIMEOUT_MS = 8 * 1000;
const DEFAULT_FORM_CONFIG = [
  {
    id: 'customerDetails',
    title: 'Customer Overview',
    subtitle: 'Primary contact and profile',
    fields: [
      { key: 'companyName', label: 'Company Name', type: 'text', placeholder: 'Acme Corp', width: 'half' },
      { key: 'industry', label: 'Industry', type: 'text', placeholder: 'e.g. Technology', width: 'half' },
      { key: 'contactPerson', label: 'Contact Person', type: 'text', placeholder: 'Full name of contact', width: 'full' },
      { key: 'email', label: 'Email Address', type: 'email', placeholder: 'email@company.com', width: 'half' },
      { key: 'whatsapp', label: 'WhatsApp Number', type: 'text', placeholder: 'WhatsApp number', width: 'half' },
      { key: 'phone', label: 'Phone (Primary)', type: 'text', placeholder: '+1 555-0123', width: 'half' },
      { key: 'mobile2', label: 'Secondary Mobile', type: 'text', placeholder: '+1 555-4567', width: 'half' }
    ]
  },
  {
    id: 'accountPotential',
    title: 'Account Potential',
    subtitle: 'History and strategic goals',
    fields: [
      { key: 'review', label: 'Review & History', type: 'textarea', placeholder: 'Recent milestones and history...', width: 'full' },
      { key: 'expectations', label: 'Expectations', type: 'textarea', placeholder: 'What does the customer expect?', width: 'full' },
      { key: 'goals', label: 'Strategic Goals', type: 'textarea', placeholder: 'Top 3 business goals', width: 'full' },
      { key: 'proposal', label: 'Proposal (Number only)', type: 'number', placeholder: 'Enter proposal amount', width: 'half' },
      { key: 'revisedProposal', label: 'Revised Proposal (Number only)', type: 'number', placeholder: 'Enter revised proposal amount', width: 'half' }
    ]
  },
  {
    id: 'priorities',
    title: 'Customer Priorities',
    subtitle: 'Drivers and tech focus',
    fields: [
      { key: 'xrFocus', label: 'Primary Focus', type: 'select', width: 'full', options: ['None', 'AR', 'VR', 'MR', 'AI', 'Experience Centre'] },
      { key: 'landscape', label: 'Business Landscape', type: 'textarea', placeholder: 'Current market challenges...', width: 'full' },
      { key: 'drivers', label: 'Key Business Drivers', type: 'textarea', placeholder: 'What drives their decisions?', width: 'full' }
    ]
  },
  {
    id: 'opportunity',
    title: 'Opportunities',
    subtitle: 'Sales and strategy',
    fields: [
      { key: 'canSellExtra', label: 'Upsell Potential', type: 'select', width: 'full', options: ['Unsure', 'Definitely', 'Maybe', 'Unlikely'] },
      { key: 'opportunities', label: 'Specific Opportunities', type: 'textarea', placeholder: 'Detail specific growth paths...', width: 'full' },
      {
        key: 'strategy',
        label: 'Primary Strategy',
        type: 'radio',
        width: 'full',
        options: ['Protect', 'Grow'],
        descriptions: {
          Protect: 'Defend existing accounts and maintain satisfaction.',
          Grow: 'Expand footprint and increase account value.'
        }
      }
    ]
  },
  {
    id: 'relationship',
    title: 'Relationships',
    subtitle: 'Stakeholders and mapping',
    fields: [
      { key: 'stakeholders', label: 'Key Executives & Stakeholders', type: 'textarea', placeholder: 'List influential points of contact...', width: 'full' },
      { key: 'plan', label: 'Advancement Plan', type: 'textarea', placeholder: 'How will we strengthen these ties?', width: 'full' }
    ]
  },
  {
    id: 'action',
    title: 'Action Plan',
    subtitle: 'Critical actions and risk',
    fields: [
      { key: 'actions', label: 'Critical Actions', type: 'textarea', placeholder: 'Immediate steps required...', width: 'full' },
      { key: 'riskMitigation', label: 'Risk Mitigation', type: 'textarea', placeholder: 'Potential blockers and solutions...', width: 'full' }
    ]
  }
];

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sync-secret');
    const users = await sql`
      SELECT id, session_id, session_expires_at
      FROM users
      WHERE id = ${decoded.id}
    `;

    if (users.length === 0) {
      return res.status(401).json({ error: 'Session no longer exists' });
    }

    const activeSession = users[0];
    if (
      !decoded.sid ||
      !activeSession.session_id ||
      activeSession.session_id !== decoded.sid ||
      !activeSession.session_expires_at ||
      new Date(activeSession.session_expires_at).getTime() <= Date.now()
    ) {
      return res.status(401).json({ error: 'Session expired or replaced by another login' });
    }

    await sql`
      UPDATE users
      SET session_last_seen_at = CURRENT_TIMESTAMP
      WHERE id = ${decoded.id} AND session_id = ${decoded.sid}
    `;

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Function: Initialize Neon Table (Self-Healing)
const initDB = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS account_plans (
      id TEXT PRIMARY KEY,
      owner_user_id INTEGER,
      owner_username TEXT,
      company_name TEXT,
      contact_person TEXT,
      email TEXT,
      phone TEXT,
      mobile_2 TEXT,
      whatsapp TEXT,
      industry TEXT,
      review TEXT,
      expectations TEXT,
      goals TEXT,
      xr_focus TEXT,
      landscape TEXT,
      drivers TEXT,
      can_sell_extra TEXT,
      opportunities TEXT,
      strategy TEXT,
      stakeholders TEXT,
      plan TEXT,
      actions TEXT,
      risk_mitigation TEXT,
      extra_data JSONB,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`ALTER TABLE account_plans ADD COLUMN IF NOT EXISTS owner_user_id INTEGER`;
  await sql`ALTER TABLE account_plans ADD COLUMN IF NOT EXISTS owner_username TEXT`;
  await sql`ALTER TABLE account_plans ADD COLUMN IF NOT EXISTS proposal TEXT`;
  await sql`ALTER TABLE account_plans ADD COLUMN IF NOT EXISTS revised_proposal TEXT`;
  await sql`ALTER TABLE account_plans ADD COLUMN IF NOT EXISTS extra_data JSONB`;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'employee',
      session_id TEXT,
      session_expires_at TIMESTAMP,
      session_last_seen_at TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      topic TEXT,
      source TEXT,
      title TEXT,
      snippet TEXT,
      link TEXT,
      date TEXT,
      page TEXT,
      sentiment TEXT,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS form_configs (
      id TEXT PRIMARY KEY,
      config JSONB NOT NULL,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS session_id TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS session_expires_at TIMESTAMP`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS session_last_seen_at TIMESTAMP`;
  await sql`
    INSERT INTO form_configs (id, config, last_updated)
    VALUES ('default', ${JSON.stringify(DEFAULT_FORM_CONFIG)}::jsonb, CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO NOTHING
  `;

  // Default admin creation outside SQL template
  try {
    const adminUser = await sql`SELECT * FROM users WHERE username = 'admin'`;
    if (adminUser.length === 0) {
      const pHash = await bcrypt.hash('admin', 10);
      await sql`INSERT INTO users (username, password, role) VALUES ('admin', ${pHash}, 'admin')`;
    }
  } catch (e) {
    console.error("DB Init Error:", e);
  }
};

// --- API Routes (Simplified SQL Edition) ---

// 1. Save or Update Record
app.post('/api/save-plan', authMiddleware, async (req, res) => {
    try {
        await initDB();
        const { _id, companyName, contactPerson, email, phone, mobile2, whatsapp, industry, review, expectations, goals, proposal, revisedProposal, xrFocus, landscape, drivers, canSellExtra, opportunities, strategy, stakeholders, plan, actions, riskMitigation } = req.body;
        const knownKeys = new Set(['_id', 'companyName', 'contactPerson', 'email', 'phone', 'mobile2', 'whatsapp', 'industry', 'review', 'expectations', 'goals', 'proposal', 'revisedProposal', 'xrFocus', 'landscape', 'drivers', 'canSellExtra', 'opportunities', 'strategy', 'stakeholders', 'plan', 'actions', 'riskMitigation']);
        const extraData = Object.fromEntries(Object.entries(req.body).filter(([key]) => !knownKeys.has(key)));
        const ownerUserId = req.user.id;
        const ownerUsername = req.user.username;
        
        const finalId = _id || Date.now().toString();

        if (_id && req.user.role !== 'admin') {
          const existingPlan = await sql`SELECT owner_user_id FROM account_plans WHERE id = ${_id}`;
          if (existingPlan.length > 0 && existingPlan[0].owner_user_id !== ownerUserId) {
            return res.status(403).json({ error: 'You cannot modify another user\'s record' });
          }
        }
        
        const result = await sql`
            INSERT INTO account_plans (
                id, owner_user_id, owner_username, company_name, contact_person, email, phone, mobile_2, whatsapp, industry, review, expectations, goals, proposal, revised_proposal,
                xr_focus, landscape, drivers, can_sell_extra, opportunities, strategy, stakeholders, 
                plan, actions, risk_mitigation, extra_data, last_updated
            ) VALUES (
                ${finalId}, ${ownerUserId}, ${ownerUsername}, ${companyName}, ${contactPerson}, ${email}, ${phone}, ${mobile2}, ${whatsapp}, ${industry}, ${review}, ${expectations}, ${goals}, ${proposal}, ${revisedProposal},
                ${xrFocus}, ${landscape}, ${drivers}, ${canSellExtra}, ${opportunities}, ${strategy}, ${stakeholders}, 
                ${plan}, ${actions}, ${riskMitigation}, ${JSON.stringify(extraData)}::jsonb, CURRENT_TIMESTAMP
            )
            ON CONFLICT (id) DO UPDATE SET
                owner_user_id = CASE
                  WHEN ${req.user.role === 'admin'} THEN account_plans.owner_user_id
                  ELSE EXCLUDED.owner_user_id
                END,
                owner_username = CASE
                  WHEN ${req.user.role === 'admin'} THEN account_plans.owner_username
                  ELSE EXCLUDED.owner_username
                END,
                company_name = EXCLUDED.company_name,
                contact_person = EXCLUDED.contact_person,
                email = EXCLUDED.email,
                phone = EXCLUDED.phone,
                mobile_2 = EXCLUDED.mobile_2,
                whatsapp = EXCLUDED.whatsapp,
                industry = EXCLUDED.industry,
                review = EXCLUDED.review,
                expectations = EXCLUDED.expectations,
                goals = EXCLUDED.goals,
                proposal = EXCLUDED.proposal,
                revised_proposal = EXCLUDED.revised_proposal,
                xr_focus = EXCLUDED.xr_focus,
                landscape = EXCLUDED.landscape,
                drivers = EXCLUDED.drivers,
                can_sell_extra = EXCLUDED.can_sell_extra,
                opportunities = EXCLUDED.opportunities,
                strategy = EXCLUDED.strategy,
                stakeholders = EXCLUDED.stakeholders,
                plan = EXCLUDED.plan,
                actions = EXCLUDED.actions,
                risk_mitigation = EXCLUDED.risk_mitigation,
                extra_data = EXCLUDED.extra_data,
                last_updated = CURRENT_TIMESTAMP
            RETURNING *
        `;

        // Normalize ID for frontend compatibility
        const responseData = { ...result[0], _id: result[0].id };
        res.json({ data: responseData });
    } catch (error) {
        console.error('SQL Save Error:', error);
        res.status(500).json({ status: 'fail' });
    }
});

// 2. Get All Records
app.get('/api/plans', authMiddleware, async (req, res) => {
    try {
        await initDB();
        const records = req.user.role === 'admin'
          ? await sql`
              SELECT id AS "_id", owner_user_id AS "ownerUserId", owner_username AS "ownerUsername",
                     company_name AS "companyName", contact_person AS "contactPerson",
                     email, phone, mobile_2 AS "mobile2", whatsapp, industry, review, expectations, goals, proposal, revised_proposal AS "revisedProposal", xr_focus AS "xrFocus",
                     landscape, drivers, can_sell_extra AS "canSellExtra", opportunities, strategy,
                     stakeholders, plan, actions, risk_mitigation AS "riskMitigation", last_updated AS "lastUpdated"
                     , extra_data AS "extraData"
              FROM account_plans
              ORDER BY last_updated DESC
            `
          : await sql`
              SELECT id AS "_id", owner_user_id AS "ownerUserId", owner_username AS "ownerUsername",
                     company_name AS "companyName", contact_person AS "contactPerson",
                     email, phone, mobile_2 AS "mobile2", whatsapp, industry, review, expectations, goals, proposal, revised_proposal AS "revisedProposal", xr_focus AS "xrFocus",
                     landscape, drivers, can_sell_extra AS "canSellExtra", opportunities, strategy,
                     stakeholders, plan, actions, risk_mitigation AS "riskMitigation", last_updated AS "lastUpdated"
                     , extra_data AS "extraData"
              FROM account_plans
              WHERE owner_user_id = ${req.user.id}
              ORDER BY last_updated DESC
            `;
        res.json(records);
    } catch (error) {
        console.error('SQL Read Error:', error);
        res.status(500).json({ status: 'error' });
    }
});

// 3. Delete Record
app.delete('/api/plan/:id', authMiddleware, async (req, res) => {
    try {
        await initDB();
        const result = req.user.role === 'admin'
          ? await sql`DELETE FROM account_plans WHERE id = ${req.params.id} RETURNING id`
          : await sql`DELETE FROM account_plans WHERE id = ${req.params.id} AND owner_user_id = ${req.user.id} RETURNING id`;

        if (result.length === 0) {
          return res.status(404).json({ error: 'Record not found or access denied' });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ status: 'error' });
    }
});

// 4. Get Intelligence Articles (Signals)
app.get('/api/articles', async (req, res) => {
    try {
        await initDB();
        const records = await sql`
            SELECT id AS "_id", topic, source, title, snippet, link, date, page, sentiment 
            FROM articles 
            ORDER BY last_updated DESC
        `;
        res.json(records);
    } catch (error) {
        console.error('SQL Articles Error:', error);
        res.status(500).json({ status: 'error' });
    }
});

// 4. Signup
app.post('/api/signup', async (req, res) => {
    try {
        await initDB();
        const { username, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await sql`
            INSERT INTO users (username, password, role)
            VALUES (${username}, ${hashedPassword}, ${role || 'employee'})
            RETURNING id, username, role
        `;
        res.json({ success: true, user: result[0] });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ error: 'User already exists or database error' });
    }
});

// 5. Login
app.post('/api/login', async (req, res) => {
    try {
        await initDB();
        const { username, password } = req.body;
        const user = await sql`SELECT * FROM users WHERE username = ${username}`;
        
        if (user.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        
        const valid = await bcrypt.compare(password, user[0].password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const existingSessionExpiresAt = user[0].session_expires_at ? new Date(user[0].session_expires_at).getTime() : null;
        const existingSessionLastSeenAt = user[0].session_last_seen_at ? new Date(user[0].session_last_seen_at).getTime() : null;
        const hasActiveSession =
          user[0].session_id &&
          existingSessionExpiresAt &&
          existingSessionExpiresAt > Date.now() &&
          existingSessionLastSeenAt &&
          Date.now() - existingSessionLastSeenAt < SESSION_ACTIVITY_TIMEOUT_MS;

        if (hasActiveSession) {
          return res.status(409).json({ error: 'This account is already logged in on another device or browser' });
        }

        const sessionId = randomUUID();
        const sessionExpiresAt = new Date(Date.now() + SESSION_DURATION_MS);
        await sql`
          UPDATE users
          SET session_id = ${sessionId}, session_expires_at = ${sessionExpiresAt}, session_last_seen_at = CURRENT_TIMESTAMP
          WHERE id = ${user[0].id}
        `;
        
        const token = jwt.sign(
          { id: user[0].id, username: user[0].username, role: user[0].role, sid: sessionId },
          process.env.JWT_SECRET || 'sync-secret',
          { expiresIn: '1d' }
        );
        res.json({ success: true, user: { username: user[0].username, role: user[0].role }, token });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/logout', authMiddleware, async (req, res) => {
    try {
        await initDB();
        await sql`
          UPDATE users
          SET session_id = NULL, session_expires_at = NULL, session_last_seen_at = NULL
          WHERE id = ${req.user.id} AND session_id = ${req.user.sid}
        `;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Logout failed' });
    }
});

app.post('/api/session/ping', authMiddleware, async (req, res) => {
    res.json({ success: true });
});

app.get('/api/form-config', authMiddleware, async (req, res) => {
    try {
        await initDB();
        const result = await sql`SELECT config FROM form_configs WHERE id = 'default'`;
        res.json(result[0]?.config || DEFAULT_FORM_CONFIG);
    } catch (error) {
        res.status(500).json({ error: 'Unable to load form config' });
    }
});

app.put('/api/form-config', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
          return res.status(403).json({ error: 'Admin access required' });
        }

        await initDB();
        const nextConfig = Array.isArray(req.body) ? req.body : req.body?.config;
        if (!Array.isArray(nextConfig)) {
          return res.status(400).json({ error: 'Invalid form config payload' });
        }

        await sql`
          INSERT INTO form_configs (id, config, last_updated)
          VALUES ('default', ${JSON.stringify(nextConfig)}::jsonb, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE SET
            config = EXCLUDED.config,
            last_updated = CURRENT_TIMESTAMP
        `;

        res.json({ success: true, config: nextConfig });
    } catch (error) {
        res.status(500).json({ error: 'Unable to save form config' });
    }
});

// Hybrid Local/Netlify Support
if (!process.env.NETLIFY) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Strategic Server (Neon) listening on :${PORT}`));
}

export const handler = serverless(app);
export default app;
