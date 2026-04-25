import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatIndianCurrency } from "@shared/formatting";
import { Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Expenses() {
  const { data: transactions, refetch: refetchTransactions } = trpc.transactions.list.useQuery({ limit: 100 });
  const createTransactionMutation = trpc.transactions.create.useMutation();
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    transactionType: "debit" as const,
    source: "Manual" as const,
  });
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await createTransactionMutation.mutateAsync({
        amount: parseFloat(formData.amount),
        description: formData.description,
        transactionType: formData.transactionType,
        source: formData.source,
      });
      
      toast.success("Transaction added successfully");
      setFormData({ amount: "", description: "", transactionType: "debit", source: "Manual" });
      setShowForm(false);
      refetchTransactions();
    } catch (error) {
      toast.error("Failed to add transaction");
    }
  };

  const categoryBreakdown = transactions?.reduce(
    (acc, tx) => {
      const category = tx.category || "Uncategorized";
      acc[category] = (acc[category] || 0) + parseFloat(tx.amount || "0");
      return acc;
    },
    {} as Record<string, number>
  ) || {};

  const filteredTransactions = categoryFilter
    ? transactions?.filter((tx) => tx.category === categoryFilter)
    : transactions;

  const categoryColors: Record<string, string> = {
    Needs: "bg-blue-50 border-blue-200",
    Wants: "bg-red-50 border-red-200",
    Investments: "bg-green-50 border-green-200",
    Income: "bg-purple-50 border-purple-200",
    Uncategorized: "bg-gray-50 border-gray-200",
  };

  const categoryIcons: Record<string, string> = {
    Needs: "🛒",
    Wants: "🎉",
    Investments: "📈",
    Income: "💰",
    Uncategorized: "❓",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expense Analysis</h1>
          <p className="text-gray-600 mt-1">Track and categorize your spending</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 border-2 border-blue-200 bg-blue-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Transaction</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)
                </label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="border border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.transactionType}
                  onChange={(e) => setFormData({ ...formData, transactionType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="debit">Expense (Debit)</option>
                  <option value="credit">Income (Credit)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Input
                type="text"
                placeholder="e.g., Swiggy dinner, Rent payment"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="Manual">Manual Entry</option>
                <option value="UPI">UPI Alert</option>
                <option value="Bank SMS">Bank SMS</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Add Transaction
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(categoryBreakdown).map(([category, amount]) => (
            <button
              key={category}
              onClick={() => setCategoryFilter(categoryFilter === category ? null : category)}
              className={`p-3 rounded-lg border-2 transition-all ${categoryColors[category] || "bg-gray-50 border-gray-200"} ${categoryFilter === category ? "ring-2 ring-blue-500" : ""}`}
            >
              <p className="text-2xl mb-1">{categoryIcons[category] || "📊"}</p>
              <p className="text-xs font-medium text-gray-900">{category}</p>
              <p className="text-sm font-bold text-gray-900 mt-1">
                {formatIndianCurrency(amount)}
              </p>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {categoryFilter ? `${categoryFilter} Transactions` : "All Transactions"}
        </h2>

        {filteredTransactions && filteredTransactions.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className={`p-4 rounded-lg border-2 flex justify-between items-center ${categoryColors[tx.category || "Uncategorized"] || "bg-gray-50 border-gray-200"}`}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-white px-2 py-1 rounded text-gray-700">
                      {tx.category}
                    </span>
                    <span className="text-xs bg-white px-2 py-1 rounded text-gray-700">
                      {tx.source}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${tx.transactionType === "credit" ? "text-green-600" : "text-gray-900"}`}
                  >
                    {tx.transactionType === "credit" ? "+" : "-"}
                    {formatIndianCurrency(tx.amount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(tx.transactionDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-gray-400 mr-2" />
            <p className="text-gray-600">
              {categoryFilter ? "No transactions in this category." : "No transactions yet."}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
