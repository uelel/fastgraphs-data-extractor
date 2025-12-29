const ext = typeof browser !== "undefined" ? browser : chrome;

console.log("🧩 FastGraphs extension script loaded on this page");

function extractFastGraphsData() {
  console.log("🚀 extractFastGraphsData() called");

  const data = [];

  document
    .querySelectorAll("div.highcharts-xaxis-labels span table.fg-axis")
    .forEach(table => {
      const rows = table.querySelectorAll("tr");
      if (rows.length !== 4) return;

      const date = rows[0].innerText.trim();
      if (!/^\d{2}\/\d{2}$/.test(date)) return;

      const EPS = rows[1].innerText.trim();
      const Div = rows[3].innerText.trim();

      data.push({ date, EPS, Div });
    });

  console.table(data);

  if (data.length) {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    console.log("✅ Data copied to clipboard");
  } else {
    console.warn("❌ No data extracted");
  }
}

ext.runtime.onMessage.addListener((msg, sender) => {
  console.log("📨 Message received in content script:", msg, sender);

  if (msg === "EXTRACT_FASTGRAPHS") {
    extractFastGraphsData();
  }
});
