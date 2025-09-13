import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Mic, MicOff, X, Filter, ArrowLeft, Clock, TrendingUp, Play, Star, Plus, Users, Volume2, VolumeX, Subtitles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';

interface UserPreferences {
  phoneNumber?: string;
  languages: string[];
  genres: string[];
  contentTypes: string[];
  allowLocation: boolean;
}

interface SearchResult {
  id: string;
  title: string;
  type: 'movie' | 'show' | 'actor';
  image: string;
  rating: number;
  year?: number;
  duration?: string;
  language?: string;
  isPremium?: boolean;
  description?: string;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'movie' | 'show' | 'actor' | 'genre' | 'recent';
  image?: string;
}

interface Actor {
  id: string;
  name: string;
  nameNative?: string;
  image: string;
  movieCount: number;
  popularMovies: string[];
}

interface FilterState {
  languages: string[];
  contentTypes: string[];
  genres: string[];
  audioOptions: string[];
  quality: string[];
  subtitles: string[];
}

interface VoiceSearchState {
  isListening: boolean;
  transcript: string;
  confidence: number;
  language: string;
}

interface SmartSuggestion {
  id: string;
  text: string;
  type: 'movie' | 'show' | 'actor' | 'genre' | 'recent' | 'trending' | 'correction';
  image?: string;
  confidence?: number;
  isCorrection?: boolean;
  originalQuery?: string;
}

const languages = [
  { code: 'te', native: 'తెలుగు', english: 'Telugu' },
  { code: 'hi', native: 'हिंदी', english: 'Hindi' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil' },
  { code: 'ml', native: 'മലയാളം', english: 'Malayalam' },
  { code: 'kn', native: 'ಕನ್ನಡ', english: 'Kannada' },
  { code: 'bn', native: 'বাংলা', english: 'Bengali' },
  { code: 'gu', native: 'ગુજરાતી', english: 'Gujarati' },
  { code: 'mr', native: 'मराठी', english: 'Marathi' },
  { code: 'en', native: 'English', english: 'English' },
  { code: 'pa', native: 'ਪੰਜਾਬੀ', english: 'Punjabi' },
  { code: 'as', native: 'অসমীয়া', english: 'Assamese' },
  { code: 'or', native: 'ଓଡିଆ', english: 'Odia' },
];

const contentTypes = [
  { 
    id: 'movies', 
    name: 'Movies', 
    subcategories: ['Feature Films', 'Short Films', 'Documentaries', 'Regional Cinema'],
    regionalSubgenres: {
      'te': ['Mass Masala', 'Family Drama', 'Period Drama', 'Commercial Cinema'],
      'ta': ['Action Thriller', 'Rural Drama', 'Urban Comedy', 'Social Drama'],
      'hi': ['Social Drama', 'Historical', 'Musical', 'Romantic Comedy'],
      'ml': ['Art House', 'Family Drama', 'Thriller', 'Comedy'],
      'kn': ['Commercial Cinema', 'Art Cinema', 'Family Drama', 'Action']
    }
  },
  { 
    id: 'series', 
    name: 'TV Shows', 
    subcategories: ['Web Series', 'TV Serials', 'Reality Shows', 'Talk Shows'],
    regionalSubgenres: {
      'te': ['Daily Soaps', 'Reality Shows', 'Talk Shows', 'Web Series'],
      'ta': ['Serial Dramas', 'Reality Shows', 'Comedy Shows', 'Web Series'],
      'hi': ['Serial Dramas', 'Reality Shows', 'Comedy Shows', 'Web Series'],
      'ml': ['Serial Dramas', 'Reality Shows', 'Talk Shows', 'Web Series'],
      'kn': ['Serial Dramas', 'Reality Shows', 'Comedy Shows', 'Web Series']
    }
  },
  { 
    id: 'sports', 
    name: 'Sports', 
    subcategories: ['Cricket', 'Football', 'WWE', 'Olympics'],
    regionalSubgenres: {}
  },
];

const genres = [
  { id: 'action', name: 'Action', regionalNames: { 'te': 'ఆక్షన్', 'ta': 'ஆக்ஷன்', 'hi': 'एक्शन' } },
  { id: 'drama', name: 'Drama', regionalNames: { 'te': 'డ్రామా', 'ta': 'டிராமா', 'hi': 'ड्रामा' } },
  { id: 'comedy', name: 'Comedy', regionalNames: { 'te': 'కామెడీ', 'ta': 'காமெடி', 'hi': 'कॉमेडी' } },
  { id: 'romance', name: 'Romance', regionalNames: { 'te': 'రొమాన్స్', 'ta': 'ரொமான்ஸ்', 'hi': 'रोमांस' } },
  { id: 'thriller', name: 'Thriller', regionalNames: { 'te': 'థ్రిల్లర్', 'ta': 'த்ரில்லர்', 'hi': 'थ्रिलर' } },
  { id: 'horror', name: 'Horror', regionalNames: { 'te': 'హారర్', 'ta': 'ஹாரர்', 'hi': 'हॉरर' } },
  { id: 'documentary', name: 'Documentary', regionalNames: { 'te': 'డాక్యుమెంటరీ', 'ta': 'டாக்குமெண்டரி', 'hi': 'डॉक्यूमेंटरी' } },
  { id: 'music', name: 'Music', regionalNames: { 'te': 'మ్యూజిక్', 'ta': 'மியூசிக்', 'hi': 'संगीत' } },
  { id: 'sports', name: 'Sports', regionalNames: { 'te': 'స్పోర్ట్స్', 'ta': 'ஸ்போர்ட்ஸ்', 'hi': 'खेल' } },
  { id: 'reality', name: 'Reality Shows', regionalNames: { 'te': 'రియాలిటీ షోలు', 'ta': 'ரியாலிட்டி ஷோஸ்', 'hi': 'रियलिटी शो' } },
];

const popularActors: Actor[] = [
  // Telugu Actors
  { id: 'prabhas', name: 'Prabhas', nameNative: 'ప్రభాస్', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=face', movieCount: 15, popularMovies: ['Baahubali', 'Saaho', 'Radhe Shyam'] },
  { id: 'mahesh', name: 'Mahesh Babu', nameNative: 'మహేష్ బాబు', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=400&fit=crop&crop=face', movieCount: 25, popularMovies: ['Sarkaru Vaari Paata', 'Maharshi', 'Bharat Ane Nenu'] },
  { id: 'rana', name: 'Rana Daggubati', nameNative: 'రణ దగ్గుబాటి', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=400&fit=crop&crop=face', movieCount: 12, popularMovies: ['Baahubali', 'Ghazi', 'Nene Raju Nene Mantri'] },
  { id: 'allu', name: 'Allu Arjun', nameNative: 'అల్లు అర్జున్', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=400&fit=crop&crop=face', movieCount: 20, popularMovies: ['Pushpa', 'Ala Vaikunthapurramuloo', 'Arya'] },
  { id: 'ram', name: 'Ram Charan', nameNative: 'రామ్ చరణ్', image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=300&h=400&fit=crop&crop=face', movieCount: 18, popularMovies: ['RRR', 'Rangasthalam', 'Magadheera'] },
  
  // Tamil Actors
  { id: 'vijay', name: 'Vijay', nameNative: 'விஜய்', image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=400&fit=crop&crop=face', movieCount: 22, popularMovies: ['Beast', 'Master', 'Bigil'] },
  { id: 'ajith', name: 'Ajith Kumar', nameNative: 'அஜித் குமார்', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop&crop=face', movieCount: 20, popularMovies: ['Valimai', 'Viswasam', 'Vivegam'] },
  { id: 'rajini', name: 'Rajinikanth', nameNative: 'ரஜினிகாந்த்', image: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=300&h=400&fit=crop&crop=face', movieCount: 30, popularMovies: ['Kabali', 'Kaala', 'Darbar'] },
  
  // Hindi Actors
  { id: 'salman', name: 'Salman Khan', nameNative: 'सलमान खान', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=face', movieCount: 28, popularMovies: ['Tiger 3', 'Bharat', 'Sultan'] },
  { id: 'shahrukh', name: 'Shah Rukh Khan', nameNative: 'शाहरुख खान', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=400&fit=crop&crop=face', movieCount: 32, popularMovies: ['Pathaan', 'Jawan', 'Dunki'] },
  { id: 'amitabh', name: 'Amitabh Bachchan', nameNative: 'अमिताभ बच्चन', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=400&fit=crop&crop=face', movieCount: 40, popularMovies: ['Brahmastra', 'Gulabo Sitabo', 'Piku'] },
];

const Search: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(['Prabhas movies', 'Telugu action', 'Latest releases']);
  const [trendingSearches] = useState<string[]>(['RRR', 'Pushpa 2', 'Salaar', 'Animal', 'Pathaan', 'Jawan']);
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceSearchState>({
    isListening: false,
    transcript: '',
    confidence: 0,
    language: 'en-US'
  });
  const [filters, setFilters] = useState<FilterState>({
    languages: [],
    contentTypes: [],
    genres: [],
    audioOptions: [],
    quality: [],
    subtitles: []
  });
  const [showActorGrid, setShowActorGrid] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [userPrimaryLanguage, setUserPrimaryLanguage] = useState('te'); // Default to Telugu
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mock search results data
  const mockSearchResults: SearchResult[] = [
    {
      id: '1',
      title: 'RRR',
      type: 'movie',
      image: 'https://images.unsplash.com/photo-1509347528160-9329d33b280f?w=300&h=400&fit=crop',
      rating: 4.5,
      year: 2022,
      duration: '3h 7m',
      language: 'Telugu',
      isPremium: false,
      description: 'A fictional story about two legendary revolutionaries and their journey away from home before they started fighting for their country in 1920s.'
    },
    {
      id: '2',
      title: 'Pushpa: The Rise',
      type: 'movie',
      image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=400&fit=crop&crop=face',
      rating: 4.2,
      year: 2021,
      duration: '2h 59m',
      language: 'Telugu',
      isPremium: false,
      description: 'A laborer rises through the ranks of a sandalwood smuggling syndicate, making some powerful enemies in the process.'
    },
    {
      id: '3',
      title: 'KGF Chapter 2',
      type: 'movie',
      image: 'https://images.unsplash.com/photo-1518604666860-f6c8c9199b44?w=300&h=400&fit=crop',
      rating: 4.3,
      year: 2022,
      duration: '2h 48m',
      language: 'Kannada',
      isPremium: true,
      description: 'Rocky, a young man, seeks power and wealth in order to fulfill a promise to his dying mother.'
    },
    {
      id: '4',
      title: 'Prabhas',
      type: 'actor',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=face',
      rating: 4.6,
      language: 'Telugu',
      description: 'Indian actor known for his work in Telugu cinema. Famous for Baahubali series.'
    },
    {
      id: '5',
      title: 'Baahubali 2: The Conclusion',
      type: 'movie',
      image: 'https://images.unsplash.com/photo-1518604666860-f6c8c9199b44?w=300&h=400&fit=crop',
      rating: 4.7,
      year: 2017,
      duration: '2h 47m',
      language: 'Telugu',
      isPremium: true,
      description: 'When Shiva learns the truth about his heritage, he rises to fulfill his destiny.'
    }
  ];

  // Initialize voice recognition with multi-language support
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      
      // Set language based on user's primary language
      const languageMap: { [key: string]: string } = {
        'te': 'te-IN',
        'hi': 'hi-IN', 
        'ta': 'ta-IN',
        'ml': 'ml-IN',
        'kn': 'kn-IN',
        'bn': 'bn-IN',
        'gu': 'gu-IN',
        'mr': 'mr-IN',
        'pa': 'pa-IN',
        'as': 'as-IN',
        'or': 'or-IN',
        'en': 'en-US'
      };
      
      recognitionRef.current.lang = languageMap[userPrimaryLanguage] || 'en-US';

      recognitionRef.current.onstart = () => {
        setVoiceState(prev => ({ ...prev, isListening: true }));
        setIsVoiceSearching(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        
        setVoiceState(prev => ({
          ...prev,
          transcript,
          confidence,
          isListening: false
        }));
        
        setSearchQuery(transcript);
        setIsVoiceSearching(false);
        handleSearch(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.log('Voice recognition error:', event.error);
        setVoiceState(prev => ({ ...prev, isListening: false }));
        setIsVoiceSearching(false);
      };

      recognitionRef.current.onend = () => {
        setVoiceState(prev => ({ ...prev, isListening: false }));
        setIsVoiceSearching(false);
      };
    }
  }, [userPrimaryLanguage]);

  // Perform search when component mounts with query param
  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  }, []); // Empty dependency array is correct here

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleSearch = useCallback((query: string) => {
    if (query.trim()) {
      setIsSearching(true);
      setRecentSearches(prev => {
        const newSearches = [query, ...prev.filter(s => s !== query)].slice(0, 5);
        return newSearches;
      });
      setShowSuggestions(false);
      
      // Update URL with search query
      setSearchParams({ q: query });
      
      // Simulate API call with mock data
      setTimeout(() => {
        const filteredResults = mockSearchResults.filter(result => 
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description?.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filteredResults);
        setIsSearching(false);
      }, 500);
    }
  }, [setSearchParams]);

  const handleVoiceSearch = useCallback(() => {
    if (isVoiceSearching) {
      recognitionRef.current?.stop();
      setIsVoiceSearching(false);
    } else {
      setIsVoiceSearching(true);
      recognitionRef.current?.start();
    }
  }, [isVoiceSearching]);

  // Memoized suggestion generator to prevent unnecessary recalculations
  const generateSuggestions = useCallback((value: string): SmartSuggestion[] => {
    if (value.length === 0) return [];
    
    const smartSuggestions: SmartSuggestion[] = [];
    const lowerValue = value.toLowerCase();
    
    // Actor name suggestions with regional support
    const matchingActors = popularActors.filter(actor => 
      actor.name.toLowerCase().includes(lowerValue) ||
      actor.nameNative?.toLowerCase().includes(lowerValue)
    );
    
    matchingActors.forEach(actor => {
      smartSuggestions.push({
        id: `actor-${actor.id}`,
        text: `${actor.name} movies`,
        type: 'actor',
        image: actor.image,
        confidence: 0.9
      });
    });
    
    // Movie/show suggestions
    const matchingMovies = mockSearchResults.filter(result => 
      result.title.toLowerCase().includes(lowerValue)
    );
    
    matchingMovies.forEach(movie => {
      smartSuggestions.push({
        id: `movie-${movie.id}`,
        text: movie.title,
        type: movie.type,
        image: movie.image,
        confidence: 0.8
      });
    });
    
    // Genre suggestions with regional names
    const matchingGenres = genres.filter(genre => 
      genre.name.toLowerCase().includes(lowerValue) ||
      Object.values(genre.regionalNames || {}).some(name => 
        name.toLowerCase().includes(lowerValue)
      )
    );
    
    matchingGenres.forEach(genre => {
      smartSuggestions.push({
        id: `genre-${genre.id}`,
        text: `${genre.name} movies`,
        type: 'genre',
        confidence: 0.7
      });
    });
    
    // Recent searches suggestions
    const matchingRecent = recentSearches.filter(search => 
      search.toLowerCase().includes(lowerValue)
    );
    
    matchingRecent.forEach(search => {
      smartSuggestions.push({
        id: `recent-${search}`,
        text: search,
        type: 'recent',
        confidence: 0.6
      });
    });
    
    // Trending suggestions
    const matchingTrending = trendingSearches.filter(search => 
      search.toLowerCase().includes(lowerValue)
    );
    
    matchingTrending.forEach(search => {
      smartSuggestions.push({
        id: `trending-${search}`,
        text: search,
        type: 'trending',
        confidence: 0.5
      });
    });
    
    // Smart corrections for common typos
    if (lowerValue.includes('prab')) {
      smartSuggestions.push({
        id: 'correction-prabhas',
        text: 'Prabhas movies',
        type: 'correction',
        isCorrection: true,
        originalQuery: value,
        confidence: 0.4
      });
    }
    
    // Sort by confidence and limit to 8 suggestions
    return smartSuggestions
      .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
      .slice(0, 8);
  }, [recentSearches, trendingSearches]);

  // Debounced input change handler
  const handleInputChange = useCallback((value: string) => {
    setSearchQuery(value);
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    if (value.length > 0) {
      // Debounce the suggestion generation
      debounceTimeoutRef.current = setTimeout(() => {
        const newSuggestions = generateSuggestions(value);
        setSuggestions(newSuggestions);
        setShowSuggestions(true);
      }, 150); // 150ms debounce
    } else {
      setShowSuggestions(false);
    }
  }, [generateSuggestions]);

  const toggleFilter = useCallback((type: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      languages: [],
      contentTypes: [],
      genres: [],
      audioOptions: [],
      quality: [],
      subtitles: []
    });
  }, []);

  const getLanguageName = useCallback((code: string) => {
    const lang = languages.find(l => l.code === code);
    return lang ? `${lang.native} (${lang.english})` : code;
  }, []);

  const getGenreName = useCallback((id: string) => {
    const genre = genres.find(g => g.id === id);
    return genre ? genre.name : id;
  }, []);

  const getContentTypeName = useCallback((id: string) => {
    const type = contentTypes.find(t => t.id === id);
    return type ? type.name : id;
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button size="icon" variant="ghost" onClick={() => navigate('/home')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            {/* Enhanced Search Bar */}
            <div className="flex-1 relative">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                  placeholder={`Search movies, shows, actors...`}
                  className="pl-10 pr-20 h-12 rounded-xl border-2 focus:border-primary bg-background/95 backdrop-blur-sm"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleVoiceSearch}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 transition-colors ${
                    voiceState.isListening ? 'text-red-500 bg-red-50' : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  {voiceState.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>

              {/* Enhanced Search Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background/95 backdrop-blur-sm border rounded-xl shadow-lg z-50">
                  <ScrollArea className="max-h-60">
                    <div className="p-2">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => {
                            setSearchQuery(suggestion.text);
                            handleSearch(suggestion.text);
                          }}
                          className="w-full px-3 py-3 text-left hover:bg-muted/50 rounded-lg flex items-center space-x-3 transition-colors"
                        >
                          {suggestion.image && (
                            <img 
                              src={suggestion.image} 
                              alt={suggestion.text}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{suggestion.text}</span>
                              {suggestion.isCorrection && (
                                <Badge variant="outline" className="text-xs">
                                  Did you mean?
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {suggestion.type} • {Math.round((suggestion.confidence || 0) * 100)}% match
                            </div>
                          </div>
                          <SearchIcon className="w-4 h-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>

            {/* Advanced Filters Button */}
            <Sheet open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="text-muted-foreground">
                  <Filter className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[70vh]">
                <SheetHeader>
                  <SheetTitle>Refine Your Search</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-full mt-6">
                  <div className="space-y-6">
                    {/* Enhanced Content Type Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Content Type</h3>
                      <div className="space-y-3">
                        {contentTypes.map((type) => (
                          <div key={type.id}>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={type.id}
                                checked={filters.contentTypes.includes(type.id)}
                                onCheckedChange={() => toggleFilter('contentTypes', type.id)}
                              />
                              <label htmlFor={type.id} className="font-medium">{type.name}</label>
                            </div>
                            {filters.contentTypes.includes(type.id) && (
                              <div className="ml-6 mt-2 space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">General Categories</h4>
                                {type.subcategories.map((sub) => (
                                  <div key={sub} className="flex items-center space-x-2">
                                    <Checkbox id={sub} />
                                    <label htmlFor={sub} className="text-sm text-muted-foreground">{sub}</label>
                                  </div>
                                ))}
                                
                                {/* Regional Subgenres */}
                                {type.regionalSubgenres && Object.keys(type.regionalSubgenres).length > 0 && (
                                  <>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2 mt-4">Regional Subgenres</h4>
                                    {Object.entries(type.regionalSubgenres).map(([langCode, subgenres]) => {
                                      const lang = languages.find(l => l.code === langCode);
                                      return (
                                        <div key={langCode} className="ml-4">
                                          <h5 className="text-xs font-medium text-muted-foreground mb-1">
                                            {lang?.native} ({lang?.english})
                                          </h5>
                                          <div className="space-y-1">
                                            {subgenres.map((subgenre) => (
                                              <div key={subgenre} className="flex items-center space-x-2">
                                                <Checkbox id={`${type.id}-${langCode}-${subgenre}`} />
                                                <label htmlFor={`${type.id}-${langCode}-${subgenre}`} className="text-xs text-muted-foreground">
                                                  {subgenre}
                                                </label>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Enhanced Language & Audio Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Language & Audio</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Original Language</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {languages.map((lang) => (
                              <div key={lang.code} className="flex items-center space-x-2">
                                <Checkbox
                                  id={lang.code}
                                  checked={filters.languages.includes(lang.code)}
                                  onCheckedChange={() => toggleFilter('languages', lang.code)}
                                />
                                <label htmlFor={lang.code} className="text-sm">
                                  {lang.native}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2 flex items-center space-x-2">
                            <Volume2 className="w-4 h-4" />
                            Audio Options
                          </h4>
                          <div className="space-y-2">
                            {['Original Audio', 'Hindi Dubbed', 'English Dubbed', 'Multiple Language Options'].map((option) => (
                              <div key={option} className="flex items-center space-x-2">
                                <Checkbox
                                  id={option}
                                  checked={filters.audioOptions.includes(option)}
                                  onCheckedChange={() => toggleFilter('audioOptions', option)}
                                />
                                <label htmlFor={option} className="text-sm">{option}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2 flex items-center space-x-2">
                            <Subtitles className="w-4 h-4" />
                            Subtitle Options
                          </h4>
                          <div className="space-y-2">
                            {['English Subtitles', 'Hindi Subtitles', 'Regional Language Subtitles', 'No Subtitles Needed'].map((option) => (
                              <div key={option} className="flex items-center space-x-2">
                                <Checkbox
                                  id={option}
                                  checked={filters.subtitles.includes(option)}
                                  onCheckedChange={() => toggleFilter('subtitles', option)}
                                />
                                <label htmlFor={option} className="text-sm">{option}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Enhanced Quality Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Quality</h3>
                      <div className="space-y-2">
                        {['HD Available', '4K Available', 'Dolby Audio'].map((quality) => (
                          <div key={quality} className="flex items-center space-x-2">
                            <Checkbox
                              id={quality}
                              checked={filters.quality.includes(quality)}
                              onCheckedChange={() => toggleFilter('quality', quality)}
                            />
                            <label htmlFor={quality} className="text-sm">{quality}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Genre Refinement Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Genre Refinement</h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium mb-2">Primary Genres</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {genres.slice(0, 5).map((genre) => (
                              <div key={genre.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={genre.id}
                                  checked={filters.genres.includes(genre.id)}
                                  onCheckedChange={() => toggleFilter('genres', genre.id)}
                                />
                                <label htmlFor={genre.id} className="text-sm">
                                  {genre.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Regional Genre Names</h4>
                          <div className="space-y-2">
                            {genres.slice(0, 5).map((genre) => (
                              <div key={`regional-${genre.id}`} className="text-xs text-muted-foreground">
                                <span className="font-medium">{genre.name}:</span>{' '}
                                {Object.entries(genre.regionalNames || {}).map(([code, name]) => {
                                  const lang = languages.find(l => l.code === code);
                                  return `${lang?.native} (${name})`;
                                }).join(', ')}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Clear All Button */}
                    <div className="pt-4">
                      <Button variant="outline" onClick={clearAllFilters} className="w-full">
                        Clear All Filters
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-4">
        {/* Quick Filter Chips - Enhanced */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Quick Filters</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowActorGrid(!showActorGrid)}
              className="flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>{showActorGrid ? 'Hide' : 'Show'} Actors</span>
            </Button>
          </div>
          
          {/* Default Quick Filter Chips */}
          <ScrollArea className="w-full">
            <div className="flex space-x-2 pb-2">
              {/* Primary Language Chip - Always First */}
              <Badge
                variant="default"
                className="flex items-center space-x-1 cursor-pointer bg-primary text-primary-foreground"
                onClick={() => toggleFilter('languages', userPrimaryLanguage)}
              >
                <span>{getLanguageName(userPrimaryLanguage)}</span>
                {filters.languages.includes(userPrimaryLanguage) && <X className="w-3 h-3" />}
              </Badge>
              
              {/* Content Type Quick Chips */}
              {['movies', 'series', 'sports'].map((type) => (
                <Badge
                  key={type}
                  variant={filters.contentTypes.includes(type) ? "default" : "outline"}
                  className="flex items-center space-x-1 cursor-pointer"
                  onClick={() => toggleFilter('contentTypes', type)}
                >
                  <span>{getContentTypeName(type)}</span>
                  {filters.contentTypes.includes(type) && <X className="w-3 h-3" />}
                </Badge>
              ))}
              
              {/* Audio Options Quick Chips */}
              {['Original Audio', 'Hindi Dubbed', 'English Dubbed'].map((option) => (
                <Badge
                  key={option}
                  variant={filters.audioOptions.includes(option) ? "secondary" : "outline"}
                  className="flex items-center space-x-1 cursor-pointer"
                  onClick={() => toggleFilter('audioOptions', option)}
                >
                  <Volume2 className="w-3 h-3" />
                  <span className="text-xs">{option}</span>
                  {filters.audioOptions.includes(option) && <X className="w-3 h-3" />}
                </Badge>
              ))}
              
              {/* Quality Quick Chips */}
              {['HD Available', '4K Available'].map((quality) => (
                <Badge
                  key={quality}
                  variant={filters.quality.includes(quality) ? "secondary" : "outline"}
                  className="flex items-center space-x-1 cursor-pointer"
                  onClick={() => toggleFilter('quality', quality)}
                >
                  <Star className="w-3 h-3" />
                  <span className="text-xs">{quality}</span>
                  {filters.quality.includes(quality) && <X className="w-3 h-3" />}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Enhanced Actor Grid */}
        {showActorGrid && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Search by Actor</h3>
              <Badge variant="outline" className="text-xs">
                {popularActors.length} actors available
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {popularActors.map((actor) => (
                <div
                  key={actor.id}
                  className="bg-card rounded-xl p-4 border cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => {
                    setSearchQuery(actor.name);
                    handleSearch(actor.name);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                      <img 
                        src={actor.image} 
                        alt={actor.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{actor.name}</h4>
                      {actor.nameNative && (
                        <p className="text-xs text-muted-foreground truncate">{actor.nameNative}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-muted-foreground">{actor.movieCount} movies</p>
                        <div className="flex space-x-1">
                          {actor.popularMovies.slice(0, 2).map((movie, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs px-1 py-0">
                              {movie}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Recent Searches</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => {
                    setSearchQuery(search);
                    handleSearch(search);
                  }}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Trending Searches */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Trending Searches</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingSearches.map((search, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => {
                  setSearchQuery(search);
                  handleSearch(search);
                }}
              >
                {search}
              </Badge>
            ))}
          </div>
        </div>

        {/* Enhanced Voice Search Examples */}
        {voiceState.isListening && (
          <div className="bg-primary/10 rounded-xl p-4 text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Mic className="w-6 h-6 text-primary animate-pulse" />
              <span className="text-sm font-medium">Listening...</span>
            </div>
            {voiceState.transcript && (
              <p className="text-sm text-muted-foreground mb-2">
                "{voiceState.transcript}"
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Try saying: "Latest Tamil action movies" or "Prabhas Telugu films"
            </p>
            <div className="mt-2 text-xs text-muted-foreground">
              Confidence: {Math.round(voiceState.confidence * 100)}%
            </div>
          </div>
        )}

        {/* Search Results */}
        {isSearching && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Searching...</p>
          </div>
        )}

        {!isSearching && searchResults.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Search Results</h3>
            <div className="space-y-4">
              {searchResults.map((result) => (
                <Card key={result.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="w-24 h-32 flex-shrink-0">
                        <img 
                          src={result.image} 
                          alt={result.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-lg">{result.title}</h4>
                          {result.isPremium && (
                            <Badge variant="secondary" className="text-xs">Premium</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{result.rating}</span>
                          </div>
                          {result.year && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-sm text-muted-foreground">{result.year}</span>
                            </>
                          )}
                          {result.duration && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-sm text-muted-foreground">{result.duration}</span>
                            </>
                          )}
                        </div>

                        {result.language && (
                          <Badge variant="outline" className="text-xs mb-2">
                            {result.language}
                          </Badge>
                        )}

                        {result.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {result.description}
                          </p>
                        )}

                        <div className="flex space-x-2">
                          <Button size="sm" className="flex-1">
                            <Play className="w-4 h-4 mr-2" />
                            {result.type === 'actor' ? 'View Profile' : 'Play'}
                          </Button>
                          <Button size="sm" variant="outline">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!isSearching && searchQuery && searchResults.length === 0 && (
          <div className="text-center py-8">
            <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">
              Try searching for something else or check your spelling
            </p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
