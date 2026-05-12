/**
 * StreamingResponseManager - Real-time AI Response Streaming for FocusFlow AI
 * 
 * Provides smooth, responsive streaming experience:
 * - Token-by-token rendering
 * - Typing indicators
 * - Progressive response display
 * - Interruption-safe streaming
 * - Graceful cancellation
 * - Low perceived latency
 */

export class StreamingResponseManager {
  constructor(options = {}) {
    this.config = {
      // Streaming settings
      enableStreaming: options.enableStreaming !== false,
      streamingEndpoint: options.streamingEndpoint || '/api/ai/stream',
      chunkSize: options.chunkSize || 1, // Token by token
      maxResponseTime: options.maxResponseTime || 30000, // 30 seconds
      enableTypingIndicator: options.enableTypingIndicator !== false,
      
      // Display settings
      enableProgressiveDisplay: options.enableProgressiveDisplay !== false,
      enableInterruption: options.enableInterruption !== false,
      enableGracefulCancellation: options.enableGracefulCancellation !== false,
      
      // Performance settings
      enableBuffering: options.enableBuffering !== false,
      bufferSize: options.bufferSize || 3, // Buffer 3 tokens
      enablePrediction: options.enablePrediction !== false,
      
      // UI settings
      typingIndicatorDelay: options.typingIndicatorDelay || 500, // 500ms
      typingIndicatorInterval: options.typingIndicatorInterval || 100, // 100ms
      enableCursorBlink: options.enableCursorBlink !== false,
      
      // Error handling
      enableRetry: options.enableRetry !== false,
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000
    };

    // Active streams
    this.activeStreams = new Map();
    this.streamQueue = [];
    this.isProcessing = false;
    
    // UI elements
    this.typingIndicators = new Map();
    this.responseContainers = new Map();
    
    // Performance tracking
    this.streamingStats = {
      totalStreams: 0,
      successfulStreams: 0,
      averageLatency: 0,
      averageTokenTime: 0,
      interruptionCount: 0,
      cancellationCount: 0
    };
    
    this.initializeEventListeners();
  }

  /**
   * Initialize event listeners
   */
  initializeEventListeners() {
    // Listen for page visibility changes
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        this.handleVisibilityChange();
      });
    }

    // Listen for network status changes
    if (typeof navigator !== 'undefined') {
      window.addEventListener('online', () => {
        this.handleNetworkOnline();
      });
      
      window.addEventListener('offline', () => {
        this.handleNetworkOffline();
      });
    }
  }

  /**
   * Start streaming response
   * @param {string} query - User query
   * @param {Object} options - Streaming options
   * @param {Function} onToken - Token callback
   * @param {Function} onComplete - Completion callback
   * @param {Function} onError - Error callback
   * @returns {Object} Stream controller
   */
  startStream(query, options = {}, onToken, onComplete, onError) {
    const streamId = this.generateStreamId();
    const startTime = Date.now();
    
    const streamController = {
      id: streamId,
      query,
      options,
      startTime,
      isActive: true,
      isInterrupted: false,
      isCancelled: false,
      tokens: [],
      buffer: [],
      typingIndicator: null,
      responseContainer: options.responseContainer,
      
      // Control methods
      interrupt: () => this.interruptStream(streamId),
      cancel: () => this.cancelStream(streamId),
      pause: () => this.pauseStream(streamId),
      resume: () => this.resumeStream(streamId)
    };

    // Store stream controller
    this.activeStreams.set(streamId, streamController);
    this.streamingStats.totalStreams++;

    // Start typing indicator if enabled
    if (this.config.enableTypingIndicator) {
      this.startTypingIndicator(streamController);
    }

    // Start streaming process
    this.executeStream(streamController, onToken, onComplete, onError);

    return streamController;
  }

  /**
   * Execute streaming process
   * @param {Object} streamController - Stream controller
   * @param {Function} onToken - Token callback
   * @param {Function} onComplete - Completion callback
   * @param {Function} onError - Error callback
   */
  async executeStream(streamController, onToken, onComplete, onError) {
    try {
      const { query, options, id: streamId } = streamController;
      
      // Prepare streaming request
      const requestBody = {
        query,
        stream: true,
        chunkSize: this.config.chunkSize,
        enablePrediction: this.config.enablePrediction,
        ...options
      };

      // Start streaming fetch
      const response = await fetch(this.config.streamingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(requestBody),
        signal: streamController.abortSignal
      });

      if (!response.ok) {
        throw new Error(`Streaming failed: ${response.status} ${response.statusText}`);
      }

      // Process streaming response
      await this.processStreamingResponse(response, streamController, onToken, onComplete);

    } catch (error) {
      if (error.name === 'AbortError') {
        // Stream was cancelled
        this.handleStreamCancellation(streamController);
      } else {
        // Stream error
        this.handleStreamError(streamController, error, onError);
      }
    } finally {
      this.cleanupStream(streamController);
    }
  }

  /**
   * Process streaming response
   * @param {Response} response - Fetch response
   * @param {Object} streamController - Stream controller
   * @param {Function} onToken - Token callback
   * @param {Function} onComplete - Completion callback
   */
  async processStreamingResponse(response, streamController, onToken, onComplete) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let tokenCount = 0;
    const startTime = Date.now();

    try {
      while (!streamController.isInterrupted && !streamController.isCancelled) {
        const { done, value } = await reader.read();
        
        if (done) break;

        // Decode chunk
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete SSE messages
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line

        for (const line of lines) {
          if (line.trim() === '') continue;
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              // Stream completed
              this.handleStreamCompletion(streamController, onComplete);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              await this.processStreamToken(parsed, streamController, onToken);
              tokenCount++;
              
              // Update performance metrics
              const tokenTime = Date.now() - startTime;
              this.updateStreamingStats(tokenTime, tokenCount);
              
            } catch (parseError) {
              console.warn('Failed to parse streaming data:', parseError);
            }
          }
        }
      }

      // Handle stream completion
      if (!streamController.isCancelled) {
        this.handleStreamCompletion(streamController, onComplete);
      }

    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Process individual stream token
   * @param {Object} tokenData - Token data
   * @param {Object} streamController - Stream controller
   * @param {Function} onToken - Token callback
   */
  async processStreamToken(tokenData, streamController, onToken) {
    const { tokens, buffer, id: streamId } = streamController;
    
    // Add token to buffer
    if (this.config.enableBuffering) {
      buffer.push(tokenData);
      
      // Process buffer when full or on special tokens
      if (buffer.length >= this.config.bufferSize || tokenData.isComplete) {
        await this.flushBuffer(streamController, onToken);
      }
    } else {
      // Process token immediately
      await this.processToken(tokenData, streamController, onToken);
    }

    // Stop typing indicator after first token
    if (tokens.length === 1 && this.config.enableTypingIndicator) {
      this.stopTypingIndicator(streamController);
    }
  }

  /**
   * Process individual token
   * @param {Object} tokenData - Token data
   * @param {Object} streamController - Stream controller
   * @param {Function} onToken - Token callback
   */
  async processToken(tokenData, streamController, onToken) {
    if (streamController.isInterrupted || streamController.isCancelled) return;

    const { tokens } = streamController;
    
    // Add token to stream
    tokens.push(tokenData);
    
    // Update UI if progressive display is enabled
    if (this.config.enableProgressiveDisplay) {
      await this.updateProgressiveDisplay(streamController, tokenData);
    }
    
    // Call token callback
    if (onToken) {
      try {
        await onToken(tokenData, streamController);
      } catch (error) {
        console.error('Token callback error:', error);
      }
    }
  }

  /**
   * Flush buffer
   * @param {Object} streamController - Stream controller
   * @param {Function} onToken - Token callback
   */
  async flushBuffer(streamController, onToken) {
    const { buffer } = streamController;
    
    for (const tokenData of buffer) {
      await this.processToken(tokenData, streamController, onToken);
    }
    
    buffer.length = 0; // Clear buffer
  }

  /**
   * Update progressive display
   * @param {Object} streamController - Stream controller
   * @param {Object} tokenData - Token data
   */
  async updateProgressiveDisplay(streamController, tokenData) {
    const { responseContainer, tokens } = streamController;
    
    if (!responseContainer) return;

    // Build current content
    const currentContent = tokens
      .map(token => token.content || token.text || '')
      .join('');
    
    // Update container with smooth animation
    if (responseContainer.updateContent) {
      await responseContainer.updateContent(currentContent, tokenData);
    } else {
      // Fallback: update innerHTML
      responseContainer.innerHTML = this.formatProgressiveContent(currentContent, tokenData);
    }
  }

  /**
   * Format progressive content
   * @param {string} content - Current content
   * @param {Object} tokenData - Current token data
   * @returns {string} Formatted HTML
   */
  formatProgressiveContent(content, tokenData) {
    let formatted = content;
    
    // Add cursor if enabled and stream is active
    if (this.config.enableCursorBlink && !tokenData.isComplete) {
      formatted += '<span class="streaming-cursor">|</span>';
    }
    
    // Add streaming class for styling
    return `<div class="streaming-content">${formatted}</div>`;
  }

  /**
   * Start typing indicator
   * @param {Object} streamController - Stream controller
   */
  startTypingIndicator(streamController) {
    const { id: streamId, responseContainer } = streamController;
    
    if (!responseContainer) return;

    // Create typing indicator element
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = `
      <div class="typing-dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
      <span class="typing-text">AI is thinking...</span>
    `;

    // Add styles
    this.addTypingIndicatorStyles(indicator);

    // Insert into container
    if (responseContainer.appendChild) {
      responseContainer.appendChild(indicator);
    } else {
      responseContainer.innerHTML += indicator.outerHTML;
    }

    // Store reference
    streamController.typingIndicator = indicator;
    this.typingIndicators.set(streamId, indicator);

    // Start animation
    setTimeout(() => {
      indicator.classList.add('typing-active');
    }, this.config.typingIndicatorDelay);
  }

  /**
   * Stop typing indicator
   * @param {Object} streamController - Stream controller
   */
  stopTypingIndicator(streamController) {
    const { typingIndicator } = streamController;
    
    if (typingIndicator) {
      typingIndicator.classList.remove('typing-active');
      typingIndicator.classList.add('typing-complete');
      
      // Remove after animation
      setTimeout(() => {
        if (typingIndicator.parentNode) {
          typingIndicator.parentNode.removeChild(typingIndicator);
        }
      }, 300);
      
      streamController.typingIndicator = null;
      this.typingIndicators.delete(streamController.id);
    }
  }

  /**
   * Add typing indicator styles
   * @param {HTMLElement} indicator - Indicator element
   */
  addTypingIndicatorStyles(indicator) {
    const style = document.createElement('style');
    style.textContent = `
      .typing-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: rgba(59, 130, 246, 0.1);
        border-radius: 8px;
        margin: 8px 0;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease;
      }
      
      .typing-indicator.typing-active {
        opacity: 1;
        transform: translateY(0);
      }
      
      .typing-indicator.typing-complete {
        opacity: 0;
        transform: translateY(-10px);
      }
      
      .typing-dots {
        display: flex;
        gap: 4px;
      }
      
      .typing-dots .dot {
        width: 8px;
        height: 8px;
        background: #3b82f6;
        border-radius: 50%;
        animation: typing-bounce 1.4s infinite ease-in-out;
      }
      
      .typing-dots .dot:nth-child(1) {
        animation-delay: -0.32s;
      }
      
      .typing-dots .dot:nth-child(2) {
        animation-delay: -0.16s;
      }
      
      .typing-text {
        color: #6b7280;
        font-size: 14px;
        font-style: italic;
      }
      
      @keyframes typing-bounce {
        0%, 80%, 100% {
          transform: scale(0.8);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }
      
      .streaming-content {
        line-height: 1.6;
        color: #1f2937;
      }
      
      .streaming-cursor {
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
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Interrupt stream
   * @param {string} streamId - Stream ID
   */
  interruptStream(streamId) {
    const streamController = this.activeStreams.get(streamId);
    if (!streamController) return;

    streamController.isInterrupted = true;
    this.streamingStats.interruptionCount++;

    // Send interruption signal to server
    if (streamController.abortController) {
      streamController.abortController.abort();
    }

    // Stop typing indicator
    this.stopTypingIndicator(streamController);

    // Add interruption indicator
    this.addInterruptionIndicator(streamController);
  }

  /**
   * Cancel stream
   * @param {string} streamId - Stream ID
   */
  cancelStream(streamId) {
    const streamController = this.activeStreams.get(streamId);
    if (!streamController) return;

    streamController.isCancelled = true;
    this.streamingStats.cancellationCount++;

    // Send cancellation signal to server
    if (streamController.abortController) {
      streamController.abortController.abort();
    }

    // Clean up immediately
    this.cleanupStream(streamController);
  }

  /**
   * Pause stream
   * @param {string} streamId - Stream ID
   */
  pauseStream(streamId) {
    const streamController = this.activeStreams.get(streamId);
    if (!streamController) return;

    streamController.isPaused = true;
    
    // Add pause indicator
    this.addPauseIndicator(streamController);
  }

  /**
   * Resume stream
   * @param {string} streamId - Stream ID
   */
  resumeStream(streamId) {
    const streamController = this.activeStreams.get(streamId);
    if (!streamController) return;

    streamController.isPaused = false;
    
    // Remove pause indicator
    this.removePauseIndicator(streamController);
  }

  /**
   * Handle stream completion
   * @param {Object} streamController - Stream controller
   * @param {Function} onComplete - Completion callback
   */
  handleStreamCompletion(streamController, onComplete) {
    const { tokens, startTime } = streamController;
    
    // Stop typing indicator
    this.stopTypingIndicator(streamController);

    // Add completion indicator
    this.addCompletionIndicator(streamController);

    // Update stats
    const duration = Date.now() - startTime;
    this.streamingStats.successfulStreams++;
    this.updateStreamingStats(duration, tokens.length);

    // Call completion callback
    if (onComplete) {
      try {
        onComplete({
          streamId: streamController.id,
          tokens,
          duration,
          isComplete: true
        });
      } catch (error) {
        console.error('Completion callback error:', error);
      }
    }
  }

  /**
   * Handle stream error
   * @param {Object} streamController - Stream controller
   * @param {Error} error - Error object
   * @param {Function} onError - Error callback
   */
  handleStreamError(streamController, error, onError) {
    // Stop typing indicator
    this.stopTypingIndicator(streamController);

    // Add error indicator
    this.addErrorIndicator(streamController, error);

    // Call error callback
    if (onError) {
      try {
        onError({
          streamId: streamController.id,
          error,
          tokens: streamController.tokens
        });
      } catch (callbackError) {
        console.error('Error callback error:', callbackError);
      }
    }

    // Retry if enabled
    if (this.config.enableRetry && streamController.retryCount < this.config.maxRetries) {
      setTimeout(() => {
        this.retryStream(streamController);
      }, this.config.retryDelay);
    }
  }

  /**
   * Handle stream cancellation
   * @param {Object} streamController - Stream controller
   */
  handleStreamCancellation(streamController) {
    // Stop typing indicator
    this.stopTypingIndicator(streamController);

    // Add cancellation indicator
    this.addCancellationIndicator(streamController);
  }

  /**
   * Add interruption indicator
   * @param {Object} streamController - Stream controller
   */
  addInterruptionIndicator(streamController) {
    const { responseContainer } = streamController;
    if (!responseContainer) return;

    const indicator = document.createElement('div');
    indicator.className = 'stream-interruption';
    indicator.innerHTML = `
      <div class="interruption-content">
        <span class="interruption-icon">⏸️</span>
        <span class="interruption-text">Response interrupted</span>
        <button class="resume-btn" onclick="window.focusflow?.resumeStream('${streamController.id}')">Resume</button>
      </div>
    `;

    responseContainer.appendChild(indicator);
  }

  /**
   * Add pause indicator
   * @param {Object} streamController - Stream controller
   */
  addPauseIndicator(streamController) {
    const { responseContainer } = streamController;
    if (!responseContainer) return;

    const indicator = document.createElement('div');
    indicator.className = 'stream-pause';
    indicator.innerHTML = `
      <div class="pause-content">
        <span class="pause-icon">⏸️</span>
        <span class="pause-text">Response paused</span>
      </div>
    `;

    responseContainer.appendChild(indicator);
  }

  /**
   * Remove pause indicator
   * @param {Object} streamController - Stream controller
   */
  removePauseIndicator(streamController) {
    const { responseContainer } = streamController;
    if (!responseContainer) return;

    const indicator = responseContainer.querySelector('.stream-pause');
    if (indicator) {
      indicator.remove();
    }
  }

  /**
   * Add completion indicator
   * @param {Object} streamController - Stream controller
   */
  addCompletionIndicator(streamController) {
    const { responseContainer } = streamController;
    if (!responseContainer) return;

    const indicator = document.createElement('div');
    indicator.className = 'stream-completion';
    indicator.innerHTML = `
      <div class="completion-content">
        <span class="completion-icon">✅</span>
        <span class="completion-text">Response complete</span>
      </div>
    `;

    responseContainer.appendChild(indicator);

    // Remove after delay
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    }, 2000);
  }

  /**
   * Add error indicator
   * @param {Object} streamController - Stream controller
   * @param {Error} error - Error object
   */
  addErrorIndicator(streamController, error) {
    const { responseContainer } = streamController;
    if (!responseContainer) return;

    const indicator = document.createElement('div');
    indicator.className = 'stream-error';
    indicator.innerHTML = `
      <div class="error-content">
        <span class="error-icon">❌</span>
        <span class="error-text">Response failed: ${error.message}</span>
        <button class="retry-btn" onclick="window.focusflow?.retryStream('${streamController.id}')">Retry</button>
      </div>
    `;

    responseContainer.appendChild(indicator);
  }

  /**
   * Add cancellation indicator
   * @param {Object} streamController - Stream controller
   */
  addCancellationIndicator(streamController) {
    const { responseContainer } = streamController;
    if (!responseContainer) return;

    const indicator = document.createElement('div');
    indicator.className = 'stream-cancellation';
    indicator.innerHTML = `
      <div class="cancellation-content">
        <span class="cancellation-icon">🚫</span>
        <span class="cancellation-text">Response cancelled</span>
      </div>
    `;

    responseContainer.appendChild(indicator);

    // Remove after delay
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    }, 2000);
  }

  /**
   * Retry stream
   * @param {Object} streamController - Stream controller
   */
  async retryStream(streamController) {
    streamController.retryCount = (streamController.retryCount || 0) + 1;
    
    // Reset state
    streamController.isInterrupted = false;
    streamController.isCancelled = false;
    streamController.tokens = [];
    streamController.buffer = [];

    // Retry the stream
    await this.executeStream(
      streamController,
      streamController.onToken,
      streamController.onComplete,
      streamController.onError
    );
  }

  /**
   * Clean up stream
   * @param {Object} streamController - Stream controller
   */
  cleanupStream(streamController) {
    // Stop typing indicator
    this.stopTypingIndicator(streamController);

    // Remove from active streams
    this.activeStreams.delete(streamController.id);

    // Clean up UI elements
    if (streamController.responseContainer) {
      const indicators = streamController.responseContainer.querySelectorAll(
        '.stream-interruption, .stream-pause, .stream-completion, .stream-error, .stream-cancellation'
      );
      indicators.forEach(indicator => indicator.remove());
    }
  }

  /**
   * Handle visibility change
   */
  handleVisibilityChange() {
    const isHidden = document.hidden;
    
    // Pause all active streams when page is hidden
    if (isHidden) {
      for (const [streamId, streamController] of this.activeStreams.entries()) {
        if (!streamController.isPaused) {
          this.pauseStream(streamId);
        }
      }
    } else {
      // Resume streams when page becomes visible
      for (const [streamId, streamController] of this.activeStreams.entries()) {
        if (streamController.isPaused) {
          this.resumeStream(streamId);
        }
      }
    }
  }

  /**
   * Handle network online
   */
  handleNetworkOnline() {
    // Retry failed streams when network comes back
    for (const [streamId, streamController] of this.activeStreams.entries()) {
      if (streamController.retryCount < this.config.maxRetries) {
        this.retryStream(streamController);
      }
    }
  }

  /**
   * Handle network offline
   */
  handleNetworkOffline() {
    // Pause all streams when network goes offline
    for (const [streamId, streamController] of this.activeStreams.entries()) {
      this.pauseStream(streamId);
    }
  }

  /**
   * Update streaming statistics
   * @param {number} duration - Stream duration
   * @param {number} tokenCount - Number of tokens
   */
  updateStreamingStats(duration, tokenCount) {
    const totalStreams = this.streamingStats.totalStreams;
    
    // Update average latency
    this.streamingStats.averageLatency = 
      (this.streamingStats.averageLatency * (totalStreams - 1) + duration) / totalStreams;
    
    // Update average token time
    if (tokenCount > 0) {
      const tokenTime = duration / tokenCount;
      this.streamingStats.averageTokenTime = 
        (this.streamingStats.averageTokenTime * (totalStreams - 1) + tokenTime) / totalStreams;
    }
  }

  /**
   * Generate stream ID
   * @returns {string} Stream ID
   */
  generateStreamId() {
    return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get streaming statistics
   * @returns {Object} Streaming statistics
   */
  getStreamingStats() {
    return {
      ...this.streamingStats,
      activeStreams: this.activeStreams.size,
      successRate: this.streamingStats.totalStreams > 0 
        ? (this.streamingStats.successfulStreams / this.streamingStats.totalStreams * 100).toFixed(2) + '%'
        : '0%',
      config: this.config,
      capabilities: [
        'token-by-token streaming',
        'typing indicators',
        'progressive response display',
        'interruption-safe streaming',
        'graceful cancellation',
        'buffering for performance',
        'network status handling',
        'visibility change handling',
        'retry mechanisms',
        'performance tracking'
      ]
    };
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Reset streaming manager
   */
  reset() {
    // Cancel all active streams
    for (const [streamId, streamController] of this.activeStreams.entries()) {
      this.cancelStream(streamId);
    }

    // Clear all data
    this.activeStreams.clear();
    this.streamQueue = [];
    this.typingIndicators.clear();
    this.responseContainers.clear();

    // Reset stats
    this.streamingStats = {
      totalStreams: 0,
      successfulStreams: 0,
      averageLatency: 0,
      averageTokenTime: 0,
      interruptionCount: 0,
      cancellationCount: 0
    };
  }
}

// Export singleton instance
export const streamingResponseManager = new StreamingResponseManager();

// Export utilities
export const startStream = streamingResponseManager.startStream.bind(streamingResponseManager);
export const getStreamingStats = streamingResponseManager.getStreamingStats.bind(streamingResponseManager);
export const updateConfig = streamingResponseManager.updateConfig.bind(streamingResponseManager);
export const reset = streamingResponseManager.reset.bind(streamingResponseManager);

export default streamingResponseManager;
