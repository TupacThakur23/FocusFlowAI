

export class StreamingResponseManager {
  constructor(options = {}) {
    this.config = {

      enableStreaming: options.enableStreaming !== false,
      streamingEndpoint: options.streamingEndpoint || '/api/ai/stream',
      chunkSize: options.chunkSize || 1, // Token by token
      maxResponseTime: options.maxResponseTime || 30000, // 30 seconds
      enableTypingIndicator: options.enableTypingIndicator !== false,
      

      enableProgressiveDisplay: options.enableProgressiveDisplay !== false,
      enableInterruption: options.enableInterruption !== false,
      enableGracefulCancellation: options.enableGracefulCancellation !== false,
      

      enableBuffering: options.enableBuffering !== false,
      bufferSize: options.bufferSize || 3, // Buffer 3 tokens
      enablePrediction: options.enablePrediction !== false,
      

      typingIndicatorDelay: options.typingIndicatorDelay || 500, // 500ms
      typingIndicatorInterval: options.typingIndicatorInterval || 100, // 100ms
      enableCursorBlink: options.enableCursorBlink !== false,
      

      enableRetry: options.enableRetry !== false,
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000
    };

    this.activeStreams = new Map();
    this.streamQueue = [];
    this.isProcessing = false;
    

    this.typingIndicators = new Map();
    this.responseContainers = new Map();
    

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

  
  initializeEventListeners() {

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        this.handleVisibilityChange();
      });
    }

    if (typeof navigator !== 'undefined') {
      window.addEventListener('online', () => {
        this.handleNetworkOnline();
      });
      
      window.addEventListener('offline', () => {
        this.handleNetworkOffline();
      });
    }
  }

  
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
      

      interrupt: () => this.interruptStream(streamId),
      cancel: () => this.cancelStream(streamId),
      pause: () => this.pauseStream(streamId),
      resume: () => this.resumeStream(streamId)
    };

    this.activeStreams.set(streamId, streamController);
    this.streamingStats.totalStreams++;

    if (this.config.enableTypingIndicator) {
      this.startTypingIndicator(streamController);
    }

    this.executeStream(streamController, onToken, onComplete, onError);

    return streamController;
  }

  
  async executeStream(streamController, onToken, onComplete, onError) {
    try {
      const { query, options, id: streamId } = streamController;
      

      const requestBody = {
        query,
        stream: true,
        chunkSize: this.config.chunkSize,
        enablePrediction: this.config.enablePrediction,
        ...options
      };

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

      await this.processStreamingResponse(response, streamController, onToken, onComplete);

    } catch (error) {
      if (error.name === 'AbortError') {

        this.handleStreamCancellation(streamController);
      } else {

        this.handleStreamError(streamController, error, onError);
      }
    } finally {
      this.cleanupStream(streamController);
    }
  }

  
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

        buffer += decoder.decode(value, { stream: true });
        

        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line

        for (const line of lines) {
          if (line.trim() === '') continue;
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {

              this.handleStreamCompletion(streamController, onComplete);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              await this.processStreamToken(parsed, streamController, onToken);
              tokenCount++;
              

              const tokenTime = Date.now() - startTime;
              this.updateStreamingStats(tokenTime, tokenCount);
              
            } catch (parseError) {
              console.warn('Failed to parse streaming data:', parseError);
            }
          }
        }
      }

      if (!streamController.isCancelled) {
        this.handleStreamCompletion(streamController, onComplete);
      }

    } finally {
      reader.releaseLock();
    }
  }

  
  async processStreamToken(tokenData, streamController, onToken) {
    const { tokens, buffer, id: streamId } = streamController;
    

    if (this.config.enableBuffering) {
      buffer.push(tokenData);
      

      if (buffer.length >= this.config.bufferSize || tokenData.isComplete) {
        await this.flushBuffer(streamController, onToken);
      }
    } else {

      await this.processToken(tokenData, streamController, onToken);
    }

    if (tokens.length === 1 && this.config.enableTypingIndicator) {
      this.stopTypingIndicator(streamController);
    }
  }

  
  async processToken(tokenData, streamController, onToken) {
    if (streamController.isInterrupted || streamController.isCancelled) return;

    const { tokens } = streamController;
    

    tokens.push(tokenData);
    

    if (this.config.enableProgressiveDisplay) {
      await this.updateProgressiveDisplay(streamController, tokenData);
    }
    

    if (onToken) {
      try {
        await onToken(tokenData, streamController);
      } catch (error) {
        console.error('Token callback error:', error);
      }
    }
  }

  
  async flushBuffer(streamController, onToken) {
    const { buffer } = streamController;
    
    for (const tokenData of buffer) {
      await this.processToken(tokenData, streamController, onToken);
    }
    
    buffer.length = 0; // Clear buffer
  }

  
  async updateProgressiveDisplay(streamController, tokenData) {
    const { responseContainer, tokens } = streamController;
    
    if (!responseContainer) return;

    const currentContent = tokens
      .map(token => token.content || token.text || '')
      .join('');
    

    if (responseContainer.updateContent) {
      await responseContainer.updateContent(currentContent, tokenData);
    } else {

      responseContainer.innerHTML = this.formatProgressiveContent(currentContent, tokenData);
    }
  }

  
  formatProgressiveContent(content, tokenData) {
    let formatted = content;
    

    if (this.config.enableCursorBlink && !tokenData.isComplete) {
      formatted += '<span class="streaming-cursor">|</span>';
    }
    

    return `<div class="streaming-content">${formatted}</div>`;
  }

  
  startTypingIndicator(streamController) {
    const { id: streamId, responseContainer } = streamController;
    
    if (!responseContainer) return;

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

    this.addTypingIndicatorStyles(indicator);

    if (responseContainer.appendChild) {
      responseContainer.appendChild(indicator);
    } else {
      responseContainer.innerHTML += indicator.outerHTML;
    }

    streamController.typingIndicator = indicator;
    this.typingIndicators.set(streamId, indicator);

    setTimeout(() => {
      indicator.classList.add('typing-active');
    }, this.config.typingIndicatorDelay);
  }

  
  stopTypingIndicator(streamController) {
    const { typingIndicator } = streamController;
    
    if (typingIndicator) {
      typingIndicator.classList.remove('typing-active');
      typingIndicator.classList.add('typing-complete');
      

      setTimeout(() => {
        if (typingIndicator.parentNode) {
          typingIndicator.parentNode.removeChild(typingIndicator);
        }
      }, 300);
      
      streamController.typingIndicator = null;
      this.typingIndicators.delete(streamController.id);
    }
  }

  
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

  
  interruptStream(streamId) {
    const streamController = this.activeStreams.get(streamId);
    if (!streamController) return;

    streamController.isInterrupted = true;
    this.streamingStats.interruptionCount++;

    if (streamController.abortController) {
      streamController.abortController.abort();
    }

    this.stopTypingIndicator(streamController);

    this.addInterruptionIndicator(streamController);
  }

  
  cancelStream(streamId) {
    const streamController = this.activeStreams.get(streamId);
    if (!streamController) return;

    streamController.isCancelled = true;
    this.streamingStats.cancellationCount++;

    if (streamController.abortController) {
      streamController.abortController.abort();
    }

    this.cleanupStream(streamController);
  }

  
  pauseStream(streamId) {
    const streamController = this.activeStreams.get(streamId);
    if (!streamController) return;

    streamController.isPaused = true;
    

    this.addPauseIndicator(streamController);
  }

  
  resumeStream(streamId) {
    const streamController = this.activeStreams.get(streamId);
    if (!streamController) return;

    streamController.isPaused = false;
    

    this.removePauseIndicator(streamController);
  }

  
  handleStreamCompletion(streamController, onComplete) {
    const { tokens, startTime } = streamController;
    

    this.stopTypingIndicator(streamController);

    this.addCompletionIndicator(streamController);

    const duration = Date.now() - startTime;
    this.streamingStats.successfulStreams++;
    this.updateStreamingStats(duration, tokens.length);

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

  
  handleStreamError(streamController, error, onError) {

    this.stopTypingIndicator(streamController);

    this.addErrorIndicator(streamController, error);

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

    if (this.config.enableRetry && streamController.retryCount < this.config.maxRetries) {
      setTimeout(() => {
        this.retryStream(streamController);
      }, this.config.retryDelay);
    }
  }

  
  handleStreamCancellation(streamController) {

    this.stopTypingIndicator(streamController);

    this.addCancellationIndicator(streamController);
  }

  
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

  
  removePauseIndicator(streamController) {
    const { responseContainer } = streamController;
    if (!responseContainer) return;

    const indicator = responseContainer.querySelector('.stream-pause');
    if (indicator) {
      indicator.remove();
    }
  }

  
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

    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    }, 2000);
  }

  
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

    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    }, 2000);
  }

  
  async retryStream(streamController) {
    streamController.retryCount = (streamController.retryCount || 0) + 1;
    

    streamController.isInterrupted = false;
    streamController.isCancelled = false;
    streamController.tokens = [];
    streamController.buffer = [];

    await this.executeStream(
      streamController,
      streamController.onToken,
      streamController.onComplete,
      streamController.onError
    );
  }

  
  cleanupStream(streamController) {

    this.stopTypingIndicator(streamController);

    this.activeStreams.delete(streamController.id);

    if (streamController.responseContainer) {
      const indicators = streamController.responseContainer.querySelectorAll(
        '.stream-interruption, .stream-pause, .stream-completion, .stream-error, .stream-cancellation'
      );
      indicators.forEach(indicator => indicator.remove());
    }
  }

  
  handleVisibilityChange() {
    const isHidden = document.hidden;
    

    if (isHidden) {
      for (const [streamId, streamController] of this.activeStreams.entries()) {
        if (!streamController.isPaused) {
          this.pauseStream(streamId);
        }
      }
    } else {

      for (const [streamId, streamController] of this.activeStreams.entries()) {
        if (streamController.isPaused) {
          this.resumeStream(streamId);
        }
      }
    }
  }

  
  handleNetworkOnline() {

    for (const [streamId, streamController] of this.activeStreams.entries()) {
      if (streamController.retryCount < this.config.maxRetries) {
        this.retryStream(streamController);
      }
    }
  }

  
  handleNetworkOffline() {

    for (const [streamId, streamController] of this.activeStreams.entries()) {
      this.pauseStream(streamId);
    }
  }

  
  updateStreamingStats(duration, tokenCount) {
    const totalStreams = this.streamingStats.totalStreams;
    

    this.streamingStats.averageLatency = 
      (this.streamingStats.averageLatency * (totalStreams - 1) + duration) / totalStreams;
    

    if (tokenCount > 0) {
      const tokenTime = duration / tokenCount;
      this.streamingStats.averageTokenTime = 
        (this.streamingStats.averageTokenTime * (totalStreams - 1) + tokenTime) / totalStreams;
    }
  }

  
  generateStreamId() {
    return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  
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

  
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  
  reset() {

    for (const [streamId, streamController] of this.activeStreams.entries()) {
      this.cancelStream(streamId);
    }

    this.activeStreams.clear();
    this.streamQueue = [];
    this.typingIndicators.clear();
    this.responseContainers.clear();

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

export const streamingResponseManager = new StreamingResponseManager();

export const startStream = streamingResponseManager.startStream.bind(streamingResponseManager);
export const getStreamingStats = streamingResponseManager.getStreamingStats.bind(streamingResponseManager);
export const updateConfig = streamingResponseManager.updateConfig.bind(streamingResponseManager);
export const reset = streamingResponseManager.reset.bind(streamingResponseManager);

export default streamingResponseManager;
