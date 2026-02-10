document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('streamers-container');
    const counterElement = document.getElementById('counter');
    const showStreamersBtn = document.getElementById('show-streamers-btn');
    const filterContainer = document.getElementById('filter-container');
    const searchInput = document.getElementById('search-input');
    const filterBtn = document.getElementById('filter-btn');
    const filterOptions = document.getElementById('filter-options');
    const filterOptionButtons = filterOptions ? filterOptions.querySelectorAll('.filter-option') : [];
    let streamersData = [];
    let currentFilter = 'all';
    let searchQuery = '';
    
    // Filter option labels mapping
    const filterLabels = {
        'all': 'All ▾',
        'pro': 'Pro Players ▾',
        'streamers': 'Streamers ▾'
    };
    
    // Fetch JSON data
    fetch('streamers.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load streamers data');
            }
            return response.json();
        })
        .then(streamers => {
            streamersData = streamers;
            // Animate counter
            animateCounter(streamers.length);
        })
        .catch(error => {
            console.error('Error loading streamers:', error);
            if (counterElement) counterElement.textContent = '!';
        });
    
    // Show streamers button click handler
    if (showStreamersBtn) {
        showStreamersBtn.addEventListener('click', function(e) {
            // Hide the button when cards are displayed
            showStreamersBtn.style.display = 'none';
            if (container) container.classList.remove('hidden');
            if (filterContainer) filterContainer.classList.remove('hidden');
            renderStreamers(getFilteredStreamers());
            
            // Enable scrolling after button click
            document.body.style.overflow = 'auto';
            
            // Scroll to show the content
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
        });
    }
    
    // Toggle filter dropdown
    if (filterBtn) {
        filterBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            filterOptions.classList.toggle('show');
        });
    }
    
    // Filter option handlers
    filterOptionButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const filter = btn.dataset.filter;
            setActiveFilter(filter);
            filterOptions.classList.remove('show');
            renderStreamers(getFilteredStreamers());
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        if (filterOptions) {
            filterOptions.classList.remove('show');
        }
    });
    
    // Search input handler
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchQuery = searchInput.value.toLowerCase().trim();
            renderStreamers(getFilteredStreamers());
        });
    }
    
    function setActiveFilter(filter) {
        currentFilter = filter;
        if (filterBtn) {
            filterBtn.textContent = filterLabels[filter];
        }
        filterOptionButtons.forEach(function(btn) {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
    }
    
    function isProPlayer(streamer) {
        const hltv = streamer.links && streamer.links.hltv && streamer.links.hltv.trim() !== '';
        const liquipedia = streamer.links && streamer.links.liquipedia && streamer.links.liquipedia.trim() !== '';
        return hltv || liquipedia;
    }
    
    function getFilteredStreamers() {
        let filtered = streamersData;
        
        // Apply category filter
        switch (currentFilter) {
            case 'pro':
                filtered = filtered.filter(isProPlayer);
                break;
            case 'streamers':
                filtered = filtered.filter(s => !isProPlayer(s));
                break;
            default:
                break;
        }
        
        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(streamer => 
                streamer.nickname.toLowerCase().includes(searchQuery)
            );
        }
        
        return filtered;
    }
    

    // Counter animation function
    function animateCounter(target) {
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60fps
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counterElement.textContent = Math.floor(current);
        }, 16);
    }
    
    function renderStreamers(streamers) {
        container.innerHTML = '';
        
        streamers.forEach((streamer) => {
            const card = createStreamerCard(streamer);
            container.appendChild(card);
        });
    }
    
    function createStreamerCard(streamer) {
        if (!streamer) {
            console.error('Invalid streamer data');
            return document.createElement('article');
        }
        
        const card = document.createElement('article');
        card.className = 'streamer-card';
        
        // Generate liquipedia link
        let liquipediaHtml = '';
        if (streamer.links && streamer.links.liquipedia && streamer.links.liquipedia.trim() !== '') {
            liquipediaHtml = `
                <a href="${escapeHtml(streamer.links.liquipedia)}" 
                   class="info-icon" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   title="View on Liquipedia">
                    i
                </a>
            `;
        }
        
        // Generate links HTML dynamically
        let linksHtml = '';
        if (streamer.links && streamer.links.twitch) {
            linksHtml += `
                <a href="${escapeHtml(streamer.links.twitch)}" 
                   class="twitch" 
                   target="_blank" 
                   rel="noopener noreferrer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>
                    Twitch
                </a>
            `;
        }
        if (streamer.links && streamer.links.hltv && streamer.links.hltv.trim() !== '') {
            linksHtml += `
                <a href="${escapeHtml(streamer.links.hltv)}" 
                   class="hltv" 
                   target="_blank" 
                   rel="noopener noreferrer">
                    HLTV
                </a>
            `;
        }
        if (streamer.links && streamer.links.youtube && streamer.links.youtube.trim() !== '') {
            linksHtml += `
                <a href="${escapeHtml(streamer.links.youtube)}" 
                   class="youtube" 
                   target="_blank" 
                   rel="noopener noreferrer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                    YouTube
                </a>
            `;
        }
        
        card.innerHTML = `
            <h2 class="streamer-header">
                <span class="nickname" ${streamer.name && streamer.name.trim() !== '' ? `data-name="${escapeHtml(streamer.name)}"` : ''}>
                    ${escapeHtml(streamer.nickname)}
                    ${streamer.name && streamer.name.trim() !== '' ? `<span class="tooltip">${escapeHtml(streamer.name)}</span>` : ''}
                </span>
                ${liquipediaHtml}
            </h2>
            <div class="links">
                ${linksHtml}
            </div>
        `;
        
        // Add click handler for name display on mobile
        const nicknameEl = card.querySelector('.nickname');
        if (nicknameEl && streamer.name && streamer.name.trim() !== '') {
            nicknameEl.style.cursor = 'pointer';
            nicknameEl.addEventListener('click', function(e) {
                e.preventDefault();
                // Toggle tooltip visibility on mobile
                if (isMobile()) {
                    const tooltip = nicknameEl.querySelector('.tooltip');
                    if (tooltip) {
                        // Hide all other tooltips first
                        document.querySelectorAll('.streamer-card .tooltip.visible').forEach(t => {
                            if (t !== tooltip) {
                                t.classList.remove('visible');
                            }
                        });
                        tooltip.classList.toggle('visible');
                    }
                }
            });
            
            // Close tooltip when clicking outside
            document.addEventListener('click', function(e) {
                if (isMobile() && !nicknameEl.contains(e.target)) {
                    const tooltip = nicknameEl.querySelector('.tooltip');
                    if (tooltip) {
                        tooltip.classList.remove('visible');
                    }
                }
            });
        }
        
        return card;
    }

    function isMobile() {
        return window.innerWidth <= 768;
    }
});
