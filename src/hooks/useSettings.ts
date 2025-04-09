import { call } from '@decky/api'
import { useEffect, useState } from 'react'

export type Settings = {
  defaultMuted: boolean
  useYtDlp: boolean
  downloadAudio: boolean
  invidiousInstance: string
  volume: number
  defaultSearchQuery: string
}

export const defaultSettings = {
  defaultMuted: false,
  useYtDlp: false,
  downloadAudio: false,
  invidiousInstance: 'https://inv.tux.pizza',
  volume: 1,
  defaultSearchQuery: "Theme Music"
}

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true)
      const savedSettings = await call<[string, Settings], Settings>(
        'get_setting',
        'settings',
        settings
      )
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
      call<[string, Settings], Settings>(
        'set_setting',
        'settings',
        newSettings
      ).catch(console.error)
      return newSettings
    })
  }

  function setDefaultMuted(value: Settings['defaultMuted']) {
    updateSettings('defaultMuted', value)
  }
  function setUseYtDlp(value: Settings['useYtDlp']) {
    updateSettings('useYtDlp', value)
    // Currently, downloads don't work with Invidious, so they can only be enabled iff yt-dlp is enabled.
    updateSettings('downloadAudio', value)
  }
  function setDownloadAudio(value: Settings['downloadAudio']) {
    updateSettings('downloadAudio', value)
  }
  function setInvidiousInstance(value: Settings['invidiousInstance']) {
    updateSettings('invidiousInstance', value)
  }
  function setVolume(value: Settings['volume']) {
    updateSettings('volume', value)
  }
  function setDefaultSearchQuery(value: Settings['defaultSearchQuery']) {
    updateSettings('defaultSearchQuery', value)
  }

  return {
    settings,
    setDefaultMuted,
    setUseYtDlp,
    setDownloadAudio,
    setInvidiousInstance,
    setVolume,
    setDefaultSearchQuery,
    isLoading
  }
}
