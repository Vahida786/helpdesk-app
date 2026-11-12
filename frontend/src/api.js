const API = "http://127.0.0.1:8000/api";

export async function api(path, options = {}) {
  const token = localStorage.getItem("access");
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401) localStorage.removeItem("access");
  return res;
}

export function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}

export async function login(username, password) {
  logout(); // clear any old token first
  const res = await api("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Wrong username or password");
  const data = await res.json();
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
}

export async function register(username, password) {
  logout();
  const res = await api("/auth/register/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    // Django sends errors like {password: ["too common"]}
    const msg = Object.values(data).flat().join(" ");
    throw new Error(msg || "Could not create account");
  }
}