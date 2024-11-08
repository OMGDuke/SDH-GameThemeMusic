import { Tabs, useParams } from '@decky/ui'
import React, { useEffect, useState } from 'react'

import useTranslations from '../../hooks/useTranslations'
import ChangePage from './changePage'
import AboutPage from './aboutPage'
import { getResolver } from '../../actions/audio'
import { YouTubeVideoPreview } from '../../../types/YouTube'
import GameSettings from './gameSettings'
import { useSettings } from '../../hooks/useSettings'

export default function ChangeTheme() {
  const [currentTab, setCurrentTab] = useState<string>('change-music-tab')
  const t = useTranslations()
  const { settings, isLoading: settingsLoading } = useSettings()
  const { appid } = useParams<{ appid: string }>()
  const appDetails = appStore.GetAppOverviewByGameID(parseInt(appid))
  const appName = appDetails?.display_name

  const [videos, setVideos] = useState<
    (YouTubeVideoPreview & { isPlaying: boolean })[]
  >([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState<string>()

  useEffect(() => {
    let ignore = false
    async function getData() {
      setLoading(true)
      const resolver = getResolver(settings.useYtDlp);
      const res = resolver.getYouTubeSearchResults(
        searchTerm?.length ? searchTerm : appName,
        Boolean(searchTerm?.length)
      )
      if (ignore) {
        return
      }
      let videos: YouTubeVideoPreview[] = []
      for await (const video of res) {
        videos.push(video)
        setVideos(videos.map((v) => ({ ...v, isPlaying: false })))
      }
      setLoading(false)
    }
    if (appName && !settingsLoading) {
      getData()
    }
    return () => {
      ignore = true
    }
  }, [searchTerm, appName, settingsLoading])

  function handlePlay(index: number, startPlay: boolean) {
    setVideos((oldVideos) => {
      const newVideos = oldVideos.map((v, vIndex) => ({
        ...v,
        isPlaying: vIndex === index ? startPlay : false
      }))
      return newVideos
    })
  }

  return (
    <div
      style={{
        marginTop: '40px',
        height: 'calc(100% - 40px)'
      }}
    >
      <Tabs
        autoFocusContents
        activeTab={currentTab}
        onShowTab={setCurrentTab}
        tabs={[
          {
            title: t('changeThemeMusic'),
            content: (
              <ChangePage
                videos={videos}
                loading={loading}
                handlePlay={handlePlay}
                customSearch={setSearchTerm}
              />
            ),
            id: 'change-music-tab'
          },
          {
            title: t('gameSettings'),
            content: <GameSettings />,
            id: 'game-settings-tab'
          },
          { title: t('about'), content: <AboutPage />, id: 'about-tab' }
        ]}
      />
    </div>
  )
}
