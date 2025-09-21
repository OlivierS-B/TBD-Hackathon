document.addEventListener('DOMContentLoaded', async () => {

    let caseData = [];

    try {
        const response = await fetch('incidents.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        caseData = data.dashboardCases.map(caseItem => ({
            ...caseItem,
            timestamp: new Date(Date.now() - caseItem.timeOffsetMinutes * 60 * 1000)
        }));

    } catch (error) {
        console.error("Could not fetch dashboard case data:", error);
        document.getElementById('casesContainer').innerHTML = `Error loading case data.`;
        return; 
    }

    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const casesContainer = document.getElementById('casesContainer');
    const filterControls = document.getElementById('filter-controls');
    
    const activeCountEl = document.getElementById('activeCount');
    const pendingCountEl = document.getElementById('pendingCount');
    const resolvedCountEl = document.getElementById('resolvedCount');
    
    let currentFilter = 'active';

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

    const renderCases = () => {
        const filteredCases = caseData.filter(c => {
            if (currentFilter === 'all') return true;
            if (currentFilter === 'active') return c.status === 'active';
            if (currentFilter === 'current') return true; 
            return true;
        });

        casesContainer.innerHTML = filteredCases.map(c => `
            <div class="case-row" data-status="${c.status}" data-id="${c.id}">
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
    
    const updateStats = () => {
        activeCountEl.textContent = caseData.filter(c => c.status === 'active').length;
        pendingCountEl.textContent = caseData.filter(c => c.status === 'pending').length;
        resolvedCountEl.textContent = caseData.filter(c => c.status === 'resolved').length;
    };
    
    const addChatMessage = (text, sender) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; 
    };

    // --- UPDATED CHATFORM EVENT LISTENER ---
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        addChatMessage(message, 'user');
        chatInput.value = '';
        addChatMessage("Thinking...", 'bot'); // Provide instant feedback

        try {
            const response = await fetch('http://localhost:3000/ask-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: message }),
            });

            // Remove the "Thinking..." message
            chatMessages.removeChild(chatMessages.lastChild);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Server error: ${response.statusText}`);
            }

            const data = await response.json();
            addChatMessage(data.answer, 'bot');

        } catch (error) {
            console.error("Error fetching AI response:", error);
            addChatMessage(`Sorry, I encountered an error: ${error.message}`, 'bot');
        }
    });

    filterControls.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            filterControls.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderCases();
        }
    });

    casesContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'SELECT') {
            e.stopPropagation();
            return;
        }
        const row = e.target.closest('.case-row');
        if (row && row.dataset.id) {
            window.location.href = `incident.html?id=${row.dataset.id}`;
        }
    });

    casesContainer.addEventListener('change', (e) => {
        if (e.target.tagName === 'SELECT') {
            const caseId = e.target.dataset.id;
            const newValue = e.target.value;
            const caseToUpdate = caseData.find(c => c.id === caseId);

            if (caseToUpdate) {
                if (e.target.classList.contains('status-select')) {
                    caseToUpdate.status = newValue;
                } else if (e.target.classList.contains('priority-select')) {
                    caseToUpdate.priority = newValue;
                }
                
                updateStats();
                renderCases();
            }
        }
    });

    renderCases();
    updateStats();
    
    setInterval(renderCases, 30000);
});
