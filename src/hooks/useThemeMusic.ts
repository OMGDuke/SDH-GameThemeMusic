import { ServerAPI } from 'decky-frontend-lib'
import { useEffect, useState } from 'react'

import { getAudio, getAudioUrlFromVideoId } from '../actions/audio'

import { getSongSettings, updateSongSettings } from '../songSettings'
import { useSettings } from '../hooks/useSettings'

const useThemeMusic = (serverAPI: ServerAPI, appId: number) => {
  const { settings, isLoading: settingsLoading } = useSettings(serverAPI)
  const [audio, setAudio] = useState<{ videoId: string; audioUrl: string }>({
    videoId: '',
    audioUrl: ''
  })
  const appDetails = appStore.GetAppOverviewByGameID(appId)
  const appName = appDetails?.display_name?.replace(/(™|®|©)/g, '')

  useEffect(() => {
    let ignore = false
    async function getCachedSong(videoId: string) {
      const newAudio = await getAudioUrlFromVideoId(serverAPI, {
        title: '',
        id: videoId
      })
      const AUDIO_FOUND = newAudio?.length
      if (AUDIO_FOUND) {
        return setAudio({
          videoId: videoId,
          audioUrl: newAudio
        })
      }
    }

    async function getNewAudio() {
      const newAudio = await getAudio(serverAPI, appName as string)
      if (ignore) {
        return
      }
      if (!newAudio?.audioUrl?.length) {
        return setAudio({ videoId: '', audioUrl: '' })
      }
      await updateSongSettings(appId, { videoId: newAudio.videoId })
      return setAudio(newAudio)
    }
    async function getData() {
      const songSettings = await getSongSettings(appId)
      const SONG_SET = songSettings?.videoId?.length
      const SILENCE_CHOSEN = SONG_SET == 0
      if (SILENCE_CHOSEN) {
        return setAudio({ videoId: '', audioUrl: '' })
      } else if (SONG_SET) {
        return getCachedSong(songSettings?.videoId as string)
      } else if (settings.defaultMuted) {
        return setAudio({ videoId: '', audioUrl: '' })
      } else {
        return getNewAudio()
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
