import React, { useState, useEffect, useCallback, useRef } from 'react';
import { debounce, throttle } from '../utils/performance';

/**
 * Frontend optimization utilities for better performance and UX
 */

/**
 * Lazy loading component wrapper
 */
export const withLazyLoading = (Component, fallback = <div>Loading...</div>) => {
  return React.lazy(() => Promise.resolve({ default: Component }));
};

/**
 * Virtual scrolling for large lists
 */
export const VirtualList = ({ items, itemHeight, containerHeight, renderItem }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  const handleScroll = useCallback(
    throttle((e) => {
      setScrollTop(e.target.scrollTop);
    }, 16),
    []
  );
  
  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) =>
            renderItem(item, startIndex + index)
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Image optimization with lazy loading and progressive enhancement
 */
export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  placeholder = '/placeholder.jpg',
  sizes = '100vw',
  priority = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef();
  
  useEffect(() => {
    if (!imgRef.current || priority) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = src;
          observer.unobserve(img);
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(imgRef.current);
    
    return () => observer.disconnect();
  }, [src, priority]);
  
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);
  
  const handleError = useCallback(() => {
    setHasError(true);
  }, []);
  
  return (
    <div style={{ position: 'relative', width, height }}>
      {!isLoaded && !hasError && (
        <img
          src={placeholder}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(2px)',
          }}
        />
      )}
      <img
        ref={imgRef}
        src={priority ? src : placeholder}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          position: isLoaded ? 'static' : 'absolute',
          top: 0,
          left: 0,
        }}
        {...props}
      />
      {hasError && (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            color: '#999',
          }}
        >
          Image failed to load
        </div>
      )}
    </div>
  );
};

/**
 * Memoized search with debouncing
 */
export const useSearchWithDebounce = (searchFunction, delay = 300) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        const data = await searchFunction(searchQuery);
        setResults(data);
      } catch (err) {
        setError(err.message);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, delay),
    [searchFunction, delay]
  );
  
  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);
  
  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
  };
};

/**
 * Performance monitor hook
 */
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
  });
  
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          setMetrics(prev => ({
            ...prev,
            renderTime: entry.duration,
          }));
        }
        
        if (entry.entryType === 'navigation') {
          setMetrics(prev => ({
            ...prev,
            networkRequests: prev.networkRequests + 1,
          }));
        }
      }
    });
    
    observer.observe({ entryTypes: ['measure', 'navigation'] });
    
    // Monitor memory usage
    const memoryMonitor = setInterval(() => {
      if (performance.memory) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: performance.memory.usedJSHeapSize,
        }));
      }
    }, 5000);
    
    return () => {
      observer.disconnect();
      clearInterval(memoryMonitor);
    };
  }, []);
  
  return metrics;
};

/**
 * Intersection Observer hook for infinite scrolling
 */
export const useInfiniteScroll = (callback, hasMore = true) => {
  const [isFetching, setIsFetching] = useState(false);
  const elementRef = useRef();
  
  useEffect(() => {
    if (!elementRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isFetching) {
          setIsFetching(true);
          callback().finally(() => setIsFetching(false));
        }
      },
      { threshold: 1.0 }
    );
    
    observer.observe(elementRef.current);
    
    return () => observer.disconnect();
  }, [callback, hasMore, isFetching]);
  
  return [elementRef, isFetching];
};

/**
 * Bundle analyzer component for development
 */
export const BundleAnalyzer = () => {
  if (process.env.NODE_ENV !== 'development') return null;
  
  const [bundleInfo, setBundleInfo] = useState(null);
  
  useEffect(() => {
    // Simulate bundle analysis (in real app, this would integrate with webpack-bundle-analyzer)
    const analyzeBundles = () => {
      const scripts = Array.from(document.scripts);
      const totalSize = scripts.reduce((acc, script) => {
        return acc + (script.src ? 1 : 0); // Simplified size calculation
      }, 0);
      
      setBundleInfo({
        totalScripts: scripts.length,
        estimatedSize: `${totalSize * 50}KB`, // Rough estimate
      });
    };
    
    analyzeBundles();
  }, []);
  
  if (!bundleInfo) return null;
  
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 10,
        right: 10,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
      }}
    >
      <div>Scripts: {bundleInfo.totalScripts}</div>
      <div>Est. Size: {bundleInfo.estimatedSize}</div>
    </div>
  );
};

/**
 * Code splitting utility
 */
export const createAsyncComponent = (importFunction) => {
  return React.lazy(() =>
    importFunction().catch(() =>
      import('./ErrorFallback').then(module => ({ default: module.ErrorFallback }))
    )
  );
};

/**
 * PWA installation prompt
 */
export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };
  
  if (!showPrompt) return null;
  
  return (
    <div className="pwa-install-prompt">
      <p>Install NeighborHub for a better experience!</p>
      <button onClick={handleInstall}>Install</button>
      <button onClick={() => setShowPrompt(false)}>Later</button>
    </div>
  );
};

export default {
  withLazyLoading,
  VirtualList,
  OptimizedImage,
  useSearchWithDebounce,
  usePerformanceMonitor,
  useInfiniteScroll,
  BundleAnalyzer,
  createAsyncComponent,
  PWAInstallPrompt,
};
