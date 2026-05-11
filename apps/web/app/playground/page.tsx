'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Terminal,
  History,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  ChevronRight,
  Globe,
  Settings2,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { executePlaygroundRequest } from '@/actions/playground-actions';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestHistory {
  id: string;
  url: string;
  method: HttpMethod;
  timestamp: number;
  status?: number;
}

export default function PlaygroundPage() {
  const [url, setUrl] = useState('http://');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<RequestHistory[]>([]);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'json' | 'visual'>('json');

  // Image detection logic
  const [detectedImages, setDetectedImages] = useState<string[]>([]);

  const extractImages = (obj: any, baseUrl: string): string[] => {
    const images: string[] = [];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

    const findImages = (item: any) => {
      if (typeof item === 'string') {
        const isImage =
          imageExtensions.some((ext) => item.toLowerCase().endsWith(ext)) ||
          item.startsWith('data:image/');
        if (isImage) {
          if (item.startsWith('/') && !item.startsWith('//')) {
            try {
              const urlObj = new URL(baseUrl);
              images.push(`${urlObj.protocol}//${urlObj.host}${item}`);
            } catch {
              images.push(item);
            }
          } else {
            images.push(item);
          }
        }
      } else if (Array.isArray(item)) {
        item.forEach(findImages);
      } else if (item !== null && typeof item === 'object') {
        Object.values(item).forEach(findImages);
      }
    };

    findImages(obj);
    return Array.from(new Set(images)); // Remove duplicates
  };

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('api_playground_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }
  }, []);

  const saveHistory = (newHistory: RequestHistory[]) => {
    setHistory(newHistory);
    localStorage.setItem('api_playground_history', JSON.stringify(newHistory.slice(0, 10)));
  };

  const handleSend = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await executePlaygroundRequest(url, method);

      if (!result.success) {
        throw new Error(result.error);
      }

      const { data } = result;
      if (!data) throw new Error('응답 데이터가 없습니다.');

      setResponse(data);

      const images = extractImages(data.body, url);
      setDetectedImages(images);
      if (images.length > 0) setViewMode('visual');
      else setViewMode('json');

      const newHistoryItem: RequestHistory = {
        id: Math.random().toString(36).substr(2, 9),
        url,
        method,
        timestamp: Date.now(),
        status: data.status,
      };
      saveHistory([newHistoryItem, ...history]);
    } catch (e: any) {
      setError(e.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response.body, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearHistory = () => {
    saveHistory([]);
  };

  return (
    <div className="min-h-screen bg-[#0f0e0d] text-gray-200 selection:bg-amber-500/30">
      {/* Background Gradients */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-amber-900/20 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-amber-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <header className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              <Terminal className="h-8 w-8 text-amber-500" />
            </div>
            <div>
              <h1 className="font-playfair text-3xl font-bold tracking-tight text-white">
                API Playground
              </h1>
              <p className="font-outfit mt-1 text-sm tracking-widest text-gray-500 uppercase">
                Baristation internal testing tool
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="font-outfit text-xs font-medium tracking-tighter text-gray-400 uppercase">
              System Online
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Controls - 8 columns */}
          <div className="space-y-8 lg:col-span-8">
            {/* Request Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="mb-6 flex items-center gap-3 text-white/80">
                <Settings2 className="h-5 w-5" />
                <h2 className="font-semibold tracking-tight">Request Configuration</h2>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="group relative flex-1">
                  <div className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-amber-500">
                    <Globe className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter API Endpoint..."
                    className="w-full rounded-2xl border border-white/5 bg-black/40 py-4 pr-4 pl-11 text-sm text-white transition-all outline-none placeholder:text-gray-600 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as HttpMethod)}
                    className="cursor-pointer appearance-none rounded-2xl border border-white/5 bg-black/40 px-4 py-4 text-xs font-bold tracking-widest uppercase transition-colors outline-none hover:bg-black/60"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>

                  <button
                    onClick={handleSend}
                    disabled={loading}
                    className="flex items-center gap-3 rounded-2xl bg-amber-500 px-8 py-4 font-bold text-black shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all hover:bg-amber-600 hover:shadow-[0_0_40px_rgba(245,158,11,0.3)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                    <span>EXECUTE</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Response Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex min-h-[500px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex min-h-[56px] items-center justify-between border-b border-white/5 bg-white/[0.02] px-6 py-2">
                <div className="flex items-center gap-6">
                  <div className="flex rounded-xl border border-white/5 bg-black/40 p-1">
                    <button
                      onClick={() => setViewMode('json')}
                      className={`rounded-lg px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all ${viewMode === 'json' ? 'bg-amber-500 text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => setViewMode('visual')}
                      className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all ${viewMode === 'visual' ? 'bg-amber-500 text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      Visuals
                      {detectedImages.length > 0 && (
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[8px] ${viewMode === 'visual' ? 'bg-black/20 text-black' : 'bg-amber-500/10 text-amber-500'}`}
                        >
                          {detectedImages.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {response && (
                    <div className="hidden items-center gap-2 sm:flex">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${response.status >= 200 && response.status < 300 ? 'border border-green-500/20 bg-green-500/10 text-green-500' : 'border border-red-500/20 bg-red-500/10 text-red-500'}`}
                      >
                        {response.status} {response.statusText}
                      </span>
                      <span className="text-[10px] font-medium text-gray-500">{response.time}</span>
                    </div>
                  )}
                </div>

                {response && viewMode === 'json' && (
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase transition-colors hover:text-white"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    {copied ? 'Copied' : 'Copy JSON'}
                  </button>
                )}
              </div>

              <div className="custom-scrollbar relative flex-1 overflow-auto bg-[#0a0908] p-6 font-mono text-sm">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0f0e0d]"
                    >
                      <Loader2 className="h-12 w-12 animate-spin text-amber-500/20" />
                      <p className="animate-pulse text-xs tracking-widest text-gray-500 uppercase">
                        Awaiting Server Response...
                      </p>
                    </motion.div>
                  ) : error ? (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-start gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-6"
                    >
                      <AlertCircle className="mt-1 h-5 w-5 shrink-0 text-red-500" />
                      <div>
                        <h4 className="mb-1 text-sm font-bold tracking-wider text-red-500 uppercase">
                          Network Error
                        </h4>
                        <p className="text-sm leading-relaxed text-red-400/80">{error}</p>
                        <p className="mt-4 text-xs text-red-500/50 italic">
                          Check CORS settings or network connection.
                        </p>
                      </div>
                    </motion.div>
                  ) : response ? (
                    viewMode === 'json' ? (
                      <motion.div
                        key="json"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="text-amber-200/80"
                      >
                        <pre className="leading-relaxed whitespace-pre-wrap">
                          {JSON.stringify(response.body, null, 2)}
                        </pre>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="visual"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="grid grid-cols-2 gap-6 sm:grid-cols-3 xl:grid-cols-4"
                      >
                        {detectedImages.length > 0 ? (
                          detectedImages.map((img, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.05 }}
                              className="group relative"
                            >
                              <div className="aspect-square overflow-hidden rounded-2xl border border-white/5 bg-black/40 shadow-lg transition-all group-hover:border-amber-500/50">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={img}
                                  alt={`Detected ${idx}`}
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      'https://via.placeholder.com/400?text=Image+Load+Error';
                                  }}
                                />
                                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                                  <button
                                    onClick={() => navigator.clipboard.writeText(img)}
                                    className="flex items-center justify-center gap-2 rounded-lg bg-white/10 py-2 text-[10px] font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20"
                                  >
                                    <Copy className="h-3 w-3" />
                                    COPY URL
                                  </button>
                                </div>
                              </div>
                              <p className="mt-2 truncate px-1 text-[10px] text-gray-500 transition-colors group-hover:text-amber-500">
                                {img.split('/').pop()}
                              </p>
                            </motion.div>
                          ))
                        ) : (
                          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                            <AlertCircle className="mb-4 h-12 w-12 text-white/5" />
                            <h3 className="font-playfair text-xl text-white/20 italic">
                              No images detected
                            </h3>
                            <p className="mt-2 text-xs text-white/10">
                              The JSON response doesn&apos;t appear to contain any image pointers.
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                      <Terminal className="mb-6 h-16 w-16 text-white/5" />
                      <h3 className="font-playfair mb-2 text-2xl text-white/20 italic">
                        The console is empty
                      </h3>
                      <p className="max-w-xs text-sm text-white/10">
                        Configure your request above and press execute to begin data harvesting.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - 4 columns */}
          <div className="space-y-8 lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3 text-white/80">
                  <History className="h-5 w-5" />
                  <h2 className="font-semibold tracking-tight">Recent History</h2>
                </div>
                <button
                  onClick={clearHistory}
                  className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="custom-scrollbar flex-1 space-y-3 overflow-auto pr-2">
                {history.length > 0 ? (
                  history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setUrl(item.url);
                        setMethod(item.method);
                      }}
                      className="group w-full rounded-2xl border border-white/5 bg-black/20 p-4 text-left transition-all hover:border-amber-500/30 hover:bg-white/[0.02]"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                            item.method === 'GET'
                              ? 'bg-blue-500/10 text-blue-500'
                              : item.method === 'POST'
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-amber-500/10 text-amber-500'
                          }`}
                        >
                          {item.method}
                        </span>
                        <span className="text-[10px] text-gray-600 transition-colors group-hover:text-gray-400">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="truncate font-mono text-xs text-gray-400">{item.url}</p>
                      <div className="mt-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase">
                          Restore
                        </span>
                        <ChevronRight className="h-3 w-3 text-amber-500" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <History className="mb-4 h-10 w-10 text-white/5" />
                    <p className="text-xs font-medium tracking-widest text-gray-600 uppercase">
                      No history yet
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.2);
        }
      `}</style>
    </div>
  );
}
