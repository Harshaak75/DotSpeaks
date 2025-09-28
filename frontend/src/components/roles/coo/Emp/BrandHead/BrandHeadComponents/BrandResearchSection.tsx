import React from 'react';
import { 
    TrendingUp, 
    Users, 
    Zap, 
    Target, 
    ShieldCheck, 
    ShieldOff, 
    Star, 
    MessageSquare,
    Search, 
    BarChart2,
    ArrowUp,
    ArrowDown,
    MapPin,
    Heart,
    Instagram,
    Linkedin,
    Twitter,
    Leaf,
    Video,
    Cpu,
    Users2
} from 'lucide-react';

// --- MOCK DATA (ENHANCED) ---
const keyMetrics = {
  brandMentions: { value: '1.2M', change: '+5.2%', positive: true },
  sentimentScore: { value: '88%', change: '-1.5%', positive: false },
  marketShare: { value: '15.4%', change: '+0.8%', positive: true },
  shareOfVoice: { value: '22%', change: '+3.1%', positive: true },
};

const sentimentData = {
    positive: 88,
    neutral: 9,
    negative: 3,
};

const competitors = [
  { name: 'Stellar Solutions', followers: '5.2M', engagement: '2.1%', strength: 'Strong influencer network', weakness: 'Slow customer support' },
  { name: 'Quantum Leap', followers: '3.8M', engagement: '1.8%', strength: 'Innovative product features', weakness: 'Higher price point' },
  { name: 'Apex Innovations', followers: '4.5M', engagement: '2.5%', strength: 'High brand loyalty', weakness: 'Outdated website design' },
];

const marketTrends = [
    { text: 'Increased demand for sustainable products.', icon: Leaf },
    { text: 'Rise of short-form video content on all platforms.', icon: Video },
    { text: 'AI-powered personalization is becoming standard.', icon: Cpu },
    { text: 'Focus on community building over direct advertising.', icon: Users2 },
];

const audienceInsights = {
  age: '25-34',
  location: 'Urban Metro Areas',
  interests: ['Tech', 'Sustainability', 'Design'],
  platforms: [
      { name: 'Instagram', icon: Instagram },
      { name: 'LinkedIn', icon: Linkedin },
      { name: 'Twitter', icon: Twitter }
  ],
};

// --- REUSABLE COMPONENTS (ENHANCED) ---
const StatCard = ({ title, value, icon: Icon, change, positive }: any) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
    <div className="flex items-start justify-between">
        <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
                <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-500 ml-4">{title}</p>
        </div>
    </div>
    <div className="mt-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <div className={`mt-1 flex items-center text-sm font-semibold ${positive ? 'text-green-600' : 'text-red-600'}`}>
            {positive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            <span className="ml-1">{change} vs last month</span>
        </div>
    </div>
  </div>
);

const CompetitorCard = ({ name, strength, weakness }: any) => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-bold text-gray-800">{name}</h4>
        <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-start">
                <ShieldCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <p><strong className="font-semibold">Strength:</strong> {strength}</p>
            </div>
            <div className="flex items-start">
                <ShieldOff className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p><strong className="font-semibold">Weakness:</strong> {weakness}</p>
            </div>
        </div>
    </div>
);

const SentimentChart = ({ data }: any) => {
    const total = data.positive + data.neutral + data.negative;
    const positiveWidth = (data.positive / total) * 100;
    const neutralWidth = (data.neutral / total) * 100;
    const negativeWidth = (data.negative / total) * 100;

    return (
        <div className="space-y-3">
            <div className="flex items-center">
                <div className="w-24 text-sm font-medium text-gray-600">Positive</div>
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div className="bg-green-500 h-4 rounded-full" style={{ width: `${positiveWidth}%` }}></div>
                </div>
                <div className="w-12 text-right text-sm font-bold">{data.positive}%</div>
            </div>
            <div className="flex items-center">
                <div className="w-24 text-sm font-medium text-gray-600">Neutral</div>
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div className="bg-yellow-400 h-4 rounded-full" style={{ width: `${neutralWidth}%` }}></div>
                </div>
                <div className="w-12 text-right text-sm font-bold">{data.neutral}%</div>
            </div>
            <div className="flex items-center">
                <div className="w-24 text-sm font-medium text-gray-600">Negative</div>
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div className="bg-red-500 h-4 rounded-full" style={{ width: `${negativeWidth}%` }}></div>
                </div>
                <div className="w-12 text-right text-sm font-bold">{data.negative}%</div>
            </div>
        </div>
    );
};


// --- THE MAIN DASHBOARD COMPONENT ---
const BrandResearchSection = () => {
  return (
    <div className="p-1 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Brand R&D Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Brand Mentions (30d)" value={keyMetrics.brandMentions.value} icon={TrendingUp} change={keyMetrics.brandMentions.change} positive={keyMetrics.brandMentions.positive} />
        <StatCard title="Positive Sentiment" value={keyMetrics.sentimentScore.value} icon={Star} change={keyMetrics.sentimentScore.change} positive={keyMetrics.sentimentScore.positive} />
        <StatCard title="Market Share" value={keyMetrics.marketShare.value} icon={Target} change={keyMetrics.marketShare.change} positive={keyMetrics.marketShare.positive} />
        <StatCard title="Share of Voice" value={keyMetrics.shareOfVoice.value} icon={Zap} change={keyMetrics.shareOfVoice.change} positive={keyMetrics.shareOfVoice.positive} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
            {/* Competitor Analysis */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><BarChart2 className="mr-2"/>Competitor Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {competitors.map((comp) => (
                        <CompetitorCard key={comp.name} name={comp.name} strength={comp.strength} weakness={comp.weakness} />
                    ))}
                </div>
            </div>
            {/* Sentiment Analysis */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><MessageSquare className="mr-2"/>Brand Sentiment Breakdown</h2>
                <SentimentChart data={sentimentData} />
            </div>
        </div>

        {/* Right Column (REDESIGNED) */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><Users className="mr-2"/>Audience Insights</h2>
            <div className="space-y-4">
                <div className="flex items-center bg-gray-50 p-3 rounded-md">
                    <Users2 className="h-5 w-5 text-gray-500 mr-3"/>
                    <p className="text-sm"><strong className="font-semibold text-gray-700">Age Group:</strong> {audienceInsights.age}</p>
                </div>
                <div className="flex items-center bg-gray-50 p-3 rounded-md">
                    <MapPin className="h-5 w-5 text-gray-500 mr-3"/>
                    <p className="text-sm"><strong className="font-semibold text-gray-700">Location:</strong> {audienceInsights.location}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-700 text-sm mb-2">Top Interests</h4>
                    <div className="flex flex-wrap gap-2">
                        {audienceInsights.interests.map(interest => (
                            <span key={interest} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">{interest}</span>
                        ))}
                    </div>
                </div>
                 <div>
                    <h4 className="font-semibold text-gray-700 text-sm mb-2">Active On</h4>
                    <div className="flex flex-wrap gap-2">
                        {audienceInsights.platforms.map(({name, icon: Icon}) => (
                            <span key={name} className="flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
                                <Icon className="h-4 w-4 mr-1.5" />
                                {name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><Search className="mr-2"/>Market Trends</h2>
            <div className="space-y-3">
              {marketTrends.map(({text, icon: Icon}, index) => 
                <div key={index} className="flex items-start bg-gray-50 p-3 rounded-md">
                    <Icon className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0"/>
                    <div>
                        <p className="text-sm font-medium text-gray-800">{text}</p>
                        <span className="text-xs font-semibold text-green-600">Rising Trend</span>
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandResearchSection;
