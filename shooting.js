// The listener's function is now 'async' to allow for 'await'
document.addEventListener('DOMContentLoaded', async () => {

    // --- STATE & DATA ---
    const startTime = new Date();
    
    // --- FETCH DATA FROM JSON FILE ---
    // This block replaces the hardcoded data arrays
    let initialFeedData = [];
    let newEvents = [];

    try {
        const response = await fetch('feed-data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Sort the initial feed data after fetching it
        initialFeedData = data.initialFeed.sort((a, b) => b.time - a.time);
        newEvents = data.newEvents;

    } catch (error) {
        console.error("Could not fetch feed data:", error);
        // Display an error to the user in the feed
        document.getElementById('feed-body').innerHTML = 
            `<p style="color: #ff453a;">Error: Could not load incident data.</p>`;
        return; // Stop execution if data fails to load
    }

    // --- DOM ELEMENTS ---
    const timerElement = document.getElementById('timer-text');
    const startTimeElement = document.getElementById('start-time-text');
    const feedBody = document.getElementById('feed-body');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input-field');
    const chatHistory = document.getElementById('chat-history');
    
  
    // --- FUNCTIONS ---
    
    /** Formats elapsed milliseconds into HH:MM:SS */
    function formatTime(ms) {
      const totalSeconds = Math.floor(ms / 1000);
      const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
      const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
      const s = String(totalSeconds % 60).padStart(2, '0');
      return `${h}:${m}:${s}`;
    }
  
    /** Creates an HTML element for a timeline item */
    function createTimelineItem(item) {
      const timestamp = formatTime(item.time * 1000);
      const itemDiv = document.createElement('div');
      itemDiv.className = 'timeline-item';
      itemDiv.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="timeline-header">
            <h4>${item.title}</h4>
            <span class="timestamp">${timestamp}</span>
          </div>
          <p>${item.details}</p>
        </div>
      `;
      return itemDiv;
    }
  
    /** Renders the entire feed from data */
    function renderFeed(data) {
      feedBody.innerHTML = ''; // Clear existing feed
      data.forEach(item => {
        const itemElement = createTimelineItem(item);
        feedBody.appendChild(itemElement);
      });
    }
  
    /** Adds a new message to the chat history */
    function addChatMessage(message, sender = 'assistant') {
      const messageDiv = document.createElement('div');
      messageDiv.className = sender === 'assistant' ? 'assistant-message' : 'user-message'; // You'd need to style .user-message
      messageDiv.textContent = message;
      chatHistory.appendChild(messageDiv);
      chatHistory.scrollTop = chatHistory.scrollHeight; // Auto-scroll
    }
    
  
    // --- EVENT LISTENERS & INITIALIZERS ---
  
    // Accordion (Card Collapse) Toggle
    document.querySelectorAll('.card-header[data-target]').forEach(header => {
      header.addEventListener('click', () => {
        const content = document.getElementById(header.dataset.target);
        const isExpanded = header.getAttribute('aria-expanded') === 'true';
  
        header.setAttribute('aria-expanded', !isExpanded);
        content.classList.toggle('is-open');
      });
    });
  
    // Incident Timer
    startTimeElement.textContent = `Incident Start Time: ${startTime.toLocaleTimeString()}`;
    setInterval(() => {
      timerElement.textContent = formatTime(Date.now() - startTime.getTime());
    }, 1000);
  
    // Initial Timeline Render (now that data is fetched)
    renderFeed(initialFeedData);
  
    // Simulate Live Feed Updates
    setInterval(() => {
      if (newEvents.length > 0) {
        const nextEvent = newEvents.shift();
        const itemElement = createTimelineItem(nextEvent);
        feedBody.prepend(itemElement); // Add new events to the top
      }
    }, 8000); // Add a new event every 8 seconds
  
    // AI Chat Form Submission
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const userQuery = chatInput.value.trim();
      if (!userQuery) return;
      
      addChatMessage(`User: ${userQuery}`, 'user');
      chatInput.value = '';
  
      setTimeout(() => {
        addChatMessage('Acknowledged. Searching protocols for your query...');
      }, 1000);
    });
});