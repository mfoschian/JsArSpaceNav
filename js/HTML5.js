function HTML5()
{
	this.getUserMedia = function(t, onsuccess, onerror)
	{
		if (navigator.getUserMedia)
		{
			return navigator.getUserMedia(t, onsuccess, onerror);
		}
		else if (navigator.webkitGetUserMedia)
		{
			return navigator.webkitGetUserMedia(t, onsuccess, onerror);
		}
		else if (navigator.mozGetUserMedia)
		{
			return navigator.mozGetUserMedia(t, onsuccess, onerror);
		}
		else if (navigator.msGetUserMedia)
		{
			return navigator.msGetUserMedia(t, onsuccess, onerror);
		}

		onerror(new Error("No getUserMedia implementation found."));
		return null;
	};
	

	var URL = window.URL || window.webkitURL;
	this.createObjectURL = URL.createObjectURL || webkitURL.createObjectURL;
	this.revokeObjectURL = URL.revokeObjectURL || webkitURL.revokeObjectURL;
	if (! this.createObjectURL)
	{
		throw new Error("URL.createObjectURL not found.");
	}
}
