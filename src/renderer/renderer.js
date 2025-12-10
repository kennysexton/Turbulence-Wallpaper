document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('api-key');
    const searchTermsInput = document.getElementById('search-terms');
    const updateFrequencySelect = document.getElementById('update-frequency');
    const saveButton = document.getElementById('save-settings');

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
});
