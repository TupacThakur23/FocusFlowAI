/**
 * useStreamingResponse - React Hook for Streaming AI Responses
 * 
 * Provides smooth streaming experience:
 * - Token-by-token rendering
 * - Typing indicators
 * - Progressive display
 * - Interruption handling
 * - Graceful cancellation
 * - Error recovery
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { streamingResponseManager } from '../../public/lib/StreamingResponseManager';
import { useGlobalStatus } from '../lib/extension/GlobalStatusProvider';

export const useStreamingResponse = (options = {}) => {
  // State management
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const [tokens, setTokens] = useState([]);
  const [error, setError] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [streamStats, setStreamStats] = useState(null);
  
  // Refs for stream control
  const streamControllerRef = useRef(null);
  const containerRef = useRef(null);
  const abortControllerRef = useRef(null);
  
  // Global status for notifications
  const { addToast } = useGlobalStatus();

  /**
   * Start streaming response
   * @param {string} query - User query
   * @param {Object} streamOptions - Streaming options
   * @returns {Object} Stream controller
   */
  const startStreaming = useCallback((query, streamOptions = {}) => {
    // Reset state
    setIsStreaming(true);
    setIsPaused(false);
    setStreamContent('');
    setTokens([]);
    setError(null);
    setIsComplete(false);
    setStreamStats(null);

    // Create abort controller
    abortControllerRef.current = new AbortController();

    // Setup response container
    const responseContainer = containerRef.current || createResponseContainer();

    // Start stream
    const streamController = streamingResponseManager.startStream(
      query,
      {
        ...streamOptions,
        responseContainer,
        abortSignal: abortControllerRef.current.signal
      },
      // Token callback
      async (tokenData, controller) => {
        await handleToken(tokenData, controller);
      },
      // Completion callback
      (result) => {
        handleCompletion(result);
      },
      // Error callback
      (result) => {
        handleError(result);
      }
    );

    // Store controller reference
    streamControllerRef.current = streamController;

    return streamController;
  }, []);

  /**
   * Handle individual token
   * @param {Object} tokenData - Token data
   * @param {Object} controller - Stream controller
   */
  const handleToken = useCallback(async (tokenData, controller) => {
    // Update tokens array
    setTokens(prev => [...prev, tokenData]);
    
    // Update content
    const newContent = tokenData.content || tokenData.text || '';
    setStreamContent(prev => prev + newContent);
    
    // Update stream stats
    if (controller) {
      setStreamStats({
        duration: Date.now() - controller.startTime,
        tokenCount: controller.tokens.length,
        isStreaming: true
      });
    }
  }, []);

  /**
   * Handle stream completion
   * @param {Object} result - Completion result
   */
  const handleCompletion = useCallback((result) => {
    setIsStreaming(false);
    setIsComplete(true);
    setStreamStats({
      ...streamStats,
      duration: result.duration,
      tokenCount: result.tokens.length,
      isStreaming: false,
      isComplete: true
    });

    // Show success notification
    addToast({
      type: 'success',
      title: 'Response Complete',
      message: `Generated ${result.tokens.length} tokens in ${result.duration}ms`,
      duration: 2000
    });
  }, [streamStats, addToast]);

  /**
   * Handle stream error
   * @param {Object} result - Error result
   */
  const handleError = useCallback((result) => {
    setIsStreaming(false);
    setError(result.error);
    setStreamStats({
      ...streamStats,
      isStreaming: false,
      hasError: true
    });

    // Show error notification
    addToast({
      type: 'error',
      title: 'Response Failed',
      message: result.error.message || 'Unknown error occurred',
      duration: 5000
    });
  }, [streamStats, addToast]);

  /**
   * Interrupt streaming
   */
  const interruptStreaming = useCallback(() => {
    if (streamControllerRef.current) {
      streamControllerRef.current.interrupt();
      setIsPaused(true);
      
      addToast({
        type: 'info',
        title: 'Response Interrupted',
        message: 'You can resume the response at any time',
        duration: 3000
      });
    }
  }, [addToast]);

  /**
   * Resume streaming
   */
  const resumeStreaming = useCallback(() => {
    if (streamControllerRef.current) {
      streamControllerRef.current.resume();
      setIsPaused(false);
      
      addToast({
        type: 'info',
        title: 'Response Resumed',
        message: 'Continuing to generate response',
        duration: 2000
      });
    }
  }, [addToast]);

  /**
   * Cancel streaming
   */
  const cancelStreaming = useCallback(() => {
    if (streamControllerRef.current) {
      streamControllerRef.current.cancel();
      setIsStreaming(false);
      setIsPaused(false);
      
      addToast({
        type: 'warning',
        title: 'Response Cancelled',
        message: 'The response has been cancelled',
        duration: 3000
      });
    }
  }, [addToast]);

  /**
   * Retry streaming
   */
  const retryStreaming = useCallback(() => {
    if (streamControllerRef.current && streamControllerRef.current.query) {
      setError(null);
      setIsComplete(false);
      
      addToast({
        type: 'info',
        title: 'Retrying Response',
        message: 'Attempting to regenerate response',
        duration: 2000
      });
      
      // Start new stream with same query
      startStreaming(streamControllerRef.current.query, streamControllerRef.current.options);
    }
  }, [startStreaming, addToast]);

  /**
   * Create response container
   * @returns {HTMLElement} Response container
   */
  const createResponseContainer = useCallback(() => {
    const container = document.createElement('div');
    container.className = 'streaming-response-container';
    
    // Add container styles
    const style = document.createElement('style');
    style.textContent = `
      .streaming-response-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #1f2937;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
      
      .streaming-response-container .streaming-cursor {
        display: inline-block;
        width: 2px;
        height: 1.2em;
        background: #3b82f6;
        margin-left: 2px;
        animation: cursor-blink 1s infinite;
      }
      
      @keyframes cursor-blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
      
      .streaming-response-container .typing-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: rgba(59, 130, 246, 0.1);
        border-radius: 8px;
        margin: 8px 0;
      }
      
      .streaming-response-container .typing-dots {
        display: flex;
        gap: 4px;
      }
      
      .streaming-response-container .typing-dots .dot {
        width: 8px;
        height: 8px;
        background: #3b82f6;
        border-radius: 50%;
        animation: typing-bounce 1.4s infinite ease-in-out;
      }
      
      .streaming-response-container .typing-dots .dot:nth-child(1) {
        animation-delay: -0.32s;
      }
      
      .streaming-response-container .typing-dots .dot:nth-child(2) {
        animation-delay: -0.16s;
      }
    `;
    
    document.head.appendChild(style);
    
    // Store container reference
    containerRef.current = container;
    
    return container;
  }, []);

  /**
   * Update content with smooth animation
   * @param {string} content - New content
   * @param {Object} tokenData - Token data
   */
  const updateContentWithAnimation = useCallback((content, tokenData) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const currentContent = container.textContent || '';
    
    // Only update if content has actually changed
    if (content !== currentContent) {
      // Add fade effect for new content
      container.style.opacity = '0.8';
      
      setTimeout(() => {
        container.textContent = content;
        container.style.opacity = '1';
      }, 50);
    }
  }, []);

  /**
   * Get streaming progress
   * @returns {Object} Progress information
   */
  const getProgress = useCallback(() => {
    if (!streamStats) return null;
    
    return {
      tokens: streamStats.tokenCount || 0,
      duration: streamStats.duration || 0,
      tokensPerSecond: streamStats.duration > 0 
        ? (streamStats.tokenCount / (streamStats.duration / 1000)).toFixed(1)
        : 0,
      isStreaming: streamStats.isStreaming || false,
      isComplete: streamStats.isComplete || false,
      hasError: !!error
    };
  }, [streamStats, error]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Cancel any active stream
      if (streamControllerRef.current) {
        streamControllerRef.current.cancel();
      }
      
      // Clean up abort controller
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Handle page visibility changes
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isStreaming && !isPaused) {
        interruptStreaming();
      } else if (!document.hidden && isPaused) {
        resumeStreaming();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isStreaming, isPaused, interruptStreaming, resumeStreaming]);

  // Return hook API
  return {
    // State
    isStreaming,
    isPaused,
    streamContent,
    tokens,
    error,
    isComplete,
    streamStats,
    progress: getProgress(),
    
    // Refs
    containerRef,
    streamController: streamControllerRef.current,
    
    // Actions
    startStreaming,
    interruptStreaming,
    resumeStreaming,
    cancelStreaming,
    retryStreaming,
    
    // Utilities
    updateContent: updateContentWithAnimation,
    getProgress,
    
    // Status helpers
    canInterrupt: isStreaming && !isPaused,
    canResume: isStreaming && isPaused,
    canCancel: isStreaming,
    canRetry: !!error && !isStreaming,
    isActive: isStreaming || isPaused
  };
};

export default useStreamingResponse;
