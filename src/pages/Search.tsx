import React, { useState, useRef, useEffect } from 'react';
import { Search, Mic, MicOff, X, Filter, ArrowLeft, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

interface UserPreferences {
  phoneNumber?: string;
  languages: string[];
  genres: string[];
  contentTypes: string[];
  allowLocation: boolean;
}

interface SearchProps {
  userPreferences: UserPreferences;
  onBack: () => void;
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
  { id: 'movies', name: 'Movies', subcategories: ['Feature Films', 'Short Films', 'Documentaries', 'Regional Cinema'] },
  { id: 'series', name: 'TV Shows', subcategories: ['Web Series', 'TV Serials', 'Reality Shows', 'Talk Shows'] },
  { id: 'sports', name: 'Sports', subcategories: ['Cricket', 'Football', 'WWE', 'Olympics'] },
];

const genres = [
  { id: 'action', name: 'Action' },
  { id: 'drama', name: 'Drama' },
  { id: 'comedy', name: 'Comedy' },
  { id: 'romance', name: 'Romance' },
  { id: 'thriller', name: 'Thriller' },
  { id: 'horror', name: 'Horror' },
  { id: 'documentary', name: 'Documentary' },
  { id: 'music', name: 'Music' },
  { id: 'sports', name: 'Sports' },
  { id: 'reality', name: 'Reality Shows' },
];

const popularActors: Actor[] = [
  { id: 'prabhas', name: 'Prabhas', nameNative: 'ప్రభాస్', image: '/placeholder.svg', movieCount: 15, popularMovies: ['Baahubali', 'Saaho', 'Radhe Shyam'] },
  { id: 'mahesh', name: 'Mahesh Babu', nameNative: 'మహేష్ బాబు', image: '/placeholder.svg', movieCount: 25, popularMovies: ['Sarkaru Vaari Paata', 'Maharshi', 'Bharat Ane Nenu'] },
  { id: 'rana', name: 'Rana Daggubati', nameNative: 'రణ దగ్గుబాటి', image: '/placeholder.svg', movieCount: 12, popularMovies: ['Baahubali', 'Ghazi', 'Nene Raju Nene Mantri'] },
  { id: 'allu', name: 'Allu Arjun', nameNative: 'అల్లు అర్జున్', image: '/placeholder.svg', movieCount: 20, popularMovies: ['Pushpa', 'Ala Vaikunthapurramuloo', 'Arya'] },
  { id: 'ram', name: 'Ram Charan', nameNative: 'రామ్ చరణ్', image: '/placeholder.svg', movieCount: 18, popularMovies: ['RRR', 'Rangasthalam', 'Magadheera'] },
];

const Search: React.FC<SearchProps> = ({ userPreferences, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(['Prabhas movies', 'Telugu action', 'Latest releases']);
  const [trendingSearches] = useState<string[]>(['RRR', 'Pushpa 2', 'Salaar', 'Animal']);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    languages: userPreferences.languages,
    contentTypes: userPreferences.contentTypes,
    genres: userPreferences.genres,
    audioOptions: [],
    quality: []
  });
  const [showActorGrid, setShowActorGrid] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize voice recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsVoiceSearching(false);
        handleSearch(transcript);
      };

      recognitionRef.current.onerror = () => {
        setIsVoiceSearching(false);
      };
    }
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setRecentSearches(prev => {
        const newSearches = [query, ...prev.filter(s => s !== query)].slice(0, 5);
        return newSearches;
      });
      setShowSuggestions(false);
      // Here you would typically call your search API
      console.log('Searching for:', query, 'with filters:', filters);
    }
  };

  const handleVoiceSearch = () => {
    if (isVoiceSearching) {
      recognitionRef.current?.stop();
      setIsVoiceSearching(false);
    } else {
      setIsVoiceSearching(true);
      recognitionRef.current?.start();
    }
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    
    if (value.length > 0) {
      // Generate suggestions based on input
      const newSuggestions: SearchSuggestion[] = [
        { id: '1', text: `${value} movies`, type: 'movie' },
        { id: '2', text: `${value} shows`, type: 'show' },
        { id: '3', text: `${value} actor`, type: 'actor' },
      ];
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const toggleFilter = (type: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      languages: [],
      contentTypes: [],
      genres: [],
      audioOptions: [],
      quality: []
    });
  };

  const getLanguageName = (code: string) => {
    const lang = languages.find(l => l.code === code);
    return lang ? `${lang.native} (${lang.english})` : code;
  };

  const getGenreName = (id: string) => {
    const genre = genres.find(g => g.id === id);
    return genre ? genre.name : id;
  };

  const getContentTypeName = (id: string) => {
    const type = contentTypes.find(t => t.id === id);
    return type ? type.name : id;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button size="icon" variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                  placeholder="Search movies, shows, actors..."
                  className="pl-10 pr-20 h-12 rounded-xl border-2 focus:border-primary"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleVoiceSearch}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 ${
                    isVoiceSearching ? 'text-red-500' : 'text-muted-foreground'
                  }`}
                >
                  {isVoiceSearching ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-xl shadow-lg z-50">
                  <ScrollArea className="max-h-60">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => {
                          setSearchQuery(suggestion.text);
                          handleSearch(suggestion.text);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-muted flex items-center space-x-3"
                      >
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <span>{suggestion.text}</span>
                      </button>
                    ))}
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
                    {/* Content Type Section */}
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
                                {type.subcategories.map((sub) => (
                                  <div key={sub} className="flex items-center space-x-2">
                                    <Checkbox id={sub} />
                                    <label htmlFor={sub} className="text-sm text-muted-foreground">{sub}</label>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Language & Audio Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Language & Audio</h3>
                      <div className="space-y-3">
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
                          <h4 className="font-medium mb-2">Audio Options</h4>
                          <div className="space-y-2">
                            {['Original Audio', 'Hindi Dubbed', 'English Dubbed'].map((option) => (
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
                      </div>
                    </div>

                    <Separator />

                    {/* Quality Section */}
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
        {/* Quick Filter Chips */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Quick Filters</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowActorGrid(!showActorGrid)}
            >
              {showActorGrid ? 'Hide' : 'Show'} Actors
            </Button>
          </div>
          
          <ScrollArea className="w-full">
            <div className="flex space-x-2 pb-2">
              {/* Language Chips */}
              {filters.languages.map((lang) => (
                <Badge
                  key={lang}
                  variant="default"
                  className="flex items-center space-x-1 cursor-pointer"
                  onClick={() => toggleFilter('languages', lang)}
                >
                  <span>{getLanguageName(lang)}</span>
                  <X className="w-3 h-3" />
                </Badge>
              ))}
              
              {/* Content Type Chips */}
              {filters.contentTypes.map((type) => (
                <Badge
                  key={type}
                  variant="secondary"
                  className="flex items-center space-x-1 cursor-pointer"
                  onClick={() => toggleFilter('contentTypes', type)}
                >
                  <span>{getContentTypeName(type)}</span>
                  <X className="w-3 h-3" />
                </Badge>
              ))}
              
              {/* Genre Chips */}
              {filters.genres.map((genre) => (
                <Badge
                  key={genre}
                  variant="outline"
                  className="flex items-center space-x-1 cursor-pointer"
                  onClick={() => toggleFilter('genres', genre)}
                >
                  <span>{getGenreName(genre)}</span>
                  <X className="w-3 h-3" />
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Actor Grid */}
        {showActorGrid && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Search by Actor</h3>
            <div className="grid grid-cols-2 gap-4">
              {popularActors.map((actor) => (
                <div
                  key={actor.id}
                  className="bg-card rounded-xl p-4 border cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSearchQuery(actor.name);
                    handleSearch(actor.name);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <img src={actor.image} alt={actor.name} className="w-8 h-8 rounded-full" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{actor.name}</h4>
                      {actor.nameNative && (
                        <p className="text-xs text-muted-foreground">{actor.nameNative}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{actor.movieCount} movies</p>
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

        {/* Voice Search Examples */}
        {isVoiceSearching && (
          <div className="bg-primary/10 rounded-xl p-4 text-center">
            <Mic className="w-8 h-8 text-primary mx-auto mb-2 animate-pulse" />
            <p className="text-sm text-muted-foreground">
              Listening... Try saying: "Latest Tamil action movies"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
