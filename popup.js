const ext = typeof browser !== "undefined" ? browser : chrome;

console.log("🧩 Popup script loaded");

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("run").addEventListener("click", async () => {
    try {
      const tabs = await ext.tabs.query({
        active: true,
        currentWindow: true
      });

      if (!tabs.length) {
        console.error("❌ No active tab");
        return;
      }

      ext.tabs.sendMessage(tabs[0].id, "EXTRACT_FASTGRAPHS");
      console.log("📤 Message sent to tab", tabs[0].id);
    } catch (e) {
      console.error("❌ Popup error:", e);
    }
  });
});
