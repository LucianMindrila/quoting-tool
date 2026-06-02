# Quoting Tool

Customer-facing web app for DT Solutions Ltd. Customers upload an Excel file containing panel sizes and edging details and receive a real-time project cost estimate.

**Live URL:** https://quoting-tool-dun.vercel.app/
**Repo:** https://github.com/LucianMindrila/quoting-tool

## Tech Stack

- **Framework:** Next.js 14, React 18
- **Deployment:** Vercel
- **Key libraries:**
  - `xlsx` — Excel file parsing
  - `jspdf` + `jspdf-autotable` — PDF export
  - `jszip` — ZIP file handling
  - `resend` / `nodemailer` — email sending
- **Language:** JavaScript (no TypeScript)

## Project Structure

```
app/
  page.jsx              Main page
  layout.jsx            Root layout
  api/send-order/       API route for emailing orders
  globals.css
components/
  CuttingRow.jsx        Individual panel row in the cutting table
  CuttingTable.jsx      Main table of panels
  DimModal.jsx          Modal for entering dimensions
  Header.jsx            App header
  MatPicker.jsx         Material selection component
  NestingDiagram.jsx    Visual nesting layout diagram
  QuotePanel.jsx        Quote summary / pricing panel
  Toast.jsx             Notification toasts
lib/
  constants.js          Pricing constants and material definitions
  fileImport.js         Excel file parsing logic
  optimizer.js          Panel nesting / cutting optimisation logic
  pdfExport.js          PDF generation logic
  csvExport.js          CSV export logic
public/
  Template-Master.xlsx  Excel template for customers to download and fill in
scripts/
  generate-template.mjs Script to regenerate the Excel template
tests/
  run.mjs               Test runner
```

## Running Locally

```bash
npm install
npm run dev
```

Open at http://localhost:3000

## Key Business Logic

- Customers download `Template-Master.xlsx`, fill in panel sizes and edging details, then upload it
- The app parses the Excel, runs a nesting/optimisation algorithm (`lib/optimizer.js`) to calculate material usage
- Pricing is driven by constants in `lib/constants.js` — this is where material costs and rates live
- Output: real-time quote displayed in `QuotePanel`, exportable as PDF

## About the Owner

Lucian Mindrila — owner of DT Solutions Ltd (manufacturing, Gloucester UK). Non-developer, business/product owner directing technical work. Discuss approach before starting significant changes.
