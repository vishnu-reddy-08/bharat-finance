import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader } from "lucide-react";
import { toast } from "sonner";

export default function AICoach() {
  const { data: chatHistory, refetch: refetchHistory } = trpc.coach.history.useQuery({ limit: 50 });
  const chatMutation = trpc.coach.chat.useMutation();
  
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;
    setMessage("");
    setLoading(true);

    try {
      await chatMutation.mutateAsync({ message: userMessage });
      refetchHistory();
      toast.success("Response received");
    } catch (error) {
      toast.error("Failed to get response from AI Coach");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Financial Coach</h1>
        <p className="text-gray-600 mt-1">Ask me anything about your finances</p>
      </div>

      <Card className="flex-1 flex flex-col border border-gray-200 overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatHistory && chatHistory.length > 0 ? (
            <>
              {chatHistory
                .slice()
                .reverse()
                .map((chat, idx) => (
                  <div key={idx} className="space-y-3">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                        <p className="text-sm">{chat.userMessage}</p>
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                        <p className="text-sm">{chat.aiResponse}</p>
                      </div>
                    </div>
                  </div>
                ))}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-4xl mb-4">🤖</div>
              <p className="text-gray-600 font-medium">Welcome to Bharat Finance Mitra!</p>
              <p className="text-gray-500 text-sm mt-2">
                Ask me about your spending, savings goals, or financial planning
              </p>
              <div className="mt-6 space-y-2 text-left">
                <p className="text-xs font-medium text-gray-600">Example questions:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• How much did I spend on Swiggy last month?</li>
                  <li>• Can I afford a new phone next month?</li>
                  <li>• What's my savings rate?</li>
                  <li>• How should I allocate my income?</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              type="text"
              placeholder="Ask me anything about your finances..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              className="border border-gray-300 flex-1"
            />
            <Button
              type="submit"
              disabled={loading || !message.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </Card>

      {/* Tips Card */}
      <Card className="p-4 border border-gray-200">
        <p className="text-xs font-medium text-gray-600 mb-2">💡 Tips for better responses:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Be specific: "How much did I spend on groceries this month?"</li>
          <li>• Ask about trends: "What's my spending pattern for dining?"</li>
          <li>• Plan ahead: "Can I afford a ₹50,000 purchase next month?"</li>
        </ul>
      </Card>
    </div>
  );
}
