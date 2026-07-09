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

  document.addEventListener("click", function (e) {
    var link = e.target.closest("a[href]");
    if (!link) return;

    var href = link.href;
    var loc = link.getAttribute("data-ga-loc") || "unknown";

    if (href.indexOf("apps.apple.com") !== -1) {
      fire("app_store_click_" + loc);
    } else if (href.indexOf("play.google.com") !== -1) {
      fire("play_store_click_" + loc);
    }
  });
})();
