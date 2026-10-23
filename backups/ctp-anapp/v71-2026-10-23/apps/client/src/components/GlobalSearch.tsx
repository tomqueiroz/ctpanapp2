import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, BookOpen, FileText, Video, Headphones } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchResult {
  id: number;
  chapter_number: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  type: 'chapter';
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('chapters')
        .select('id, chapter_number, title, subtitle, description')
        .or(`title.ilike.%${query}%,subtitle.ilike.%${query}%,description.ilike.%${query}%`)
        .order('chapter_number')
        .limit(10);

      if (data) {
        setResults(data.map(item => ({ ...item, type: 'chapter' as const })));
      }
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(`/dashboard/chapter/${result.chapter_number}`);
    onOpenChange(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onOpenChange(false);
      setQuery('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar no Curso
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite para buscar capítulos, conteúdos..."
              className="pl-10 pr-10"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading && (
              <p className="text-center text-gray-500 py-8">Buscando...</p>
            )}

            {!loading && query && results.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                Nenhum resultado encontrado para "{query}"
              </p>
            )}

            {!loading && results.length > 0 && (
              <>
                <p className="text-sm text-gray-600 mb-2">
                  {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
                </p>
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-[#0072BC] hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#0072BC] rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 mb-1">
                          Capítulo {result.chapter_number}: {result.title}
                        </p>
                        {result.subtitle && (
                          <p className="text-sm text-gray-600 mb-1">
                            {result.subtitle}
                          </p>
                        )}
                        {result.description && (
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {result.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}

            {!query && (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Digite para começar a buscar</p>
                <p className="text-xs mt-2">
                  Busque por capítulos, títulos ou conteúdos
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
