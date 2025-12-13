import React, {useState, useEffect, useCallback} from 'react';
import SettingsPage from './SettingsPage.jsx';
import Preview from './Preview.jsx';
import {UpdateFrequency} from '../shared/enums.js';
import IconButton from "./components/IconButton";
import {ReactComponent as SettingsIcon} from './icons/settings.svg';
import {ReactComponent as FastForwardIcon} from './icons/fast-forward.svg';
import {ReactComponent as CheckIcon} from './icons/check.svg';

function App() {
	const [showSettings, setShowSettings] = useState(false);
	const [apiKey, setApiKey] = useState('');
	const [searchTerms, setSearchTerms] = useState('nature');
	const [updateFrequency, setUpdateFrequency] = useState(UpdateFrequency.DAILY);
	const [currentPhoto, setCurrentPhoto] = useState(null);
	const [hoveredActionName, setHoveredActionName] = useState(null);

	const [previewPhoto, setPreviewPhoto] = useState(null);

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
			console.log('Settings saved and wallpaper update triggered!');
		} else {
			console.error('API not available to save settings.');
		}
	}, []);

	// Function to fetch the next image for preview only
	const handleNextImagePreview = useCallback(async () => {
		if (window.api && window.api.getNextImage) {
			if (!apiKey) {
				alert('Please enter an Unsplash API Key first.');
				return;
			}
			console.log('Fetching next image for preview...');
			const newPhoto = await window.api.getNextImage({apiKey, searchTerms});
			if (newPhoto) {
				setPreviewPhoto(newPhoto); // Store in the new preview state
			}
		} else {
			console.error('API not available to fetch next image preview.');
		}
	}, [apiKey, searchTerms]);

	// Function to set wallpaper on OS and save info
	const handleSetWallpaper = useCallback(async () => {
		const photoToSet = previewPhoto || currentPhoto; // Use preview photo if available
		if (!photoToSet) {
			alert('No image to set. Please fetch an image first.');
			return;
		}
		if (window.api && window.api.setWallpaper) {
			console.log('- Applying wallpaper to OS and saving information...');
			await window.api.setWallpaper(photoToSet);
			// After setting, the previewed image becomes the current one
			setCurrentPhoto(photoToSet);
			setPreviewPhoto(null); // Clear the preview
			console.log('- Wallpaper set and info saved!');
		} else {
			console.error('API not available to set wallpaper.');
		}
	}, [currentPhoto, previewPhoto]);

	return (
		<div className="relative h-full flex flex-col">
			<Preview apiKey={apiKey} searchTerms={searchTerms} currentPhoto={previewPhoto || currentPhoto}/>

			<div className="absolute w-full top-0 p-4 flex justify-between">
				<IconButton
					icon={CheckIcon} // New Check button
					actionName="Set Wallpaper"
					onClick={handleSetWallpaper}
					onMouseEnter={() => setHoveredActionName("Set Wallpaper")}
					onMouseLeave={() => setHoveredActionName(null)}
				/>
				<IconButton
					icon={FastForwardIcon} // Next Image button
					actionName="Next Image (Preview)"
					onClick={handleNextImagePreview}
					onMouseEnter={() => setHoveredActionName("Next Image (Preview)")}
					onMouseLeave={() => setHoveredActionName(null)}
				/>
				<IconButton
					icon={SettingsIcon} // Settings button
					actionName="Open Settings"
					onClick={() => setShowSettings(true)}
					onMouseEnter={() => setHoveredActionName("Open Settings")}
					onMouseLeave={() => setHoveredActionName(null)}
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

			{
				hoveredActionName && (
					<div className="fixed inset-0 flex items-center justify-center z-100 pointer-events-none">
             <span className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
							{hoveredActionName}
             </span>
					</div>
				)
			}
		</div>
	)
		;
}

export default App;