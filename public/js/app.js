/**
 * Deep Link Shortener - Frontend Application
 */

/**
 * Shorten a URL
 */
async function shortenUrl() {
    const urlInput = document.getElementById('originalUrl');
    const url = urlInput.value.trim();

    const btnText = document.getElementById('btnText');
    const btnLoading = document.getElementById('btnLoading');
    const shortenBtn = document.getElementById('shortenBtn');
    const errorMsg = document.getElementById('errorMsg');
    const result = document.getElementById('result');

    // Reset UI
    errorMsg.classList.remove('show');
    result.classList.remove('show');

    // Validation
    if (!url) {
        showError('لطفاً یک لینک وارد کنید');
        return;
    }

    if (!isValidUrl(url)) {
        showError('لینک وارد شده معتبر نیست');
        return;
    }

    // Show loading
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    shortenBtn.disabled = true;

    try {
        // Call API
        const response = await fetch('/api/shorten', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        const data = await response.json();

        if (data.success) {
            // Show result
            document.getElementById('shortUrlInput').value = data.shortUrl;
            document.getElementById('platform').textContent = data.platform;
            result.classList.add('show');

            // Load stats
            loadStats(data.shortCode);
        } else {
            showError(data.error || 'خطایی رخ داد. دوباره تلاش کنید.');
        }

    } catch (error) {
        console.error('Error:', error);
        showError('خطا در برقراری ارتباط با سرور');
    } finally {
        // Hide loading
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        shortenBtn.disabled = false;
    }
}

/**
 * Copy short URL to clipboard
 */
function copyToClipboard() {
    const input = document.getElementById('shortUrlInput');
    const copyBtn = document.getElementById('copyBtn');

    input.select();
    document.execCommand('copy');

    // Visual feedback
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✓ کپی شد!';
    copyBtn.classList.add('copied');

    setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.classList.remove('copied');
    }, 2000);
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    const errorMsg = document.getElementById('errorMsg');
    errorMsg.textContent = message;
    errorMsg.classList.add('show');
}

/**
 * Validate URL
 * @param {string} string - URL string to validate
 * @returns {boolean} Whether URL is valid
 */
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * Load stats for a short code
 * @param {string} shortCode - Short code to load stats for
 */
async function loadStats(shortCode) {
    try {
        const response = await fetch(`/api/stats/${shortCode}`);
        const data = await response.json();

        if (data.success) {
            document.getElementById('clicks').textContent = data.totalClicks || 0;
            document.getElementById('appOpens').textContent = calculateAppOpens(data);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

/**
 * Calculate app opens from analytics
 * @param {Object} stats - Stats data
 * @returns {number} Number of app opens
 */
function calculateAppOpens(stats) {
    // This would need to be implemented based on actual analytics tracking
    return 0;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Allow Enter key to submit
    const urlInput = document.getElementById('originalUrl');
    if (urlInput) {
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                shortenUrl();
            }
        });
    }
});
