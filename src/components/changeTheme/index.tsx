import { ServerAPI, Tabs, useParams } from 'decky-frontend-lib'
import React, { useEffect, useState } from 'react'

import useTranslations from '../../hooks/useTranslations'
import ChangePage from './changePage'
import AboutPage from './aboutPage'
import { SettingsProvider } from '../../context/settingsContext'
import {
  getAudioUrlFromVideoId,
  getYouTubeSearchResults
} from '../../actions/audio'

export default function ChangeTheme({ serverAPI }: { serverAPI: ServerAPI }) {
  const [currentTab, setCurrentTab] = useState<string>()
  const t = useTranslations()
  const { appid } = useParams<{ appid: string }>()
  const appDetails = appStore.GetAppOverviewByGameID(parseInt(appid))
  const appName = appDetails?.display_name

  const [audios, setAudios] = useState<
    {
      appName: string
      title: string
      videoId: string
      audioUrl: string
      isPlaying: boolean
    }[]
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getData() {
      setLoading(true)
      const res = await getYouTubeSearchResults(serverAPI, appName)
      if (res?.length) {
        const audios = await Promise.all(
          res.map(async (v) => await getAudioUrlFromVideoId(serverAPI, v))
        )
        const filteredAudios = audios
          .filter((a) => a?.audioUrl?.length)
          .map((a) => ({ ...a, isPlaying: false })) as {
          appName: string
          title: string
          videoId: string
          audioUrl: string
          isPlaying: boolean
        }[]
        setAudios(filteredAudios || [])
        setLoading(false)
      }
    }
    if (appid) {
      getData()
    }
  }, [])

  function handlePlay(index: number, startPlay: boolean) {
    setAudios((oldAudios) => {
      const newAudios = oldAudios.map((a, aIndex) => ({
        ...a,
        isPlaying: aIndex === index ? startPlay : false
      }))
      return newAudios
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
        title="Game Theme Music"
        autoFocusContents
        activeTab={currentTab}
        onShowTab={setCurrentTab}
        tabs={[
          {
            title: t('changeThemeMusic'),
            content: (
              <SettingsProvider>
                <ChangePage
                  audios={audios}
                  loading={loading}
                  handlePlay={handlePlay}
                />
              </SettingsProvider>
            ),
            id: 'change-music-tab'
          },
          { title: t('about'), content: <AboutPage />, id: 'about-tab' }
        ]}
      />
    </div>
  )
}
