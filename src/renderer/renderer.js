document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('api-key');
    const searchTermsInput = document.getElementById('search-terms');
    const updateFrequencySelect = document.getElementById('update-frequency');
    const saveButton = document.getElementById('save-settings');
    const nextImageButton = document.getElementById('next-wallpaper'); // New button reference

    // Listen for initial settings from the main process
    if (window.api && window.api.on) {
        window.api.on('load-settings', (settings) => {
            if (settings.apiKey) {
                apiKeyInput.value = settings.apiKey;
            }
            if (settings.searchTerms) {
                searchTermsInput.value = settings.searchTerms;
            }
            if (settings.updateFrequency) {
                updateFrequencySelect.value = settings.updateFrequency;
            }
        });
    }

    saveButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value;
        const searchTerms = searchTermsInput.value;
        const updateFrequency = updateFrequencySelect.value;

        // Send settings to the main process
        if (window.api && window.api.saveSettings) {
            window.api.saveSettings({ apiKey, searchTerms, updateFrequency });
            alert('Settings saved and wallpaper update triggered!');
        } else {
            console.error('API not available to save settings.');
        }
    });

    // Event listener for the "Next Image" button
    if (nextImageButton) {
        nextImageButton.addEventListener('click', () => {
            const apiKey = apiKeyInput.value;
            const searchTerms = searchTermsInput.value;
            if (window.api && window.api.nextWallpaper) {
                if (!apiKey) {
                    alert('Please enter an Unsplash API Key first.');
                    return;
                }
                window.api.nextWallpaper({ apiKey, searchTerms });
                alert('Fetching next image...');
            } else {
                console.error('API not available to fetch next wallpaper.');
            }
        });
    }
});
