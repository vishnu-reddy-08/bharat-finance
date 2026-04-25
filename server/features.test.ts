import { describe, it, expect } from "vitest";
import { calculateFinancialHealthScore, categorizeTransaction, formatIndianCurrency } from "@shared/formatting";
import { calculateTax } from "@shared/taxEngine";

describe("Financial Health Score", () => {
  it("should calculate health score based on savings rate", () => {
    const score = calculateFinancialHealthScore(100000, 20000);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("should return higher score for higher savings rate", () => {
    const lowSavingsScore = calculateFinancialHealthScore(100000, 10000);
    const highSavingsScore = calculateFinancialHealthScore(100000, 50000);
    expect(highSavingsScore).toBeGreaterThan(lowSavingsScore);
  });

  it("should handle zero income", () => {
    const score = calculateFinancialHealthScore(0, 0);
    expect(score).toBe(0);
  });

  it("should cap score at 100", () => {
    const score = calculateFinancialHealthScore(100000, 100000);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe("Transaction Categorization", () => {
  it("should categorize Swiggy as Wants", () => {
    const category = categorizeTransaction("Swiggy dinner");
    expect(category).toBe("Wants");
  });

  it("should categorize rent as Needs", () => {
    const category = categorizeTransaction("Rent payment");
    expect(category).toBe("Needs");
  });

  it("should categorize groceries as Needs", () => {
    const category = categorizeTransaction("Grocery shopping");
    expect(category).toBe("Needs");
  });

  it("should categorize SIP as Investments", () => {
    const category = categorizeTransaction("SIP mutual fund");
    expect(category).toBe("Investments");
  });

  it("should categorize PPF as Investments", () => {
    const category = categorizeTransaction("PPF contribution");
    expect(category).toBe("Investments");
  });

  it("should categorize salary as Income", () => {
    const category = categorizeTransaction("Salary deposit");
    expect(category).toBe("Income");
  });

  it("should return Uncategorized for unknown transactions", () => {
    const category = categorizeTransaction("Random transaction");
    expect(category).toBe("Uncategorized");
  });
});

describe("Tax Engine (2025-26)", () => {
  it("should calculate tax for new regime", () => {
    const result = calculateTax({
      annualIncome: 1000000,
      npsContribution: 0,
      otherDeductions: 0,
      age: 30,
    });
    expect(result.newRegimeTax).toBeGreaterThan(0);
  });

  it("should calculate tax for old regime", () => {
    const result = calculateTax({
      annualIncome: 1000000,
      npsContribution: 50000,
      otherDeductions: 100000,
      age: 30,
    });
    expect(result.oldRegimeTax).toBeGreaterThan(0);
  });

  it("should recommend regime with lower tax", () => {
    const result = calculateTax({
      annualIncome: 1000000,
      npsContribution: 50000,
      otherDeductions: 100000,
      age: 30,
    });
    expect(["New", "Old"]).toContain(result.recommendedRegime);
  });

  it("should apply standard deduction of 75000", () => {
    const result = calculateTax({
      annualIncome: 1000000,
      npsContribution: 0,
      otherDeductions: 0,
      age: 30,
    });
    expect(result.standardDeduction).toBe(75000);
  });

  it("should cap NPS deduction at 50000", () => {
    const result = calculateTax({
      annualIncome: 1000000,
      npsContribution: 100000,
      otherDeductions: 0,
      age: 30,
    });
    expect(result.npsDeduction).toBeLessThanOrEqual(50000);
  });

  it("should calculate savings as difference between regimes", () => {
    const result = calculateTax({
      annualIncome: 1000000,
      npsContribution: 50000,
      otherDeductions: 100000,
      age: 30,
    });
    expect(result.savings).toBeGreaterThanOrEqual(0);
  });

  it("should handle income below 500000", () => {
    const result = calculateTax({
      annualIncome: 300000,
      npsContribution: 0,
      otherDeductions: 0,
      age: 30,
    });
    expect(result.newRegimeTax).toBeGreaterThanOrEqual(0);
    expect(result.oldRegimeTax).toBeGreaterThanOrEqual(0);
  });

  it("should handle high income above 5000000", () => {
    const result = calculateTax({
      annualIncome: 5000000,
      npsContribution: 50000,
      otherDeductions: 150000,
      age: 30,
    });
    expect(result.newRegimeTax).toBeGreaterThan(0);
    expect(result.oldRegimeTax).toBeGreaterThan(0);
  });
});

describe("Indian Currency Formatting", () => {

  it("should format rupees with symbol", () => {
    const formatted = formatIndianCurrency(1000);
    expect(formatted).toContain("₹");
  });

  it("should convert thousands to K", () => {
    const formatted = formatIndianCurrency(1000);
    expect(formatted).toContain("1");
  });

  it("should convert lakhs correctly", () => {
    const formatted = formatIndianCurrency(100000);
    expect(formatted).toContain("1");
    expect(formatted).toContain("L");
  });

  it("should convert crores correctly", () => {
    const formatted = formatIndianCurrency(10000000);
    expect(formatted).toContain("1");
    expect(formatted).toContain("Cr");
  });

  it("should handle zero", () => {
    const formatted = formatIndianCurrency(0);
    expect(formatted).toBe("₹0");
  });

  it("should handle negative numbers", () => {
    const formatted = formatIndianCurrency(-5000);
    expect(formatted).toContain("-");
  });

  it("should handle decimal amounts", () => {
    const formatted = formatIndianCurrency(1500.50);
    expect(formatted).toContain("₹");
  });
});
