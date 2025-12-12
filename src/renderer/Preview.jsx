import React from 'react';

function Preview({apiKey, searchTerms, currentPhoto}) {
	const appName = import.meta.env.VITE_APP_NAME; // Get appName directly from Vite env

	const unsplashReferralLink = `https://unsplash.com/?utm_source=${appName}&utm_medium=referral`;

	return (
		<div className="bg-gray-800 w-full h-full">
			{currentPhoto ? (
					<div className="w-full h-full">
						<div className="w-full h-full">
							<img
								src={currentPhoto.fullUrl}
								alt={currentPhoto.alt}
								className="absolute inset-0 w-full h-full object-cover object-center"
							/>
						</div>
						<div className="absolute bottom-2 bg-gray-300 w-full flex justify-between">
							<p className="text-gray-700"><strong>By:</strong>{' '}
								{currentPhoto.userName ? (
									<a href={currentPhoto.userProfileUrl} target="_blank" rel="noopener noreferrer"
										 className="text-blue-500 hover:underline">
										{currentPhoto.userName}
									</a>
								) : 'N/A'}
								{' '} on{' '}
								<a href={unsplashReferralLink} target="_blank" rel="noopener noreferrer"
									 className="text-blue-500 hover:underline">
									Unsplash
								</a>
							</p>
							<p className="text-gray-700"><strong>Location:</strong> {currentPhoto.locationName || 'N/A'}</p>
						</div>
					</div>
				) :
				(
					<p className="text-gray-700 text-center mb-4">No wallpaper information available. Please set your
						API key in the
						settings.</p>
				)
			}

		</div>
	)
		;
}

export default Preview;

