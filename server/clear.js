import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
  await mongoose.connection.db.collection('researches').deleteMany({});
  console.log('deleted');
  process.exit(0);
});
