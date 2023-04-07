import { ServerAPI, useParams } from 'decky-frontend-lib'
import React, { ReactElement, useEffect, useRef, useState } from 'react'

import useThemeMusic from '../../hooks/useThemeMusic'
import { useSettings } from '../../context/settingsContext'
import { getCache } from '../../cache/musicCache'

export default function ThemePlayer({
  serverAPI
}: {
  serverAPI: ServerAPI
}): ReactElement {
  const { state: settingsState } = useSettings()
  const { appid } = useParams<{ appid: string }>()
  const audioRef = useRef<HTMLAudioElement>(null)
  const { audio } = useThemeMusic(serverAPI, parseInt(appid))
  const [volume, setVolume] = useState(settingsState.volume)

  useEffect(() => {
    async function getData() {
      const cache = await getCache(parseInt(appid))
      if (typeof cache?.volume === 'number' && isFinite(cache.volume)) {
        setVolume(cache.volume)
      }
    }
    getData()
  }, [])

  useEffect(() => {
    if (audio?.audioUrl?.length && audioRef.current) {
      audioRef.current.src = audio?.audioUrl
      audioRef.current.volume = volume
      audioRef.current.play()
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.volume = 0
        audioRef.current.src = ''
      }
    }
  }, [audio?.audioUrl, audioRef?.current, volume])

  if (!audio?.audioUrl?.length) return <></>

  return (
    <audio
      ref={audioRef}
      className="game-theme-music-container"
      style={{ display: 'none' }}
      loop
      controls={false}
    ></audio>
  )
}
