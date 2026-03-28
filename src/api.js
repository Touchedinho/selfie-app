import axios from "axios";

// URL base per le API
const API_BASE = "http://site242528.tw.cs.unibo.it/api";

// Imposta il tempo virtuale (passa null o vuoto per resettare)
export const setVirtualTime = async (time) => {
  const response = await axios.post(`${API_BASE}/time-machine/set`, { time });
  return response.data;
};

// Ottieni l'orario virtuale/sistema corrente
export const getVirtualTime = async () => {
  const response = await axios.get(`${API_BASE}/time-machine/get`);
  return response.data.time;
};
