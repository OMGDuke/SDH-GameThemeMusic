import { ServerAPI, useParams } from 'decky-frontend-lib'
import React, { ReactElement, useEffect } from 'react'

import useThemeMusic from '../../hooks/useThemeMusic'
import { useSettings } from '../../context/settingsContext'
import { getCache } from '../../cache/musicCache'
import useAudioPlayer from '../../hooks/useAudioPlayer'

export default function ThemePlayer({
  serverAPI
}: {
  serverAPI: ServerAPI
}): ReactElement {
  const { state: settingsState } = useSettings()
  const { appid } = useParams<{ appid: string }>()
  const { audio } = useThemeMusic(serverAPI, parseInt(appid))
  const audioPlayer = useAudioPlayer(audio.audioUrl)

  useEffect(() => {
    async function getData() {
      const cache = await getCache(parseInt(appid))
      if (typeof cache?.volume === 'number' && isFinite(cache.volume)) {
        audioPlayer.setVolume(cache.volume)
      } else {
        audioPlayer.setVolume(settingsState.volume)
      }
    }
    getData()
  }, [])

  useEffect(() => {
    if (audio?.audioUrl?.length && audioPlayer.isReady) {
      audioPlayer.play()
    }
  }, [audio?.audioUrl, audioPlayer.isReady])

  return <></>
}
