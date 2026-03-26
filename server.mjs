import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import postgres from 'postgres';
import serverless from 'serverless-http';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Neon Postgres Connection (Standard connection string)
const sql = postgres(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL, { ssl: 'require' });

// Function: Initialize Neon Table (Self-Healing)
const initDB = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS account_plans (
      id TEXT PRIMARY KEY,
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
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'employee'
    );
  `;
};

// --- API Routes (Simplified SQL Edition) ---

// 1. Save or Update Record
app.post('/api/save-plan', async (req, res) => {
    try {
        await initDB();
        const { _id, companyName, contactPerson, email, phone, mobile2, whatsapp, industry, review, expectations, goals, xrFocus, landscape, drivers, canSellExtra, opportunities, strategy, stakeholders, plan, actions, riskMitigation } = req.body;
        
        const finalId = _id || Date.now().toString();
        
        const result = await sql`
            INSERT INTO account_plans (
                id, company_name, contact_person, email, phone, mobile_2, whatsapp, industry, review, expectations, goals, 
                xr_focus, landscape, drivers, can_sell_extra, opportunities, strategy, stakeholders, 
                plan, actions, risk_mitigation, last_updated
            ) VALUES (
                ${finalId}, ${companyName}, ${contactPerson}, ${email}, ${phone}, ${mobile2}, ${whatsapp}, ${industry}, ${review}, ${expectations}, ${goals}, 
                ${xrFocus}, ${landscape}, ${drivers}, ${canSellExtra}, ${opportunities}, ${strategy}, ${stakeholders}, 
                ${plan}, ${actions}, ${riskMitigation}, CURRENT_TIMESTAMP
            )
            ON CONFLICT (id) DO UPDATE SET
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
app.get('/api/plans', async (req, res) => {
    try {
        await initDB();
        const records = await sql`
            SELECT id AS "_id", company_name AS "companyName", contact_person AS "contactPerson", 
                   email, phone, mobile_2 AS "mobile2", whatsapp, industry, review, expectations, goals, xr_focus AS "xrFocus", 
                   landscape, drivers, can_sell_extra AS "canSellExtra", opportunities, strategy, 
                   stakeholders, plan, actions, risk_mitigation AS "riskMitigation", last_updated AS "lastUpdated"
            FROM account_plans 
            ORDER BY last_updated DESC
        `;
        res.json(records);
    } catch (error) {
        console.error('SQL Read Error:', error);
        res.status(500).json({ status: 'error' });
    }
});

// 3. Delete Record
app.delete('/api/plan/:id', async (req, res) => {
    try {
        await initDB();
        await sql`DELETE FROM account_plans WHERE id = ${req.params.id}`;
        res.json({ success: true });
    } catch (error) {
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
        
        const token = jwt.sign({ id: user[0].id, role: user[0].role }, process.env.JWT_SECRET || 'sync-secret', { expiresIn: '1d' });
        res.json({ success: true, user: { username: user[0].username, role: user[0].role }, token });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Hybrid Local/Netlify Support
if (!process.env.NETLIFY) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Strategic Server (Neon) listening on :${PORT}`));
}

export const handler = serverless(app);
export default app;
