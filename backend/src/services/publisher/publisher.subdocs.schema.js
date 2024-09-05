import {StringEnum} from "@feathersjs/typebox";

// https://github.com/Ondsel-Development/FreeCAD/releases/download/2024.2.2/Ondsel_ES-2024.2.2.37240-Windows-x86_64-installer.exe
// https://github.com/Ondsel-Development/FreeCAD/releases/download/weekly-builds/Ondsel_ES_weekly-builds-38472-Windows-x86_64.7z

export const PublishedFileNatureMap = {
  linuxX8664App: "linux_x86_64_app",
  linuxAarch64App: "linux_aarch64_app",
  macMApp: "mac_m_app",
  macIntelApp: "mac_intel_app",
  winX8664Installer: "win_x86_64_installer",
  winX8664ArchivedApp: "win_x86_64_archived_app",
}

export const PublishedFileNatureType = StringEnum([
  PublishedFileNatureMap.linuxX8664App,
  PublishedFileNatureMap.linuxAarch64App,
  PublishedFileNatureMap.macMApp,
  PublishedFileNatureMap.macIntelApp,
  PublishedFileNatureMap.winX8664Installer,
  PublishedFileNatureMap.winX8664ArchivedApp,
])

export const PublishedReleaseCadenceMap = {
  weekly: 'weekly-builds',
  stable: 'stable',
}

export const PublishedReleaseCadenceType = StringEnum([
  PublishedReleaseCadenceMap.weekly,
  PublishedReleaseCadenceMap.stable,
])