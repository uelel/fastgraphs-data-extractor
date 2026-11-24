const ext = chrome;

console.log("🧩 Popup script loaded");

let statusTimer;
function showStatus(text, type = "success") {
  const el = document.getElementById("status");
  el.textContent = text;
  el.className = `fg-status fg-status-${type} fg-status-visible`;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => el.classList.remove("fg-status-visible"), 3000);
}

ext.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === "FASTGRAPHS_SECURITY_INFO") {
    document.getElementById("securityName").textContent = msg.payload.name;
    document.getElementById("securityTicker").textContent = msg.payload.ticker;
    return;
  }

  if (msg.type === "FASTGRAPHS_ERROR") {
    showStatus(msg.payload, "error");
    return;
  }

  if (msg.type === "FASTGRAPHS_EPS_DATA") {
    const data = msg.payload;

    console.log("📊 Received EPS data:", data);

    if (!data.length) {
      showStatus("No EPS data found", "error");
      return;
    }

    // Convert to TSV format for Google Sheets
    const tsvData = data.map(row => `${row.date}\t${row.EPS}`).join("\n");

    await navigator.clipboard.writeText(tsvData);

    showStatus("EPS data copied to clipboard");
  }

  if (msg.type === "FASTGRAPHS_DIV_DATA") {
    const data = msg.payload;

    console.log("📊 Received Div data:", data);

    if (!data.length) {
      showStatus("No Dividends data found", "error");
      return;
    }

    // Convert to TSV format for Google Sheets
    const tsvData = data.map(row => `${row.date}\t${row.Div}`).join("\n");

    await navigator.clipboard.writeText(tsvData);

    showStatus("Dividends data copied to clipboard");
  }

  if (msg.type === "FASTGRAPHS_PAYOUT_RATIO_DATA") {
    const data = msg.payload;

    console.log("📊 Received Payout Ratio data:", data);

    if (!data.length) {
      showStatus("No Payout Ratio data found", "error");
      return;
    }

    // Convert to TSV format for Google Sheets
    const tsvData = data.map(row => `${row.date}\t${row.PayoutRatio}`).join("\n");

    await navigator.clipboard.writeText(tsvData);

    showStatus("Payout Ratio data copied to clipboard");
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await ext.tabs.query({ active: true, currentWindow: true });
  
  ext.tabs.sendMessage(tab.id, "GET_SECURITY_INFO");

  document.getElementById("extractEPS").addEventListener("click", async () => {
    const [tab] = await ext.tabs.query({
      active: true,
      currentWindow: true
    });

    ext.tabs.sendMessage(tab.id, "EXTRACT_EPS");
  });

  document.getElementById("extractDiv").addEventListener("click", async () => {
    const [tab] = await ext.tabs.query({
      active: true,
      currentWindow: true
    });

    ext.tabs.sendMessage(tab.id, "EXTRACT_DIV");
  });

  document.getElementById("extractPayoutRatio").addEventListener("click", async () => {
    const [tab] = await ext.tabs.query({
      active: true,
      currentWindow: true
    });

    ext.tabs.sendMessage(tab.id, "EXTRACT_PAYOUT_RATIO");
  });
});
