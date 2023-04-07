import { ServerAPI, useParams } from 'decky-frontend-lib'
import React, { ReactElement, useEffect, useRef } from 'react'

import useThemeMusic from '../../hooks/useThemeMusic'
import { useSettings } from '../../context/settingsContext'

export default function ThemePlayer({
  serverAPI
}: {
  serverAPI: ServerAPI
}): ReactElement {
  const { state: settingsState } = useSettings()
  const { appid } = useParams<{ appid: string }>()
  const audioRef = useRef<HTMLAudioElement>(null)
  const { audio } = useThemeMusic(serverAPI, parseInt(appid))

  useEffect(() => {
    if (audio?.audioUrl?.length && audioRef.current) {
      audioRef.current.src = audio?.audioUrl
      audioRef.current.volume = settingsState.volume
      audioRef.current.play()
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [audio?.audioUrl, audioRef])

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
