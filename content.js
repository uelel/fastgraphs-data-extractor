const ext = typeof browser !== "undefined" ? browser : chrome;

// selectors: "legacy" = app.fastgraphs.com, "modern" = www.fastgraphs.com
const SELECTORS = {
  legacy: {
    HISTORICAL_CHART: ".summary-hist-body",
    X_AXIS_LABELS: "div.highcharts-xaxis-labels span table.fg-axis",
    SECURITY_NAME: "div.comp_base-info span.mat-headline-1:nth-of-type(1)",
    SECURITY_TICKER: "div.comp_base-info span.mat-headline-1:nth-of-type(2)",
  },
  modern: {
    HISTORICAL_CHART: ".historical-chart",
    X_AXIS_LABELS: "div.highcharts-xaxis-labels span table.historical-chart__axis-label",
    SECURITY_NAME: "h1.security-header__title-text",
  },
};

console.log("🧩 FastGraphs extension script loaded on this page");

// Detected on every call: both frontends are SPAs that render late.
function isModernFrontend() {
  return (
    document.querySelector(SELECTORS.modern.HISTORICAL_CHART) !== null ||
    document.querySelector(SELECTORS.modern.SECURITY_NAME) !== null
  );
}

function getSelectors() {
  return isModernFrontend() ? SELECTORS.modern : SELECTORS.legacy;
}

function extractSecurityInfo() {
  let name = "";
  let ticker = "";

  if (isModernFrontend()) {
    const text = document.querySelector(SELECTORS.modern.SECURITY_NAME)?.innerText.trim() ?? "";
    const match = text.match(/^(.*?)\s*\(([^()]+)\)\s*$/);
    if (match) {
      name = match[1];
      ticker = match[2].trim();
    } else {
      name = text;
    }
  } else {
    name = document.querySelector(SELECTORS.legacy.SECURITY_NAME)?.innerText.trim() ?? "";
    ticker = document.querySelector(SELECTORS.legacy.SECURITY_TICKER)?.innerText.trim() ?? "";
  }

  ext.runtime.sendMessage({ type: "FASTGRAPHS_SECURITY_INFO", payload: { name, ticker } });
}

function isHistoricalChartPresent() {
  return document.querySelector(getSelectors().HISTORICAL_CHART) !== null;
}

// Returns { date, rows } for each valid 4-row x-axis label table
function getAxisRows() {
  const { HISTORICAL_CHART, X_AXIS_LABELS } = getSelectors();
  const result = [];

  document
    .querySelectorAll(`${HISTORICAL_CHART} ${X_AXIS_LABELS}`)
    .forEach(table => {
      const rows = table.querySelectorAll("tr");
      if (rows.length !== 4) return;

      const date = rows[0].innerText.trim();
      if (!/^\d{1,2}\/\d{2}$/.test(date)) return;

      result.push({ date, rows });
    });

  return result;
}

function getEarningsPerShareData() {
  const data = [];

  getAxisRows().forEach(({ date, rows }) => {
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

  getAxisRows().forEach(({ date, rows }) => {
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
