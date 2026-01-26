import React, {useEffect, useState} from 'react';
import {UpdateFrequency} from '../shared/enums.js';
import {ReactComponent as Close} from './icons/close.svg';
import {getCollections} from './Unsplash.js';
import {useDebounce} from './hooks/useDebounce.js';

const SETTINGS_PAGES = ['Frequency', 'Collection', 'API'];

function SettingsPage({
		apiKey, setApiKey,
		searchTerms, setSearchTerms,
		collectionId, setCollectionId,
		updateFrequency, setUpdateFrequency,
		unsplashUsername, setUnsplashUsername,
		onSave, onClose
	}) {

	// Set the initial page based on whether an API key exists.
	const [activePage, setActivePage] = useState(() => {
		if (!apiKey) return 'API';
		return 'Frequency';
	});
	const [searchType, setSearchType] = useState(collectionId ? 'collection' : 'query');
	const [collections, setCollections] = useState([]);
	const [collectionsLoading, setCollectionsLoading] = useState(false);
	const [collectionsError, setCollectionsError] = useState(null);
	const [noCollectionsFound, setNoCollectionsFound] = useState(false);

	const debouncedApiKey = useDebounce(apiKey, 500);
	const debouncedSearchTerms = useDebounce(searchTerms, 500);
	const debouncedCollectionId = useDebounce(collectionId, 500);
	const debouncedUpdateFrequency = useDebounce(updateFrequency, 500);
	const debouncedUnsplashUsername = useDebounce(unsplashUsername, 500);

	useEffect(() => {
		const settings = {
			apiKey: debouncedApiKey,
			searchTerms: searchType === 'query' ? debouncedSearchTerms : '',
			collectionId: searchType === 'collection' ? debouncedCollectionId : '',
			updateFrequency: debouncedUpdateFrequency,
			unsplashUsername: debouncedUnsplashUsername,
		};
		onSave(settings);
	}, [debouncedApiKey, debouncedSearchTerms, debouncedCollectionId, debouncedUpdateFrequency, debouncedUnsplashUsername, onSave, searchType]);

	useEffect(() => {
		if (searchType === 'collection') {
			setSearchTerms('');
		} else {
			setCollectionId('');
		}
	}, [searchType, setSearchTerms, setCollectionId]);

	const fetchCollections = async () => {
		if (!unsplashUsername) {
			alert('Please enter an Unsplash username first.');
			return;
		}
		setCollectionsLoading(true);
		setCollectionsError(null);
		setNoCollectionsFound(false);
		try {
			const fetchedCollections = await getCollections(unsplashUsername, apiKey);
			if (fetchedCollections.length === 0) {
				setNoCollectionsFound(true);
			}
			setCollections(fetchedCollections);
		} catch (error) {
			setCollectionsError(error.message);
		} finally {
			setCollectionsLoading(false);
		}
	}

	const renderActivePage = () => {
		switch (activePage) {
			case 'Frequency':
				return (
					<div className="mb-6">
						<label htmlFor="update-frequency" className="block text-gray-700 text-sm font-bold mb-2">Update
							Frequency:</label>
						<select
							id="update-frequency"
							name="update-frequency"
							value={updateFrequency}
							onChange={(e) => setUpdateFrequency(e.target.value)}
							className="shadow-sm border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-hidden focus:shadow-outline"
						>
							{Object.entries(UpdateFrequency).map(([key, value]) => (
								<option key={key} value={value}>{key.charAt(0) + key.slice(1).toLowerCase()}</option>
							))}
						</select>
					</div>
				);
			case 'Collection':
				return (
					<>
						<div className="flex items-center justify-center mb-4">
							<span className="mr-3 text-sm font-medium text-gray-900">Query</span>
							<label className="relative inline-flex items-center cursor-pointer">
								<input
									type="checkbox"
									className="sr-only peer"
									checked={searchType === 'collection'}
									onChange={() => setSearchType(searchType === 'query' ? 'collection' : 'query')}
								/>
								<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-600"></div>
							</label>
							<span className="ml-3 text-sm font-medium text-gray-900">Collection</span>
						</div>
						{searchType === 'query' ? (
							<div className="mb-4">
								<label htmlFor="search-terms" className="block text-gray-700 text-sm font-bold mb-2">Search Terms:</label>
								<input
									type="text"
									id="search-terms"
									name="search-terms"
									value={searchTerms}
									onChange={(e) => setSearchTerms(e.target.value)}
									className="shadow-sm appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-hidden focus:shadow-outline"
									placeholder="e.g., nature, city, abstract"
								/>
							</div>
						) : (
							<div className="mb-4">
								<label htmlFor="unsplash-username" className="block text-gray-700 text-sm font-bold mb-2">Unsplash Username:</label>
								<input
									type="text"
									id="unsplash-username"
									name="unsplash-username"
									value={unsplashUsername}
									onChange={(e) => setUnsplashUsername(e.target.value)}
									className="shadow-sm appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-hidden focus:shadow-outline mb-4"
									placeholder="Your Unsplash Username"
								/>
								<button
									onClick={fetchCollections}
									className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-1.5 px-3 rounded-sm focus:outline-hidden focus:shadow-outline mb-4 text-sm"
									disabled={collectionsLoading}
								>
									{collectionsLoading ? 'Fetching...' : 'Fetch Collections'}
								</button>
								{collectionsError && <p className="text-red-500 text-xs italic">{collectionsError}</p>}
								{noCollectionsFound && <p className="text-yellow-500 text-xs italic">No public collections found for this user.</p>}
								<label htmlFor="collection-id" className="block text-gray-700 text-sm font-bold mb-2">
									Collection ID:
								</label>
								<select
									id="collection-id"
									name="collection-id"
									value={collectionId}
									onChange={(e) => setCollectionId(e.target.value)}
									className="shadow-sm border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-hidden focus:shadow-outline"
								>
									<option value="">Select a collection</option>
									{collections.map((collection) => (
										<option key={collection.id} value={collection.id}>{collection.title}</option>
									))}
								</select>
							</div>
						)}
					</>
				);
			case 'API':
				return (
					<div className="mb-4">
						<label htmlFor="api-key" className="block text-gray-700 text-sm font-bold mb-2">Unsplash Access Key:</label>
						<input
							type="text"
							id="api-key"
							name="api-key"
							value={apiKey}
							onChange={(e) => setApiKey(e.target.value)}
							className="shadow-sm appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-hidden focus:shadow-outline"
							placeholder="Your Unsplash Access Key"
						/>
					</div>
				);
			default:
				return null;
		}
	}

	return (
		<div className="bg-white p-10 rounded-lg shadow-xl w-full max-w-lg mx-auto relative">
			{onClose && (
				<button
					onClick={onClose}
					className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center cursor-pointer z-10"
				>
					<Close className="w-5 h-5"/>
				</button>
			)}

			{/* Page Navigation */}
			<div className="mb-8 border-b border-gray-200">
				<nav className="-mb-px flex space-x-2" aria-label="Tabs">
					{SETTINGS_PAGES.map((page) => (
						<button
							key={page}
							onClick={() => setActivePage(page)}
							className={`whitespace-nowrap pb-3 px-3 border-b-2 font-medium text-sm ${
								activePage === page
									? 'border-slate-800 text-slate-900'
									: 'border-transparent text-gray-500 hover:text-slate-800 hover:border-gray-300'
							}`}
						>
							{page}
						</button>
					))}
				</nav>
			</div>

			{/* Page Content */}
			<div className="min-h-[160px]">
				{renderActivePage()}
			</div>
		</div>
	);
}

export default SettingsPage;
