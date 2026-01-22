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
		throw error;
	}
}
