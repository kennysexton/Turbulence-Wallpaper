const BASE_URL = 'https://api.unsplash.com';

export async function getCollections(username, apiKey) {
	if (!username) {
		throw new Error('Username is required to fetch collections.');
	}

	const url = new URL(`${BASE_URL}/users/${username}/collections`);
	const headers = {
		'Authorization': `Client-ID ${apiKey}`,
		'Content-Type': 'application/json',
	};

	try {
		const response = await fetch(url, { headers });
		if (!response.ok) {
			throw new Error(`Error fetching collections: ${response.statusText}`);
		}
		return await response.json();
	} catch (error) {
		console.error('Failed to fetch collections:', error);
		throw new Error('Could not connect to Unsplash. Please check your internet connection.');
	}
}

export async function getRandomPhoto(apiKey, { searchTerms, collectionId }) {
	const url = new URL(`${BASE_URL}/photos/random`);

	if (collectionId) {
		url.searchParams.append('collections', collectionId);
	} else if (searchTerms) {
		url.searchParams.append('query', searchTerms);
	}

	url.searchParams.append('orientation', 'landscape');

	const headers = {
		'Authorization': `Client-ID ${apiKey}`,
		'Content-Type': 'application/json',
	};

	try {
		const response = await fetch(url.toString(), { headers });
		if (!response.ok) {
			throw new Error(`Unsplash API error: ${response.statusText}`);
		}
		return await response.json();
	} catch (error) {
		console.error('Failed to fetch random photo:', error);
		throw new Error('Could not connect to Unsplash. Please check your internet connection.');
	}
}
