import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { formatIndianCurrency, getDaysRemainingInMonth } from "@shared/formatting";
import { TrendingUp, Wallet, Target, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = trpc.profile.getOrCreate.useQuery();
  const { data: transactions } = trpc.transactions.list.useQuery({ limit: 50 });
  const { data: goals } = trpc.goals.list.useQuery();
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    setDaysRemaining(getDaysRemainingInMonth());
  }, []);

  const healthScoreColor = profile?.financialHealthScore
    ? profile.financialHealthScore >= 70
      ? "text-green-600"
      : profile.financialHealthScore >= 40
      ? "text-yellow-600"
      : "text-red-600"
    : "text-gray-600";

  const healthScoreBgColor = profile?.financialHealthScore
    ? profile.financialHealthScore >= 70
      ? "bg-green-50"
      : profile.financialHealthScore >= 40
      ? "bg-yellow-50"
      : "bg-red-50"
    : "bg-gray-50";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name || "User"}</p>
        </div>
      </div>

      {/* Financial Health Score */}
      <Card className={`p-6 border-2 border-blue-200 ${healthScoreBgColor}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Financial Health Score</p>
            <div className={`text-5xl font-bold mt-2 ${healthScoreColor}`}>
              {profile?.financialHealthScore || 0}
              <span className="text-2xl">/100</span>
            </div>
            <p className="text-gray-600 text-sm mt-2">
              {profile?.financialHealthScore ? (
                profile.financialHealthScore >= 70
                  ? "Excellent financial health! Keep it up."
                  : profile.financialHealthScore >= 40
                  ? "Good progress. Focus on increasing your savings rate."
                  : "Time to review your spending habits."
              ) : (
                "Update your financial profile to see your score."
              )}
            </p>
          </div>
          <TrendingUp className={`w-16 h-16 ${healthScoreColor}`} />
        </div>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <Card className="p-4 border border-gray-200">
          <p className="text-gray-600 text-sm font-medium">Total Balance</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatIndianCurrency(profile?.totalBalance || 0)}
          </p>
          <p className="text-gray-500 text-xs mt-2">All accounts combined</p>
        </Card>

        {/* Monthly Income */}
        <Card className="p-4 border border-gray-200">
          <p className="text-gray-600 text-sm font-medium">Monthly Income</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {formatIndianCurrency(profile?.monthlyIncome || 0)}
          </p>
          <p className="text-gray-500 text-xs mt-2">Average monthly earnings</p>
        </Card>

        {/* Monthly Savings Goal */}
        <Card className="p-4 border border-gray-200">
          <p className="text-gray-600 text-sm font-medium">Savings Goal</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {formatIndianCurrency(profile?.monthlySavingsGoal || 0)}
          </p>
          <p className="text-gray-500 text-xs mt-2">Monthly target</p>
        </Card>

        {/* Safe-to-Spend Daily */}
        <Card className="p-4 border border-gray-200">
          <p className="text-gray-600 text-sm font-medium">Safe-to-Spend Daily</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">
            {formatIndianCurrency(
              ((parseFloat(String(profile?.monthlyIncome || "0"))) - (parseFloat(String(profile?.monthlySavingsGoal || "0")))) / (daysRemaining || 30)
            )}
          </p>
          <p className="text-gray-500 text-xs mt-2">{daysRemaining || 30} days left in month</p>
        </Card>
      </div>

      {/* Current Monthly Progress */}
      <Card className="p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Progress</h2>
        <div className="space-y-4">
          {/* Income Progress */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Income</span>
              <span className="text-sm font-medium text-gray-900">
                {formatIndianCurrency(profile?.monthlyIncome || 0)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>

          {/* Savings Progress */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Savings</span>
              <span className="text-sm font-medium text-gray-900">
                {formatIndianCurrency(profile?.currentMonthlySavings || 0)} /{" "}
                {formatIndianCurrency(profile?.monthlySavingsGoal || 0)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{
                  width: `${
                    profile?.monthlySavingsGoal
                      ? Math.min(
                          ((parseFloat(String(profile?.currentMonthlySavings || "0"))) / parseFloat(String(profile.monthlySavingsGoal))) * 100,
                          100
                        )
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Transactions Summary */}
      <Card className="p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
        {transactions && transactions.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {transactions.slice(0, 10).map((tx) => (
              <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                  <p className="text-xs text-gray-500">{tx.category}</p>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    tx.transactionType === "credit" ? "text-green-600" : "text-gray-900"
                  }`}
                >
                  {tx.transactionType === "credit" ? "+" : "-"}{formatIndianCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-gray-400 mr-2" />
            <p className="text-gray-600">No transactions yet. Start by adding your first transaction.</p>
          </div>
        )}
      </Card>

      {/* Active Savings Goals */}
      {goals && goals.length > 0 && (
        <Card className="p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Savings Goals</h2>
          <div className="space-y-4">
            {goals.slice(0, 3).map((goal) => {
              const progress = goal.targetAmount
                ? (parseFloat(String(goal.currentAmount || "0")) / parseFloat(String(goal.targetAmount))) * 100
                : 0;
              return (
                <div key={goal.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{goal.goalName}</span>
                    <span className="text-sm font-medium text-gray-600">
                      {formatIndianCurrency(goal.currentAmount || 0)} /{" "}
                      {formatIndianCurrency(goal.targetAmount)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{Math.round(progress || 0)}% complete</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
