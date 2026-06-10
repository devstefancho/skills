import { Router } from "express";
import { db } from "../lib/db";
import { sendVerificationEmail } from "../services/email";

const router = Router();

// POST /signup — from the signup screen
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!isValidEmail(email) || password.length < 8) {
    return res.status(400).json({ error: "INVALID_INPUT" });
  }

  const existing = await db.findUserByEmail(email);
  if (existing) {
    // Existing but unverified → resend verification instead of erroring
    if (!existing.verified) {
      await sendVerificationEmail(existing.id, email);
      return res.status(200).json({ status: "VERIFICATION_RESENT" });
    }
    return res.status(409).json({ error: "EMAIL_TAKEN", loginUrl: "/login" });
  }

  const user = await db.createUser(email, password, { verified: false });
  await sendVerificationEmail(user.id, email);
  return res.status(201).json({ status: "VERIFICATION_SENT" });
});

// GET /signup/verify?token= — link in the verification email
router.get("/signup/verify", async (req, res) => {
  const claim = await db.consumeVerificationToken(String(req.query.token));
  if (!claim) {
    return res.redirect("/signup/expired"); // expired or already used → re-request screen
  }
  await db.markVerified(claim.userId);
  return res.redirect("/welcome");
});

function isValidEmail(email: string) {
  return /^[^@]+@[^@]+\.[^@]+$/.test(email);
}

export default router;
