const express = require("express");
const fetch = require("node-fetch");

const app = express();

const TOKEN_URL = "https://auth.cat.uk.pt-x.com/oauth2/token";
const CLIENT_ID = process.env.PTX_CLIENT_ID;
const CLIENT_SECRET = process.env.PTX_CLIENT_SECRET;

async function getAccessToken() {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: "verify"
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
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, () => console.log("Server running"));
