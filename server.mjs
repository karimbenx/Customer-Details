import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import serverless from 'serverless-http';

dotenv.config();

const app = express();

// Basic Middleware
app.use(cors());
app.use(express.json());

// MongoDB: Serverless Global Connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://merwins2004_db_user:v7bDAGfgRhsGnoVo@cluster0.osicvcz.mongodb.net/customer_details?retryWrites=true&w=majority';
  try {
    const db = await mongoose.connect(MONGO_URI, { dbName: 'customer_details' });
    isConnected = db.connections[0].readyState;
    console.log('✅ Strategic DB Initialized');
  } catch (err) {
    console.error('❌ DB Error:', err);
  }
};

// Simplified Strategy Schema
const accountPlanSchema = new mongoose.Schema({
  companyName: String,
  contactPerson: String,
  email: String,
  phone: String,
  industry: String,
  review: String,
  expectations: String,
  goals: String,
  xrFocus: String,
  landscape: String,
  drivers: String,
  canSellExtra: String,
  opportunities: String,
  strategy: String,
  stakeholders: String,
  plan: String,
  actions: String,
  riskMitigation: String,
  lastUpdated: { type: Date, default: Date.now }
});

const AccountPlan = mongoose.models.AccountPlan || mongoose.model('AccountPlan', accountPlanSchema, 'account_plans');

// Minimal API Routes (Direct and Fast)
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.post('/api/save-plan', async (req, res) => {
  try {
    const { _id, ...data } = req.body;
    let result;
    if (_id) {
       result = await AccountPlan.findByIdAndUpdate(_id, { ...data, lastUpdated: new Date() }, { new: true });
    } else {
       result = new AccountPlan({ ...data, lastUpdated: new Date() });
       await result.save();
    }
    res.json({ data: result });
  } catch (error) {
    res.status(500).json({ status: 'fail' });
  }
});

app.get('/api/plans', async (req, res) => {
  try {
    const plans = await AccountPlan.find().sort({ lastUpdated: -1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ status: 'error' });
  }
});

app.delete('/api/plan/:id', async (req, res) => {
  try {
    await AccountPlan.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ status: 'error' });
  }
});

// For Local Run Only
if (!process.env.NETLIFY) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Strategic Server :${PORT}`));
}

export const handler = serverless(app);
export default app;
