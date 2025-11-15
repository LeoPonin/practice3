import express from "express";
import db from "../db.js";

const router = express.Router();


router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, planCode, nameEng, nameTh FROM study_plans");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const planId = req.params.id;
    const [rows] = await db.query("SELECT * FROM study_plans WHERE id = ?", [planId]);
    if (rows.length === 0) return res.status(404).json({ error: "Plan not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
