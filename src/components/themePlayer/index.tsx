import { ServerAPI, useParams } from 'decky-frontend-lib'
import React, { ReactElement } from 'react'

import useThemeMusic from '../../hooks/useThemeMusic'

export default function ThemePlayer({
  serverAPI
}: {
  serverAPI: ServerAPI
}): ReactElement {
  const { appid: pathId } = useParams<{ appid: string }>()
  const appDetails = appStore.GetAppOverviewByGameID(parseInt(pathId))
  const appName = appDetails?.display_name

  const { audioUrl } = useThemeMusic(serverAPI, appName)

  if (!audioUrl?.length) return <></>

  return (
    <audio
      className="game-theme-music-container"
      style={{ display: 'none' }}
      autoPlay
      src={audioUrl}
    ></audio>
  )
}
