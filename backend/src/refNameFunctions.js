// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// refname library

// make sure all systems use the same algo. See:
//    backend/src/refNameFunctions.js
//    frontend/src/refNameFunctions.js

const forbiddenNames = [
  'user',
  'org',
  'group',
  'groups',
  'workspace',
  'workspaces',
  'dir',
  'file',
  'share',
  'shares',
  'create',
  'settings',
];

export function conformRefName(inputName) {
  // This function takes any string and creates a conforming name.
  // It is designed to Never throw an error; but instead makes a best attempt.
  // While the returned string will never be more than 20 characters, it has no minimum length. So, empty strings are
  // possible.
  //
  // algo:
  //   1. letters and digits are kept
  //   2. some punctuation is turned into underscores
  //   3. all other characters are ignored
  //   3. double underscores forbidden
  //   4. leading and trailing underscores forbidden
  //   5. the character sequences 'admin' and 'ondsel' are not permitted
  //   6. max of 20 characters
  //   7. simple names used in URL segments such as "file" and "org" and "dir" are not permitted and are appended
  let result = "";
  let justSawUnderscore = true; // initialize true to prevent leading underscores
  for (const ch of inputName) {
    if ([' ', '+', '_', '-', '\'', '`', '@', '#', '$', '%', ].includes(ch)) {
      if (justSawUnderscore === false) {
        result += '_'
        justSawUnderscore = true;
      }
    } else if (ch.match(/[a-z0-9]/i)) {
      result += ch;
      justSawUnderscore = false;
    } else {
      // ignore all else and leave 'justSawUnderscore' alone
    }
  }
  // remove the forbidden 'admin' and 'ondsel' character sequences
  result = result.replace(/admin/i, '');
  result = result.replace(/ondsel/i, '');
  // trim
  result = result.replace(/_+$/,''); // remove trailing slashes
  result = result.substring(0, 20);                        // trim to 20 chars
  result = result.replace(/_+$/,''); // remove trailing again because trim might end with an underscore
  // if forbidden simple word is discovered, append it with a "1"
  if (forbiddenNames.includes(result)) {
    result = result + "1";
  }
  return result;
}

// the following two parts are from https://stackoverflow.com/questions/18638900/javascript-crc32
const makeCRCTable = function(){
  let c;
  let crcTable = [];
  for(let n =0; n < 256; n++){
    c = n;
    for(let k =0; k < 8; k++){
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    crcTable[n] = c;
  }
  return crcTable;
}

const crcTable = makeCRCTable();

export const crc32 = function(str) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < str.length; i++ ) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
};

export function refNameHasher(username) {
  // simple 32-bit int CRC hash based on a "normalized" refname
  // we make lower case so that "Bob" and "bob" match.
  // we remove underscores so that "BobSmith" and "Bob_Smith" match.
  const loweredUsername = username.toLowerCase();
  const keyUsername = loweredUsername.replaceAll(/_/g, '');
  const result = crc32(keyUsername);
  return result;
}
