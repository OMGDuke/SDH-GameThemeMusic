import { ServerAPI } from 'decky-frontend-lib'
import { useEffect, useState } from 'react'

import { getAudio } from '../actions/audio'

const useThemeMusic = (serverAPI: ServerAPI, appName: string | undefined) => {
  const [audioUrl, setAudioUrl] = useState<string>()

  async function refresh() {
    if (appName?.length) {
      const url = await getAudio(serverAPI, appName as string).catch(
        () => undefined
      )

      if (url?.length) {
        setAudioUrl(url)
      }
    }
  }

  useEffect(() => {
    let ignore = false
    async function getData() {
      const url = await getAudio(serverAPI, appName as string)
      if (ignore) {
        return
      }
      if (!url?.length) return
      setAudioUrl(url)
    }
    if (appName?.length) {
      getData()
    }
    return () => {
      ignore = true
    }
  }, [appName])

  useEffect(() => {
    let ignore = false
    async function getData() {
      if (ignore) {
        return
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
    audioUrl,
    refresh
  }
}

export default useThemeMusic
