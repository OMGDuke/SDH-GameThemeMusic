import * as React from 'react'

const LOCAL_STORAGE_KEY = 'game-theme-music-settings'
type State = {
  volume: number
  defaultMuted: boolean
}

type Action =
  | { type: 'set-volume'; value: State['volume'] }
  | { type: 'set-default-muted'; value: State['defaultMuted'] }
  | { type: 'load-settings'; value: State }
type Dispatch = (action: Action) => void

type SettingsProviderProps = { children: React.ReactNode }

const SettingsStateContext = React.createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined)

const defaultSettings = {
  volume: 1,
  defaultMuted: false
} as const

function settingsReducer(state: State, action: Action) {
  switch (action.type) {
    case 'set-volume': {
      const newState = { ...state, volume: action.value }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState))
      return newState
    }
    case 'set-default-muted': {
      const newState = { ...state, defaultMuted: action.value }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState))
      return newState
    }
    case 'load-settings': {
      return action.value
    }
  }
}

export function getInitialState() {
  const settingsString = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (!settingsString) {
    return defaultSettings
  }
  const storedSettings = JSON.parse(settingsString)
  return {
    volume: storedSettings?.volume || defaultSettings.volume,
    defaultMuted: storedSettings?.defaultMuted || defaultSettings.defaultMuted
  }
}

function SettingsProvider({ children }: SettingsProviderProps) {
  const [state, dispatch] = React.useReducer(settingsReducer, getInitialState())
  const value = { state, dispatch }
  return (
    <SettingsStateContext.Provider value={value}>
      {children}
    </SettingsStateContext.Provider>
  )
}

function useSettings() {
  const context = React.useContext(SettingsStateContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

export { SettingsProvider, useSettings }
