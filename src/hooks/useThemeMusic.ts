import { useEffect, useState } from 'react'

import { getResolver } from '../actions/audio'

import { getCache, updateCache } from '../cache/musicCache'
import { useSettings } from '../hooks/useSettings'

const useThemeMusic = (appId: number) => {
  const { settings, isLoading: settingsLoading } = useSettings()
  const [audio, setAudio] = useState<{ videoId: string; audioUrl: string }>({
    videoId: '',
    audioUrl: ''
  })
  const appDetails = appStore.GetAppOverviewByGameID(appId)
  const appName = appDetails?.display_name?.replace(/(™|®|©)/g, '')

  useEffect(() => {
    let ignore = false
    async function getData() {
      const resolver = getResolver(settings.useYtDlp)
      const cache = await getCache(appId)
      if (cache?.videoId?.length == 0) {
        return setAudio({ videoId: '', audioUrl: '' })
      } else if (cache?.videoId?.length) {
        const newAudio = await resolver.getAudioUrlFromVideo({
          id: cache.videoId
        })
        if (newAudio?.length) {
          return setAudio({ videoId: cache.videoId, audioUrl: newAudio })
        }
      } else if (settings.defaultMuted) {
        return setAudio({ videoId: '', audioUrl: '' })
      } else {
        const newAudio = await resolver.getAudio(appName as string, settings.defaultSearchKeywords)
        if (ignore) {
          return
        }
        if (!newAudio?.audioUrl?.length) {
          return setAudio({ videoId: '', audioUrl: '' })
        }
        await updateCache(appId, newAudio)
        return setAudio(newAudio)
      }
    }
    if (appName?.length && !settingsLoading) {
      getData()
    }
    return () => {
      ignore = true
    }
  }, [appName, settingsLoading])

  return {
    audio
  }
}

export default useThemeMusic
