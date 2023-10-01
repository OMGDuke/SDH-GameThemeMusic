import React from 'react'
import { definePlugin, ServerAPI, staticClasses } from 'decky-frontend-lib'

import { GiMusicalNotes } from 'react-icons/gi'

import Settings from './components/settings'
import { SettingsProvider } from './context/settingsContext'
import patchLibraryApp from './lib/patchLibraryApp'
import patchContextMenu, { LibraryContextMenu } from './lib/patchContextMenu'
import ChangeTheme from './components/changeTheme'
import { AudioLoaderCompatState, AudioLoaderCompatStateContextProvider } from './state/AudioLoaderCompatState'

export default definePlugin((serverAPI: ServerAPI) => {
  const state: AudioLoaderCompatState = new AudioLoaderCompatState();
  const libraryPatch = patchLibraryApp(serverAPI, state)

  serverAPI.routerHook.addRoute(
    '/gamethememusic/:appid',
    () =>
    <AudioLoaderCompatStateContextProvider AudioLoaderCompatStateClass={state}> 
      <ChangeTheme serverAPI={serverAPI} />,
    </AudioLoaderCompatStateContextProvider>,
    {
      exact: true
    }
  )

  const patchedMenu = patchContextMenu(LibraryContextMenu)


  const AppStateRegistrar =
  // SteamClient is something exposed by the SP tab of SteamUI, it's not a decky-frontend-lib thingy, but you can still call it normally
  // Refer to the SteamClient.d.ts or just console.log(SteamClient) to see all of it's methods
  SteamClient.GameSessions.RegisterForAppLifetimeNotifications((update: AppState) => {
      const { gamesRunning } = state.getPublicState();
      const setGamesRunning = state.setGamesRunning.bind(state);

      if (update.bRunning) {
        // Because gamesRunning is in AudioLoaderCompatState, array methods like push and splice don't work
        setGamesRunning([...gamesRunning, update.unAppID]);   
      } else {
        const filteredGames = gamesRunning.filter((e:Number) => e !== update.unAppID);
        // This happens when an app is closed
        setGamesRunning(filteredGames);
      }
    }
  );

  return {
    title: <div className={staticClasses.Title}>Game Theme Music</div>,
    icon: <GiMusicalNotes />,
    content: (
      <SettingsProvider>
        <Settings />
      </SettingsProvider>
    ),
    onDismount() {
      AppStateRegistrar.unregister();
      serverAPI.routerHook.removePatch('/library/app/:appid', libraryPatch)
      serverAPI.routerHook.removeRoute('/gamethememusic/:appid')
      patchedMenu?.unpatch()
    }
  }
})
