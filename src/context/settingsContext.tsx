import * as React from 'react'

const LOCAL_STORAGE_KEY = 'game-theme-music-settings'
type State = {
  volume: number
}

type Action =
  | { type: 'set-volume'; value: State['volume'] }
  | { type: 'load-settings'; value: State }
type Dispatch = (action: Action) => void

type SettingsProviderProps = { children: React.ReactNode }

const SettingsStateContext = React.createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined)

const defaultSettings = {
  volume: 1
} as const

function settingsReducer(state: State, action: Action) {
  switch (action.type) {
    case 'set-volume': {
      const newState = { ...state, volume: action.value }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState))
      return newState
    }
    case 'load-settings': {
      return action.value
    }
  }
}

function SettingsProvider({ children }: SettingsProviderProps) {
  const [state, dispatch] = React.useReducer(settingsReducer, defaultSettings)
  React.useEffect(() => {
    async function getSettings() {
      const settingsString = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (!settingsString) {
        dispatch({
          type: 'load-settings',
          value: defaultSettings
        })
        return
      }
      const storedSettings = JSON.parse(settingsString)
      dispatch({
        type: 'load-settings',
        value: {
          volume: storedSettings?.volume || defaultSettings.volume
        }
      })
    }
    getSettings()
  }, [])
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
