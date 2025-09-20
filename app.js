// Wrap the entire script in a 'DOMContentLoaded' listener to ensure the HTML is loaded first.
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DATA: Centralized source of truth ---
    // In a real app, this would come from an API.
    const caseData = [
        { id: '001-2024', type: 'SHOOT', category: 'shooting', description: 'Multiple shots fired - Downtown District', location: '123 Main Street, Units dispatched', status: 'active', priority: 'High', timestamp: new Date(Date.now() - 2 * 60 * 1000), url: 'shooting.html' },
        { id: '003-2024', type: 'ROB', category: 'robbery', description: 'Bank Robbery - First National', location: '456 Bank Ave, Suspect fled scene', status: 'pending', priority: 'High', timestamp: new Date(Date.now() - 5 * 60 * 1000) },
        { id: '005-2024', type: 'DOM', category: 'domestic', description: 'Domestic disturbance - Residential', location: '789 Oak Street, Wellness check requested', status: 'active', priority: 'Medium', timestamp: new Date(Date.now() - 8 * 60 * 1000) },
        { id: '002-2024', type: 'SHOOT', category: 'shooting', description: 'Single gunshot reported - Industrial Area', location: '321 Factory Rd, Investigating', status: 'pending', priority: 'Medium', timestamp: new Date(Date.now() - 15 * 60 * 1000) },
        { id: '004-2024', type: 'ROB', category: 'robbery', description: 'Convenience Store - Suspect apprehended', location: '654 Store Lane, Case closed', status: 'resolved', priority: 'Low', timestamp: new Date(Date.now() - 60 * 60 * 1000) }
    ];

    // --- 2. CACHE DOM ELEMENTS ---
    // Store frequently accessed elements in variables for faster access.
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const casesContainer = document.getElementById('casesContainer');
    const filterControls = document.getElementById('filter-controls');
    
    const activeCountEl = document.getElementById('activeCount');
    const pendingCountEl = document.getElementById('pendingCount');
    const resolvedCountEl = document.getElementById('resolvedCount');
    
    // --- 3. STATE MANAGEMENT ---
    let currentFilter = 'active';

    // --- 4. CORE FUNCTIONS ---

    /**
     * Calculates a 'time ago' string from a date object.
     * @param {Date} date - The timestamp to format.
     * @returns {string} - Formatted time string (e.g., "2 min ago").
     */
    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " min ago";
        return Math.floor(seconds) + " sec ago";
    };

    /**
     * Renders the list of cases into the DOM based on the current filter.
     * MODIFIED: Replaced static spans for status and priority with <select> dropdowns.
     */
    const renderCases = () => {
        // Filter the data first, don't hide DOM elements
        const filteredCases = caseData.filter(c => {
            if (currentFilter === 'all') return true;
            if (currentFilter === 'active') return c.status === 'active';
            if (currentFilter === 'current') return true; // Placeholder for location logic
            return true;
        });

        // Generate HTML from the data
        casesContainer.innerHTML = filteredCases.map(c => `
            <div class="case-row" data-status="${c.status}" data-id="${c.id}" ${c.url ? `data-url="${c.url}"` : ''}>
                <div>
                    <span class="case-type type-${c.category}">${c.type}</span>
                    <br><small>${c.id}</small>
                </div>
                <div>
                    <strong>${c.description}</strong>
                    <br><small>${c.location}</small>
                </div>
                <div>
                    <select class="status-select status-${c.status}" data-id="${c.id}">
                        <option value="active" ${c.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="pending" ${c.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="resolved" ${c.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                    </select>
                </div>
                <div>
                     <select class="priority-select priority-${c.priority.toLowerCase()}" data-id="${c.id}">
                        <option value="High" ${c.priority === 'High' ? 'selected' : ''}>High</option>
                        <option value="Medium" ${c.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                        <option value="Low" ${c.priority === 'Low' ? 'selected' : ''}>Low</option>
                    </select>
                </div>
                <div>${formatTimeAgo(c.timestamp)}</div>
            </div>
        `).join('');
    };
    
    /**
     * Updates the statistic counters based on the full dataset.
     */
    const updateStats = () => {
        activeCountEl.textContent = caseData.filter(c => c.status === 'active').length;
        pendingCountEl.textContent = caseData.filter(c => c.status === 'pending').length;
        resolvedCountEl.textContent = caseData.filter(c => c.status === 'resolved').length;
    };
    
    /**
     * Adds a message to the chat UI.
     * @param {string} text - The message content.
     * @param {string} sender - 'user' or 'bot'.
     */
    const addChatMessage = (text, sender) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll
    };

    // --- 5. EVENT LISTENERS ---

    // Chat functionality
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page reload on form submission
        const message = chatInput.value.trim();
        if (message) {
            addChatMessage(message, 'user');
            chatInput.value = '';
            
            // Simulate bot response
            setTimeout(() => {
                const responses = ["Units dispatched.", "Case logged as HIGH priority.", "Backup support en route."];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                addChatMessage(randomResponse, 'bot');
            }, 1000);
        }
    });

    // Filtering controls - using Event Delegation
    filterControls.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            // Remove active class from all buttons
            filterControls.querySelector('.active').classList.remove('active');
            // Add active class to the clicked button
            e.target.classList.add('active');
            // Update state and re-render
            currentFilter = e.target.dataset.filter;
            renderCases();
        }
    });

    // Case row clicks - using Event Delegation
    casesContainer.addEventListener('click', (e) => {
        // ADDED: Stop navigation if a dropdown was clicked
        if (e.target.tagName === 'SELECT') {
            e.stopPropagation();
            return;
        }
        const row = e.target.closest('.case-row');
        if (row && row.dataset.url) {
            window.location.href = row.dataset.url;
        }
    });

    /**
     * NEW: Event listener to handle changes in status or priority dropdowns.
     */
    casesContainer.addEventListener('change', (e) => {
        if (e.target.tagName === 'SELECT') {
            const caseId = e.target.dataset.id;
            const newValue = e.target.value;
            const caseToUpdate = caseData.find(c => c.id === caseId);

            if (caseToUpdate) {
                // Check if it's the status or priority select
                if (e.target.classList.contains('status-select')) {
                    caseToUpdate.status = newValue;
                } else if (e.target.classList.contains('priority-select')) {
                    caseToUpdate.priority = newValue;
                }
                
                // Re-render everything to reflect the state change
                updateStats();
                renderCases();
            }
        }
    });


    // --- 6. INITIALIZATION ---
    
    // Initial render of cases and stats
    renderCases();
    updateStats();
    
    // Periodically update the time-ago strings
    setInterval(renderCases, 30000); // Re-render every 30 seconds for fresh timestamps
});