import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatIndianCurrency } from "@shared/formatting";
import { TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function TaxEngine() {
  const calculateTaxMutation = trpc.tax.calculate.useMutation();
  const { data: latestAnalysis } = trpc.tax.latest.useQuery();
  
  const [formData, setFormData] = useState({
    annualIncome: "",
    npsContribution: "",
    otherDeductions: "",
    age: "30",
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.annualIncome) {
      toast.error("Please enter your annual income");
      return;
    }

    setLoading(true);
    try {
      const taxResult = await calculateTaxMutation.mutateAsync({
        annualIncome: parseFloat(formData.annualIncome),
        npsContribution: parseFloat(formData.npsContribution || "0"),
        otherDeductions: parseFloat(formData.otherDeductions || "0"),
        age: parseInt(formData.age),
      });
      setResult(taxResult);
      toast.success("Tax calculation completed");
    } catch (error) {
      toast.error("Failed to calculate tax");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tax Engine (2025-26)</h1>
        <p className="text-gray-600 mt-1">Analyze your income and find the best tax regime</p>
      </div>

      <Card className="p-6 border-2 border-blue-200 bg-blue-50">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tax Calculation</h2>
        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Income (₹)
              </label>
              <Input
                type="number"
                placeholder="Enter annual income"
                value={formData.annualIncome}
                onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                className="border border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <Input
                type="number"
                placeholder="Your age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="border border-gray-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NPS Contribution (Section 80CCD(2)) - ₹
              </label>
              <Input
                type="number"
                placeholder="Max 10% of salary, capped at ₹50,000"
                value={formData.npsContribution}
                onChange={(e) => setFormData({ ...formData, npsContribution: e.target.value })}
                className="border border-gray-300"
              />
              <p className="text-xs text-gray-500 mt-1">Max: ₹50,000</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other Deductions (Section 80C) - ₹
              </label>
              <Input
                type="number"
                placeholder="LIC, PPF, ELSS, etc."
                value={formData.otherDeductions}
                onChange={(e) => setFormData({ ...formData, otherDeductions: e.target.value })}
                className="border border-gray-300"
              />
              <p className="text-xs text-gray-500 mt-1">Max: ₹1,50,000</p>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 w-full">
            {loading ? "Calculating..." : "Calculate Tax"}
          </Button>
        </form>
      </Card>

      {result && (
        <div className="space-y-4">
          <Card className={`p-6 border-2 ${result.recommendedRegime === "New" ? "border-green-200 bg-green-50" : "border-purple-200 bg-purple-50"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Recommended Tax Regime</p>
                <p className="text-4xl font-bold mt-2 text-gray-900">{result.recommendedRegime} Regime</p>
                <p className="text-gray-600 text-sm mt-2">
                  Estimated Tax: {formatIndianCurrency(result.recommendedRegime === "New" ? result.newRegimeTax : result.oldRegimeTax)}
                </p>
              </div>
              <TrendingUp className="w-16 h-16 text-green-600" />
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6 border border-gray-200">
              <p className="text-gray-600 text-sm font-medium">New Tax Regime</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatIndianCurrency(result.newRegimeTax)}
              </p>
              <p className="text-gray-500 text-xs mt-2">No deductions allowed</p>
            </Card>

            <Card className="p-6 border border-gray-200">
              <p className="text-gray-600 text-sm font-medium">Old Tax Regime</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatIndianCurrency(result.oldRegimeTax)}
              </p>
              <p className="text-gray-500 text-xs mt-2">With applicable deductions</p>
            </Card>
          </div>

          <Card className="p-6 border-2 border-green-200 bg-green-50">
            <p className="text-gray-600 text-sm font-medium">Potential Savings</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {formatIndianCurrency(result.savings)}
            </p>
            <p className="text-gray-600 text-sm mt-2">
              By choosing {result.recommendedRegime} Regime over {result.recommendedRegime === "New" ? "Old" : "New"} Regime
            </p>
          </Card>

          <Card className="p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Breakdown</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Annual Income</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatIndianCurrency(result.annualIncome)}
                </p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Deductions</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Standard Deduction</span>
                    <span className="font-medium text-gray-900">{formatIndianCurrency(result.standardDeduction)}</span>
                  </div>
                  {result.npsDeduction > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">NPS (80CCD(2))</span>
                      <span className="font-medium text-gray-900">{formatIndianCurrency(result.npsDeduction)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Taxable Income</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Regime</span>
                    <span className="font-medium text-gray-900">{formatIndianCurrency(result.taxableIncomeNew)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Old Regime</span>
                    <span className="font-medium text-gray-900">{formatIndianCurrency(result.taxableIncomeOld)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Important Notes</p>
                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                  <li>• Standard Deduction for 2025-26: ₹75,000</li>
                  <li>• NPS (80CCD(2)) benefit: Up to 10% of salary, max ₹50,000</li>
                  <li>• This is an estimate. Consult a tax professional for final filing.</li>
                  <li>• New Regime does not allow any deductions except standard deduction</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
