const BACKEND_URL = "https://bscit.sit.kmutt.ac.th/intproj25/ssa1/itb-ecors";
const KEYCLOAK_AUTH_URL = "https://bscit.sit.kmutt.ac.th/intproj25/ft/keycloak";
const REALM = "itb-ecors";
const CLIENT_ID = "itb-ecors-ssa1";
const BASE_PATH = window.location.pathname.replace(/[^/]*$/, "");


function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

// ---------------------------
// EXCHANGE CODE → TOKEN
// ---------------------------
async function exchangeCodeForToken() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (!code) return;

  const tokenURL = `${KEYCLOAK_AUTH_URL}/realms/${REALM}/protocol/openid-connect/token`;
  const res = await fetch(tokenURL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      code: code,
      redirect_uri: window.location.origin + BASE_PATH + "reserve.html"
    })
  });

  if (!res.ok) {
    console.error("Token exchange failed", await res.text());
    return;
  }

  const data = await res.json();
  localStorage.setItem("kc_token", data.access_token);
  localStorage.setItem("kc_refresh", data.refresh_token);
  window.history.replaceState({}, "", "reserve.html");
}

function protectPage() {
  const token = localStorage.getItem("kc_token");

  // Not logged in → go to Keycloak login
  if (!token) {
    const loginURL =
      `${KEYCLOAK_AUTH_URL}/realms/${REALM}/protocol/openid-connect/auth` +
      `?client_id=${encodeURIComponent(CLIENT_ID)}` +
      `&redirect_uri=${window.location.origin + BASE_PATH + "reserve.html"}` +
      `&response_type=code` +
      `&prompt=login`;
    window.location.href = loginURL;
    return;
  }

  // Logged in → do nothing
}


function displayUserInfo() {
  const decoded = decodeToken(localStorage.getItem("kc_token"));
  if (decoded?.name) {
    document.getElementById("ecors-fullname").textContent = `Welcome, ${decoded.name}`;
  }
}