import React from 'react'
import { definePlugin, ServerAPI, staticClasses } from 'decky-frontend-lib'

import { GiMusicalNotes } from 'react-icons/gi'

import Settings from './components/settings'
import patchLibraryApp from './lib/patchLibraryApp'
import patchContextMenu, { LibraryContextMenu } from './lib/patchContextMenu'
import ChangeTheme from './components/changeTheme'
import {
  AudioLoaderCompatState,
  AudioLoaderCompatStateContextProvider
} from './state/AudioLoaderCompatState'

export default definePlugin((serverAPI: ServerAPI) => {
  const state: AudioLoaderCompatState = new AudioLoaderCompatState()
  const libraryPatch = patchLibraryApp(serverAPI, state)

  serverAPI.routerHook.addRoute(
    '/gamethememusic/:appid',
    () => (
      <AudioLoaderCompatStateContextProvider
        AudioLoaderCompatStateClass={state}
      >
        <ChangeTheme serverAPI={serverAPI} />
      </AudioLoaderCompatStateContextProvider>
    ),
    {
      exact: true
    }
  )

  const patchedMenu = patchContextMenu(LibraryContextMenu)

  const AppStateRegistrar =
    SteamClient.GameSessions.RegisterForAppLifetimeNotifications(
      (update: AppState) => {
        const { gamesRunning } = state.getPublicState()
        const setGamesRunning = state.setGamesRunning.bind(state)

        if (update.bRunning) {
          setGamesRunning([...gamesRunning, update.unAppID])
        } else {
          const filteredGames = gamesRunning.filter(
            (e: number) => e !== update.unAppID
          )
          setGamesRunning(filteredGames)
        }
      }
    )

  return {
    title: <div className={staticClasses.Title}>Game Theme Music</div>,
    icon: <GiMusicalNotes />,
    content: <Settings serverAPI={serverAPI} />,
    onDismount() {
      AppStateRegistrar.unregister()
      serverAPI.routerHook.removePatch('/library/app/:appid', libraryPatch)
      serverAPI.routerHook.removeRoute('/gamethememusic/:appid')
      patchedMenu?.unpatch()
    }
  }
})
