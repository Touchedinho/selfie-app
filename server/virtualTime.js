// Modulo per gestire il tempo virtuale in modo centralizzato
let virtualTime = null;

function setVirtualTime(date) {
  virtualTime = date instanceof Date ? date : (date ? new Date(date) : null);
}

function getVirtualTime() {
  return virtualTime ? new Date(virtualTime) : new Date();
}

module.exports = {
  setVirtualTime,
  getVirtualTime,
};
