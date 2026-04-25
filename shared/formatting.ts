/**
 * Format number to Indian currency system (Lakhs and Crores)
 * @param amount - The amount to format
 * @returns Formatted string with ₹ symbol
 */
export function formatIndianCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (isNaN(num)) return "₹0";
  
  const absNum = Math.abs(num);
  const isNegative = num < 0;
  
  let formatted: string;
  
  if (absNum >= 10000000) {
    // Crores (1 Crore = 10 Million)
    const crores = absNum / 10000000;
    formatted = `₹${crores.toFixed(2)} Cr`;
  } else if (absNum >= 100000) {
    // Lakhs (1 Lakh = 100,000)
    const lakhs = absNum / 100000;
    formatted = `₹${lakhs.toFixed(2)} L`;
  } else {
    // Regular formatting for amounts below 1 Lakh
    formatted = `₹${absNum.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }
  
  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Format amount as simple number with Indian locale
 */
export function formatIndianNumber(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (isNaN(num)) return "0";
  
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Parse Indian currency string back to number
 */
export function parseIndianCurrency(value: string): number {
  const cleaned = value.replace(/[₹,\s]/g, "");
  const num = parseFloat(cleaned);
  
  if (cleaned.includes("Cr")) {
    return num * 10000000;
  } else if (cleaned.includes("L")) {
    return num * 100000;
  }
  
  return num;
}

/**
 * Calculate Financial Health Score based on savings rate
 * Score ranges from 0-100
 * @param monthlyIncome - Monthly income
 * @param monthlySavings - Monthly savings
 * @returns Score 0-100
 */
export function calculateFinancialHealthScore(
  monthlyIncome: number,
  monthlySavings: number
): number {
  if (monthlyIncome <= 0) return 0;
  
  const savingsRate = (monthlySavings / monthlyIncome) * 100;
  
  // Scoring logic:
  // 0-10% savings rate = 20 points
  // 10-20% = 40 points
  // 20-30% = 60 points
  // 30-40% = 80 points
  // 40%+ = 100 points
  
  if (savingsRate < 0) return Math.max(0, 50 + savingsRate * 2);
  if (savingsRate < 10) return 20;
  if (savingsRate < 20) return 40;
  if (savingsRate < 30) return 60;
  if (savingsRate < 40) return 80;
  return 100;
}

/**
 * Calculate safe-to-spend daily limit
 * @param monthlyIncome - Monthly income
 * @param monthlySavingsGoal - Monthly savings goal
 * @param daysRemainingInMonth - Days left in current month
 * @returns Daily spending limit
 */
export function calculateSafeToSpendDaily(
  monthlyIncome: number,
  monthlySavingsGoal: number,
  daysRemainingInMonth: number = 30
): number {
  if (daysRemainingInMonth <= 0) return 0;
  
  const availableForSpending = monthlyIncome - monthlySavingsGoal;
  return Math.max(0, availableForSpending / daysRemainingInMonth);
}

/**
 * Get days remaining in current month
 */
export function getDaysRemainingInMonth(): number {
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return lastDay.getDate() - today.getDate() + 1;
}

/**
 * Categorize transaction based on description using keywords
 */
export function categorizeTransaction(description: string): "Needs" | "Wants" | "Investments" | "Income" | "Uncategorized" {
  const desc = description.toLowerCase();
  
  // Income keywords
  if (desc.includes("salary") || desc.includes("income") || desc.includes("credit") || desc.includes("transfer in")) {
    return "Income";
  }
  
  // Needs keywords (essentials)
  if (
    desc.includes("rent") ||
    desc.includes("grocery") ||
    desc.includes("food") ||
    desc.includes("utility") ||
    desc.includes("electricity") ||
    desc.includes("water") ||
    desc.includes("insurance") ||
    desc.includes("medicine") ||
    desc.includes("medical") ||
    desc.includes("hospital") ||
    desc.includes("fuel") ||
    desc.includes("petrol") ||
    desc.includes("school") ||
    desc.includes("education")
  ) {
    return "Needs";
  }
  
  // Investments keywords
  if (
    desc.includes("sip") ||
    desc.includes("mutual fund") ||
    desc.includes("ppf") ||
    desc.includes("nps") ||
    desc.includes("stock") ||
    desc.includes("investment") ||
    desc.includes("fixed deposit") ||
    desc.includes("fd") ||
    desc.includes("gold") ||
    desc.includes("liquid fund")
  ) {
    return "Investments";
  }
  
  // Wants keywords (discretionary)
  if (
    desc.includes("swiggy") ||
    desc.includes("zomato") ||
    desc.includes("restaurant") ||
    desc.includes("cafe") ||
    desc.includes("movie") ||
    desc.includes("cinema") ||
    desc.includes("shopping") ||
    desc.includes("amazon") ||
    desc.includes("flipkart") ||
    desc.includes("myntra") ||
    desc.includes("uber") ||
    desc.includes("ola") ||
    desc.includes("entertainment") ||
    desc.includes("gaming") ||
    desc.includes("subscription") ||
    desc.includes("spotify") ||
    desc.includes("netflix")
  ) {
    return "Wants";
  }
  
  return "Uncategorized";
}
