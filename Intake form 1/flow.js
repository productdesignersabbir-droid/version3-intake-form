/* Braevon intake — shared flow script.
   Every screen is its own static HTML file, exported without interaction. This
   one script, loaded by all of them, puts the behaviour back: picking answers,
   follow-up boxes, validation, Continue / Back, and moving from file to file in
   order. Answers are kept in sessionStorage so later screens (state name,
   checkout details, upsell pack) can echo them. */
(function () {
  var SCREENS = [
    "01-goals", "02-social-proof-92", "03-testimonials", "04-eligibility",
    "05-state-availability", "06-doctor-intro", "07-erection-confidence",
    "08-morning-erections", "09-performance-factors", "10-prior-ed-medication",
    "11-treatment-side-effects-conditional", "12-last-use-conditional",
    "13-physical-exam", "14-conditions-surgeries", "15-current-medications",
    "16-allergies", "17-medicines", "18-recreational-drugs", "19-diagnoses",
    "20-curve-peyronie-s", "21-tight-foreskin", "22-conditions",
    "23-cardiovascular-symptoms", "24-cardiovascular-risk-factors",
    "25-blood-pressure", "26-other-health-concerns", "27-anything-else",
    "28-patient-info", "29-consent", "30-processing-product-reveal",
    "31-onset-chart", "32-preference-stat", "33-medical-review", "34-checkout",
    "35-upsell", "36-order-confirmed"
  ];
  /* Screens that only appear for certain answers: number -> [group, values]. */
  var CONDITIONAL = {
    11: ["ed-meds", ["yes"]],
    12: ["ed-meds", ["yes"]]
  };

  /* A screen's place is its position in SCREENS, not the number in its file
     name, so a step can be slotted in or taken out without renaming the
     checkout and breaking links to it. data-skip-last counts positions too. */
  var file = decodeURIComponent(location.pathname.split("/").pop());
  var m = file.match(/^braevon-screen-(.+)\.html$/);
  if (!m) return;
  var current = SCREENS.indexOf(m[1]) + 1;
  if (!current) return;

  /* ---------------------------------------------------------------- store */
  var KEY = "braevon-intake";
  function load() {
    try { return JSON.parse(sessionStorage.getItem(KEY)) || {}; } catch (_) { return {}; }
  }
  var store = load();
  function save() {
    try { sessionStorage.setItem(KEY, JSON.stringify(store)); } catch (_) {}
  }
  store.answers = store.answers || {};
  store.fields = store.fields || {};
  var answers = store.answers;

  function urlFor(n) {
    return "braevon-screen-" + SCREENS[n - 1] + ".html";
  }
  function shown(n) {
    var c = CONDITIONAL[n];
    if (!c) return true;
    var have = answers[c[0]] || [];
    return c[1].some(function (v) { return have.indexOf(v) > -1; });
  }
  function go(n) {
    save();
    location.href = urlFor(n);
  }
  function next() {
    for (var n = current + 1; n <= SCREENS.length; n++) {
      if (shown(n)) return go(n);
    }
  }
  function back() {
    for (var n = current - 1; n >= 1; n--) {
      if (shown(n)) return go(n);
    }
  }

  var $$ = function (sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); };
  var isCheckout = !!document.querySelector("[data-checkout]");

  /* ----------------------------------------------------- email suggestion */
  /* A mistyped address ("name@gmail.codsa") gets a "Did you mean …?" row under
     the field, on every email input of the flow (patient info and checkout).
     It is an offer, not an error: it never blocks Continue, "Use it" writes the
     correction into the field, and the × puts it away for that address. */
  /* Providers whose name alone says what the domain should be. `multi` ones
     also live on country domains (yahoo.co.uk), which are left alone. */
  var MAIL = {
    gmail: "gmail.com", googlemail: "googlemail.com", icloud: "icloud.com", aol: "aol.com",
    msn: "msn.com", ymail: "ymail.com", rocketmail: "rocketmail.com", protonmail: "protonmail.com",
    sbcglobal: "sbcglobal.net",
    bellsouth: "bellsouth.net", earthlink: "earthlink.net", optonline: "optonline.net",
    yahoo: "yahoo.com", hotmail: "hotmail.com", outlook: "outlook.com"
  };
  var MAIL_MULTI = { yahoo: 1, hotmail: 1, outlook: 1 };
  var MAIL_COUNTRY = ["co.uk", "ca", "fr", "de", "es", "it", "nl", "be", "se", "dk", "no", "ie", "ch", "at",
    "pt", "gr", "in", "co.in", "co.jp", "com.au", "co.nz", "com.br", "com.mx", "com.ar", "com.sg", "co.za"];
  /* Real names that sit one or two letters from a provider above: never "corrected". */
  var MAIL_OWN = ["mail", "email", "gmx", "live", "me", "mac", "att", "cox", "proton", "pm", "hey", "zoho"];
  var TLDS = ["com", "net", "org", "edu"];
  var TLD_REAL = ["cam", "new", "nec", "bet", "pet", "vet"];

  function editDistance(a, b) {
    var row = [], i, j, prev, tmp;
    for (j = 0; j <= b.length; j++) row[j] = j;
    for (i = 1; i <= a.length; i++) {
      prev = row[0]; row[0] = i;
      for (j = 1; j <= b.length; j++) {
        tmp = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1));
        prev = tmp;
      }
    }
    return row[b.length];
  }
  function suggestEmail(value) {
    var v = String(value).trim(), at = v.lastIndexOf("@");
    if (at < 1 || at === v.length - 1 || /\s/.test(v)) return null;
    var local = v.slice(0, at), domain = v.slice(at + 1).toLowerCase().replace(/\.+$/, "");
    var dot = domain.indexOf(".");
    var name = dot < 0 ? domain : domain.slice(0, dot), rest = dot < 0 ? "" : domain.slice(dot + 1);
    var fixed = null, provider = MAIL[name] ? name : null;
    if (!provider && MAIL_OWN.indexOf(name) < 0) {
      /* "gmial", "hotmal": one slip on a short name, two on a longer one. */
      var best = 3;
      Object.keys(MAIL).forEach(function (p) {
        var d = editDistance(name, p);
        if (d < best && d <= (p.length > 4 ? 2 : 1)) { best = d; provider = p; }
      });
    }
    if (provider) {
      fixed = MAIL_MULTI[provider] && MAIL_COUNTRY.indexOf(rest) > -1 ? provider + "." + rest : MAIL[provider];
    } else if (rest) {
      /* Any other domain: only an ending that is plainly a slip of .com/.net/.org/.edu. */
      var cut = rest.lastIndexOf("."), tld = rest.slice(cut + 1), to = null;
      if (tld === "cm" || tld === "om") to = "com";
      else if (tld.length > 2 && TLDS.indexOf(tld) < 0 && TLD_REAL.indexOf(tld) < 0) {
        TLDS.forEach(function (t) { if (!to && editDistance(tld, t) === 1) to = t; });
      }
      if (to) fixed = name + "." + rest.slice(0, cut + 1) + to;
    }
    return fixed && fixed !== domain ? local + "@" + fixed : null;
  }
  function emailSuggestions() {
    var css = document.createElement("style");
    css.textContent =
      ".em-sug{display:flex;align-items:center;gap:12px;margin:8px 0 0;padding:9px 12px 9px 14px;" +
      "border:1.5px solid var(--ink,#171D2C);border-radius:8px;background:#E9ECF1;" +
      "font-size:14px;line-height:1.35;color:var(--ink,#171D2C);text-align:left}" +
      ".em-sug[hidden]{display:none}" +
      ".em-sug span{flex:1;min-width:0;overflow-wrap:anywhere}.em-sug b{font-weight:700}" +
      ".em-sug button{flex:none;margin:0;padding:0;border:0;background:none;font:inherit;color:inherit;cursor:pointer}" +
      ".em-sug-use{font-weight:700;text-decoration:underline;text-underline-offset:2px}" +
      ".em-sug-x{width:24px;height:24px;font-size:20px;line-height:1;color:var(--muted,#4B5568)}" +
      ".em-sug button:focus-visible{outline:2px solid var(--accent,#E6430D);outline-offset:2px;border-radius:4px}";
    document.head.appendChild(css);

    function rowFor(input) {
      var row = input.parentNode.querySelector(".em-sug");
      if (row) return row;
      row = document.createElement("div");
      row.className = "em-sug"; row.hidden = true;
      row.setAttribute("role", "status");
      row.innerHTML = '<span>Did you mean <b></b>?</span>' +
        '<button type="button" class="em-sug-use">Use it</button>' +
        '<button type="button" class="em-sug-x" aria-label="Dismiss suggestion">&times;</button>';
      input.insertAdjacentElement("afterend", row);
      return row;
    }
    function check(input) {
      var s = suggestEmail(input.value), row = rowFor(input);
      if (!s || input.dataset.sugNo === input.value.trim()) { row.hidden = true; return; }
      row.querySelector("b").textContent = s;
      row.hidden = false;
    }
    /* Offered once the address is finished (leaving the field), then kept in
       step with further typing; never while the first attempt is mid-word. */
    document.addEventListener("focusout", function (e) {
      if (e.target.matches && e.target.matches('input[type="email"]')) check(e.target);
    });
    document.addEventListener("input", function (e) {
      if (!e.target.matches || !e.target.matches('input[type="email"]')) return;
      var row = e.target.parentNode.querySelector(".em-sug");
      if (row && !row.hidden) check(e.target);
    });
    /* mousedown is held back so the field keeps focus and the row does not
       re-run its check under the pointer. */
    document.addEventListener("mousedown", function (e) {
      if (e.target.closest && e.target.closest(".em-sug button")) e.preventDefault();
    });
    document.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest(".em-sug button");
      if (!b) return;
      var row = b.parentNode, input = row.previousElementSibling;
      if (b.className === "em-sug-use") {
        input.value = row.querySelector("b").textContent;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      } else {
        input.dataset.sugNo = input.value.trim();
      }
      row.hidden = true;
      input.focus();
    });
  }
  emailSuggestions();

  /* ------------------------------------------------------------- checkout */
  /* The checkout ships its own script. Only its exits are rewired here, in the
     capture phase so its own "Checkout" handler (which would show an
     end-of-assessment overlay) never runs. */
  if (isCheckout) {
    document.addEventListener("click", function (e) {
      if (e.target.closest(".cta-next")) {
        /* "Checkout" takes the reader up to where Shipping Information starts. */
        e.stopPropagation(); e.preventDefault();
        var ship = document.getElementById("ck_email");
        var form = ship && ship.closest(".ck-form");
        if (form) form.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (e.target.closest(".ck-continue")) {
        /* The payment form's Continue completes checkout and moves on. */
        e.stopPropagation(); e.preventDefault();
        next();
      } else if (e.target.closest(".back-btn")) {
        e.stopPropagation(); e.preventDefault();
        back();
      } else {
        var pack = e.target.closest(".ck-pack");
        if (pack) { store.pack = pack.dataset.pack; save(); setTimeout(function () { syncShotSave(); renderDiscount(); }, 0); }
      }
    }, true);
    document.addEventListener("input", function (e) {
      if (e.target.id) { store.fields[e.target.id] = e.target.value; save(); }
    });
    /* Unticking "Billing is same as shipping" opens the billing address fields. */
    /* Read more / Read less on the authorization-hold note under Continue. */
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-hold-toggle]");
      if (!t) return;
      var open = t.getAttribute("aria-expanded") !== "true";
      t.setAttribute("aria-expanded", String(open));
      document.getElementById(t.getAttribute("aria-controls")).hidden = !open;
      t.querySelector("span").textContent = open ? "Read less" : "Read more";
    });
    document.addEventListener("change", function (e) {
      if (!e.target.matches("[data-billing-same]")) return;
      $$("[data-billing]").forEach(function (b) { b.hidden = e.target.checked; });
    });
    document.addEventListener("DOMContentLoaded", fillCheckout);
    if (document.readyState !== "loading") fillCheckout();
    window.addEventListener("resize", fitHeadline);
    if (document.fonts) document.fonts.ready.then(fitHeadline);
    return;
  }
  /* ------------------------------------------------ 25% off offer popup */
  /* Ten seconds after the checkout opens, a "Take 25% off" popup appears
     (once per visit, and never again once claimed). Claiming it knocks 25% off
     every price on the page; the original is kept, struck through, beside it. */
  function money(n) { return "$" + n.toFixed(2); }
  function priceOf(str) { return parseFloat(String(str).replace(/[^\d.]/g, "")) || 0; }
  function renderDiscount() {
    var picked = document.querySelector(".ck-pack.selected");
    if (store.discount) {
      $$(".ck-pack[data-price]").forEach(function (p) {
        if (!p.dataset.fullPrice) p.dataset.fullPrice = p.dataset.price;
        p.dataset.price = money(priceOf(p.dataset.fullPrice) * 0.75);
      });
      if (picked) {
        $$("[data-pack-price]").forEach(function (el) {
          el.innerHTML = '<s class="ck-was">' + picked.dataset.fullPrice + "</s> " + picked.dataset.price;
        });
      }
    }
    /* "Prescriptions start at just …" follows the pack that is selected, at
       the price it is being sold for right now (discount included). */
    if (picked) {
      $$(".ck-ready-strip b").forEach(function (el) { el.textContent = picked.dataset.price; });
    }
  }
  function scheduleOffer() {
    if (store.discount || scheduleOffer.done) return;
    scheduleOffer.done = true;
    setTimeout(showOffer, 10000);
  }
  function showOffer() {
    if (store.discount || document.querySelector(".ck-offer")) return;
    var wrap = document.createElement("div");
    wrap.className = "ck-offer";
    wrap.innerHTML =
      '<div class="ck-offer-card" role="dialog" aria-modal="true" aria-labelledby="ckOfferTitle">' +
        '<button class="ck-offer-x" type="button" aria-label="Close">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        "</button>" +
        '<h2 id="ckOfferTitle">Take <span>25% off</span></h2>' +
        "<p>You\u2019re clicks away from a better sex life.<br>Let\u2019s do this.</p>" +
        '<button class="cta ck-offer-claim" type="button">Claim My Offer</button>' +
        '<small>*First-time customers only</small>' +
      "</div>";
    document.body.appendChild(wrap);
    requestAnimationFrame(function () { wrap.classList.add("on"); });
    function close() {
      wrap.classList.remove("on");
      document.removeEventListener("keydown", onKey);
      setTimeout(function () { wrap.remove(); }, 200);
    }
    function onKey(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", onKey);
    wrap.addEventListener("click", function (e) {
      if (e.target === wrap || e.target.closest(".ck-offer-x")) return close();
      if (e.target.closest(".ck-offer-claim")) {
        store.discount = 25; save();
        renderDiscount();
        close();
        /* The reader stays where they were: prices update in place rather than
           the page jumping to the product card (2026-09-18). */
      }
    });
    var claim = wrap.querySelector(".ck-offer-claim");
    if (claim) claim.focus({ preventScroll: true });
  }

  /* The round "SAVE 33%" tag on the product image belongs to the packs that
     carry a saving (`data-save`): the 12 pack, and the 18 pack's 42%. */
  function syncShotSave() {
    var picked = document.querySelector(".ck-pack.selected");
    var pct = picked && picked.dataset.save;
    $$("[data-shot-save]").forEach(function (t) {
      t.hidden = !pct;
      if (pct) t.innerHTML = "SAVE<br>" + pct + "%";
    });
  }
  /* The checkout headline leads with the patient's name and holds to two
     lines: it steps down 1px at a time until it fits. */
  function fitHeadline() {
    var h = document.querySelector(".ck-h1");
    if (!h) return;
    h.style.fontSize = "";
    var size = parseFloat(getComputedStyle(h).fontSize);
    function lines() {
      return Math.round(h.getBoundingClientRect().height / parseFloat(getComputedStyle(h).lineHeight));
    }
    while (lines() > 2 && size > 18) { size -= 1; h.style.fontSize = size + "px"; }
  }
  function fillCheckout() {
    /* The pack is chosen here, and only here. One picked earlier in the session
       is selected again through its own button, so the product card follows as
       on a click. */
    packBar();
    var mine = store.pack && document.querySelector('.ck-packs .ck-pack[data-pack="' + store.pack + '"]');
    if (mine && !mine.classList.contains("selected")) mine.click();
    var f = store.fields;
    var name = [f.firstName, f.lastName].filter(Boolean).join(" ");
    [["ck_email", f.email], ["ck_phone", f.phone], ["ck_state", f.state], ["ck_name", name]]
      .forEach(function (p) {
        var el = document.getElementById(p[0]);
        if (el && p[1] && !el.value) el.value = p[1];
      });
    if (f.firstName) {
      $$("[data-fname-echo]").forEach(function (e) { e.textContent = f.firstName.trim() + "’s"; });
    }
    fitHeadline();
    syncShotSave();
    renderDiscount();
    scheduleOffer();
    var picked = document.querySelector(".ck-pack.selected");
    if (picked && !store.pack) { store.pack = picked.dataset.pack; save(); }
  }

  /* ------------------------------------------------------------ restoring */
  function restore() {
    $$(".opts[data-group], .tiles[data-group]").forEach(function (box) {
      var g = box.dataset.group, items = $$(".opt, .tile", box);
      if (answers[g]) {
        items.forEach(function (o) {
          o.classList.toggle("selected", answers[g].indexOf(o.dataset.value) > -1);
        });
      } else {
        var pre = items.filter(function (o) { return o.classList.contains("selected"); })
                       .map(function (o) { return o.dataset.value; });
        if (pre.length) answers[g] = pre;
      }
    });
    $$("input[id], select[id], textarea[id]").forEach(function (f) {
      if (store.fields[f.id] !== undefined) f.value = store.fields[f.id];
    });
    $$("[data-consent]").forEach(function (c, i) {
      var k = "consent-" + current + "-" + i;
      if (store.fields[k] !== undefined) c.classList.toggle("on", store.fields[k]);
    });
    $$("[data-state-name]").forEach(function (e) {
      if (store.fields.state) e.textContent = store.fields.state;
    });
    /* The medical review reads back earlier answers: each [data-echo] names an
       answer group and carries its value -> label map in data-labels. */
    $$("[data-echo]").forEach(function (e) {
      var picked = answers[e.dataset.echo] || [], labels = {};
      try { labels = JSON.parse(e.dataset.labels || "{}"); } catch (_) {}
      var text = picked.map(function (v) { return labels[v] || v; }).join(", ");
      if (text) e.textContent = text;
    });
    save();
  }

  /* ------------------------------------------------------------- reveals */
  function syncReveals() {
    $$(".reveal[data-reveal-for]").forEach(function (r) {
      var picked = answers[r.dataset.revealFor] || [];
      var on = r.dataset.revealOn, none = r.dataset.revealNone || "none";
      var open = on === "*"
        ? picked.some(function (v) { return v !== none; })
        : picked.indexOf(on) > -1;
      r.classList.toggle("open", open);
    });
  }

  /* ------------------------------------------------------ blood pressure */
  var sysEl = document.querySelector("[data-bp-sys]");
  var diaEl = document.querySelector("[data-bp-dia]");
  function bpLead(manual) {
    $$("[data-bp-lead]").forEach(function (s) {
      s.hidden = s.dataset.bpLead !== (manual ? "manual" : "est");
    });
  }
  function checkBP() {
    var warn = document.querySelector("[data-bp-warning]");
    if (!warn || !sysEl) return;
    var s = +sysEl.value || 0, d = +diaEl.value || 0;
    warn.classList.toggle("open", s >= 160 || d >= 100 || (s > 0 && s < 90) || (d > 0 && d < 50));
  }
  function setBP(s, d) {
    if (!sysEl) return;
    sysEl.value = s; diaEl.value = d;
    store.fields.bpSys = s; store.fields.bpDia = d;
    bpLead(false); checkBP();
  }
  function syncBPOptOut() {
    var out = (answers["bp-taken"] || []).indexOf("no") > -1;
    $$('.opts[data-group="bp"], .bp, .bp-lead, .bp-sub').forEach(function (el) {
      el.classList.toggle("off", out);
    });
    $$(".fieldset-label").forEach(function (el) {
      if (el.nextElementSibling && el.nextElementSibling.classList.contains("bp-sub")) el.classList.toggle("off", out);
    });
  }

  /* --------------------------------------------------------- validation */
  function problems() {
    var bad = [];
    var bpOut = (answers["bp-taken"] || []).indexOf("no") > -1;
    $$(".opts[data-group], .tiles[data-group]").forEach(function (box) {
      if (box.hasAttribute("data-optional")) return;
      var rev = box.closest(".reveal");
      if (rev && !rev.classList.contains("open")) return;
      if (bpOut && box.dataset.group === "bp") return;
      if (!box.querySelector(".selected") && !(box.dataset.group === "bp" && sysEl && sysEl.value && diaEl.value)) {
        bad.push([box, "Please select an option to continue."]);
      }
    });
    $$(".reveal.open[data-reveal-for]").forEach(function (r) {
      $$("textarea", r).forEach(function (t) {
        if (!t.value.trim()) bad.push([t.closest(".field") || r, r.dataset.err || "This field is required."]);
      });
    });
    $$(".fields .field").forEach(function (fld) {
      if (fld.closest(".reveal")) return;
      $$("input, select, textarea", fld).forEach(function (f) {
        var v = f.value.trim(), why = null;
        if (!v) why = "This field is required.";
        else if (f.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v)) why = "Enter a valid email address.";
        else if (f.type === "tel" && v.replace(/\D/g, "").length < 10) why = "Enter a valid phone number.";
        /* 40 to 180 kg, in the pounds the field asks for. */
        else if (f.id === "weight" && !(+v >= 88 && +v <= 397)) why = "Enter a weight between 88 and 397 lbs.";
        if (why) bad.push([fld, why]);
      });
    });
    $$("[data-consent-required]").forEach(function (c) {
      if (!c.classList.contains("on")) bad.push([c, c.dataset.err || "Please agree to continue."]);
    });
    return bad;
  }
  function clearErrors() {
    $$(".err[data-flow]").forEach(function (e) { e.remove(); });
    $$(".consent.invalid").forEach(function (c) { c.classList.remove("invalid"); });
  }
  function showErrors(bad) {
    clearErrors();
    bad.forEach(function (b) {
      var el = b[0];
      if (el.matches("[data-consent]")) el.classList.add("invalid");
      var p = document.createElement("p");
      p.className = "err"; p.setAttribute("data-flow", ""); p.textContent = b[1];
      if (el.classList.contains("field")) el.appendChild(p);
      else el.insertAdjacentElement("afterend", p);
    });
    var first = bad[0][0];
    first.scrollIntoView({ block: "center", behavior: "smooth" });
    var step = document.querySelector(".step");
    if (step && step.animate) {
      step.animate([{ transform: "translateX(0)" }, { transform: "translateX(-5px)" },
                    { transform: "translateX(5px)" }, { transform: "translateX(0)" }], { duration: 220 });
    }
  }
  function advance() {
    var bad = problems();
    if (bad.length) return showErrors(bad);
    next();
  }

  /* -------------------------------------------------------------- clicks */
  document.addEventListener("click", function (e) {
    var t = e.target;

    var skip = t.closest("[data-skip-last]");
    if (skip) return go(+skip.dataset.skipLast);

    if (t.closest(".back-btn")) return back();

    if (t.closest("[data-finish]")) return next();

    if (t.closest(".cta-next")) return advance();

    var head = t.closest(".acc-head");
    if (head) { head.closest(".acc").classList.toggle("open"); return; }

    var consent = t.closest("[data-consent]");
    if (consent) {
      consent.classList.toggle("on");
      var i = $$("[data-consent]").indexOf(consent);
      store.fields["consent-" + current + "-" + i] = consent.classList.contains("on");
      save(); clearErrors();
      return;
    }

    var opt = t.closest(".opt, .tile");
    var box = opt && opt.closest("[data-group]");
    if (!box) return;
    var g = box.dataset.group, multi = box.dataset.mode === "multi";
    var items = $$(".opt, .tile", box);
    if (!multi) {
      items.forEach(function (o) { o.classList.toggle("selected", o === opt); });
    } else {
      var on = !opt.classList.contains("selected");
      opt.classList.toggle("selected", on);
      if (on) {
        items.forEach(function (o) {
          if (o === opt) return;
          if (opt.dataset.exclusive || o.dataset.exclusive) o.classList.remove("selected");
        });
      }
    }
    answers[g] = items.filter(function (o) { return o.classList.contains("selected"); })
                      .map(function (o) { return o.dataset.value; });
    if (opt.dataset.sys) setBP(opt.dataset.sys, opt.dataset.dia);
    if (g === "bp-taken") syncBPOptOut();
    save(); syncReveals(); clearErrors();

    /* Answering a single-choice question moves on by itself, as the live
       intake does — unless it opened a follow-up, or the screen still needs
       something else (blood pressure always waits for Continue). */
    var selected = opt.classList.contains("selected");
    if (opt.classList.contains("opt") && selected && (!multi || opt.dataset.exclusive) &&
        !sysEl && !document.querySelector(".reveal.open[data-reveal-for]") && !problems().length) {
      var here = current;
      setTimeout(function () { if (here === current) next(); }, 160);
    }
  });

  /* -------------------------------------------------------------- typing */
  function remember(e) {
    var f = e.target;
    if (f === sysEl || f === diaEl) {
      f.value = f.value.replace(/\D/g, "");
      $$('.opts[data-group="bp"] .opt').forEach(function (o) { o.classList.remove("selected"); });
      answers.bp = ["manual"];
      store.fields.bpSys = sysEl.value; store.fields.bpDia = diaEl.value;
      bpLead(true); checkBP(); save();
      return;
    }
    /* Weight is whole pounds: digits only, three at most. */
    if (f.id === "weight") f.value = f.value.replace(/\D/g, "").slice(0, 3);
    if (f.id) { store.fields[f.id] = f.value; save(); }
    var fld = f.closest(".field");
    if (fld) $$(".err[data-flow]", fld).forEach(function (x) { x.remove(); });
  }
  document.addEventListener("input", remember);
  document.addEventListener("change", remember);

  /* ---------------------------------------------------------- countdowns */
  function countdowns() {
    var els = $$("[data-countdown]");
    if (!els.length) return;
    var parts = els[0].textContent.split(":");
    var left = (+parts[0] || 0) * 60 + (+parts[1] || 0);
    setInterval(function () {
      if (left <= 0) return;
      left--;
      var t = Math.floor(left / 60) + ":" + ("0" + (left % 60)).slice(-2);
      els.forEach(function (e) { e.textContent = t; });
    }, 1000);
  }

  /* -------------------------------------------------------------- upsell */
  function upsell() {
    var tier = store.pack && document.querySelector('[data-up-offer][data-pack="' + store.pack + '"]');
    if (!tier) return;
    var d = tier.dataset;
    var set = function (sel, v) { $$(sel).forEach(function (e) { e.textContent = v; }); };
    set("[data-up-pack]", d.pack);
    set("[data-up-n]", d.n);
    set("[data-up-save]", d.save);
    set("[data-up-save2]", (+d.save).toFixed(2));
    set("[data-up-price]", d.price);
    set("[data-up-retail]", Math.round(+d.retail));
    set("[data-up-retail2]", d.retail);
    set("[data-up-nowsave]", d.nowsave);
  }

  /* -------------------------------------------- pack versions (checkout) */
  /* TEMPORARY, for client review (see the pack versions rules in the
     checkout): two buttons across the top of screen 34 switch between the
     original 6 / 12 pack offer ("2", the default) and the version that adds an
     18 pack ("3", `html.ck-v3`). Delete once one is chosen. */
  function packVersion(v) {
    var three = v === "3";
    document.documentElement.classList.toggle("ck-v3", three);
    $$(".opt-bar button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.packs === v)); });
    store.packs = v;
    /* The 18 pack does not exist in the original version: fall back to the 6. */
    if (!three && store.pack === "18") {
      var six = document.querySelector('.ck-packs .ck-pack[data-pack="6"]');
      store.pack = "6";
      if (six) six.click();
    }
    save();
  }
  function packBar() {
    if (!document.querySelector(".ck-packs") || document.querySelector(".opt-bar")) return;
    var bar = document.createElement("div");
    bar.className = "opt-bar";
    bar.innerHTML = '<button type="button" data-packs="2">6 / 12 Pack</button>' +
      '<button type="button" data-packs="3">6 / 12 / 18 Pack</button>';
    document.body.insertBefore(bar, document.body.firstChild);
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-packs]");
      if (b) { e.stopPropagation(); packVersion(b.dataset.packs); }
    });
    packVersion((location.search.match(/[?&]packs=([23])/) || [])[1] || store.packs || "2");
  }

  function init() {
    restore();
    if (sysEl) {
      if (store.fields.bpSys) { sysEl.value = store.fields.bpSys; diaEl.value = store.fields.bpDia; bpLead(answers.bp && answers.bp[0] === "manual"); checkBP(); }
      else {
        var pre = document.querySelector('.opts[data-group="bp"] .opt.selected');
        if (pre) setBP(pre.dataset.sys, pre.dataset.dia);
      }
      syncBPOptOut();
    }
    syncReveals();
    countdowns();
    upsell();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
