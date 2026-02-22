import express from "express";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config(); // Load .env

const app = express();
app.use(express.json());

// ✅ Use PORT from env
const PORT = process.env.PORT || 7001;

// 🔑 Generate RSA Key Pair
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

// Health check route
app.get("/", (req, res) => {
  res.json({ status: `Witness running on ${PORT}` });
});

// 🔏 Sign Merkle Root
app.post("/sign", (req, res) => {
  try {
    const { merkleRoot } = req.body;

    if (!merkleRoot) {
      return res.status(400).json({ message: "Merkle root required" });
    }

    const signature = crypto.sign(
      "sha256",
      Buffer.from(merkleRoot),
      privateKey
    );

    res.json({
      signature: signature.toString("base64"),
      publicKey: publicKey.export({ type: "pkcs1", format: "pem" })
    });

  } catch (error) {
    console.error("Sign error:", error);
    res.status(500).json({ message: "Witness error" });
  }
});

// Global error catch
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

app.listen(PORT, () => {
  console.log(`🔏 Witness Server running on port ${PORT}`);
});