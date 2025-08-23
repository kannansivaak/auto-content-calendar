'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  BarChart3,
  Brain,
  // TrendingUp,
  // Clock,
  // Target,
  Zap,
  // Users,
  Star,
  Check,
  ArrowRight,
  PlayCircle,
  Shield,
  Globe,
  Smartphone,
  // ChevronDown,
  Menu,
  X
} from 'lucide-react';

const ShowcaseHomepage = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Smart Calendar Planning",
      description: "Visual calendar interface with drag-and-drop scheduling, optimal timing suggestions, and batch content planning.",
      image: "📅",
      benefits: ["Visual content planning", "Drag-and-drop scheduling", "Optimal timing insights", "Batch scheduling"]
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI Content Generation",
      description: "Claude AI-powered content creation with personalized scripts, hashtag suggestions, and engagement optimization.",
      image: "🤖",
      benefits: ["AI-generated scripts", "Smart hashtag suggestions", "Personalized content", "Engagement optimization"]
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Performance Analytics",
      description: "Deep insights into your content performance with AI-driven recommendations and engagement tracking.",
      image: "📊",
      benefits: ["Performance tracking", "AI insights", "Engagement metrics", "Growth recommendations"]
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Intelligent Insights",
      description: "Claude AI analyzes your content patterns and provides personalized recommendations for maximum impact.",
      image: "🧠",
      benefits: ["Pattern analysis", "Content optimization", "Trend identification", "Personalized tips"]
    }
  ];

  // const pricingPlans = [
  //   {
  //     name: "Starter",
  //     price: "Free",
  //     period: "forever",
  //     features: [
  //       "5 AI-generated posts per month",
  //       "Basic calendar scheduling",
  //       "Simple analytics",
  //       "Community support"
  //     ],
  //     popular: false
  //   },
  //   {
  //     name: "Creator",
  //     price: "$19",
  //     period: "per month",
  //     features: [
  //       "Unlimited AI content generation",
  //       "Advanced scheduling features",
  //       "Detailed analytics & insights",
  //       "Priority support",
  //       "Custom brand voice training",
  //       "Hashtag optimization"
  //     ],
  //     popular: true
  //   },
  //   {
  //     name: "Agency",
  //     price: "$49",
  //     period: "per month",
  //     features: [
  //       "Everything in Creator",
  //       "Multiple account management",
  //       "Team collaboration",
  //       "White-label options",
  //       "Advanced AI training",
  //       "Dedicated account manager"
  //     ],
  //     popular: false
  //   }
  // ];
  const handleSignIn = () => {
    window.location.href = '/signin';
  };

  const handleSignUp = () => {
    window.location.href = '/signup';
  };

  return (
    <div className="min-h-screen text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <span className="text-xl font-bold">Instagram AI</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
             <button
                onClick={handleSignIn}
                className="border border-purple-400 hover:bg-purple-600 px-4 py-2 rounded-lg transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={handleSignUp}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
              >
                Sign Up
              </button>
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
                          <div className="md:hidden bg-black/30 backdrop-blur-md border-t border-white/10">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <button
                  onClick={handleSignIn}
                  className="w-full text-left border border-purple-400 hover:bg-purple-600 px-3 py-2 rounded transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={handleSignUp}
                  className="w-full text-left bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            {/* <div className="inline-flex items-center space-x-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span className="text-sm text-purple-300">Powered by Claude AI</span>
            </div> */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Instagram AI
            </h1>
            <h2 className="text-2xl md:text-4xl font-semibold mb-6">
              Content Calendar Revolution
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Transform your Instagram strategy with AI-powered content creation,
              intelligent scheduling, and performance insights that drive real results.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
            <button className="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center space-x-2">
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="border border-white/30 hover:bg-white/10 px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center space-x-2">
              <PlayCircle className="w-5 h-5" />
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">150%</div>
              <div className="text-gray-300">Average Engagement Increase</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">10hrs</div>
              <div className="text-gray-300">Saved Per Week</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Powerful Features for
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Content Success</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to create, schedule, and optimize your Instagram content with the power of AI
            </p>
          </div>

          {/* Interactive Feature Showcase */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                    activeFeature === index
                      ? 'bg-purple-500/20 border-2 border-purple-400'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${
                      activeFeature === index ? 'bg-purple-500' : 'bg-white/10'
                    }`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-300 mb-4">{feature.description}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {feature.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-sm text-gray-400">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">{features[activeFeature]?.image}</div>
                <h3 className="text-2xl font-bold mb-2">{features[activeFeature]?.title}</h3>
                <p className="text-gray-300">{features[activeFeature]?.description}</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Feature Adoption</span>
                    <span className="text-sm font-semibold">94%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: '94%'}}></div>
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">User Satisfaction</span>
                    <span className="text-sm font-semibold">4.9/5</span>
                  </div>
                  <div className="flex space-x-1">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
              <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-400 text-sm">Your content and data are protected</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
              <Globe className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Multi-Language</h3>
              <p className="text-gray-400 text-sm">Create content in 50+ languages with AI translation support</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
              <Smartphone className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Mobile Optimized</h3>
              <p className="text-gray-400 text-sm">Manage your content on-the-go with our responsive design</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
              <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-400 text-sm">Generate and schedule content in seconds, not hours</p>
            </div>
          </div>
        </div>
      </section>

      {/* <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Choose Your
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Perfect Plan</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Start free and scale as you grow. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`relative rounded-2xl p-8 border ${
                plan.popular
                  ? 'border-purple-400 bg-purple-500/10'
                  : 'border-white/10 bg-white/5'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-400 ml-2">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'border border-white/20 hover:bg-white/10 text-white'
                }`}>
                  {plan.price === 'Free' ? 'Get Started Free' : 'Start Free Trial'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section> */}


      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Instagram?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of creators who've already revolutionized their content strategy with AI
          </p>
        </div>
      </section>
    </div>
  );
};

export default ShowcaseHomepage;
