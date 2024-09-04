import {StringEnum} from "@feathersjs/typebox";

export const PublishedFileIdentityMap = {
  linuxAarch64AppImage: 'Linux-aarch64.AppImage',
  linuxAarch64AppImageSha256: 'Linux-aarch64.AppImage-SHA256.txt',
  linuxX8664AppImage: 'Linux-x86_64.AppImage',
  linuxX8664AppImageSha256: 'Linux-x86_64.AppImage-SHA256.txt',
  macOsAppleSiliconDmg: 'macOS-apple-silicon-arm64.dmg',
  macOsAppleSiliconDmgSha256: 'macOS-apple-silicon-arm64.dmg-SHA256.txt',
  macOsIntelX8664Dmg: 'macOS-intel-x86_64.dmg',
  macOsIntelX8664DmgSha256: 'macOS-intel-x86_64.dmg-SHA256.txt',
  windowsX8664InstallerExe: 'Windows-x86_64-installer.exe',
  windowsX8664InstallerExeSha256: 'Windows-x86_64-installer.exe-SHA256.txt',
}

export const PublishedFileIdentityType = StringEnum([
  PublishedFileIdentityMap.linuxAarch64AppImage,
  PublishedFileIdentityMap.linuxAarch64AppImageSha256,
  PublishedFileIdentityMap.linuxX8664AppImage,
  PublishedFileIdentityMap.linuxX8664AppImageSha256,
  PublishedFileIdentityMap.macOsAppleSiliconDmg,
  PublishedFileIdentityMap.macOsAppleSiliconDmgSha256,
  PublishedFileIdentityMap.macOsIntelX8664Dmg,
  PublishedFileIdentityMap.macOsIntelX8664DmgSha256,
  PublishedFileIdentityMap.windowsX8664InstallerExe,
  PublishedFileIdentityMap.windowsX8664InstallerExeSha256,
])
