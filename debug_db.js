import mongoose from 'mongoose';

const MONGO_URI = 'mongodb+srv://merwins2004_db_user:v7bDAGfgRhsGnoVo@cluster0.osicvcz.mongodb.net/customer_details?retryWrites=true&w=majority';

async function check() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name));
    
    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`- ${col.name}: ${count} documents`);
      if (count > 0) {
        const doc = await mongoose.connection.db.collection(col.name).findOne();
        console.log(`  Sample data from ${col.name}:`, doc.customerDetails?.companyName);
      }
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

check();
