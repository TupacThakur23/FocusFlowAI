class PerformanceMonitor {
  constructor() {
    this.metrics = {
      renders: 0,
      renderTime: 0,
      memoryUsage: [],
      requestCounts: new Map(),
      lastCleanup: Date.now()
    };
    this.observers = new Map();
    this.debounceTimers = new Map();
    this.requestCache = new Map();
    this.initializeMonitoring();
  }
  initializeMonitoring() {
    if (performance.memory) {
      this.startMemoryMonitoring();
    }
    this.startRenderMonitoring();
    this.startCleanupInterval();
  }
  startMemoryMonitoring() {
    const measureMemory = () => {
      if (performance.memory) {
        const memory = {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit,
          timestamp: Date.now()
        };
        this.metrics.memoryUsage.push(memory);
        if (this.metrics.memoryUsage.length > 100) {
          this.metrics.memoryUsage = this.metrics.memoryUsage.slice(-100);
        }
        if (memory.used > memory.limit * 0.9) {
          console.warn('High memory usage detected:', memory);
          this.triggerCleanup();
        }
      }
    };
    setInterval(measureMemory, 5000);
  }
  startRenderMonitoring() {
    if (typeof window !== 'undefined' && window.performance) {
      this.observeReactRenders();
    }
  }
  observeReactRenders() {
    if (window.PerformanceObserver) {
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (entry.name === 'render') {
            this.metrics.renders++;
            this.metrics.renderTime += entry.duration;
          }
        });
      });
      try {
        observer.observe({
          entryTypes: ['render']
        });
        this.observers.set('render', observer);
      } catch (error) {
        console.warn('Performance observer not available:', error);
      }
    }
  }
  startCleanupInterval() {
    setInterval(() => {
      this.triggerCleanup();
    }, 30000);
  }
  triggerCleanup() {
    const now = Date.now();
    for (const [key, timer] of this.debounceTimers.entries()) {
      if (now - timer.lastUsed > 60000) {
        clearTimeout(timer.timeout);
        this.debounceTimers.delete(key);
      }
    }
    for (const [key, request] of this.requestCache.entries()) {
      if (now - request.timestamp > 300000) {
        this.requestCache.delete(key);
      }
    }
    if (this.metrics.memoryUsage.length > 50) {
      this.metrics.memoryUsage = this.metrics.memoryUsage.slice(-50);
    }
    this.metrics.lastCleanup = now;
    if (window.gc) {
      window.gc();
    }
  }
  debounce(func, wait, key = 'default') {
    return (...args) => {
      const existing = this.debounceTimers.get(key);
      if (existing) {
        clearTimeout(existing.timeout);
      }
      const timeout = setTimeout(() => {
        func(...args);
        this.debounceTimers.delete(key);
      }, wait);
      this.debounceTimers.set(key, {
        timeout,
        lastUsed: Date.now()
      });
    };
  }
  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  memoize(func, maxSize = 100) {
    const cache = new Map();
    return (...args) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = func(...args);
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, result);
      return result;
    };
  }
  async deduplicatedRequest(key, requestFn, options = {}) {
    const {
      cacheTime = 5000,
      maxSize = 50
    } = options;
    const now = Date.now();
    const cached = this.requestCache.get(key);
    if (cached && now - cached.timestamp < cacheTime) {
      this.metrics.requestCounts.set(key, (this.metrics.requestCounts.get(key) || 0) + 1);
      return cached.result;
    }
    this.metrics.requestCounts.set(key, (this.metrics.requestCounts.get(key) || 0) + 1);
    try {
      const result = await requestFn();
      if (this.requestCache.size >= maxSize) {
        const firstKey = this.requestCache.keys().next().value;
        this.requestCache.delete(firstKey);
      }
      this.requestCache.set(key, {
        result,
        timestamp: now
      });
      return result;
    } catch (error) {
      this.requestCache.delete(key);
      throw error;
    }
  }
  measure(func, label) {
    return async (...args) => {
      const start = performance.now();
      try {
        const result = await func(...args);
        const end = performance.now();
        const duration = end - start;
        if (duration > 100) {
          console.warn(`Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
        }
        return result;
      } catch (error) {
        const end = performance.now();
        const duration = end - start;
        console.error(`Operation failed: ${label} took ${duration.toFixed(2)}ms`, error);
        throw error;
      }
    };
  }
  optimizeComponent(Component, options = {}) {
    const {
      memoize = true,
      debounceMs = 0,
      throttleMs = 0
    } = options;
    let OptimizedComponent = Component;
    if (memoize) {
      OptimizedComponent = React.memo(OptimizedComponent);
    }
    if (debounceMs > 0) {
      const debouncedRender = this.debounce(props => {
        return <OptimizedComponent {...props} />;
      }, debounceMs);
      return debouncedRender;
    }
    if (throttleMs > 0) {
      const throttledRender = this.throttle(props => {
        return <OptimizedComponent {...props} />;
      }, throttleMs);
      return throttledRender;
    }
    return OptimizedComponent;
  }
  getMetrics() {
    return {
      ...this.metrics,
      cacheSize: this.requestCache.size,
      debounceTimers: this.debounceTimers.size,
      averageRenderTime: this.metrics.renders > 0 ? this.metrics.renderTime / this.metrics.renders : 0,
      memoryTrend: this.getMemoryTrend()
    };
  }
  getMemoryTrend() {
    if (this.metrics.memoryUsage.length < 2) return 'stable';
    const recent = this.metrics.memoryUsage.slice(-10);
    const increasing = recent.every((curr, i, arr) => {
      if (i === 0) return true;
      return curr.used > arr[i - 1].used;
    });
    return increasing ? 'increasing' : 'stable';
  }
  resetMetrics() {
    this.metrics = {
      renders: 0,
      renderTime: 0,
      memoryUsage: [],
      requestCounts: new Map(),
      lastCleanup: Date.now()
    };
    this.requestCache.clear();
    this.debounceTimers.clear();
  }
  cleanup() {
    for (const [key, observer] of this.observers.entries()) {
      observer.disconnect();
      this.observers.delete(key);
    }
    for (const [key, timer] of this.debounceTimers.entries()) {
      clearTimeout(timer.timeout);
    }
    this.debounceTimers.clear();
    this.requestCache.clear();
    this.resetMetrics();
  }
}
export const performanceMonitor = new PerformanceMonitor();
export const debounce = performanceMonitor.debounce.bind(performanceMonitor);
export const throttle = performanceMonitor.throttle.bind(performanceMonitor);
export const memoize = performanceMonitor.memoize.bind(performanceMonitor);
export const measure = performanceMonitor.measure.bind(performanceMonitor);
export const deduplicatedRequest = performanceMonitor.deduplicatedRequest.bind(performanceMonitor);
export const optimizeComponent = performanceMonitor.optimizeComponent.bind(performanceMonitor);
export const getMetrics = performanceMonitor.getMetrics.bind(performanceMonitor);
export const resetMetrics = performanceMonitor.resetMetrics.bind(performanceMonitor);
export const cleanup = performanceMonitor.cleanup.bind(performanceMonitor);
export default performanceMonitor;
