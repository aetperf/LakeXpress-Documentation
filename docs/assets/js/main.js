// Main JavaScript for MigratorXpress Documentation

// Add smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add active state to current navigation item
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-menu a').forEach(link => {
        if (link.getAttribute('href') === currentPath || 
            (currentPath.endsWith('/') && link.getAttribute('href').endsWith('/index.html'))) {
            link.classList.add('active');
        }
    });

    // Copy code blocks on click
    document.querySelectorAll('pre').forEach(pre => {
        pre.style.position = 'relative';
        pre.style.cursor = 'pointer';
        pre.title = 'Click to copy';
        
        pre.addEventListener('click', function() {
            const code = this.querySelector('code');
            if (code) {
                const text = code.textContent;
                navigator.clipboard.writeText(text).then(() => {
                    // Show feedback
                    const feedback = document.createElement('div');
                    feedback.textContent = 'Copied!';
                    feedback.style.cssText = `
                        position: absolute;
                        top: 5px;
                        right: 5px;
                        background: #10b981;
                        color: white;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 12px;
                        font-family: sans-serif;
                    `;
                    this.appendChild(feedback);
                    setTimeout(() => feedback.remove(), 2000);
                });
            }
        });
    });
});

// Mobile menu toggle
function toggleMobileMenu() {
    const menu = document.querySelector('.nav-menu');
    menu.classList.toggle('mobile-active');
}

// Add syntax highlighting for code blocks if needed
function highlightCode() {
    document.querySelectorAll('pre code').forEach((block) => {
        // Add basic syntax highlighting classes
        const language = detectLanguage(block.textContent);
        block.classList.add(`language-${language}`);
    });
}

function detectLanguage(code) {
    if (code.includes('migxpress2')) return 'bash';
    if (code.includes('{') && code.includes('}')) return 'json';
    return 'text';
}