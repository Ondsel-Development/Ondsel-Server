export function GetFileName (filePath)
{
	let fileName = filePath;

	let firstParamIndex = fileName.indexOf ('?');
	if (firstParamIndex !== -1) {
		fileName = fileName.substring (0, firstParamIndex);
	}

	let firstSeparator = fileName.lastIndexOf ('/');
	if (firstSeparator === -1) {
		firstSeparator = fileName.lastIndexOf ('\\');
	}
	if (firstSeparator !== -1) {
		fileName = fileName.substring (firstSeparator + 1);
	}

	return decodeURI (fileName);
}

export function GetFileExtension (filePath)
{
	let fileName = GetFileName (filePath);
	let firstPoint = fileName.lastIndexOf ('.');
	if (firstPoint === -1) {
		return '';
	}
	let extension = fileName.substring (firstPoint + 1);
	return extension.toLowerCase ();
}
