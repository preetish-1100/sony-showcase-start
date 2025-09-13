import React, { useState } from 'react';
import { User, Settings, Crown, Trophy, Target, Star, LogOut, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import XPDashboard from '@/components/gamification/XPDashboard';
import AchievementSystem from '@/components/gamification/AchievementSystem';
import PremiumUnlockSystem from '@/components/gamification/PremiumUnlockSystem';

interface ProfileProps {
  userPreferences: {
    phoneNumber?: string;
    languages: string[];
    genres: string[];
    contentTypes: string[];
    allowLocation: boolean;
  };
}

const Profile: React.FC<ProfileProps> = ({ userPreferences }) => {
  const [userXP, setUserXP] = useState(1240);
  const [activeTab, setActiveTab] = useState('xp');

  const handleXPUnlock = (contentId: string, xpCost: number) => {
    setUserXP(prev => prev - xpCost);
    console.log(`Unlocked content ${contentId} for ${xpCost} XP`);
  };

  const userInfo = {
    name: 'SonyLIV User',
    phone: userPreferences.phoneNumber || '+91 98765 43210',
    avatar: '/placeholder.svg',
    joinDate: 'March 2024',
    level: 'Silver Viewer'
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Profile</h1>
            <Button size="icon" variant="ghost">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto pb-20">
        {/* User Info Card */}
        <Card className="mx-4 mt-4">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={userInfo.avatar} />
                <AvatarFallback>
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{userInfo.name}</h2>
                <p className="text-sm text-muted-foreground">{userInfo.phone}</p>
                <div className="flex items-center mt-2 space-x-2">
                  <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 text-black">
                    <Star className="w-3 h-3 mr-1" />
                    {userInfo.level}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Since {userInfo.joinDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-bold text-sonyliv-primary">{userXP}</div>
                <div className="text-xs text-muted-foreground">Total XP</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-500">12</div>
                <div className="text-xs text-muted-foreground">Achievements</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-500">45</div>
                <div className="text-xs text-muted-foreground">Movies Watched</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-4 mx-4">
            <TabsTrigger value="xp" className="text-xs">
              <Zap className="w-4 h-4 mr-1" />
              XP
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs">
              <Trophy className="w-4 h-4 mr-1" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="favorites" className="text-xs">
              <Crown className="w-4 h-4 mr-1" />
              Premium
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="xp" className="mt-0">
            <XPDashboard />
          </TabsContent>

          <TabsContent value="achievements" className="mt-0">
            <AchievementSystem />
          </TabsContent>

          <TabsContent value="favorites" className="mt-0">
            <PremiumUnlockSystem 
              userXP={userXP}
              onUnlock={handleXPUnlock}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <div className="space-y-4 p-4">
              {/* Account Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Crown className="w-4 h-4 mr-2" />
                    Premium Plans
                  </Button>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Your Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Languages</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {userPreferences.languages.map((lang) => (
                        <Badge key={lang} variant="secondary" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Genres</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {userPreferences.genres.map((genre) => (
                        <Badge key={genre} variant="secondary" className="text-xs">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-3">
                    Update Preferences
                  </Button>
                </CardContent>
              </Card>

              {/* Logout */}
              <Card>
                <CardContent className="pt-6">
                  <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const Zap: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);

export default Profile;