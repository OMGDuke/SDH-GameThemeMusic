import { ServerAPI, Tabs, useParams } from 'decky-frontend-lib'
import React, { useEffect, useState } from 'react'

import useTranslations from '../../hooks/useTranslations'
import ChangePage from './changePage'
import AboutPage from './aboutPage'
import { SettingsProvider } from '../../context/settingsContext'
import { getYouTubeSearchResults } from '../../actions/audio'
import YouTubeVideo from '../../../types/YouTube'
import GameSettings from './gameSettings'

export default function ChangeTheme({ serverAPI }: { serverAPI: ServerAPI }) {
  const [currentTab, setCurrentTab] = useState<string>('change-music-tab')
  const t = useTranslations()
  const { appid } = useParams<{ appid: string }>()
  const appDetails = appStore.GetAppOverviewByGameID(parseInt(appid))
  const appName = appDetails?.display_name

  const [videos, setVideos] = useState<
    (YouTubeVideo & { isPlaying: boolean })[]
  >([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState<string>()

  useEffect(() => {
    let ignore = false
    async function getData() {
      setLoading(true)
      const res = await getYouTubeSearchResults(
        serverAPI,
        searchTerm?.length ? searchTerm : appName,
        Boolean(searchTerm?.length)
      )
      if (ignore) {
        return
      }
      setVideos(res?.map((v) => ({ ...v, isPlaying: false })) || [])
      setLoading(false)
    }
    if (appName) {
      getData()
    }
    return () => {
      ignore = true
    }
  }, [searchTerm, appName])

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
              <SettingsProvider>
                <ChangePage
                  serverAPI={serverAPI}
                  videos={videos}
                  loading={loading}
                  handlePlay={handlePlay}
                  customSearch={setSearchTerm}
                />
              </SettingsProvider>
            ),
            id: 'change-music-tab'
          },
          {
            title: t('gameSettings'),
            content: (
              <SettingsProvider>
                <GameSettings serverAPI={serverAPI} />
              </SettingsProvider>
            ),
            id: 'game-settings-tab'
          },
          { title: t('about'), content: <AboutPage />, id: 'about-tab' }
        ]}
      />
    </div>
  )
}
