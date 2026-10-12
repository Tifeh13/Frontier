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
})();
