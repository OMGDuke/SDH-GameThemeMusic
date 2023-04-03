import { ServerAPI } from 'decky-frontend-lib'
import { useEffect, useState } from 'react'

import { getAudio, getAudioUrlFromVideoId } from '../actions/audio'

import { getCache, updateCache } from '../cache/musicCache'

const useThemeMusic = (serverAPI: ServerAPI, appId: number) => {
  const [audio, setAudio] = useState<
    { videoId: string; audioUrl: string } | undefined
  >()
  const appDetails = appStore.GetAppOverviewByGameID(appId)
  const appName = appDetails?.display_name

  useEffect(() => {
    let ignore = false
    async function getData() {
      const cache = await getCache(appId)
      if (cache?.videoId && !cache?.videoId?.length) {
        return setAudio({ videoId: '', audioUrl: '' })
      }
      if (cache?.videoId?.length) {
        const newAudio = await getAudioUrlFromVideoId(serverAPI, {
          title: '',
          id: cache.videoId
        })
        if (newAudio?.length) {
          return setAudio({ videoId: cache.videoId, audioUrl: newAudio })
        }
      }
      const newAudio = await getAudio(serverAPI, appName as string)
      if (ignore) {
        return
      }
      if (!newAudio?.audioUrl?.length) {
        return setAudio({ videoId: '', audioUrl: '' })
      }
      setAudio(newAudio)
    }
    if (appName?.length) {
      getData()
    }
    return () => {
      ignore = true
    }
  }, [appName])

  useEffect(() => {
    if (audio?.videoId) {
      updateCache(appId, {
        videoId: audio.videoId
      })
    }
  }, [audio, appName])

  return {
    audio
  }
}

export default useThemeMusic
