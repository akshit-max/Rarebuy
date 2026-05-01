const API = "https://rarebuy.onrender.com/api";

// LOGIN
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("https://rarebuy.onrender.com/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.user.role);

    // 🔥 ROLE BASED REDIRECT
    window.location.href = "index.htm";

  } else {
    document.getElementById("msg").innerText = data.msg || "Login failed";
  }
}

// REGISTER
async function register() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    document.getElementById("msg").innerText = data.msg || "Registered";

  } catch (err) {
    console.error(err);
  }
}