const ext = typeof browser !== "undefined" ? browser : chrome;

console.log("🧩 FastGraphs extension script loaded on this page");

function extractEarningsPerShare() {
  console.log("extractEarningsPerShare() called");

  const data = [];

  document
    .querySelectorAll("div.highcharts-xaxis-labels span table.fg-axis")
    .forEach(table => {
      const rows = table.querySelectorAll("tr");
      if (rows.length !== 4) return;

      const date = rows[0].innerText.trim();
      if (!/^\d{2}\/\d{2}$/.test(date)) return;

      const EPS = rows[1].innerText.trim();
      
      if (/^\d+.\d+$/.test(EPS)) {
        data.push({ date, EPS });
      }
    });

  console.table(data);

  ext.runtime.sendMessage({
    type: "FASTGRAPHS_EPS_DATA",
    payload: data
  });
}

function extractDividendsPerShare() {
  console.log("extractDividendsPerShare() called");

  const data = [];

  document
    .querySelectorAll("div.highcharts-xaxis-labels span table.fg-axis")
    .forEach(table => {
      const rows = table.querySelectorAll("tr");
      if (rows.length !== 4) return;

      const date = rows[0].innerText.trim();
      if (!/^\d{2}\/\d{2}$/.test(date)) return;

      const Div = rows[3].innerText.trim();
      
      if (/^\d+.\d+$/.test(Div)) {
        data.push({ date, Div });
      }
    });

  console.table(data);

  ext.runtime.sendMessage({
    type: "FASTGRAPHS_DIV_DATA",
    payload: data
  });
}

function extractDividendPayoutRatio() {
  console.log("extractDividendPayoutRatio() called");

  const data = [];

  // Find the markers for series 6
  const markersGroup = document.querySelector(".summary-hist-body svg .highcharts-markers.highcharts-series-6");
  if (!markersGroup) {
    console.error("No .summary-hist-body svg .highcharts-markers.highcharts-series-6 element found");
    ext.runtime.sendMessage({
      type: "FASTGRAPHS_PAYOUT_RATIO_DATA",
      payload: data
    });
    return;
  }

  // Extract all children
  const children = markersGroup.children;
  console.log(`Found ${children.length} children in markers group`);

  Array.from(children).forEach((child, index) => {
    // simulate mouse hover over these elements and extract payout ratio
  });

  console.table(data);

  ext.runtime.sendMessage({
    type: "FASTGRAPHS_PAYOUT_RATIO_DATA",
    payload: data
  });
}

ext.runtime.onMessage.addListener((msg, sender) => {
  console.log("📨 Message received in content script:", msg, sender);

  if (msg === "EXTRACT_EPS") {
    extractEarningsPerShare();
  }

  if (msg === "EXTRACT_DIV") {
    extractDividendsPerShare();
  }

  if (msg === "EXTRACT_PAYOUT_RATIO") {
    extractDividendPayoutRatio();
  }
});
