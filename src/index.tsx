import React from 'react'
import {
  definePlugin,
  Patch,
  ServerAPI,
  staticClasses
} from 'decky-frontend-lib'
import { GiMusicalNotes } from 'react-icons/gi'

import Settings from './components/settings'
import { SettingsProvider } from './context/settingsContext'
import patchLibraryApp from './lib/patchLibraryApp'
import patchContextMenu, { getMenu } from './lib/patchContextMenu'
import ChangeTheme from './components/changeTheme'

export default definePlugin((serverAPI: ServerAPI) => {
  const libraryPatch = patchLibraryApp(serverAPI)

  serverAPI.routerHook.addRoute(
    '/gamethememusic/:appid',
    () => <ChangeTheme serverAPI={serverAPI} />,
    {
      exact: true
    }
  )

  let patchedMenu: Patch | undefined
  getMenu().then((LibraryContextMenu) => {
    patchedMenu = patchContextMenu(LibraryContextMenu)
  })

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
      serverAPI.routerHook.removeRoute('/gamethememusic/:appid')
      patchedMenu?.unpatch()
    }
  }
})
