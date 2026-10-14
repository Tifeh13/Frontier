# FRONTIER JEWELERS

FRONTIER JEWELERS — background check application & collaboration proposal (USA) page.

## Files
- `public/index.html` — Main page (hero, collaboration proposal letter, proposal, application, review)
- `public/styles.css` — Styles (navy/blue + orange palette, fully responsive)
- `public/app.js` — Form handling, validation & Formspree submission
- `public/logo.png` — Brand logo

## Sections (in order)
1. Hero — collaboration proposal introduction
2. Collaboration proposal letter (responsibilities + payment terms)
3. Salary payment proposal form (step 1)
4. Application form (step 2)
5. Review & final submission (step 3)
6. Contact + footer

## Formspree endpoints
- Salary payment proposal — `https://formspree.io/f/xwlvnyql`
- Application form — `https://formspree.io/f/mdealbkw`

Both forms collect the **same full detail set**, so either one on its own is a
complete submission. Each posts to its own endpoint with its own payload keys.

## Running locally
```bash
npx serve public
# or
npm start
```

## Form fields (identical on both forms)
Required (submission is blocked until every one is filled — 17 per form):
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

The review step (step 3) shows the details from whichever form was completed
and submits them to the proposal endpoint.

## Deployment
Push to GitHub and deploy to your hosting platform.
