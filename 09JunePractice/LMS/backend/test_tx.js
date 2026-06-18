const mongoose = require('mongoose');
require('dotenv').config();
async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const session = await mongoose.startSession();
    session.startTransaction();
    console.log("Transactions supported!");
    await session.abortTransaction();
    session.endSession();
    process.exit(0);
  } catch(e) {
    console.error("Transactions NOT supported:", e.message);
    process.exit(1);
  }
}
run();
