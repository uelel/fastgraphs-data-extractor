const ext = typeof browser !== "undefined" ? browser : chrome;

// selectors
const HISTORICAL_CHART = ".summary-hist-body";
const X_AXIS_LABELS = "div.highcharts-xaxis-labels span table.fg-axis";
const SECURITY_NAME = "div.comp_base-info span.mat-headline-1:nth-of-type(1)";
const SECURITY_TICKER = "div.comp_base-info span.mat-headline-1:nth-of-type(2)";

console.log("🧩 FastGraphs extension script loaded on this page");

function extractSecurityInfo() {
  const name = document.querySelector(SECURITY_NAME)?.innerText.trim() ?? "";
  const ticker = document.querySelector(SECURITY_TICKER)?.innerText.trim() ?? "";
  ext.runtime.sendMessage({ type: "FASTGRAPHS_SECURITY_INFO", payload: { name, ticker } });
}

function isHistoricalChartPresent() {
  return document.querySelector(HISTORICAL_CHART) !== null;
}

function getEarningsPerShareData() {
  const data = [];

  document
    .querySelectorAll(`${HISTORICAL_CHART} ${X_AXIS_LABELS}`)
    .forEach(table => {
      const rows = table.querySelectorAll("tr");
      if (rows.length !== 4) return;

      const date = rows[0].innerText.trim();
      if (!/^\d{1,2}\/\d{2}$/.test(date)) return;

      const EPS = rows[1].innerText.trim();
      
      if (/^\d+.\d+$/.test(EPS)) {
        data.push({ date, EPS: parseFloat(EPS) });
      }
    });

  return data;
}

function extractEarningsPerShare() {
  console.log("extractEarningsPerShare() called");

  const data = getEarningsPerShareData();

  console.table(data);

  ext.runtime.sendMessage({
    type: "FASTGRAPHS_EPS_DATA",
    payload: data
  });
}

function getDividendsPerShareData() {
  const data = [];

  document
    .querySelectorAll(`${HISTORICAL_CHART} ${X_AXIS_LABELS}`)
    .forEach(table => {
      const rows = table.querySelectorAll("tr");
      if (rows.length !== 4) return;

      const date = rows[0].innerText.trim();
      if (!/^\d{1,2}\/\d{2}$/.test(date)) return;

      const Div = rows[3].innerText.trim();
      
      if (/^\d+.\d+$/.test(Div)) {
        data.push({ date, Div: parseFloat(Div) });
      }
    });

  return data;
}

function extractDividendsPerShare() {
  console.log("extractDividendsPerShare() called");

  const data = getDividendsPerShareData();

  console.table(data);

  ext.runtime.sendMessage({
    type: "FASTGRAPHS_DIV_DATA",
    payload: data
  });
}

function extractDividendPayoutRatio() {
  console.log("extractDividendPayoutRatio() called");

  const epsData = getEarningsPerShareData();
  const divData = getDividendsPerShareData();

  // Create a map of EPS by date for quick lookup
  const epsMap = new Map(epsData.map(item => [item.date, item.EPS]));

  // Calculate payout ratio for dates where both EPS and Div exist
  const data = [];
  divData.forEach(item => {
    const eps = epsMap.get(item.date);
    if (eps !== undefined && eps !== 0) {
      const PayoutRatio = (item.Div / eps).toFixed(3);
      data.push({ date: item.date, PayoutRatio });
    }
  });

  console.table(data);

  ext.runtime.sendMessage({
    type: "FASTGRAPHS_PAYOUT_RATIO_DATA",
    payload: data
  });
}

ext.runtime.onMessage.addListener((msg, sender) => {
  console.log("📨 Message received in content script:", msg, sender);

  if (msg === "GET_SECURITY_INFO") {
    extractSecurityInfo();
    return;
  }

  if (!isHistoricalChartPresent()) {
    ext.runtime.sendMessage({
      type: "FASTGRAPHS_ERROR",
      payload: "No historical graph was found. Make sure a security page is opened in your browser."
    });
    return;
  }

  if (msg === "EXTRACT_EPS") extractEarningsPerShare();
  if (msg === "EXTRACT_DIV") extractDividendsPerShare();
  if (msg === "EXTRACT_PAYOUT_RATIO") extractDividendPayoutRatio();
});
