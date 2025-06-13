
import React, { useState, useEffect } from 'react';
import { X, Key, Info, User, LogOut, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const SettingsModal = ({
  isOpen,
  onClose,
  apiKey,
  onApiKeyChange,
}) => {
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userEmail, setUserEmail] = useState('user@example.com'); // Mock user data

  useEffect(() => {
    // Check if dark mode is enabled
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const handleSave = () => {
    onApiKeyChange(tempApiKey);
    onClose();
  };

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    // Clear any stored data
    localStorage.removeItem('apiKey');
    localStorage.removeItem('userEmail');
    // Redirect to login or landing page
    window.location.href = '/login';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Configure your preferences and account
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Info Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Account</h3>
            <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">{userEmail}</p>
                <p className="text-xs text-muted-foreground">Signed in</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <Separator />

          {/* Theme Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Appearance</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isDarkMode ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                <Label htmlFor="theme-toggle">Dark mode</Label>
              </div>
              <Switch
                id="theme-toggle"
                checked={isDarkMode}
                onCheckedChange={toggleTheme}
              />
            </div>
          </div>

          <Separator />

          {/* API Key Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">API Configuration</h3>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                You'll need to add your DeepSeek API key to the environment variables for the API to work.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="apiKey">DeepSeek API Key</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="apiKey"
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="Enter your DeepSeek API key"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">
                Your API key will be stored in environment variables for security.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsModal;
