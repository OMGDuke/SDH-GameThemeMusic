import React from 'react'
import { definePlugin, ServerAPI, staticClasses } from 'decky-frontend-lib'
import { FaMusic } from 'react-icons/fa'

import patchLibraryApp from './lib/patchLibraryApp'

export default definePlugin((serverAPI: ServerAPI) => {
  const libraryPatch = patchLibraryApp(serverAPI)
  return {
    title: <div className={staticClasses.Title}>Game Theme Music</div>,
    icon: <FaMusic />,
    onDismount() {
      serverAPI.routerHook.removePatch('/library/app/:appid', libraryPatch)
    }
  }
})
