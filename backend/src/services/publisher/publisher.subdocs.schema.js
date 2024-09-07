import {StringEnum} from "@feathersjs/typebox";

// https://github.com/Ondsel-Development/FreeCAD/releases/download/2024.2.2/Ondsel_ES-2024.2.2.37240-Windows-x86_64-installer.exe
// https://github.com/Ondsel-Development/FreeCAD/releases/download/weekly-builds/Ondsel_ES_weekly-builds-38472-Windows-x86_64.7z


export const PublishedFileTargetMap = {
  linuxX8664App: 'Linux-x86_64.AppImage',
  linuxX8664AppSha: 'Linux-x86_64.AppImage-SHA256.txt',
  linuxAarch64App: 'Linux-aarch64.AppImage',
  linuxAarch64AppSha: 'Linux-aarch64.AppImage-SHA256.txt',
  macMApp: 'macOS-apple-silicon-arm64.dmg',
  macMAppSha: 'macOS-apple-silicon-arm64.dmg-SHA256.txt',
  macIntelApp: 'macOS-intel-x86_64.dmg',
  macIntelAppSha: 'macOS-intel-x86_64.dmg-SHA256.txt',
  winX8664Installer: 'Windows-x86_64-installer.exe',
  winX8664InstallerSha: 'Windows-x86_64-installer.exe-SHA256.txt',
  winX8664ArchivedApp: 'Windows-x86_64.7z',
}

export const PublishedFileTargetType = StringEnum([
  PublishedFileTargetMap.linuxX8664App,
  PublishedFileTargetMap.linuxX8664AppSha,
  PublishedFileTargetMap.linuxAarch64App,
  PublishedFileTargetMap.linuxAarch64AppSha,
  PublishedFileTargetMap.macMApp,
  PublishedFileTargetMap.macMAppSha,
  PublishedFileTargetMap.macIntelApp,
  PublishedFileTargetMap.macIntelAppSha,
  PublishedFileTargetMap.winX8664Installer,
  PublishedFileTargetMap.winX8664InstallerSha,
  PublishedFileTargetMap.winX8664ArchivedApp,
])

export const PublishedReleaseCadenceMap = {
  weekly: 'weekly-builds',
  stable: 'stable',
}

export const PublishedReleaseCadenceType = StringEnum([
  PublishedReleaseCadenceMap.weekly,
  PublishedReleaseCadenceMap.stable,
])