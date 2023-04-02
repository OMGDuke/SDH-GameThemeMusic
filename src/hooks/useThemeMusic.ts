import { ServerAPI } from 'decky-frontend-lib'
import { useEffect, useState } from 'react'

import { getAudio, getAudioUrlFromVideoId } from '../actions/audio'

import { getCache, updateCache } from '../cache/musicCache'

const useThemeMusic = (serverAPI: ServerAPI, appId: number) => {
  const [audio, setAudio] = useState<{
    appName: string
    title: string
    videoId: string
    audioUrl: string
  }>()
  const appDetails = appStore.GetAppOverviewByGameID(appId)
  const appName = appDetails?.display_name

  useEffect(() => {
    let ignore = false
    async function getData() {
      const cache = await getCache(appId)
      if (cache?.disabled) {
        return
      }
      if (cache?.videoId?.length) {
        const newAudio = await getAudioUrlFromVideoId(serverAPI, {
          appName,
          title: cache.title,
          id: cache.videoId
        })
        return setAudio(newAudio)
      }
      const newAudio = await getAudio(serverAPI, appName as string)
      if (ignore) {
        return
      }
      if (!newAudio?.audioUrl?.length) return
      setAudio({ ...newAudio, appName })
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
        appName,
        title: audio.title,
        videoId: audio.videoId
      })
    }
  }, [audio, appName])

  return {
    audio
  }
}

export default useThemeMusic
