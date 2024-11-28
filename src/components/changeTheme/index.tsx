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
  const appName = appDetails?.display_name?.replace(/(™|®|©)/g, '')

  const [videos, setVideos] = useState<
    (YouTubeVideoPreview & { isPlaying: boolean })[]
  >([])
  const [loadingNum, setLoadingNum] = useState(0)
  const initialSearch = appName?.concat(' Theme Music') ?? ''
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  useEffect(() => {
    let ignore = false
    async function getData() {
      setLoadingNum((x) => x + 1)
      setVideos([])
      const resolver = getResolver(settings.useYtDlp)
      const res = resolver.getYouTubeSearchResults(searchTerm)
      for await (const video of res) {
        if (ignore) {
          break
        }
        setVideos((oldVideos) => [...oldVideos, { isPlaying: false, ...video }])
      }
      setLoadingNum((x) => x - 1)
    }
    if (searchTerm.length > 0 && !settingsLoading) {
      getData()
    }
    return () => {
      ignore = true
    }
  }, [searchTerm, settingsLoading])

  function handlePlay(index: number, startPlay: boolean) {
    setVideos((oldVideos) => {
      const newVideos = oldVideos.map((v, vIndex) => ({
        ...v,
        isPlaying: vIndex === index ? startPlay : false
      }))
      return newVideos
    })
  }

  function setInitialSearch() {
    setSearchTerm(initialSearch)
    return initialSearch
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
                loading={loadingNum > 0}
                handlePlay={handlePlay}
                customSearch={setSearchTerm}
                currentSearch={searchTerm}
                setInitialSearch={setInitialSearch}
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
