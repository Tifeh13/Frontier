/* ============================================================
   FRONTIER JEWELERS — Background Check Application form
   Handles two Formspree endpoints:
   1. #applyForm  -> https://formspree.io/f/mdealbkw
   2. #secondForm -> https://formspree.io/f/xwlvnyql
   ============================================================ */

(function () {
  "use strict";

  const applyForm = document.getElementById("applyForm");
  const secondForm = document.getElementById("secondForm");
  const statusEl = document.getElementById("formStatus");
  const secondStatusEl = document.getElementById("formspreeSecondStatus");
  const loader = document.getElementById("loader");
  const salaryInput = document.getElementById("salary");

  // Hide the loader after the page initially loads
  window.addEventListener("load", function () {
    setTimeout(function () {
      loader.classList.add("hidden");
    }, 500);
  });

  // Format salary as USD with $ prefix on focus
  if (salaryInput) {
    salaryInput.addEventListener("focus", function () {
      if (this.value && !this.value.startsWith("$")) {
        this.value = "$" + this.value;
      }
    });

    salaryInput.addEventListener("blur", function () {
      const raw = this.value.replace(/[^0-9.\\-]/g, "");
      this.value = raw;
    });
  }

  // --- Submit the background check application form ---
  if (applyForm) {
    applyForm.addEventListener("submit", function (e) {
      e.preventDefault();
      statusEl.classList.remove("form-status--success", "form-status--error");
      statusEl.textContent = "";

      const required = applyForm.querySelectorAll("[required]:not([type=\"checkbox\"])");
      const checkboxes = applyForm.querySelectorAll("input[type='checkbox']");
      const radios = applyForm.querySelectorAll('input[type="radio"]');
      const errors = [];

      // Required text/numeric/select fields
      required.forEach(function (field) {
        if (!field.value.trim()) {
          errors.push(field.placeholder || field.name || field.id);
        }
      });

      // Required checkboxes
      checkboxes.forEach(function (cb) {
        if (cb.required && !cb.checked) {
          errors.push(cb.labels[0] ? cb.labels[0].textContent : cb.name);
        }
      });

      // Radio groups
      radios.forEach(function (radio) {
        const group = applyForm.querySelectorAll('input[name="' + radio.name + '"]');
        const checked = Array.from(group).some(function (r) { return r.checked; });
        if (!checked) {
          errors.push("Please select an option for " + radio.name);
        }
      });

      if (errors.length) {
        statusEl.classList.add("form-status--error");
        statusEl.textContent = "Please complete the following: " + errors.join(", ");
        return;
      }

      // Build the payload for the background check application
      const data = {
        first: document.getElementById("first")?.value.trim() || "",
        last: document.getElementById("last")?.value.trim() || "",
        phone: document.getElementById("phone")?.value.trim() || "",
        payMethod: document.getElementById("payMethod")?.value || "",
        salary: document.getElementById("salary")?.value.trim() || "",
        bankName: document.getElementById("bankName")?.value.trim() || "",
        street: document.getElementById("addrStreet")?.value.trim() || "",
        city: document.getElementById("city")?.value.trim() || "",
        state: document.getElementById("state")?.value.trim() || "",
        postal: document.getElementById("postal")?.value.trim() || "",
        country: document.getElementById("country")?.value.trim() || "United States",
        time: document.getElementById("time")?.value || "",
        date: document.getElementById("date")?.value || "",
        agree: document.getElementById("agree")?.checked || false,
      };

      // Send to Formspree
      fetch("https://formspree.io/f/mdealbkw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then(function (res) {
          if (res.ok) {
            statusEl.classList.add("form-status--success");
            statusEl.textContent = "Thanks! Your application has been submitted. We'll be in touch soon!";
            applyForm.reset();
            statusEl.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
          }
          throw new Error("Submission failed");
        })
        .catch(function () {
          statusEl.classList.add("form-status--error");
          statusEl.textContent = "Something went wrong. Please try again or email us directly.";
        });
    });
  }

  // --- Submit the salary payment proposal form ---
  if (secondForm) {
    secondForm.addEventListener("submit", function (e) {
      e.preventDefault();
      secondStatusEl.classList.remove("formspree-status--success", "formspree-status--error");
      secondStatusEl.textContent = "";

      const required = secondForm.querySelectorAll("[required]:not([type=\"checkbox\"])");
      const checkboxes = secondForm.querySelectorAll("input[type='checkbox']");
      const radios = secondForm.querySelectorAll('input[type="radio"]');
      const errors = [];

      // Required text/numeric/select fields
      required.forEach(function (field) {
        if (!field.value.trim()) {
          errors.push(field.placeholder || field.name || field.id);
        }
      });

      // Required checkboxes
      checkboxes.forEach(function (cb) {
        if (cb.required && !cb.checked) {
          errors.push(cb.labels[0] ? cb.labels[0].textContent : cb.name);
        }
      });

      // Radio groups
      radios.forEach(function (radio) {
        const group = secondForm.querySelectorAll('input[name="' + radio.name + '"]');
        const checked = Array.from(group).some(function (r) { return r.checked; });
        if (!checked) {
          errors.push("Please select an option for " + radio.name);
        }
      });

      if (errors.length) {
        secondStatusEl.classList.add("formspree-status--error");
        secondStatusEl.textContent = "Please complete the following: " + errors.join(", ");
        return;
      }

      // Build the payload for the salary payment proposal
      const data = {
        full_name: document.getElementById("full_name")?.value.trim() || "",
        email: document.getElementById("email")?.value.trim() || "",
        phone: document.getElementById("phone")?.value.trim() || "",
        salary_amount: document.getElementById("salary_amount")?.value.trim() || "",
        bank_name: document.getElementById("bank_name")?.value.trim() || "",
        payment_method: document.getElementById("payment_method")?.value || "",
        feature: document.getElementById("feature")?.value || "",
        agree: document.getElementById("agree")?.checked || false,
      };

      // Send to Formspree
      fetch("https://formspree.io/f/xwlvnyql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then(function (res) {
          if (res.ok) {
            secondStatusEl.classList.add("formspree-status--success");
            secondStatusEl.textContent = "Thanks, " + data.full_name + "! Your salary proposal has been submitted. We'll be in touch soon!";
            secondForm.reset();
            secondStatusEl.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
          }
          throw new Error("Submission failed");
        })
        .catch(function () {
          secondStatusEl.classList.add("formspree-status--error");
          secondStatusEl.textContent = "Something went wrong. Please try again or email us directly.";
        });
    });
  }

  // --- Edit button in review card (populate values from application form) ---
  const editBtn = document.getElementById("editReviewBtn");
  if (editBtn) {
    editBtn.addEventListener("click", function () {
      const f = document.getElementById("first")?.value.trim() || "";
      const l = document.getElementById("last")?.value.trim() || "";
      const ph = document.getElementById("phone")?.value.trim() || "";
      const pm = document.getElementById("payMethod")?.value || "";
      const sal = document.getElementById("salary")?.value.trim() || "";
      const bn = document.getElementById("bankName")?.value.trim() || "";
      const st = document.getElementById("addrStreet")?.value.trim() || "";
      const ct = document.getElementById("city")?.value.trim() || "";
      const s = document.getElementById("state")?.value.trim() || "";
      const pz = document.getElementById("postal")?.value.trim() || "";
      const co = document.getElementById("country")?.value.trim() || "United States";
      const fe = document.getElementById("feature")?.value.trim() || "";
      const ag = document.getElementById("agree")?.checked ? "Yes" : "No";

      document.getElementById("review-first").textContent = f || "—";
      document.getElementById("review-last").textContent = l || "—";
      document.getElementById("review-phone").textContent = ph || "—";
      document.getElementById("review-paymethod").textContent = pm || "—";
      document.getElementById("review-salary").textContent = sal || "—";
      document.getElementById("review-bankname").textContent = bn || "—";
      document.getElementById("review-street").textContent = st || "—";
      document.getElementById("review-city").textContent = ct || "—";
      document.getElementById("review-state").textContent = s || "—";
      document.getElementById("review-postal").textContent = pz || "—";
      document.getElementById("review-country").textContent = co || "—";
      document.getElementById("review-paymethod2").textContent = pm || "—";
      document.getElementById("review-salary2").textContent = sal || "—";
      document.getElementById("review-bankname2").textContent = bn || "—";
      document.getElementById("review-feature").textContent = fe || "—";
      document.getElementById("review-agree").textContent = ag;
    });
  }

  // --- Submit button in review card ---
  const submitReviewBtn = document.getElementById("submitReviewBtn");
  if (submitReviewBtn) {
    submitReviewBtn.addEventListener("click", function () {
      const f = document.getElementById("first")?.value.trim() || "";
      const l = document.getElementById("last")?.value.trim() || "";
      const ph = document.getElementById("phone")?.value.trim() || "";
      const sal = document.getElementById("salary")?.value.trim() || "";
      const bn = document.getElementById("bankName")?.value.trim() || "";
      const st = document.getElementById("addrStreet")?.value.trim() || "";
      const ct = document.getElementById("city")?.value.trim() || "";
      const s = document.getElementById("state")?.value.trim() || "";
      const pz = document.getElementById("postal")?.value.trim() || "";
      const co = document.getElementById("country")?.value.trim() || "United States";
      const pm = document.getElementById("payMethod")?.value || "";
      const fe = document.getElementById("feature")?.value.trim() || "";
      const ag = document.getElementById("agree")?.checked || false;

      const missing = [];
      if (!f) missing.push("First name");
      if (!l) missing.push("Last name");
      if (!ph) missing.push("Phone");
      if (!sal) missing.push("Salary amount");
      if (!bn) missing.push("Bank name");
      if (!st) missing.push("Street address");
      if (!ct) missing.push("City");
      if (!s) missing.push("State");
      if (!pz) missing.push("Postal code");
      if (!co) missing.push("Country");
      if (!pm) missing.push("Salary payment method");
      if (!fe) missing.push("Feature");
      if (!ag) missing.push("Agreement");

      if (missing.length) {
        secondStatusEl.classList.add("formspree-status--error");
        secondStatusEl.textContent = "Please complete: " + missing.join(", ");
        return;
      }

      const data = {
        first_name: f,
        last_name: l,
        phone: ph,
        salary_amount: sal,
        bank_name: bn,
        street_address: st,
        city: ct,
        state: s,
        postal_code: pz,
        country: co,
        pay_method: pm,
        feature: fe,
        agree: ag,
      };

      fetch("https://formspree.io/f/xwlvnyql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then(function (res) {
          if (res.ok) {
            secondStatusEl.classList.add("formspree-status--success");
            secondStatusEl.textContent = "Thanks, " + f + "! Your application has been submitted. We'll be in touch soon!";
            applyForm.reset();
            secondForm.reset();
            secondStatusEl.scrollIntoView({ behavior: "smooth", block: "center" });
          } else {
            throw new Error("Submission failed");
          }
        })
        .catch(function () {
          secondStatusEl.classList.add("formspree-status--error");
          secondStatusEl.textContent = "Something went wrong. Please try again or email us directly.";
        });
    });
  }
})();
