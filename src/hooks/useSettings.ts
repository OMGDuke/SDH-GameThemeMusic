import { call } from '@decky/api'
import { useEffect, useState } from 'react'

export type Settings = {
  defaultMuted: boolean
  pipedInstance: string
  volume: number
}

export const defaultSettings = {
  defaultMuted: false,
  pipedInstance: 'https://pipedapi.kavin.rocks',
  volume: 1
}

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true)
      const savedSettings = await call<[string, Settings], Settings>('get_setting', 'settings', settings)
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
      call<[string, Settings], Settings>('set_setting', 'settings', newSettings).catch(console.error)
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
