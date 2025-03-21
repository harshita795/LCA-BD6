const express = require("express");
const rateLimit = require("express-rate-limit");
const app = express();
const PORT = 3005;

app.use(express.json());

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Too many login attempts. Try again later." },
});

const Users = [{ email: "user@example.com", password: "securePassword123" }];
function loginUser(email, password) {
  return Users.find(
    (user) => user.email === email && user.password === password
  );
}

app.post("/login", loginLimiter, (req, res) => {
  try {
    const { email, password } = req.body;
    const user = loginUser(email, password);

    if (!email || !password) {
      return res.status(400).json({ error: "Eamil or password is required." });
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    return res.status(200).json({ success: true, token: "JWT_TOKEN" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error in login the user", error: error.message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
  });
}

module.exports = { app };

// **1. Missing Fields Test**

// - **Description:** Handle scenarios where `email` or `password` fields are missing.
// - **Expected Outcome:** The API should return an error when either field is absent.

// **2. Rate Limiting Test**

// - **Description:** Simulate 5 failed attempts within one minute and ensure the API blocks the next attempt with the following message:

// ```jsx
// {
//     "error": "Too many login attempts. Try again later."
// }
// ```
