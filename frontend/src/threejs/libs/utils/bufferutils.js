// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export function ArrayBufferToUtf8String (buffer)
{
	let decoder = new TextDecoder ('utf-8');
	return decoder.decode (buffer);
}
