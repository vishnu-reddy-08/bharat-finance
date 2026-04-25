import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatIndianCurrency } from "@shared/formatting";
import { Sparkles, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function Nudges() {
  const { data: nudges, refetch: refetchNudges } = trpc.nudges.list.useQuery({ limit: 20 });
  const { data: profile } = trpc.profile.getOrCreate.useQuery();
  const generateNudgeMutation = trpc.nudges.generate.useMutation();
  const markAsReadMutation = trpc.nudges.markAsRead.useMutation();
  
  const [generating, setGenerating] = useState(false);

  const handleGenerateNudge = async () => {
    if (!profile) return;
    
    setGenerating(true);
    try {
      await generateNudgeMutation.mutateAsync({
        monthlyIncome: parseFloat(String(profile.monthlyIncome || "0")),
        currentMonthlySavings: parseFloat(String(profile.currentMonthlySavings || "0")),
        monthlySavingsGoal: parseFloat(String(profile.monthlySavingsGoal || "0")),
      });
      toast.success("Nudge generated!");
      refetchNudges();
    } catch (error) {
      toast.error("Failed to generate nudge");
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkAsRead = async (nudgeId: number) => {
    try {
      await markAsReadMutation.mutateAsync({ nudgeId });
      refetchNudges();
    } catch (error) {
      toast.error("Failed to mark nudge as read");
    }
  };

  const unreadCount = nudges?.filter((n) => !n.isRead).length || 0;

  const nudgeTypeIcons: Record<string, string> = {
    "Savings Goal": "🎯",
    "Liquid Fund": "💧",
    "Festive Spending": "🎉",
    "Spending Pattern": "📊",
    "Investment Opportunity": "📈",
  };

  const nudgeTypeColors: Record<string, string> = {
    "Savings Goal": "bg-blue-50 border-blue-200",
    "Liquid Fund": "bg-cyan-50 border-cyan-200",
    "Festive Spending": "bg-orange-50 border-orange-200",
    "Spending Pattern": "bg-purple-50 border-purple-200",
    "Investment Opportunity": "bg-green-50 border-green-200",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Savings Nudges</h1>
          <p className="text-gray-600 mt-1">AI-powered insights to help you save smarter</p>
        </div>
        <Button
          onClick={handleGenerateNudge}
          disabled={generating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {generating ? "Generating..." : "Generate Nudge"}
        </Button>
      </div>

      {unreadCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          <p className="text-sm text-blue-900">
            You have <strong>{unreadCount} new nudge{unreadCount !== 1 ? "s" : ""}</strong> to review
          </p>
        </div>
      )}

      {nudges && nudges.length > 0 ? (
        <div className="space-y-3">
          {nudges.map((nudge) => (
            <Card
              key={nudge.id}
              className={`p-5 border-2 transition-all ${nudgeTypeColors[nudge.nudgeType] || "bg-gray-50 border-gray-200"} ${!nudge.isRead ? "ring-2 ring-blue-400" : ""}`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">
                  {nudgeTypeIcons[nudge.nudgeType] || "💡"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900">{nudge.nudgeType}</p>
                    {nudge.festiveContext && nudge.festiveContext !== "None" && (
                      <span className="text-xs bg-white px-2 py-1 rounded text-gray-700">
                        {nudge.festiveContext}
                      </span>
                    )}
                    {!nudge.isRead && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-900 font-medium mb-2">{nudge.title}</p>
                  <p className="text-sm text-gray-700 mb-3">{nudge.content}</p>
                  <div className="flex gap-2">
                    {nudge.actionUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={nudge.actionUrl} target="_blank" rel="noopener noreferrer">
                          Learn More
                        </a>
                      </Button>
                    )}
                    {!nudge.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(nudge.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 flex-shrink-0">
                  {new Date(nudge.createdAt).toLocaleDateString()}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 border border-gray-200 text-center">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No nudges yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Generate your first nudge to get personalized financial insights
          </p>
          <Button
            onClick={handleGenerateNudge}
            disabled={generating}
            className="bg-blue-600 hover:bg-blue-700 mt-4"
          >
            Generate First Nudge
          </Button>
        </Card>
      )}

      {/* Festive Alerts Section */}
      <Card className="p-6 border-2 border-orange-200 bg-orange-50">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🎊</span>
          Festive Spending Alerts
        </h2>
        <div className="space-y-3">
          <div className="p-4 bg-white rounded-lg border border-orange-200">
            <p className="text-sm font-medium text-gray-900">Diwali Season</p>
            <p className="text-sm text-gray-600 mt-1">
              Plan your festive spending budget. Consider setting aside extra funds for gifts, decorations, and celebrations.
            </p>
            <p className="text-xs text-gray-500 mt-2">October - November</p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-orange-200">
            <p className="text-sm font-medium text-gray-900">Wedding Season</p>
            <p className="text-sm text-gray-600 mt-1">
              Wedding invitations coming up? Budget for travel, gifts, and outfits. Track these expenses separately.
            </p>
            <p className="text-xs text-gray-500 mt-2">Year-round</p>
          </div>
        </div>
      </Card>

      {/* Quick Tips */}
      <Card className="p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">💡 Quick Tips</h2>
        <div className="space-y-3">
          <div className="flex gap-3">
            <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Liquid Funds</p>
              <p className="text-sm text-gray-600">Move idle savings to liquid funds for better returns without locking capital</p>
            </div>
          </div>
          <div className="flex gap-3">
            <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">50-30-20 Rule</p>
              <p className="text-sm text-gray-600">Allocate 50% to needs, 30% to wants, and 20% to savings and investments</p>
            </div>
          </div>
          <div className="flex gap-3">
            <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Emergency Fund</p>
              <p className="text-sm text-gray-600">Build an emergency fund of 3-6 months of expenses before investing</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
