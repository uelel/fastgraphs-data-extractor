const ext = chrome;

console.log("🧩 Popup script loaded");

ext.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === "FASTGRAPHS_DATA") {
    const data = msg.payload;

    console.log("📊 Received data:", data);

    if (!data.length) {
      alert("No data found");
      return;
    }

    await navigator.clipboard.writeText(
      JSON.stringify(data, null, 2)
    );

    alert("EPS & Div data copied to clipboard");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("run").addEventListener("click", async () => {
    const [tab] = await ext.tabs.query({
      active: true,
      currentWindow: true
    });

    ext.tabs.sendMessage(tab.id, "EXTRACT_FASTGRAPHS");
  });
});
