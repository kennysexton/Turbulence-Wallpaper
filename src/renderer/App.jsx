import React, {useState, useEffect, useCallback} from 'react';
import SettingsPage from './SettingsPage.jsx';
import Preview from './Preview.jsx';
import {UpdateFrequency} from '../shared/enums.js';
import Options from "./components/Options";
import TitleBar from "./components/TitleBar";

import {getRandomPhoto} from './Unsplash.js';
import {ReactComponent as Dots} from "./icons/loading-dots.svg";

function App() {
	const [showSettings, setShowSettings] = useState(false);
	const [apiKey, setApiKey] = useState('');
	const [searchTerms, setSearchTerms] = useState('nature');
	const [collectionId, setCollectionId] = useState('');
	const [updateFrequency, setUpdateFrequency] = useState(UpdateFrequency.DAILY);
	const [unsplashUsername, setUnsplashUsername] = useState('');
	const [currentPhoto, setCurrentPhoto] = useState(null);
	const [hoveredActionName, setHoveredActionName] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const [previewPhoto, setPreviewPhoto] = useState(null);

	const fetchAndSetWallpaper = useCallback(async () => {
		if (!apiKey) {
			console.warn('API Key is missing. Skipping wallpaper update.');
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const imageData = await getRandomPhoto(apiKey, {searchTerms, collectionId});
			const newPhoto = {
				id: imageData.id,
				fullUrl: imageData.urls.full,
				locationName: imageData.location?.name,
				userName: imageData.user?.name,
				userProfileUrl: imageData.user?.links?.html,
				description: imageData.description,
				htmlLink: imageData.links.html,
			};
			await window.api.setWallpaper(newPhoto);
			setCurrentPhoto(newPhoto);
			setPreviewPhoto(null);
		} catch (error) {
			console.error('Error fetching and setting wallpaper:', error);
			setError(error.message);
		} finally {
			setLoading(false);
		}
	}, [apiKey, searchTerms, collectionId]);

	// Load initial settings and current photo from main process
	useEffect(() => {
		if (window.api && window.api.on) {
			const unsubscribeSettings = window.api.on('load-settings', (settings) => {
				setApiKey(settings.apiKey || '');
				setSearchTerms(settings.searchTerms || 'nature');
				setCollectionId(settings.collectionId || '');
				setUpdateFrequency(settings.updateFrequency || UpdateFrequency.DAILY);
				setUnsplashUsername(settings.unsplashUsername || '');
			});
			const unsubscribePhoto = window.api.on('load-current-photo', (photo) => {
				setCurrentPhoto(photo);
				setPreviewPhoto(null);
			});
			const unsubscribeLoadingStart = window.api.on('loading-start', () => {
				setLoading(true);
			});
			const unsubscribeLoadingEnd = window.api.on('loading-end', () => {
				setLoading(false);
			});
			const unsubscribeTriggerWallpaperUpdate = window.api.on('trigger-wallpaper-update', fetchAndSetWallpaper);
			// Cleanup listeners on component unmount
			return () => {
				unsubscribeSettings();
				unsubscribePhoto();
				unsubscribeLoadingStart();
				unsubscribeLoadingEnd();
				unsubscribeTriggerWallpaperUpdate();
			};
		}
	}, [fetchAndSetWallpaper]);

	// Function to save settings, passed to SettingsPage
	const handleSaveSettings = useCallback((newSettings) => {
		setApiKey(newSettings.apiKey);
		setSearchTerms(newSettings.searchTerms);
		setCollectionId(newSettings.collectionId);
		setUpdateFrequency(newSettings.updateFrequency);
		setUnsplashUsername(newSettings.unsplashUsername);
		if (window.api && window.api.saveSettings) {
			window.api.saveSettings(newSettings);
			console.log('Settings saved and wallpaper update triggered!');
		} else {
			console.error('API not available to save settings.');
		}
	}, []);

	// Function to fetch the next image for preview only
	const handleNextImagePreview = useCallback(async () => {
		if (!apiKey) {
			alert('Please enter an Unsplash API Key first.');
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const imageData = await getRandomPhoto(apiKey, {searchTerms, collectionId});
			const newPhoto = {
				id: imageData.id,
				fullUrl: imageData.urls.full,
				locationName: imageData.location?.name,
				userName: imageData.user?.name,
				userProfileUrl: imageData.user?.links?.html,
				description: imageData.description,
				htmlLink: imageData.links.html,
			};
			setPreviewPhoto(newPhoto);
			setCurrentPhoto(null);
		} catch (error) {
			console.error('Error fetching next image preview:', error);
			setError(error.message);
		} finally {
			setLoading(false);
		}
	}, [apiKey, searchTerms, collectionId]);

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

	const showSetWallpaper = previewPhoto && (!currentPhoto || previewPhoto.id !== currentPhoto.id);

	return (
		<div className="h-full flex flex-col">
			<TitleBar showSettings={showSettings} />
			<main className="relative grow">
				{loading && (
					<div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
						<Dots className="w-10 h-10 text-white animate-pulse" />
					</div>
				)}
				<Preview apiKey={apiKey} searchTerms={searchTerms} currentPhoto={previewPhoto || currentPhoto} error={error}/>

				<Options
					onSetWallpaper={handleSetWallpaper}
					onNextImage={handleNextImagePreview}
					onShowSettings={() => setShowSettings(true)}
					onHoverAction={setHoveredActionName}
					showSetWallpaper={showSetWallpaper}
				/>
			</main>

			{
				showSettings && (
					<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
						<SettingsPage
							apiKey={apiKey}
							setApiKey={setApiKey}
							searchTerms={searchTerms}
							setSearchTerms={setSearchTerms}
							collectionId={collectionId}
							setCollectionId={setCollectionId}
							updateFrequency={updateFrequency}
							setUpdateFrequency={setUpdateFrequency}
							unsplashUsername={unsplashUsername}
							setUnsplashUsername={setUnsplashUsername}
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
	);
}

export default App;