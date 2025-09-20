document.addEventListener('DOMContentLoaded', async () => {
    // --- SETUP & DATA FETCHING ---
    const startTime = new Date();
    
    // 1. Get the incident ID from the URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const incidentId = urlParams.get('id');

    if (!incidentId) {
        document.body.innerHTML = '<h1>Error: No Incident ID was provided in the URL.</h1>';
        return;
    }

    let initialFeedData = [];
    let newEvents = [];

    try {
        const response = await fetch('incidents.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // 2. Find the specific case information from the dashboard data
        const caseInfo = data.dashboardCases.find(c => c.id === incidentId);
        if (!caseInfo) {
            throw new Error(`Incident with ID "${incidentId}" not found.`);
        }

        // 3. Get the correct feed data using the case's category
        const incidentCategory = caseInfo.category; // e.g., "shooting"
        const feedData = data[incidentCategory]; // e.g., data["shooting"]

        if (!feedData) {
            throw new Error(`Feed data for category "${incidentCategory}" not found.`);
        }
        
        initialFeedData = feedData.initialFeed.sort((a, b) => b.time - a.time);
        newEvents = feedData.newEvents;

        // 4. Populate the dynamic elements on the page
        document.getElementById('incident-location-text').textContent = `Location: ${caseInfo.description}`;
        document.getElementById('video-iframe').src = caseInfo.videoUrl;

    } catch (error) {
        console.error("Could not fetch or process incident data:", error);
        document.getElementById('feed-body').innerHTML = 
            `<p style="color: #ff453a;">Error: Could not load incident data. ${error.message}</p>`;
        return; 
    }

    // --- DOM ELEMENTS ---
    const timerElement = document.getElementById('timer-text');
    const startTimeElement = document.getElementById('start-time-text');
    const feedBody = document.getElementById('feed-body');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input-field');
    const chatHistory = document.getElementById('chat-history');
    
    // --- FUNCTIONS (Consolidated from other files) ---
    function formatTime(ms) {
      const totalSeconds = Math.floor(ms / 1000);
      const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
      const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
      const s = String(totalSeconds % 60).padStart(2, '0');
      return `${h}:${m}:${s}`;
    }
  
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
  
    function renderFeed(data) {
      feedBody.innerHTML = '';
      data.forEach(item => {
        const itemElement = createTimelineItem(item);
        feedBody.appendChild(itemElement);
      });
    }
  
    function addChatMessage(message, sender = 'assistant') {
      const messageDiv = document.createElement('div');
      messageDiv.className = sender === 'assistant' ? 'assistant-message' : 'user-message';
      messageDiv.textContent = message;
      chatHistory.appendChild(messageDiv);
      chatHistory.scrollTop = chatHistory.scrollHeight;
    }
    
    // --- EVENT LISTENERS & INITIALIZERS ---
    document.querySelectorAll('.card-header[data-target]').forEach(header => {
      header.addEventListener('click', () => {
        const content = document.getElementById(header.dataset.target);
        const isExpanded = header.getAttribute('aria-expanded') === 'true';
        header.setAttribute('aria-expanded', !isExpanded);
        content.classList.toggle('is-open');
      });
    });
  
    startTimeElement.textContent = `Incident Start Time: ${startTime.toLocaleTimeString()}`;
    setInterval(() => {
      timerElement.textContent = formatTime(Date.now() - startTime.getTime());
    }, 1000);
  
    renderFeed(initialFeedData);
  
    // Simulates new events coming in
    setInterval(() => {
      if (newEvents.length > 0) {
        const nextEvent = newEvents.shift();
        const itemElement = createTimelineItem(nextEvent);
        feedBody.prepend(itemElement);
      }
    }, 8000);
  
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