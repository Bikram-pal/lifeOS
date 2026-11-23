import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../../components/common/Card';
import { Settings as SettingsIcon, Save, Key, Cpu, User } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';
import { toast } from 'sonner';

export const SettingsPage = () => {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [aiModel, setAiModel] = useState(user?.preferences?.aiModel || 'llama-3.3-70b-versatile');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await authService.updateProfile({
        name,
        preferences: {
          ...user?.preferences,
          aiModel,
        },
      });
      setUser(res.data.user);
      toast.success('Settings updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">System Settings</h2>
        <p className="text-sm text-slate-400 mt-1">
          Configure your user profile, Groq AI model preferences, and workspace options.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary-400" />
              <CardTitle>Profile Information</CardTitle>
            </div>
          </CardHeader>
          <div className="space-y-4 max-w-md">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
            <Input
              label="Email Address"
              value={user?.email || ''}
              disabled
              helperText="Email cannot be changed directly."
            />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-violet-400" />
              <CardTitle>AI Engine Configuration</CardTitle>
            </div>
          </CardHeader>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Configured Groq LLM Model
              </label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full bg-[#111726] border border-[#233054] rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-primary-500 font-mono"
              >
                <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Recommended)</option>
                <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Fast / Low Latency)</option>
                <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
              </select>
              <p className="text-xs text-slate-400 mt-1.5">
                The AI service routes queries to this model via your backend Groq API client.
              </p>
            </div>
          </div>
        </Card>

        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save Preferences
        </Button>
      </form>
    </div>
  );
};
