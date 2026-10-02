import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

export type PostOffice = {
  id: string;
  provider: 'belpost' | 'evropochta';
  name: string;
  city: string;
  address: string;
  displayName: string;
};

type PostOfficeAutocompleteProps = {
  provider: 'belpost' | 'evropochta';
  value: string;
  onSelect: (office: PostOffice | null) => void;
  onChange: (value: string) => void;
  error?: string;
};

type SearchResult = PostOffice;

const normalize = (s: string): string => {
  return s
    .toLowerCase()
    .trim()
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
    .replace(/,/g, ' ')
    .replace(/пр-т\s|просп\.?\s|проспект\s/g, 'проспект ')
    .replace(/ул\s|улица\s/g, 'улица ')
    .replace(/пер\s|переулок\s/g, 'переулок ')
    .replace(/\s+/g, ' ')
    .trim();
};

export default function PostOfficeAutocomplete({ provider, value, onSelect, onChange, error }: PostOfficeAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [apiError, setApiError] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setShowSuggestions(true);

    debounceRef.current = setTimeout(async () => {
      abortRef.current = new AbortController();
      const query = value.trim();
      const normalized = normalize(query);

      const results = searchLocalProvider(provider, normalized);
      setSuggestions(results);
      setIsLoading(false);
      setApiError(results.length === 0 && query.length >= 4);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, provider]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (office: SearchResult) => {
    onChange(office.displayName);
    onSelect(office);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="post-office-autocomplete" ref={containerRef}>
      <div className="post-office-input-wrap">
        <Search size={15} className="post-office-icon" />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onSelect(null);
          }}
          onFocus={() => { if (value.trim().length >= 2) setShowSuggestions(true); }}
          placeholder="Введите город, номер отделения, улицу или адрес"
          className={`post-office-input ${error ? 'is-error' : ''}`}
          aria-label="Отделение получения"
        />
        {value && (
          <button type="button" className="post-office-clear" onClick={() => { onChange(''); onSelect(null); setSuggestions([]); }} aria-label="Очистить">
            <X size={14} />
          </button>
        )}
      </div>

      {showSuggestions && (
        <div className="post-office-dropdown">
          {isLoading && <div className="post-office-loading">Поиск отделений…</div>}
          {!isLoading && suggestions.length > 0 && (
            <div className="post-office-list">
              {suggestions.map((office) => (
                <button
                  type="button"
                  key={office.id}
                  className="post-office-item"
                  onClick={() => handleSelect(office)}
                >
                  <span className="post-office-item-name">{office.name}</span>
                  <span className="post-office-item-address">{office.address}</span>
                  <span className="post-office-item-city">{office.city}</span>
                </button>
              ))}
            </div>
          )}
          {!isLoading && suggestions.length === 0 && !apiError && value.trim().length >= 2 && value.trim().length < 4 && (
            <div className="post-office-empty">Продолжите ввод для поиска</div>
          )}
          {!isLoading && apiError && (
            <div className="post-office-fallback">
              Автоматический поиск временно недоступен. Введите город, номер и адрес отделения вручную.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function searchLocalProvider(provider: 'belpost' | 'evropochta', normalizedQuery: string): SearchResult[] {
  // Provider-specific search using Yandex Maps API would go here.
  // For now, return empty — the fallback handles manual entry.
  // To enable live search, set VITE_YANDEX_MAPS_API_KEY and implement
  // a serverless proxy at /api/post-offices/belpost?q=...
  void provider;
  void normalizedQuery;
  return [];
}
