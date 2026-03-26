import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import serverless from 'serverless-http';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { neon } from '@netlify/neon';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const router = express.Router();

// Netlify Neon Zero-Config SQL Driver
const sql = neon();

// Function: Initialize Neon Table (Self-Healing)
const initDB = async () => {
    try {
        // Splitting queries for maximum compatibility with serverless drivers
        await sql`CREATE TABLE IF NOT EXISTS account_plans (
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
        )`;

        await sql`CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'employee'
        )`;

        await sql`CREATE TABLE IF NOT EXISTS articles (
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
        )`;

        // Default admin creation
        const adminUser = await sql`SELECT * FROM users WHERE username = 'admin'`;
        if (adminUser.length === 0) {
            const pHash = await bcrypt.hash('admin', 10);
            await sql`INSERT INTO users (username, password, role) VALUES ('admin', ${pHash}, 'admin')`;
        }
    } catch (e) {
        console.error("DB Init Error:", e);
        throw e;
    }
};

// --- API Routes ---

router.post('/save-plan', async (req, res) => {
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

        if (!result.length) throw new Error('Query failed to return result');
        const responseData = { ...result[0], _id: result[0].id };
        res.json({ data: responseData });
    } catch (error) {
        console.error('SQL Save Error:', error);
        res.status(500).json({ error: 'Save failed: ' + error.message });
    }
});

router.get('/plans', async (req, res) => {
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
        res.status(500).json({ error: 'Fetch failed: ' + error.message });
    }
});

router.delete('/plan/:id', async (req, res) => {
    try {
        await initDB();
        await sql`DELETE FROM account_plans WHERE id = ${req.params.id}`;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Delete failed: ' + error.message });
    }
});

router.get('/articles', async (req, res) => {
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
        res.status(500).json({ error: 'Intel fetch failed: ' + error.message });
    }
});

router.post('/signup', async (req, res) => {
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
        res.status(500).json({ error: 'User already exists or database error: ' + error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        await initDB();
        const { username, password } = req.body;
        const users = await sql`SELECT * FROM users WHERE username = ${username}`;
        
                if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        
        const valid = await bcrypt.compare(password, users[0].password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
        
        const token = jwt.sign({ id: users[0].id, role: users[0].role }, process.env.JWT_SECRET || 'sync-secret', { expiresIn: '1d' });
        res.json({ success: true, user: { username: users[0].username, role: users[0].role }, token });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Server error: ' + (error.message || 'Unknown database error.') });
    }
});

app.use('/.netlify/functions/api', router);
app.use('/api', router);
app.use('/', router);

export const handler = serverless(app);
