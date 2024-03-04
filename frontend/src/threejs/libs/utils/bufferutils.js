export function ArrayBufferToUtf8String (buffer)
{
	let decoder = new TextDecoder ('utf-8');
	return decoder.decode (buffer);
}
