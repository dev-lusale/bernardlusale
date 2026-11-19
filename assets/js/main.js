/* Bernard Lusale — portfolio interactions. Vanilla JS, no dependencies. */
(function () {
  "use strict";

  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var cfg = window.PORTFOLIO_CONFIG || {};
  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }

  $$("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ---------- Opening sequence ---------- */
  var intro = $("#intro");
  var introDone = false;
  function ready() { root.classList.add("is-ready"); }
  function endIntro() {
    if (introDone) return;
    introDone = true;
    try { sessionStorage.setItem("bl-intro", "1"); } catch (e) { /* ignore */ }
    if (!intro || !root.classList.contains("intro-on")) { ready(); return; }
    intro.classList.add("is-leaving");
    ready();
    window.setTimeout(function () {
      root.classList.remove("intro-on");
      var main = $("#main");
      // keep focus sensible if the skip button had it
      if (doc.activeElement && intro.contains(doc.activeElement) && main) main.focus({ preventScroll: true });
    }, 800);
  }
  if (root.classList.contains("intro-on") && intro) {
    var skip = $("[data-intro-skip]", intro);
    if (skip) skip.addEventListener("click", endIntro);
    doc.addEventListener("keydown", function onKey(e) {
      if (e.key === "Escape") { endIntro(); doc.removeEventListener("keydown", onKey); }
    });
    window.setTimeout(endIntro, 2300);
  } else {
    // next frame so entrance transitions still run
    window.requestAnimationFrame(function () { window.requestAnimationFrame(ready); });
  }

  /* ---------- Scroll-driven bits (one rAF loop) ---------- */
  var header = $(".site-header");
  var bar = $("[data-progress]");
  var toTop = $("[data-to-top]");
  var band = $(".band-track");
  var depthEls = $$("[data-depth]");
  var timeline = $("[data-timeline]");
  var tlFill = $("[data-timeline-fill]");
  var tlItems = $$(".tl");
  if (toTop) toTop.hidden = false;

  function parallaxOn() { return !reduce.matches && window.innerWidth >= 900; }
  var ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight;
    var max = Math.max(1, doc.documentElement.scrollHeight - vh);
    if (bar) bar.style.setProperty("--p", Math.min(1, y / max).toFixed(4));
    if (header) header.classList.toggle("is-scrolled", y > 10);
    if (toTop) toTop.classList.toggle("is-on", y > vh * 1.2);

    if (band && !reduce.matches) {
      var r = band.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) band.style.setProperty("--band-x", (-(y * 0.35) % (band.scrollWidth / 3)).toFixed(1) + "px");
    }

    if (parallaxOn()) {
      depthEls.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        var center = rect.top + rect.height / 2 - vh / 2;
        var d = parseFloat(el.getAttribute("data-depth")) || 0;
        el.style.transform = "translate3d(0," + (center * d).toFixed(1) + "px,0)";
      });
    }

    if (timeline && tlFill) {
      var tr = timeline.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (vh * 0.6 - tr.top) / tr.height));
      tlFill.style.setProperty("--tp", p.toFixed(4));
      var mark = vh * 0.6;
      tlItems.forEach(function (li) { li.classList.toggle("is-passed", li.getBoundingClientRect().top < mark); });
    }
  }
  function onScroll() { if (!ticking) { ticking = true; window.requestAnimationFrame(frame); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    if (!parallaxOn()) depthEls.forEach(function (el) { el.style.transform = ""; });
    onScroll();
  });
  frame();

  if (toTop) toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduce.matches ? "auto" : "smooth" });
    var b = $(".brand"); if (b) b.focus({ preventScroll: true });
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$(".reveal");
  if (!("IntersectionObserver" in window) || reduce.matches) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    // stagger siblings that enter together
    var io = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (e) { return e.isIntersecting; });
      batch.forEach(function (e, i) {
        e.target.style.setProperty("--s", String(Math.min(i, 6)));
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Active nav ---------- */
  var navLinks = $$("[data-nav]");
  var ids = ["home", "about", "experience", "projects", "achievements", "research", "contact"];
  var secs = ids.map(function (id) { return doc.getElementById(id); }).filter(Boolean);
  function setActive(id) {
    navLinks.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + id;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  }
  if ("IntersectionObserver" in window) {
    var vis = {};
    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { vis[e.target.id] = e.isIntersecting ? e.intersectionRatio + 0.0001 : 0; });
      var best = null, br = 0;
      ids.forEach(function (id) { if ((vis[id] || 0) > br) { br = vis[id]; best = id; } });
      if (best) setActive(best);
    }, { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.01, 0.5, 1] });
    secs.forEach(function (s) { navIo.observe(s); });
    // the journey section sits between research and contact; treat it as research
    var jr = doc.getElementById("journey");
    if (jr) new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) setActive("research");
    }, { rootMargin: "-40% 0px -55% 0px" }).observe(jr);
  }

  /* ---------- Drawer ---------- */
  var drawer = $("#drawer"), openBtn = $("[data-menu-open]"), lastFocus = null;
  $$(".drawer-list li").forEach(function (li, i) { li.style.setProperty("--i", String(i)); });
  function focusables(el) { return $$('a[href], button:not([disabled])', el).filter(function (n) { return n.offsetParent !== null; }); }
  function openDrawer() {
    lastFocus = doc.activeElement;
    drawer.hidden = false;
    doc.body.classList.add("lock");
    openBtn.setAttribute("aria-expanded", "true");
    window.requestAnimationFrame(function () { drawer.classList.add("is-open"); var f = focusables(drawer); if (f.length) f[0].focus(); });
  }
  function closeDrawer(restore) {
    if (drawer.hidden) return;
    drawer.classList.remove("is-open");
    drawer.hidden = true;
    doc.body.classList.remove("lock");
    openBtn.setAttribute("aria-expanded", "false");
    if (restore !== false && lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (drawer && openBtn) {
    openBtn.addEventListener("click", openDrawer);
    $$("[data-menu-close]", drawer).forEach(function (b) { b.addEventListener("click", function () { closeDrawer(); }); });
    $$("a[href^='#']", drawer).forEach(function (a) { a.addEventListener("click", function () { closeDrawer(false); }); });
    drawer.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.preventDefault(); closeDrawer(); return; }
      if (e.key !== "Tab") return;
      var f = focusables(drawer); if (!f.length) return;
      if (e.shiftKey && doc.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && doc.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
    window.addEventListener("resize", function () { if (window.innerWidth >= 1180) closeDrawer(false); });
  }

  /* ---------- Project filter ---------- */
  var filters = $$("[data-filter]");
  var cards = $$(".proj");
  var fStatus = $("[data-filter-status]");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      filters.forEach(function (b) { var on = b === btn; b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); });
      var n = 0;
      cards.forEach(function (c) {
        var show = f === "all" || (" " + c.getAttribute("data-cat") + " ").indexOf(" " + f + " ") > -1;
        c.hidden = !show;
        c.classList.remove("is-entering");
        if (show) {
          c.style.setProperty("--n", String(n++));
          if (!reduce.matches) { void c.offsetWidth; c.classList.add("is-entering"); }
        }
      });
      if (fStatus) fStatus.textContent = n + (n === 1 ? " project" : " projects") + " shown";
    });
  });

  /* ---------- Project case-study dialog ---------- */
  var data = {};
  try { data = JSON.parse($("#project-data").textContent); } catch (e) { data = {}; }
  var modal = $("#project-modal");
  function fill(key) {
    var p = data[key]; if (!p || !modal) return false;
    function set(name, val) { var el = $('[data-pm="' + name + '"]', modal); if (el) el.textContent = val || ""; }
    set("title", p.title); set("status", p.status); set("problem", p.problem); set("solution", p.solution); set("contribution", p.contribution);
    set("techLabel", p.techLabel || "Technologies");
    var tech = $('[data-pm="tech"]', modal); tech.innerHTML = "";
    (p.tech || []).forEach(function (t) { var li = doc.createElement("li"); li.textContent = t; tech.appendChild(li); });
    $('[data-pm-wrap="tech"]', modal).hidden = !(p.tech && p.tech.length);
    var links = $('[data-pm="links"]', modal); links.innerHTML = "";
    (p.links || []).forEach(function (l) {
      var a = doc.createElement("a");
      a.className = "btn btn-solid btn-sm"; a.href = l.href; a.target = "_blank"; a.rel = "noopener";
      a.textContent = l.label;
      var s = doc.createElement("span"); s.className = "sr-only"; s.textContent = " (opens in a new tab)"; a.appendChild(s);
      links.appendChild(a);
    });
    return true;
  }
  $$("[data-project]").forEach(function (btn) {
    btn.setAttribute("aria-haspopup", "dialog");
    btn.addEventListener("click", function () {
      if (!fill(btn.getAttribute("data-project"))) return;
      if (typeof modal.showModal === "function") modal.showModal(); else modal.setAttribute("open", "");
      doc.body.classList.add("lock");
      var body = $(".modal-body", modal); if (body) body.scrollTop = 0;
    });
  });
  if (modal) {
    $$("[data-modal-close]", modal).forEach(function (b) { b.addEventListener("click", function () { modal.close(); }); });
    modal.addEventListener("click", function (e) { if (e.target === modal) modal.close(); });
    modal.addEventListener("close", function () { doc.body.classList.remove("lock"); });
  }

  /* ---------- Contact form ---------- */
  var form = $("#contact-form");
  if (form) {
    var summary = $("#form-summary"), status = $("#form-status"), submit = $("[data-submit]", form), label = $("[data-submit-label]", form);
    var note = $("[data-form-note]", form);
    if (cfg.formEndpoint && note) note.textContent = "Your message is sent directly to Bernard.";
    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var rules = {
      name: function (v) { return v.trim().length < 2 ? "Enter your name." : ""; },
      email: function (v) { return !v.trim() ? "Enter your email address." : (EMAIL.test(v.trim()) ? "" : "Enter an email address like name@example.com."); },
      message: function (v) { var n = v.trim().length; return !n ? "Write a message." : (n < 10 ? "Add a little more detail (at least 10 characters)." : ""); }
    };
    var fields = $$("[name]", form).filter(function (f) { return rules[f.name]; });
    function check(f) {
      var m = rules[f.name](f.value), err = doc.getElementById(f.id + "-err");
      if (err) err.textContent = m;
      f.setAttribute("aria-invalid", m ? "true" : "false");
      return m;
    }
    fields.forEach(function (f) {
      f.addEventListener("blur", function () { if (f.value) check(f); });
      f.addEventListener("input", function () { if (f.getAttribute("aria-invalid") === "true") check(f); });
    });
    function say(kind, title, text, linkHref, linkText) {
      status.className = "form-status" + (kind ? " is-" + kind : "");
      status.innerHTML = "";
      if (!kind) return;
      var s = doc.createElement("strong"); s.textContent = title; status.appendChild(s);
      var p = doc.createElement("p"); p.textContent = text; status.appendChild(p);
      if (linkHref) { var a = doc.createElement("a"); a.href = linkHref; a.textContent = linkText; status.appendChild(a); }
    }
    function loading(on) {
      submit.disabled = on; submit.classList.toggle("is-loading", on);
      form.setAttribute("aria-busy", on ? "true" : "false");
      label.textContent = on ? "Sending…" : "Send message";
    }
    function mailtoHref() {
      var topic = form.elements.topic.value;
      var subject = "Portfolio enquiry" + (topic ? ": " + topic : "") + " from " + form.elements.name.value.trim();
      var body = form.elements.message.value.trim() + "\n\n— " + form.elements.name.value.trim() + " (" + form.elements.email.value.trim() + ")";
      return "mailto:" + (cfg.email || "") + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      say(null);
      var errs = [];
      fields.forEach(function (f) { var m = check(f); if (m) errs.push({ f: f, m: m }); });
      if (errs.length) {
        summary.hidden = false; summary.innerHTML = "";
        var p = doc.createElement("p"); p.textContent = errs.length === 1 ? "Please fix 1 problem" : "Please fix " + errs.length + " problems";
        var ul = doc.createElement("ul");
        errs.forEach(function (x) {
          var li = doc.createElement("li"), a = doc.createElement("a");
          a.href = "#" + x.f.id; a.textContent = x.m;
          a.addEventListener("click", function (ev) { ev.preventDefault(); x.f.focus(); });
          li.appendChild(a); ul.appendChild(li);
        });
        summary.appendChild(p); summary.appendChild(ul); summary.focus();
        return;
      }
      summary.hidden = true;
      if (form.elements._gotcha && form.elements._gotcha.value) return;

      if (!cfg.formEndpoint) {
        var href = mailtoHref();
        window.location.href = href;
        say("ok", "Your email app should now be open",
          "Your message is ready to send from your own email account. It has not been sent yet: press Send in your email app. If nothing opened, use the link below or email " + cfg.email + " directly.",
          href, "Open the email again");
        return;
      }

      loading(true);
      var fd = new FormData(form);
      fd.append("_subject", "Portfolio enquiry from " + form.elements.name.value.trim());
      fetch(cfg.formEndpoint, { method: "POST", body: fd, headers: { Accept: "application/json" } })
        .then(function (res) {
          if (!res.ok) throw new Error("status " + res.status);
          form.reset();
          fields.forEach(function (f) { f.setAttribute("aria-invalid", "false"); });
          say("ok", "Message sent", "Thank you. Bernard has received your message and will reply by email.");
        })
        .catch(function () {
          say("err", "Your message could not be sent", "Please try again, or email directly instead. Your message is still in the form.",
            mailtoHref(), "Email " + cfg.email);
        })
        .then(function () { loading(false); });
    });
  }
})();
