'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { ArrowRight, Loader } from 'lucide-react';

export default function BriefBuilderPage() {
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    targetAudience: '',
    contentType: 'blog',
    goals: [],
    keywords: [],
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGoalsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      goals: e.target.value.split('\n').filter((g) => g.trim()),
    }));
  };

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      keywords: e.target.value.split(',').map((k) => k.trim()).filter((k) => k),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create project
      const createRes = await apiClient.post('/briefs', formData);
      const projectId = createRes.data.data.id;

      // Trigger generation
      await apiClient.post(`/briefs/${projectId}/generate`);

      setSuccess(true);
      setTimeout(() => {
        window.location.href = `/contentflow/dashboard`;
      }, 2000);
    } catch (err) {
      alert('❌ Failed to create brief');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">Brief Created!</h2>
          <p className="text-gray-600">AI is generating your brief now...</p>
          <p className="text-sm text-gray-500 mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-2">Create Content Brief</h1>
      <p className="text-gray-600 mb-8">
        Tell us about your content idea. Our AI will generate a comprehensive brief in
        minutes.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold mb-2">Brief Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Q1 2026 Marketing Strategy"
            required
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Topic */}
        <div>
          <label className="block text-sm font-semibold mb-2">Topic/Keyword</label>
          <input
            type="text"
            name="topic"
            value={formData.topic}
            onChange={handleInputChange}
            placeholder="What is your content about?"
            required
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-sm font-semibold mb-2">Target Audience</label>
          <input
            type="text"
            name="targetAudience"
            value={formData.targetAudience}
            onChange={handleInputChange}
            placeholder="e.g., SaaS founders, marketing managers"
            required
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        {/* Content Type */}
        <div>
          <label className="block text-sm font-semibold mb-2">Content Type</label>
          <select
            name="contentType"
            value={formData.contentType}
            onChange={handleInputChange}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option>blog</option>
            <option>video</option>
            <option>social</option>
            <option>whitepaper</option>
            <option>case_study</option>
            <option>infographic</option>
            <option>podcast</option>
          </select>
        </div>

        {/* Goals */}
        <div>
          <label className="block text-sm font-semibold mb-2">Goals (one per line)</label>
          <textarea
            value={formData.goals.join('\n')}
            onChange={handleGoalsChange}
            placeholder="Drive traffic\nGenerate leads\nBuild brand awareness"
            rows={3}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Keywords (comma-separated)
          </label>
          <textarea
            value={formData.keywords.join(', ')}
            onChange={handleKeywordsChange}
            placeholder="SaaS marketing, customer acquisition, growth strategy"
            rows={2}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader size={20} className="animate-spin" />
              Generating Brief...
            </>
          ) : (
            <>
              Create Brief
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>💡 Tip:</strong> Be specific about your topic and audience for the best
          results. Our AI will generate a comprehensive brief including SEO strategy and
          distribution plan.
        </p>
      </div>
    </div>
  );
}
