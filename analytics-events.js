(function () {
  function fire(eventName) {
    if (typeof gtag === "function") {
      gtag("event", eventName);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var pageId = document.body.getAttribute("data-ga-page");
    if (pageId) {
      fire("page_view_" + pageId);
    }
  });

  function reportStoreConversion(e, href) {
    if (typeof gtag !== "function") return;
    e.preventDefault();
    gtag("event", "conversion", {
      send_to: "AW-18092979969/lt92CP3XuqscEIHus7ND",
      value: 1.0,
      currency: "EUR",
      event_callback: function () {
        window.location = href;
      },
    });
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest("a[href]");
    if (!link) return;

    var href = link.href;
    var loc = link.getAttribute("data-ga-loc") || "unknown";

    if (href.indexOf("apps.apple.com") !== -1) {
      fire("app_store_click_" + loc);
      reportStoreConversion(e, href);
    } else if (href.indexOf("play.google.com") !== -1) {
      fire("play_store_click_" + loc);
      reportStoreConversion(e, href);
    }
  });
})();
