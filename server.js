import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = 'mongodb+srv://merwins2004_db_user:v7bDAGfgRhsGnoVo@cluster0.osicvcz.mongodb.net/customer_details?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Define Schema & Model
const accountPlanSchema = new mongoose.Schema({
  customerDetails: {
    companyName: String,
    contactPerson: String,
    email: String,
    phone: String,
    industry: String
  },
  accountPotential: {
    review: String,
    expectations: String,
    goals: String
  },
  customerPriorities: {
    xrFocus: String,
    landscape: String,
    drivers: String
  },
  opportunityIdentification: {
    canSellExtra: String,
    opportunities: String,
    strategy: String
  },
  relationshipAlignment: {
    stakeholders: String,
    plan: String
  },
  actionPlanCoordination: {
    actions: String,
    riskMitigation: String
  },
  lastUpdated: { type: Date, default: Date.now }
});

const AccountPlan = mongoose.model('AccountPlan', accountPlanSchema, 'account_plans');

// API Endpoints


// Post account plan (Create or Update)
app.post('/api/save-plan', async (req, res) => {
  try {
    const { _id, ...data } = req.body;
    let updatedPlan;

    if (_id && _id !== '') {
      // Update existing
      updatedPlan = await AccountPlan.findByIdAndUpdate(
        _id,
        { ...data, lastUpdated: Date.now() },
        { new: true, runValidators: true }
      );
    } else {
      // Create new
      updatedPlan = new AccountPlan({ ...data, lastUpdated: Date.now() });
      await updatedPlan.save();
    }

    res.status(200).json({ message: 'Plan saved successfully', data: updatedPlan });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ message: 'Error saving plan', error: error.message });
  }
});

// Get all account plans
app.get('/api/plans', async (req, res) => {
  try {
    const plans = await AccountPlan.find().sort({ lastUpdated: -1 });
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving plans', error: error.message });
  }
});

// Get a specific plan
app.get('/api/plan/:id', async (req, res) => {
  try {
    const plan = await AccountPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving plan', error: error.message });
  }
});

// Delete a plan
app.delete('/api/plan/:id', async (req, res) => {
  try {
    await AccountPlan.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting plan', error: error.message });
  }
});

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
