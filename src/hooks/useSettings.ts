import { useEffect, useState } from 'react'

import { ServerAPI } from 'decky-frontend-lib'

export type Settings = {
  defaultMuted: boolean
  pipedInstance: string
  volume: number
}

export const useSettings = (serverApi: ServerAPI) => {
  const [settings, setSettings] = useState<Settings>({
    defaultMuted: false,
    pipedInstance: 'https://pipedapi.kavin.rocks',
    volume: 1
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true)
      const savedSettings = (
        await serverApi.callPluginMethod('get_setting', {
          key: 'settings',
          default: settings
        })
      ).result as Settings
      setSettings(savedSettings)
      setIsLoading(false)
    }
    getData()
  }, [])

  async function updateSettings(
    key: keyof Settings,
    value: Settings[keyof Settings]
  ) {
    setSettings((oldSettings) => {
      const newSettings = { ...oldSettings, [key]: value }
      serverApi.callPluginMethod('set_setting', {
        key: 'settings',
        value: newSettings
      })
      return newSettings
    })
  }

  function setDefaultMuted(value: Settings['defaultMuted']) {
    updateSettings('defaultMuted', value)
  }
  function setPipedInstance(value: Settings['pipedInstance']) {
    updateSettings('pipedInstance', value)
  }
  function setVolume(value: Settings['volume']) {
    updateSettings('volume', value)
  }

  return { settings, setDefaultMuted, setPipedInstance, setVolume, isLoading }
}
