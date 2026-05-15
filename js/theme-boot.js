/* Apply saved theme before first paint to avoid flash. */
(function () {
  try {
    var t = localStorage.getItem("bayan-theme");
    if (t === "dark" || t === "light") document.documentElement.setAttribute("data-theme", t);
  } catch (e) {}
})();
