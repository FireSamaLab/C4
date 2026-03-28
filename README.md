# C4 Construction Estimator (MVP)

Simple full-stack MVP to estimate framing wood quantities and rough cost for a rectangular new house.

## Tech stack
- Node.js
- Express
- HTML/CSS
- Vanilla JavaScript
- Local JSON storage

## Install and run
1. Install dependencies:
   npm install
2. Start server:
   npm start
3. Open:
   http://localhost:3000

## MVP flow
1. Create project (optionally upload a plan file)
2. Enter project assumptions
3. Maintain lumber/material prices
4. Generate estimate and review results

## Notes
- This is an approximate framing estimator, not a structural engineering tool.
- Storage is local JSON in the `data` folder.
- Uploaded plan files are stored in `uploads`.
- Built to be easy to extend later (example: AI plan reading).
