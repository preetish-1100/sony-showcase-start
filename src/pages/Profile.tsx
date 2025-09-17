import React, { useState } from 'react';
import { User, Settings, Crown, Trophy, Target, Star, LogOut, Bell, Calendar } from 'lucide-react';
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
  onSignOut?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ userPreferences, onSignOut }) => {
  const [userXP, setUserXP] = useState(1240);
  const [activeTab, setActiveTab] = useState('xp');

  const handleXPUnlock = (contentId: string, xpCost: number) => {
    setUserXP(prev => prev - xpCost);
    console.log(`Unlocked content ${contentId} for ${xpCost} XP`);
  };

  const handleSignOut = () => {
    console.log('Sign out clicked');
    
    // Clear all user data from localStorage
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('onboardingCompleted');
    
    // Call the parent component's sign out handler
    if (onSignOut) {
      onSignOut();
    } else {
      // Fallback: reload the page to trigger onboarding
      window.location.reload();
    }
  };

  // Language display names
  const getLanguageDisplayName = (languageCode: string) => {
    const languageNames: { [key: string]: string } = {
      'te': 'Telugu',
      'hi': 'Hindi', 
      'ta': 'Tamil',
      'kn': 'Kannada',
      'ml': 'Malayalam',
      'en': 'English',
      'bn': 'Bengali',
      'gu': 'Gujarati',
      'mr': 'Marathi',
      'pa': 'Punjabi'
    };
    return languageNames[languageCode] || languageCode;
  };

  // Genre display names
  const getGenreDisplayName = (genre: string) => {
    return genre.charAt(0).toUpperCase() + genre.slice(1);
  };

  // Content type display names
  const getContentTypeDisplayName = (type: string) => {
    const typeNames: { [key: string]: string } = {
      'movies': 'Movies',
      'tv_shows': 'TV Shows',
      'series': 'Series',
      'sports': 'Sports'
    };
    return typeNames[type] || type;
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
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="w-6 h-6 text-sonyliv-primary" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">My Profile</h1>
            </div>
            <Button size="icon" variant="ghost" className="hover:bg-sonyliv-primary/10">
              <Settings className="w-5 h-5 text-sonyliv-primary" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto pb-24">
        {/* User Info Card */}
        <Card className="mx-4 mt-6 border-2 border-sonyliv-primary/10 shadow-lg">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start space-x-4">
              <div className="relative">
                <Avatar className="w-20 h-20 border-4 border-sonyliv-primary/20">
                  <AvatarImage src={userInfo.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-sonyliv-primary to-purple-600 text-white">
                    <User className="w-10 h-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Star className="w-3 h-3 text-white fill-current" />
                </div>
              </div>
              
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{userInfo.name}</h2>
                <p className="text-sm text-muted-foreground mb-2">{userInfo.phone}</p>
                <div className="space-y-2">
                  <Badge className="bg-gradient-to-r from-gray-400 to-gray-600 text-white border-0">
                    <Crown className="w-3 h-3 mr-1" />
                    {userInfo.level}
                  </Badge>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Member since {userInfo.joinDate}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200">
              <div className="text-center p-3 rounded-lg bg-blue-50">
                <div className="text-2xl font-bold text-sonyliv-primary">{userXP}</div>
                <div className="text-xs text-muted-foreground font-medium">Total XP</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50">
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-xs text-muted-foreground font-medium">Achievements</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-orange-50">
                <div className="text-2xl font-bold text-orange-600">45</div>
                <div className="text-xs text-muted-foreground font-medium">Movies Watched</div>
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
                  <CardTitle className="text-base flex items-center">
                    <Target className="w-4 h-4 mr-2 text-sonyliv-primary" />
                    Your Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Content Types */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Content Types</label>
                    <div className="flex flex-wrap gap-2">
                      {userPreferences.contentTypes.length > 0 ? (
                        userPreferences.contentTypes.map((type) => (
                          <Badge key={type} variant="default" className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200">
                            {getContentTypeDisplayName(type)}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No content types selected</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Languages */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Languages</label>
                    <div className="flex flex-wrap gap-2">
                      {userPreferences.languages.length > 0 ? (
                        userPreferences.languages.map((lang) => (
                          <Badge key={lang} variant="secondary" className="text-xs bg-green-100 text-green-800 hover:bg-green-200">
                            {getLanguageDisplayName(lang)}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No languages selected</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Genres */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Favorite Genres</label>
                    <div className="flex flex-wrap gap-2">
                      {userPreferences.genres.length > 0 ? (
                        userPreferences.genres.map((genre) => (
                          <Badge key={genre} variant="outline" className="text-xs bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300">
                            {getGenreDisplayName(genre)}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No genres selected</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Location */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-muted-foreground">Location-based Content</label>
                      <Badge variant={userPreferences.allowLocation ? "default" : "secondary"} className="text-xs">
                        {userPreferences.allowLocation ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4 border-sonyliv-primary text-sonyliv-primary hover:bg-sonyliv-primary hover:text-white">
                    <Settings className="w-4 h-4 mr-2" />
                    Update Preferences
                  </Button>
                </CardContent>
              </Card>

              {/* Logout */}
              <Card>
                <CardContent className="pt-6">
                  <Button 
                    variant="outline" 
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleSignOut}
                  >
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