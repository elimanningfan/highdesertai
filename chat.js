// High Desert AI Chat Widget
// Frontend chat logic with localStorage persistence and daily conversation reset

class ChatWidget {
  constructor() {
    this.isOpen = false;
    this.conversationHistory = [];
    this.maxStoredMessages = 20;
    this.maxContextMessages = 10;
    this.storageKey = 'highdesertai_chat';
    this.dateKey = 'highdesertai_chat_date';
    this.apiEndpoint = '/.netlify/functions/chat';

    this.init();
  }

  init() {
    this.createChatUI();
    this.attachEventListeners();
    this.loadConversation();
    this.checkAndResetDaily();
    this.showWelcomeMessage();
  }

  createChatUI() {
    const chatHTML = `
      <!-- Chat Toggle Button -->
      <button class="chat-toggle" id="chatToggle" aria-label="Open chat">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.38 0-2.67-.3-3.83-.84l-.27-.15-2.83.48.48-2.83-.15-.27C4.3 14.67 4 13.38 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
          <path d="M9 11h6v2H9zm0-3h6v2H9z"/>
        </svg>
        <span class="close-icon">×</span>
      </button>

      <!-- Chat Window -->
      <div class="chat-window" id="chatWindow">
        <div class="chat-header">
          <h3>High Desert AI</h3>
          <p>AI Consulting Assistant</p>
        </div>

        <div class="error-message" id="errorMessage"></div>

        <div class="chat-messages" id="chatMessages">
          <!-- Messages will be inserted here -->
        </div>

        <div class="typing-indicator" id="typingIndicator">
          <div class="typing-bubble">
            <div class="typing-dots">
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
            </div>
          </div>
        </div>

        <div class="chat-input-container">
          <textarea
            class="chat-input"
            id="chatInput"
            placeholder="Ask about AI consulting..."
            rows="1"
          ></textarea>
          <button class="send-button" id="sendButton" aria-label="Send message">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatHTML);
  }

  attachEventListeners() {
    const chatToggle = document.getElementById('chatToggle');
    const chatWindow = document.getElementById('chatWindow');
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');

    // Toggle chat window
    chatToggle.addEventListener('click', () => this.toggleChat());

    // Send message on button click
    sendButton.addEventListener('click', () => this.sendMessage());

    // Send message on Enter (without Shift)
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea
    chatInput.addEventListener('input', (e) => {
      e.target.style.height = 'auto';
      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    });

    // Close chat when clicking outside (optional)
    document.addEventListener('click', (e) => {
      if (this.isOpen &&
          !chatWindow.contains(e.target) &&
          !chatToggle.contains(e.target)) {
        // Uncomment to enable click-outside-to-close
        // this.toggleChat();
      }
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const chatToggle = document.getElementById('chatToggle');
    const chatWindow = document.getElementById('chatWindow');

    if (this.isOpen) {
      chatToggle.classList.add('open');
      chatWindow.classList.add('open');
      document.getElementById('chatInput').focus();
    } else {
      chatToggle.classList.remove('open');
      chatWindow.classList.remove('open');
    }
  }

  showWelcomeMessage() {
    // Only show welcome message if conversation is empty
    if (this.conversationHistory.length === 0) {
      const welcomeMessage = "👋 Hi! I'm High Desert AI's consulting assistant. I can help you think through AI opportunities for your business, answer questions about implementation, or discuss AI strategy. What's on your mind?";
      this.addMessage('assistant', welcomeMessage);
    }
  }

  async sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();

    if (!message) return;

    // Disable input while sending
    this.setInputState(false);

    // Add user message to UI
    this.addMessage('user', message);

    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';

    // Show typing indicator
    this.showTypingIndicator(true);

    // Hide any previous error messages
    this.hideError();

    try {
      // Send to API
      const response = await this.callAPI(message);

      // Hide typing indicator
      this.showTypingIndicator(false);

      // Add assistant response
      this.addMessage('assistant', response);

    } catch (error) {
      console.error('Error sending message:', error);

      // Hide typing indicator
      this.showTypingIndicator(false);

      // Show error message
      this.showError('Sorry, something went wrong. Please try again.');
    } finally {
      // Re-enable input
      this.setInputState(true);
      document.getElementById('chatInput').focus();
    }
  }

  async callAPI(message) {
    // Get last 10 messages for context
    const contextMessages = this.conversationHistory.slice(-this.maxContextMessages);

    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        history: contextMessages,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  }

  addMessage(role, content) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageData = {
      role: role,
      content: content,
      timestamp: new Date().toISOString(),
    };

    // Add to conversation history
    this.conversationHistory.push(messageData);

    // Trim history if too long
    if (this.conversationHistory.length > this.maxStoredMessages) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxStoredMessages);
    }

    // Save to localStorage
    this.saveConversation();

    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = content;

    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = this.formatTime(messageData.timestamp);

    messageDiv.appendChild(bubble);
    messageDiv.appendChild(time);
    messagesContainer.appendChild(messageDiv);

    // Scroll to bottom
    this.scrollToBottom();
  }

  showTypingIndicator(show) {
    const indicator = document.getElementById('typingIndicator');
    if (show) {
      indicator.classList.add('show');
      this.scrollToBottom();
    } else {
      indicator.classList.remove('show');
    }
  }

  setInputState(enabled) {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');

    chatInput.disabled = !enabled;
    sendButton.disabled = !enabled;
  }

  showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
  }

  hideError() {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.classList.remove('show');
  }

  scrollToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  saveConversation() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.conversationHistory));
      localStorage.setItem(this.dateKey, new Date().toDateString());
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }

  loadConversation() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.conversationHistory = JSON.parse(saved);
        this.renderConversation();
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      this.conversationHistory = [];
    }
  }

  renderConversation() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '';

    this.conversationHistory.forEach(msg => {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${msg.role}`;

      const bubble = document.createElement('div');
      bubble.className = 'message-bubble';
      bubble.textContent = msg.content;

      const time = document.createElement('div');
      time.className = 'message-time';
      time.textContent = this.formatTime(msg.timestamp);

      messageDiv.appendChild(bubble);
      messageDiv.appendChild(time);
      messagesContainer.appendChild(messageDiv);
    });

    this.scrollToBottom();
  }

  checkAndResetDaily() {
    try {
      const savedDate = localStorage.getItem(this.dateKey);
      const today = new Date().toDateString();

      if (savedDate !== today) {
        // New day - clear conversation
        this.conversationHistory = [];
        localStorage.removeItem(this.storageKey);
        localStorage.setItem(this.dateKey, today);
      }
    } catch (error) {
      console.error('Error checking date:', error);
    }
  }
}

// Initialize chat widget when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ChatWidget();
  });
} else {
  new ChatWidget();
}
