import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import { Check, CreditCard, ArrowLeft, Smartphone } from "lucide-react";

export default function SubscriptionPage() {
  const { data: user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("standard");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      setProfile(data.user);
      if (data.user.phone) {
        setPhoneNumber(data.user.phone);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "KSh 5,000",
      period: "per term",
      features: [
        "Up to 100 students",
        "Performance tracking",
        "Parent alerts",
        "Basic reports",
        "Email support",
      ],
    },
    {
      id: "standard",
      name: "Standard",
      price: "KSh 12,000",
      period: "per term",
      popular: true,
      features: [
        "Up to 500 students",
        "Advanced analytics",
        "Parent education content",
        "Custom branding",
        "Priority support",
        "Learning recommendations",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "KSh 25,000",
      period: "per term",
      features: [
        "Unlimited students",
        "Multi-school management",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
        "Advanced security features",
      ],
    },
  ];

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setLoading(true);

    // In a real implementation, this would trigger M-Pesa STK Push
    alert(
      `M-Pesa payment integration would be triggered here.\n\nPlan: ${selectedPlan}\nPhone: ${phoneNumber}\n\nNote: This is a demo. In production, this would integrate with M-Pesa Daraja API.`,
    );

    setLoading(false);
  };

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/account/signin";
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <a
              href="/admin/dashboard"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </a>
            <div>
              <h1 className="text-3xl font-bold">Subscription Plans</h1>
              <p className="mt-1 text-blue-100">
                Choose the perfect plan for your school
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-lg border-2 p-8 relative ${
                plan.popular ? "border-blue-500 scale-105" : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.price}
                </span>
                <span className="text-gray-600"> {plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check
                      className="text-green-500 flex-shrink-0 mt-1"
                      size={20}
                    />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setSelectedPlan(plan.id)}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  selectedPlan === plan.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {selectedPlan === plan.id ? "Selected" : "Select Plan"}
              </button>
            </div>
          ))}
        </div>

        {/* Payment Form */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Smartphone className="text-green-600" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Pay with M-Pesa
              </h2>
              <p className="text-gray-600">
                Enter your M-Pesa number to complete payment
              </p>
            </div>
          </div>

          <form onSubmit={handleSubscribe} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Plan
              </label>
              <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-semibold text-blue-900 capitalize">
                  {selectedPlan} -{" "}
                  {plans.find((p) => p.id === selectedPlan)?.price}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                M-Pesa Phone Number
              </label>
              <input
                required
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+254 700 000 000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <p className="text-sm text-gray-500 mt-2">
                You'll receive an STK push to complete payment
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Pay Now"}
            </button>
          </form>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              Important Notes:
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Payment is per term (approximately 3 months)</li>
              <li>
                • You'll receive a confirmation SMS after successful payment
              </li>
              <li>• Your subscription will be activated immediately</li>
              <li>• Contact support for any payment issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}



