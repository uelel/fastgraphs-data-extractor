# FastGraphs Data Extractor

A simple Chrome extension that lets you copy financial data from FastGraphs.com directly to your clipboard. It extracts following data from the historical chart on the security summary pages:

- **Earnings Per Share (EPS)**: historical EPS for all available dates
- **Dividends Per Share**: historical dividend payments for all available dates
- **Dividend Payout Ratio**: calculated from EPS and dividends data

The output is **tab-separated plain text**, ready to paste directly into Google Sheets or Excel with no reformatting.

---

## 🛠️ Requirements

- Google Chrome or any Chromium-based browser
- **Active subscription to [FastGraphs.com](https://www.fastgraphs.com)**. The extension only works when you are logged in and the chart data is rendered on the page

---

## ⚙️ Installation

The extension is not published on the Chrome Web Store. Install it manually in developer mode:

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked** and select the cloned folder
5. The extension icon will appear in your toolbar

---

## ⚡ Usage

1. Log in to [app.fastgraphs.com](https://app.fastgraphs.com) with your subscription
2. Open a stock page and wait for the chart to fully load
3. Click the extension icon in the toolbar
4. Click the button for the data you want to extract.
5. The data is copied to your clipboard. Paste it into a spreadsheet.

---

## ⚠️ Disclaimer

**Subscription required.** This extension requires an active, paid FastGraphs subscription. It does not bypass, circumvent, or replicate any access controls. It only reads data that is already rendered in your browser after you have authenticated.

**Personal use only.** This tool is intended for personal research and analysis. The data extracted from FastGraphs belongs to FastGraphs and its data providers. Do not redistribute, republish, or use the extracted data for commercial purposes.

**No affiliation.** This project is an independent, open-source tool and is not affiliated with, endorsed by, or associated with FastGraphs or EDMP Inc. in any way.

---

## 📝 License

This project is licensed under the MIT License. Feel free to use, modify, and share!

Got ideas or want to contribute? Open an issue or submit a pull request!
