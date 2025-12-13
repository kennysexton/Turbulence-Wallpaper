import React from 'react';

function Preview({ currentPhoto }) {
  const appName = import.meta.env.VITE_APP_NAME; // Get appName directly from Vite env
  const unsplashReferralLink = `https://unsplash.com/?utm_source=${appName}&utm_medium=referral`;

  const handleOpenLink = (url) => {
    if (window.api && window.api.openExternal) {
      window.api.openExternal(url);
    }
  };

	return (
		<div className=" text-slate-800 w-full h-full">
			{currentPhoto ? (
					<div className="w-full h-full">
						<div className="w-full h-full">
							<img
								src={currentPhoto.fullUrl}
								alt={currentPhoto.description || ''}
								className="absolute inset-0 w-full h-full object-cover object-center"
							/>
						</div>
						<div className="absolute bottom-0 backdrop-blur-md bg-white/40 py-2 px-4 w-full flex flex-col sm:flex-row justify-between ">
							<p className=""><strong>By:</strong>{' '}
								{currentPhoto.userName ? (
									<a
                    onClick={() => handleOpenLink(currentPhoto.userProfileUrl)}
                    className="hover:underline cursor-pointer"
                  >
										{currentPhoto.userName}
									</a>
								) : ''}
								{' '} on{' '}
								<a
                  onClick={() => handleOpenLink(unsplashReferralLink)}
                  className="hover:underline cursor-pointer"
                >
									Unsplash
								</a>
							</p>
							{currentPhoto && currentPhoto.locationName && (
								<p className=""><strong>Location:</strong> {currentPhoto.locationName}</p>
							)}
						</div>
					</div>
				) :
				(
					<p className="text-center mb-4">No wallpaper information available. Please set your
						API key in the
						settings.</p>
				)
			}

		</div>
	)
		;
}

export default Preview;
