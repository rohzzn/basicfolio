// Keeps the clocks ticking and the numbers fresh, without reloading the page.
(function () {
  function tick() {
    document.querySelectorAll('[data-tz]').forEach(function (el) {
      el.textContent = new Date().toLocaleTimeString('en-US', { timeZone: el.dataset.tz, hour: 'numeric', minute: '2-digit' });
    });
  }
  function refresh() {
    if (document.hidden) return;
    fetch(location.pathname, { cache: 'no-store' })
      .then(function (res) { return res.ok ? res.text() : null; })
      .then(function (html) {
        if (!html) return;
        var next = new DOMParser().parseFromString(html, 'text/html').getElementById('live');
        var now = document.getElementById('live');
        if (next && now) now.replaceWith(next);
        tick();
      })
      .catch(function () {});
  }
  tick();
  setInterval(tick, 15000);
  setInterval(refresh, 60000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) refresh(); });
})();
