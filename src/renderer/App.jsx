import React, {useState, useEffect, useCallback} from 'react';
import SettingsPage from './SettingsPage.jsx';
import Preview from './Preview.jsx';
import {UpdateFrequency} from '../shared/enums.js';
import IconButton from "./components/IconButton";
import {ReactComponent as SettingsIcon} from './icons/settings.svg';
import {ReactComponent as FastForwardIcon} from './icons/fast-forward.svg';

function App() {
	const [showSettings, setShowSettings] = useState(false);
	const [apiKey, setApiKey] = useState('');
	const [searchTerms, setSearchTerms] = useState('nature');
	const [updateFrequency, setUpdateFrequency] = useState(UpdateFrequency.DAILY);
	const [currentPhoto, setCurrentPhoto] = useState(null); // New state for current photo data

	// Load initial settings and current photo from main process
	useEffect(() => {
		if (window.api && window.api.on) {
			const unsubscribeSettings = window.api.on('load-settings', (settings) => {
				setApiKey(settings.apiKey || '');
				setSearchTerms(settings.searchTerms || 'nature');
				setUpdateFrequency(settings.updateFrequency || UpdateFrequency.DAILY);
			});
			const unsubscribePhoto = window.api.on('load-current-photo', (photo) => {
				setCurrentPhoto(photo);
			});
			// Cleanup listeners on component unmount
			return () => {
				unsubscribeSettings();
				unsubscribePhoto();
			};
		}
	}, []);

	// Function to save settings, passed to SettingsPage
	const handleSaveSettings = useCallback((newSettings) => {
		setApiKey(newSettings.apiKey);
		setSearchTerms(newSettings.searchTerms);
		setUpdateFrequency(newSettings.updateFrequency);
		if (window.api && window.api.saveSettings) {
			window.api.saveSettings(newSettings);
			alert('Settings saved and wallpaper update triggered!');
		} else {
			console.error('API not available to save settings.');
		}
	}, []);

	// Function to trigger next wallpaper, moved from Preview.jsx
	const handleNextWallpaper = useCallback(() => {
		if (window.api && window.api.nextWallpaper) {
			if (!apiKey) {
				alert('Please enter an Unsplash API Key first.');
				return;
			}
			window.api.nextWallpaper({apiKey, searchTerms});
			alert('Fetching next image...');
		} else {
			console.error('API not available to fetch next wallpaper.');
		}
	}, [apiKey, searchTerms]);


	return (
		<div className="relative h-full flex flex-col">
			<Preview apiKey={apiKey} searchTerms={searchTerms} currentPhoto={currentPhoto}/>

			<div className="absolute w-full top-0 p-4 flex justify-between">
				<IconButton
					icon={SettingsIcon}
					actionName="Open Settings"
					onClick={() => setShowSettings(true)}
				/>
				<IconButton
					icon={FastForwardIcon}
					actionName="Next Image"
					onClick={handleNextWallpaper}
				/>
			</div>

			{
				showSettings && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<SettingsPage
							apiKey={apiKey}
							setApiKey={setApiKey}
							searchTerms={searchTerms}
							setSearchTerms={setSearchTerms}
							updateFrequency={updateFrequency}
							setUpdateFrequency={setUpdateFrequency}
							onSave={handleSaveSettings}
							onClose={() => setShowSettings(false)}
						/>
					</div>
				)
			}
		</div>
	)
		;
}

export default App;