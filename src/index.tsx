import { definePlugin, staticClasses } from '@decky/ui'
import { routerHook } from '@decky/api'

import { GiMusicalNotes } from 'react-icons/gi'

import Settings from './components/settings'
import patchLibraryApp from './lib/patchLibraryApp'
import patchContextMenu, { LibraryContextMenu } from './lib/patchContextMenu'
import ChangeTheme from './components/changeTheme'
import {
  AudioLoaderCompatState,
  AudioLoaderCompatStateContextProvider
} from './state/AudioLoaderCompatState'

import { name } from '@decky/manifest'

export default definePlugin(() => {
  const state: AudioLoaderCompatState = new AudioLoaderCompatState()
  const libraryPatch = patchLibraryApp(state)

  routerHook.addRoute(
    '/gamethememusic/:appid',
    () => (
      <AudioLoaderCompatStateContextProvider
        AudioLoaderCompatStateClass={state}
      >
        <ChangeTheme />
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
    title: <div className={staticClasses.Title}>{name}</div>,
    icon: <GiMusicalNotes />,
    content: <Settings />,
    onDismount() {
      AppStateRegistrar.unregister()
      routerHook.removePatch('/library/app/:appid', libraryPatch)
      routerHook.removeRoute('/gamethememusic/:appid')
      patchedMenu?.unpatch()
    }
  }
})
