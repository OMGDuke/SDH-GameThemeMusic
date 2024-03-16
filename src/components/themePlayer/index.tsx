import { ServerAPI, useParams } from 'decky-frontend-lib'
import React, { ReactElement, useEffect } from 'react'

import useThemeMusic from '../../hooks/useThemeMusic'
import { useSettings } from '../../hooks/useSettings'
import { getCache } from '../../cache/musicCache'
import useAudioPlayer from '../../hooks/useAudioPlayer'

export default function ThemePlayer({
  serverAPI
}: {
  serverAPI: ServerAPI
}): ReactElement {
  const { settings, isLoading: settingsIsLoading } = useSettings(serverAPI)
  const { appid } = useParams<{ appid: string }>()
  const { audio } = useThemeMusic(serverAPI, parseInt(appid))
  const audioPlayer = useAudioPlayer(audio.audioUrl)

  useEffect(() => {
    async function getData() {
      const cache = await getCache(parseInt(appid))
      if (typeof cache?.volume === 'number' && isFinite(cache.volume)) {
        audioPlayer.setVolume(cache.volume)
      } else {
        audioPlayer.setVolume(settings.volume)
      }
    }
    if (!settingsIsLoading) {
      getData()
    }
  }, [settingsIsLoading])

  useEffect(() => {
    if (audio?.audioUrl?.length && audioPlayer.isReady) {
      audioPlayer.play()
    }
  }, [audio?.audioUrl, audioPlayer.isReady])

  return <></>
}
