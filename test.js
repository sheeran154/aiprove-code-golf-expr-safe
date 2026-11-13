// Test suite for code-golf-expr entries.
// Tests BOTH index.js (eval-based entry) and parser.js (eval-free fallback)
// against the public cases, hand-written edge cases, and a generated
// randomized case file (random-cases.json, expected values computed
// independently by Python's arithmetic evaluator).
// Usage: node test.js [path-to-random-cases.json]
'use strict';
const fs = require('fs');
const path = require('path');

const impls = {
  'index.js (entry, pure eval)': require('./index.js').evalExpr,
  'safe.js (hedge, sanitized eval)': require('./safe.js').evalExpr,
  'parser.js (fallback, no eval)': require('./parser.js').evalExpr,
};

const publicCases = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../challenge-repo/challenges/code-golf-expr/cases.json'), 'utf8')
);

// Hand-written edge cases with literal expected values.
const edgeCases = [
  { in: '100', out: 100 },
  { in: '0', out: 0 },
  { in: '0.5', out: 0.5 },
  { in: '.5+.5', out: 1 },
  { in: '5.', out: 5 },
  { in: '-5+3', out: -2 },
  { in: '2*-3', out: -6 },
  { in: '2--3', out: 5 },
  { in: '-(1+2)', out: -3 },
  { in: '+5', out: 5 },
  { in: ' 1 + 2 * 3 ', out: 7 },
  { in: '1+2*3-4/2', out: 5 },
  { in: '(((((7)))))', out: 7 },
  { in: '2*(3+(4-1))', out: 12 },
  { in: '10/4', out: 2.5 },
  { in: '1/3', out: 1 / 3 },
  { in: '0.1+0.2', out: 0.1 + 0.2 },
  { in: '999*999', out: 998001 },
  { in: '1+2+3+4+5+6+7+8+9+10', out: 55 },
  { in: '100/10/2', out: 5 },
  { in: '2*3/4', out: 1.5 },
  { in: '7-3-2', out: 2 },
  { in: '20-4*3', out: 8 },
  { in: '(20-4)*3', out: 48 },
  { in: '3.14159*2', out: 6.28318 },
  { in: '1e3', out: 1000 },
  { in: '123456789*2', out: 246913578 },
  { in: '5/2*2', out: 5 },
  { in: '(1)', out: 1 },
  { in: '((1+2)*(3+4))', out: 21 },
  { in: '10-2*3+1', out: 5 },
  { in: '8/2/2', out: 2 },
  { in: '2.5*4', out: 10 },
  { in: '0.3*3', out: 0.9 },
];

function close(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') return false;
  if (Number.isNaN(a) && Number.isNaN(b)) return true;
  if (!isFinite(a) || !isFinite(b)) return a === b;
  return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
}

let grandTotal = { pass: 0, fail: 0 };

for (const [name, fn] of Object.entries(impls)) {
  let pass = 0, fail = 0;
  const failures = [];
  const run = (expr, expected, label) => {
    let got;
    try { got = fn(expr); } catch (e) { got = 'THREW: ' + e.message; }
    if (close(got, expected)) pass++;
    else { fail++; if (failures.length < 10) failures.push({ expr, expected, got, label }); }
  };
  for (const c of publicCases) run(c.in, c.out, 'public');
  for (const c of edgeCases) run(c.in, c.out, 'edge');
  const randPath = process.argv[2] || path.join(__dirname, 'random-cases.json');
  if (fs.existsSync(randPath)) {
    const rand = JSON.parse(fs.readFileSync(randPath, 'utf8'));
    for (const c of rand) run(c.in, c.out, 'random');
    console.log(`  random cases loaded: ${rand.length}`);
  }
  console.log(`${name}: PASS ${pass}  FAIL ${fail}`);
  for (const f of failures) console.log('   FAIL', JSON.stringify(f));
  grandTotal.pass += pass; grandTotal.fail += fail;
}

console.log(`TOTAL: PASS ${grandTotal.pass}  FAIL ${grandTotal.fail}`);
process.exit(grandTotal.fail ? 1 : 0);
