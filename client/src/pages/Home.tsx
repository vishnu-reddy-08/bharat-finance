import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { TrendingUp, BarChart3, Zap, Shield, Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">₹</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Bharat Finance Mitra</h1>
        </div>
        <Button
          onClick={() => (window.location.href = getLoginUrl())}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Sign In
        </Button>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Your Personal Finance AI Coach
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Bharat Finance Mitra helps Indian middle-class families make smarter financial decisions with AI-powered insights, tax optimization, and personalized nudges.
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-8 text-white">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Financial Health Score</p>
                    <p className="text-2xl font-bold">75/100</p>
                  </div>
                </div>
                <div className="h-px bg-white/20"></div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Monthly Savings</p>
                    <p className="text-2xl font-bold">₹25,000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Everything You Need for Financial Success
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Smart Expense Tracking</h4>
              <p className="text-gray-600">
                Import UPI alerts and bank SMS. AI automatically categorizes your spending into Needs, Wants, and Investments.
              </p>
            </Card>

            <Card className="p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Tax Optimization</h4>
              <p className="text-gray-600">
                2025-26 tax engine analyzes your income and recommends the best regime, factoring in NPS and deductions.
              </p>
            </Card>

            <Card className="p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">AI Nudges & Coach</h4>
              <p className="text-gray-600">
                Personalized savings nudges, festive spending alerts, and an AI coach to answer your financial questions.
              </p>
            </Card>

            <Card className="p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Financial Health Score</h4>
              <p className="text-gray-600">
                Track your savings rate and get a real-time financial health score (0-100) with actionable insights.
              </p>
            </Card>

            <Card className="p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-cyan-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Privacy First</h4>
              <p className="text-gray-600">
                DPDP Act 2023 compliant. Granular consent controls. Your data is encrypted and never shared.
              </p>
            </Card>

            <Card className="p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-pink-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Indian Context</h4>
              <p className="text-gray-600">
                Built for Indian middle class. Supports ₹ Lakhs/Crores, Diwali & wedding season planning, and local tax rules.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-4xl font-bold mb-6">Start Your Financial Journey Today</h3>
          <p className="text-lg opacity-90 mb-8">
            Join thousands of Indian families taking control of their finances with Bharat Finance Mitra.
          </p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            Sign Up Free
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">DPDP Compliance</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-white">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white">Email</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Bharat Finance Mitra. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
