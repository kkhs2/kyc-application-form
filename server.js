import express from "express";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

const TOKEN_URL = "https://login.cat.uk.pt-x.com/auth/realms/bottomline/protocol/openid-connect/token";
const REQUEST_URL = "https://ptx-shared-services.cat.uk.pt-x.com/account-verification/v1/account-name-verifications";

const CLIENT_ID = process.env.PTX_CLIENT_ID;
const CLIENT_SECRET = process.env.PTX_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error("Missing PTX_CLIENT_ID or PTX_CLIENT_SECRET");
}

async function getAccessToken() {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  if (!res.ok) throw new Error(await res.text());
  return (await res.json()).access_token;
}

app.get("/api/token-test", async (req, res) => {
  try {
    const token = await getAccessToken();
    res.json({ ok: true, token: token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/cop", async (req, res) => {
  try {
    const { name, sortCode, accountNumber, type } = req.body;
    if (!name || !sortCode || !accountNumber) {
      return res.status(400).json({
        error: "Missing name, sortCode or accountNumber"
      });
    }

    const token = await getAccessToken();

    const payload = {
      requestId: crypto.randomUUID(),
      checkType: "Payee",
      accountType: type.toUpperCase(),    // PERSONAL / BUSINESS
      sortCode: sortCode.toString().padStart(6, "0"),
      accountNumber: accountNumber.toString().padStart(8, "0"),
      name: name
    };

    const ptxRes = await fetch(REQUEST_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await ptxRes.json();

    if (!ptxRes.ok) {
      return res.status(ptxRes.status).json(data);
    }

    res.json(data);
  } catch (err) {
    console.error("PTX CoP error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log("Server running"));
