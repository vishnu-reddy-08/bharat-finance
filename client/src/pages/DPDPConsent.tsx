import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function DPDPConsent() {
  const { data: preferences } = trpc.consent.getOrCreate.useQuery();
  const updateConsentMutation = trpc.consent.update.useMutation();
  
  const [consents, setConsents] = useState({
    dataCollection: false,
    transactionAnalysis: false,
    aiCoachInsights: false,
    nudgeGeneration: false,
    taxAnalysis: false,
  });
  const [saving, setSaving] = useState(false);
  const [confirmDelay, setConfirmDelay] = useState(0);

  useEffect(() => {
    if (preferences) {
      setConsents({
        dataCollection: preferences.dataCollection || false,
        transactionAnalysis: preferences.transactionAnalysis || false,
        aiCoachInsights: preferences.aiCoachInsights || false,
        nudgeGeneration: preferences.nudgeGeneration || false,
        taxAnalysis: preferences.taxAnalysis || false,
      });
    }
  }, [preferences]);

  const handleToggle = (key: keyof typeof consents) => {
    setConsents({ ...consents, [key]: !consents[key] });
    setConfirmDelay(1);
  };

  useEffect(() => {
    if (confirmDelay > 0) {
      const timer = setTimeout(() => {
        setConfirmDelay(confirmDelay - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [confirmDelay]);

  const handleSaveConsents = async () => {
    setSaving(true);
    try {
      await updateConsentMutation.mutateAsync(consents);
      toast.success("Consent preferences updated");
    } catch (error) {
      toast.error("Failed to update consent preferences");
    } finally {
      setSaving(false);
    }
  };

  const consentItems = [
    {
      key: "dataCollection",
      title: "Data Collection",
      description: "Allow collection of your financial data including transactions, income, and balances",
      icon: "📊",
      required: true,
    },
    {
      key: "transactionAnalysis",
      title: "Transaction Analysis",
      description: "Allow AI analysis of your transactions for automatic categorization and insights",
      icon: "🔍",
      required: false,
    },
    {
      key: "aiCoachInsights",
      title: "AI Coach Insights",
      description: "Allow AI Coach to provide personalized financial advice based on your data",
      icon: "🤖",
      required: false,
    },
    {
      key: "nudgeGeneration",
      title: "Nudge Generation",
      description: "Allow generation of personalized savings nudges and recommendations",
      icon: "💡",
      required: false,
    },
    {
      key: "taxAnalysis",
      title: "Tax Analysis",
      description: "Allow analysis of your income for tax planning and optimization",
      icon: "💰",
      required: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Data Privacy & Consent</h1>
        <p className="text-gray-600 mt-1">Manage your data sharing preferences (DPDP Act 2023 Compliant)</p>
      </div>

      {/* Important Notice */}
      <Card className="p-4 border-2 border-blue-200 bg-blue-50">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">About Your Data</p>
            <p className="text-sm text-blue-800 mt-1">
              We comply with the Digital Personal Data Protection (DPDP) Act 2023. Your data is encrypted and used only for the purposes you consent to. You can withdraw consent anytime.
            </p>
          </div>
        </div>
      </Card>

      {/* Consent Items */}
      <div className="space-y-3">
        {consentItems.map((item) => (
          <Card key={item.key} className="p-4 border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="text-2xl flex-shrink-0">{item.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  {item.required && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => handleToggle(item.key as keyof typeof consents)}
                  disabled={item.required}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    consents[item.key as keyof typeof consents]
                      ? "bg-blue-600"
                      : "bg-gray-300"
                  } ${item.required ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      consents[item.key as keyof typeof consents]
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Friction Delay Notice */}
      {confirmDelay > 0 && (
        <Card className="p-4 border-2 border-yellow-200 bg-yellow-50">
          <div className="flex gap-3 items-center">
            <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-900">Confirming your choice...</p>
              <p className="text-sm text-yellow-800">
                This 1-second delay ensures you're making an intentional choice about your data privacy.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex gap-2">
        <Button
          onClick={handleSaveConsents}
          disabled={saving || confirmDelay > 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
        <Button variant="outline" disabled>
          <CheckCircle className="w-4 h-4 mr-2" />
          Last Updated: {preferences?.updatedAt ? new Date(preferences.updatedAt).toLocaleDateString() : "Never"}
        </Button>
      </div>

      {/* Information Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 border border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-2">🔒 Your Rights</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Right to know what data we collect</li>
            <li>• Right to withdraw consent anytime</li>
            <li>• Right to request data deletion</li>
            <li>• Right to data portability</li>
            <li>• Right to grievance redressal</li>
          </ul>
        </Card>

        <Card className="p-4 border border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-2">🛡️ Data Protection</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• End-to-end encryption</li>
            <li>• Secure data storage</li>
            <li>• No third-party sharing</li>
            <li>• Regular security audits</li>
            <li>• GDPR & DPDP compliant</li>
          </ul>
        </Card>
      </div>

      {/* Detailed Descriptions */}
      <Card className="p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Information</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Data Collection Purpose</p>
            <p className="text-sm text-gray-600 mt-1">
              We collect your financial data solely to provide personalized financial coaching and insights. This includes transaction history, income information, and savings goals.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-900">Data Retention</p>
            <p className="text-sm text-gray-600 mt-1">
              Your data is retained as long as your account is active. Upon account deletion, all personal data is securely purged within 30 days, except where required by law.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-900">Data Sharing</p>
            <p className="text-sm text-gray-600 mt-1">
              We never share your personal financial data with third parties without explicit consent. AI processing happens on secure servers with no external data transfer.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-900">Contact Us</p>
            <p className="text-sm text-gray-600 mt-1">
              For privacy concerns or data requests, contact our Data Protection Officer at privacy@bharatfinancemitra.com
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
