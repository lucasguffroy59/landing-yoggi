(function () {
  var BACKEND_EVENTS_URL = "https://yoggi-backend.up.railway.app/api/analytics/events";
  var LANDING_ANALYTICS_TOKEN = "d9ed57ddfdcea52954c96539f32a6a3edf36b05ce35b140b";

  function getAnonymousId() {
    var key = "yoggi_anonymous_id";
    var id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }
    return id;
  }

  function sendBackendEvent(eventName, properties) {
    try {
      fetch(BACKEND_EVENTS_URL, {
        method: "POST",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
          "X-App-Token": LANDING_ANALYTICS_TOKEN,
        },
        body: JSON.stringify({
          anonymousId: getAnonymousId(),
          eventName: eventName,
          properties: properties || {},
        }),
      }).catch(function () {});
    } catch (err) {}
  }

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

    var firstVisitKey = "yoggi_landing_first_visit_sent";
    if (!localStorage.getItem(firstVisitKey)) {
      sendBackendEvent("landing_first_visit", {});
      localStorage.setItem(firstVisitKey, "1");
    }
  });

  function reportStoreConversion(e, href) {
    if (typeof gtag !== "function") return;
    e.preventDefault();

    var navigated = false;
    function goToStore() {
      if (navigated) return;
      navigated = true;
      window.location = href;
    }

    gtag("event", "conversion", {
      send_to: "AW-18092979969/lS6PCKHWptAcEIHus7ND",
      value: 1.0,
      currency: "EUR",
      event_callback: goToStore,
    });

    setTimeout(goToStore, 400);
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest("a[href]");
    if (!link) return;

    var href = link.href;
    var loc = link.getAttribute("data-ga-loc") || "unknown";

    if (href.indexOf("apps.apple.com") !== -1) {
      fire("app_store_click_" + loc);
      sendBackendEvent("landing_store_click", { platform: "ios", loc: loc });
      reportStoreConversion(e, href);
    } else if (href.indexOf("play.google.com") !== -1) {
      fire("play_store_click_" + loc);
      sendBackendEvent("landing_store_click", { platform: "android", loc: loc });
      reportStoreConversion(e, href);
    }
  });
})();
