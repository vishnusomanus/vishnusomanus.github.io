// Calculate total for buy token page
function calculateTotal() {
    const tokenCount = parseInt(document.getElementById('token-count').value) || 1;
    const tokenPrice = 25000;
    const total = tokenCount * tokenPrice;
    
    if (document.getElementById('quantity-display')) {
        document.getElementById('quantity-display').textContent = tokenCount;
    }
    if (document.getElementById('total-display')) {
        document.getElementById('total-display').textContent = '₹' + total.toLocaleString('en-IN');
    }
}

// Set active nav item
function setActiveNav(pageId) {
    const navLinks = document.querySelectorAll('.bottom-nav a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set active nav based on current page
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    setActiveNav(currentPage);
});
