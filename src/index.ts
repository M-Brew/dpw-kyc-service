import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import kycRoutes from "./routes/kycRoutes";
import { initConsumer } from "./kafka/transactionAMLConsumer";

const { PORT, DB_URI } = process.env;

const app = express();

app.use(cors());
app.use(express.json());

app.use('/kyc-aml', kycRoutes);

// Initialize Kafka consumer for AML monitoring
// initConsumer();

mongoose.connect(DB_URI);
mongoose.connection.on("open", () =>
  console.log("Connected to database successfully")
);

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
