/**
 * Utility functions shared across the application
 */

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Animates a counter from 0 to target value
 * @param {number} target - The target value to reach
 * @param {HTMLElement} counterElement - The element to display the counter
 * @param {number} duration - Animation duration in milliseconds (default: 2000ms)
 */
function animateCounter(target, counterElement, duration = 2000) {
    if (!counterElement) return;
    
    const step = target / (duration / 16);
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

/**
 * Animates page exit before redirecting
 * @param {Event} event - The click event
 * @param {string} targetPath - The target path to redirect to (default: './')
 */
function exitToMain(event, targetPath = './') {
    if (event) {
        event.preventDefault();
    }
    
    const body = document.body;
    if (body) {
        body.classList.add('page-exiting');
    }
    
    // Wait for animation to complete, then redirect
    setTimeout(function() {
        window.location.href = targetPath;
    }, 400);
}
