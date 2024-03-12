import { ServerAPI } from 'decky-frontend-lib'
import { useEffect, useState } from 'react'

import { getAudio, getAudioUrlFromVideoId } from '../actions/audio'

import { getCache, updateCache } from '../cache/musicCache'
import { useSettings } from '../context/settingsContext'

const useThemeMusic = (serverAPI: ServerAPI, appId: number) => {
  const { state: settingsState } = useSettings()
  const [audio, setAudio] = useState<{ videoId: string; audioUrl: string }>({
    videoId: '',
    audioUrl: ''
  })
  const appDetails = appStore.GetAppOverviewByGameID(appId)
  const appName = appDetails?.display_name?.replace(/(™|®|©)/g, '')

  useEffect(() => {
    let ignore = false
    async function getData() {
      const cache = await getCache(appId)
      if (cache?.videoId?.length == 0) {
        return setAudio({ videoId: '', audioUrl: '' })
      } else if (cache?.videoId?.length) {
        const newAudio = await getAudioUrlFromVideoId(serverAPI, {
          title: '',
          id: cache.videoId
        })
        if (newAudio?.length) {
          return setAudio({ videoId: cache.videoId, audioUrl: newAudio })
        }
      } else if (settingsState.defaultMuted) {
        return setAudio({ videoId: '', audioUrl: '' })
      } else {
        const newAudio = await getAudio(serverAPI, appName as string)
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
    if (appName?.length) {
      getData()
    }
    return () => {
      ignore = true
    }
  }, [appName])

  return {
    audio
  }
}

export default useThemeMusic
