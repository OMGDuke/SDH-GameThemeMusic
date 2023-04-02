import React from 'react'
import { definePlugin, ServerAPI, staticClasses } from 'decky-frontend-lib'
import { GiMusicalNotes } from 'react-icons/gi'

import Settings from './components/settings'
import { SettingsProvider } from './context/settingsContext'
import patchLibraryApp from './lib/patchLibraryApp'

export default definePlugin((serverAPI: ServerAPI) => {
  const libraryPatch = patchLibraryApp(serverAPI)
  return {
    title: <div className={staticClasses.Title}>Game Theme Music</div>,
    icon: <GiMusicalNotes />,
    content: (
      <SettingsProvider>
        <Settings />
      </SettingsProvider>
    ),
    onDismount() {
      serverAPI.routerHook.removePatch('/library/app/:appid', libraryPatch)
    }
  }
})
