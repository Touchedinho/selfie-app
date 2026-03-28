export function isAuthenticated() {
  const token = localStorage.getItem("token");
  if (!token) return false;
  // Prova a decodificare il token per controllare la scadenza
  try {
    // I token JWT sono nel formato: header.payload.signature
    const payload = JSON.parse(atob(token.split(".")[1]));

    // Controlla se il token è scaduto
    const currentTime = Math.floor(Date.now() / 1000); // Ora attuale in secondi
    return payload.exp > currentTime;
  } catch (e) {
    // Se il token non può essere decodificato, consideralo non valido
    console.error("Invalid token format", e);
    return false;
  }
}

export const getToken = () => {
  return localStorage.getItem("token");
};

// Funzione per impostare il token di autenticazione
export const setToken = (token) => {
  localStorage.setItem("token", token);
};

// Funzione per rimuovere il token di autenticazione (logout)
export const removeToken = () => {
  localStorage.removeItem("token");
};

export function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}
