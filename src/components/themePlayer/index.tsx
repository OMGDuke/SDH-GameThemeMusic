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
  const { appid: pathId } = useParams<{ appid: string }>()
  const appDetails = appStore.GetAppOverviewByGameID(parseInt(pathId))
  const appName = appDetails?.display_name
  const audioRef = useRef<HTMLAudioElement>(null)

  const { audioUrl } = useThemeMusic(serverAPI, appName)

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl
      audioRef.current.volume = settingsState.volume
      audioRef.current.play()
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [audioUrl])

  if (!audioUrl?.length) return <></>

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
