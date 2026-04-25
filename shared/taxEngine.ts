/**
 * Tax Engine for 2025-26 fiscal year
 * Supports both New and Old Tax Regimes
 * Includes Section 80CCD(2) NPS benefits
 */

export interface TaxCalculationInput {
  annualIncome: number;
  npsContribution: number; // Section 80CCD(2) - 10% of gross salary, max ₹50,000
  otherDeductions: number; // Other 80C deductions (LIC, PPF, etc.)
  age: number; // For senior citizen benefits
}

export interface TaxCalculationResult {
  annualIncome: number;
  newRegimeTax: number;
  oldRegimeTax: number;
  recommendedRegime: "New" | "Old";
  savings: number;
  standardDeduction: number;
  npsDeduction: number;
  totalDeductions: number;
  taxableIncomeNew: number;
  taxableIncomeOld: number;
  breakdown: {
    newRegime: TaxBracketBreakdown;
    oldRegime: TaxBracketBreakdown;
  };
}

export interface TaxBracketBreakdown {
  brackets: Array<{
    range: string;
    rate: number;
    tax: number;
  }>;
  surcharge: number;
  healthAndEducationCess: number;
  totalTax: number;
}

// 2025-26 Tax Slabs - New Regime
const NEW_REGIME_SLABS = [
  { min: 0, max: 400000, rate: 0 },
  { min: 400000, max: 800000, rate: 0.05 },
  { min: 800000, max: 1200000, rate: 0.1 },
  { min: 1200000, max: 1600000, rate: 0.15 },
  { min: 1600000, max: 2000000, rate: 0.2 },
  { min: 2000000, max: 2400000, rate: 0.25 },
  { min: 2400000, max: Infinity, rate: 0.3 },
];

// 2025-26 Tax Slabs - Old Regime
const OLD_REGIME_SLABS = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 0.05 },
  { min: 500000, max: 1000000, rate: 0.2 },
  { min: 1000000, max: Infinity, rate: 0.3 },
];

// Standard Deduction (2025-26)
const STANDARD_DEDUCTION = 75000; // Increased from 50,000

// Section 80CCD(2) NPS Deduction Limit
const NPS_DEDUCTION_LIMIT = 50000;

// Section 80C Deduction Limit (includes LIC, PPF, ELSS, etc.)
const SECTION_80C_LIMIT = 150000;

/**
 * Calculate tax for New Regime
 */
function calculateNewRegimeTax(taxableIncome: number, age: number): TaxBracketBreakdown {
  let tax = 0;
  const brackets: Array<{ range: string; rate: number; tax: number }> = [];

  for (const slab of NEW_REGIME_SLABS) {
    if (taxableIncome > slab.min) {
      const incomeInBracket = Math.min(taxableIncome, slab.max) - slab.min;
      const bracketTax = incomeInBracket * slab.rate;
      tax += bracketTax;

      brackets.push({
        range: `₹${slab.min.toLocaleString("en-IN")} - ₹${slab.max === Infinity ? "∞" : slab.max.toLocaleString("en-IN")}`,
        rate: slab.rate * 100,
        tax: bracketTax,
      });
    }
  }

  // Surcharge (2% for income above ₹50 lakhs in new regime)
  let surcharge = 0;
  if (taxableIncome > 5000000) {
    surcharge = tax * 0.02;
  }

  // Health and Education Cess (4%)
  const healthAndEducationCess = (tax + surcharge) * 0.04;

  const totalTax = tax + surcharge + healthAndEducationCess;

  return {
    brackets,
    surcharge,
    healthAndEducationCess,
    totalTax,
  };
}

/**
 * Calculate tax for Old Regime
 */
function calculateOldRegimeTax(taxableIncome: number, age: number): TaxBracketBreakdown {
  let tax = 0;
  const brackets: Array<{ range: string; rate: number; tax: number }> = [];

  // Senior citizen (60+) gets additional deduction of ₹50,000
  const seniorCitizenDeduction = age >= 60 ? 50000 : 0;
  const adjustedIncome = Math.max(0, taxableIncome - seniorCitizenDeduction);

  for (const slab of OLD_REGIME_SLABS) {
    if (adjustedIncome > slab.min) {
      const incomeInBracket = Math.min(adjustedIncome, slab.max) - slab.min;
      const bracketTax = incomeInBracket * slab.rate;
      tax += bracketTax;

      brackets.push({
        range: `₹${slab.min.toLocaleString("en-IN")} - ₹${slab.max === Infinity ? "∞" : slab.max.toLocaleString("en-IN")}`,
        rate: slab.rate * 100,
        tax: bracketTax,
      });
    }
  }

  // Surcharge (15% for income above ₹1 crore in old regime)
  let surcharge = 0;
  if (adjustedIncome > 10000000) {
    surcharge = tax * 0.15;
  }

  // Health and Education Cess (4%)
  const healthAndEducationCess = (tax + surcharge) * 0.04;

  const totalTax = tax + surcharge + healthAndEducationCess;

  return {
    brackets,
    surcharge,
    healthAndEducationCess,
    totalTax,
  };
}

/**
 * Main tax calculation function
 */
export function calculateTax(input: TaxCalculationInput): TaxCalculationResult {
  const {
    annualIncome,
    npsContribution,
    otherDeductions,
    age = 30,
  } = input;

  // Validate NPS contribution (max 10% of gross salary, capped at ₹50,000)
  const maxNpsContribution = Math.min(annualIncome * 0.1, NPS_DEDUCTION_LIMIT);
  const validNpsContribution = Math.min(npsContribution, maxNpsContribution);

  // Calculate deductions for Old Regime
  const section80CDeduction = Math.min(otherDeductions, SECTION_80C_LIMIT);
  const totalDeductionsOldRegime = STANDARD_DEDUCTION + validNpsContribution + section80CDeduction;

  // New Regime: Only standard deduction applies, no other deductions
  const totalDeductionsNewRegime = STANDARD_DEDUCTION;

  // Calculate taxable income
  const taxableIncomeOld = Math.max(0, annualIncome - totalDeductionsOldRegime);
  const taxableIncomeNew = Math.max(0, annualIncome - totalDeductionsNewRegime);

  // Calculate tax for both regimes
  const oldRegimeBreakdown = calculateOldRegimeTax(taxableIncomeOld, age);
  const newRegimeBreakdown = calculateNewRegimeTax(taxableIncomeNew, age);

  // Determine recommended regime
  const recommendedRegime = oldRegimeBreakdown.totalTax < newRegimeBreakdown.totalTax ? "Old" : "New";
  const savings = Math.abs(oldRegimeBreakdown.totalTax - newRegimeBreakdown.totalTax);

  return {
    annualIncome,
    newRegimeTax: newRegimeBreakdown.totalTax,
    oldRegimeTax: oldRegimeBreakdown.totalTax,
    recommendedRegime,
    savings,
    standardDeduction: STANDARD_DEDUCTION,
    npsDeduction: validNpsContribution,
    totalDeductions: Math.max(totalDeductionsOldRegime, totalDeductionsNewRegime),
    taxableIncomeNew,
    taxableIncomeOld,
    breakdown: {
      newRegime: newRegimeBreakdown,
      oldRegime: oldRegimeBreakdown,
    },
  };
}

/**
 * Get tax filing deadline for current financial year
 */
export function getTaxFilingDeadline(): Date {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // Check if we're in the current FY (April to March)
  const isCurrentFY = today.getMonth() >= 3; // April (3) onwards
  const fyYear = isCurrentFY ? currentYear + 1 : currentYear;
  
  // Deadline is July 31st of the following year
  return new Date(fyYear, 6, 31); // Month is 0-indexed, so 6 = July
}

/**
 * Format tax result for display
 */
export function formatTaxResult(result: TaxCalculationResult): string {
  return `
Tax Calculation Summary (2025-26)
================================
Annual Income: ₹${result.annualIncome.toLocaleString("en-IN")}

Recommended Regime: ${result.recommendedRegime}
Tax Liability: ₹${(result.recommendedRegime === "New" ? result.newRegimeTax : result.oldRegimeTax).toLocaleString("en-IN")}
Potential Savings: ₹${result.savings.toLocaleString("en-IN")}

New Regime Tax: ₹${result.newRegimeTax.toLocaleString("en-IN")}
Old Regime Tax: ₹${result.oldRegimeTax.toLocaleString("en-IN")}

Deductions Applied:
- Standard Deduction: ₹${result.standardDeduction.toLocaleString("en-IN")}
- NPS Contribution (80CCD(2)): ₹${result.npsDeduction.toLocaleString("en-IN")}
  `;
}
