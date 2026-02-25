document.addEventListener('DOMContentLoaded', function() {
    initStreamersPage();
    initTournamentsPage();
});

function initStreamersPage() {
    const container = document.getElementById('streamers-container');
    const counterElement = document.getElementById('counter');

    if (!container || !counterElement) {
        return;
    }

    const showStreamersBtn = document.getElementById('show-streamers-btn');
    const filterContainer = document.getElementById('filter-container');
    const searchInput = document.getElementById('search-input');
    const filterBtn = document.getElementById('filter-btn');
    const filterOptions = document.getElementById('filter-options');
    const filterOptionButtons = filterOptions ? filterOptions.querySelectorAll('.filter-option') : [];
    const filterLabels = {
        all: 'All ▾',
        pro: 'Pro Players ▾',
        streamers: 'Streamers ▾'
    };

    let streamersData = [];
    let currentFilter = 'all';
    let searchQuery = '';

    fetchJson('assets/data/streamers.json')
        .then(streamers => {
            streamersData = Array.isArray(streamers) ? streamers : [];
            animateCounter(streamersData.length, counterElement);
        })
        .catch(error => {
            console.error('Error loading streamers:', error);
            counterElement.textContent = '!';
        });

    if (showStreamersBtn) {
        showStreamersBtn.addEventListener('click', function() {
            showStreamersBtn.style.display = 'none';
            container.classList.remove('hidden');
            if (filterContainer) {
                filterContainer.classList.remove('hidden');
            }

            renderStreamers(getFilteredStreamers());
            document.body.style.overflow = 'auto';
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
        });
    }

    if (filterBtn && filterOptions) {
        filterBtn.addEventListener('click', function(event) {
            event.stopPropagation();
            filterOptions.classList.toggle('show');
        });
    }

    filterOptionButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const selectedFilter = button.dataset.filter;
            setActiveFilter(selectedFilter);
            if (filterOptions) {
                filterOptions.classList.remove('show');
            }
            renderStreamers(getFilteredStreamers());
        });
    });

    document.addEventListener('click', function() {
        if (filterOptions) {
            filterOptions.classList.remove('show');
        }
    });

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchQuery = searchInput.value.toLowerCase().trim();
            renderStreamers(getFilteredStreamers());
        });
    }

    container.addEventListener('click', function(event) {
        const nicknameElement = event.target.closest('.nickname[data-has-name="true"]');
        if (!nicknameElement || !isMobile()) {
            return;
        }

        event.preventDefault();
        const tooltip = nicknameElement.querySelector('.tooltip');
        if (!tooltip) {
            return;
        }

        container.querySelectorAll('.tooltip.visible').forEach(function(visibleTooltip) {
            if (visibleTooltip !== tooltip) {
                visibleTooltip.classList.remove('visible');
            }
        });

        tooltip.classList.toggle('visible');
    });

    document.addEventListener('click', function(event) {
        if (!isMobile()) {
            return;
        }

        if (event.target.closest('.nickname[data-has-name="true"]')) {
            return;
        }

        container.querySelectorAll('.tooltip.visible').forEach(function(visibleTooltip) {
            visibleTooltip.classList.remove('visible');
        });
    });

    function setActiveFilter(filter) {
        currentFilter = filter;

        if (filterBtn) {
            filterBtn.textContent = filterLabels[filter] || filterLabels.all;
        }

        filterOptionButtons.forEach(function(button) {
            button.classList.toggle('active', button.dataset.filter === filter);
        });
    }

    function isProPlayer(streamer) {
        return hasLink(streamer, 'hltv') || hasLink(streamer, 'liquipedia');
    }

    function getFilteredStreamers() {
        let filteredStreamers = streamersData;

        if (currentFilter === 'pro') {
            filteredStreamers = filteredStreamers.filter(isProPlayer);
        } else if (currentFilter === 'streamers') {
            filteredStreamers = filteredStreamers.filter(function(streamer) {
                return !isProPlayer(streamer);
            });
        }

        if (searchQuery) {
            filteredStreamers = filteredStreamers.filter(function(streamer) {
                return String(streamer.nickname || '').toLowerCase().includes(searchQuery);
            });
        }

        return filteredStreamers;
    }

    function renderStreamers(streamers) {
        container.innerHTML = '';

        streamers.forEach(function(streamer) {
            container.appendChild(createStreamerCard(streamer));
        });
    }
}

function createStreamerCard(streamer) {
    if (!streamer) {
        console.error('Invalid streamer data');
        const fallbackCard = document.createElement('article');
        fallbackCard.className = 'streamer-card';
        return fallbackCard;
    }

    const card = document.createElement('article');
    card.className = 'streamer-card';

    const hasName = hasText(streamer.name);
    const liquipediaLink = hasLink(streamer, 'liquipedia')
        ? `
            <a href="${escapeHtml(streamer.links.liquipedia)}"
               class="info-icon"
               target="_blank"
               rel="noopener noreferrer"
               title="View on Liquipedia">
                i
            </a>
        `
        : '';

    const linksHtml = [
        buildAnchor(streamer.links && streamer.links.twitch, 'twitch', `${twitchIconSvg()} Twitch`),
        buildAnchor(streamer.links && streamer.links.hltv, 'hltv', 'HLTV'),
        buildAnchor(streamer.links && streamer.links.youtube, 'youtube', `${youtubeIconSvg()} YouTube`)
    ].join('');

    card.innerHTML = `
        <h2 class="streamer-header">
            <span class="nickname" ${hasName ? `data-name="${escapeHtml(streamer.name)}" data-has-name="true"` : ''}>
                ${escapeHtml(streamer.nickname || '')}
                ${hasName ? `<span class="tooltip">${escapeHtml(streamer.name)}</span>` : ''}
            </span>
            ${liquipediaLink}
        </h2>
        <div class="links">
            ${linksHtml}
        </div>
    `;

    if (hasName) {
        const nicknameElement = card.querySelector('.nickname');
        if (nicknameElement) {
            nicknameElement.style.cursor = 'pointer';
        }
    }

    return card;
}

function initTournamentsPage() {
    const container = document.getElementById('tournaments-container');
    const counterElement = document.getElementById('tournament-counter');

    if (!container || !counterElement) {
        return;
    }

    fetchJson('assets/data/tournaments.json')
        .then(tournaments => {
            const tournamentsData = Array.isArray(tournaments) ? tournaments : [];
            animateCounter(tournamentsData.length, counterElement);
            renderTournaments(container, tournamentsData);
            document.body.style.overflow = 'auto';
        })
        .catch(error => {
            console.error('Error loading tournaments:', error);
            container.innerHTML = '<div class="error">Failed to load tournaments data</div>';
        });

    const scrollDownBtn = document.getElementById('scroll-down-btn');
    if (scrollDownBtn) {
        scrollDownBtn.addEventListener('click', function() {
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
        });
    }
}

function renderTournaments(container, tournaments) {
    container.innerHTML = '';
    tournaments.forEach(function(tournament) {
        container.appendChild(createTournamentCard(tournament));
    });
}

function createTournamentCard(tournament) {
    const card = document.createElement('article');
    card.className = 'tournament-card';

    const date = new Date(tournament.date);
    const formattedDate = Number.isNaN(date.getTime())
        ? ''
        : date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

    const teammatesHtml = Array.isArray(tournament.teammates) && tournament.teammates.length > 0
        ? `<div class="tournament-teammates"><span class="teammates-label">With:</span><div class="teammates-list">${tournament.teammates.map(function(teammate) {
            return `<span class="teammate-badge">${escapeHtml(teammate)}</span>`;
        }).join('')}</div></div>`
        : '';

    const links = tournament.links || {};
    const linksHtml = [
        buildAnchor(links.info, 'tournament-link info', 'Info'),
        buildAnchor(links.website, 'tournament-link website', 'Website'),
        buildAnchor(links.bracket, 'tournament-link bracket', 'Bracket')
    ].join('');

    card.innerHTML = `
        <div class="tournament-header">
            <div class="tournament-game">${escapeHtml(tournament.game || '')}</div>
            <div class="tournament-date">${formattedDate}</div>
        </div>
        <h2 class="tournament-name">${escapeHtml(tournament.name || '')}</h2>
        <div class="tournament-team">Team: ${escapeHtml(tournament.team || '')}</div>
        <div class="tournament-placement ${getPlacementClass(tournament.placement)}">
            <span class="placement-label">Result:</span>
            <span class="placement-value">${escapeHtml(tournament.placement || '')}</span>
        </div>
        ${teammatesHtml}
        <div class="tournament-links">
            ${linksHtml}
        </div>
    `;

    return card;
}

function getPlacementClass(placement) {
    const normalizedPlacement = String(placement || '').toLowerCase();

    if (normalizedPlacement.includes('winner')) {
        return 'placement-winner';
    }

    if (normalizedPlacement.includes('2') || normalizedPlacement.includes('second')) {
        return 'placement-second';
    }

    if (normalizedPlacement.includes('3') || normalizedPlacement.includes('third')) {
        return 'placement-third';
    }

    return 'placement-regular';
}

function fetchJson(path) {
    return fetch(path).then(function(response) {
        if (!response.ok) {
            throw new Error(`Failed to load ${path}`);
        }
        return response.json();
    });
}

function hasText(value) {
    return typeof value === 'string' && value.trim() !== '';
}

function hasLink(entity, key) {
    return Boolean(entity && entity.links && hasText(entity.links[key]));
}

function buildAnchor(href, className, labelHtml) {
    if (!hasText(href)) {
        return '';
    }

    return `
        <a href="${escapeHtml(href)}"
           class="${className}"
           target="_blank"
           rel="noopener noreferrer">
            ${labelHtml}
        </a>
    `;
}

function twitchIconSvg() {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>';
}

function youtubeIconSvg() {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>';
}

function isMobile() {
    return window.innerWidth <= 768;
}
