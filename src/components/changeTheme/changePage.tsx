import {
  DialogButton,
  Focusable,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  SteamSpinner,
  TextField,
  useParams
} from 'decky-frontend-lib'
import React, { useEffect, useState } from 'react'
import { useSettings } from '../../context/settingsContext'
import AudioPlayer from './audioPlayer'
import { getCache, updateCache } from '../../cache/musicCache'
import useTranslations from '../../hooks/useTranslations'
import YouTubeVideo from '../../../types/YouTube'
import NoMusic from './noMusic'

export default function ChangePage({
  customSearch,
  handlePlay,
  loading,
  serverAPI,
  videos
}: {
  videos: (YouTubeVideo & { isPlaying: boolean })[]
  loading: boolean
  handlePlay: (idx: number, startPlaying: boolean) => void
  serverAPI: ServerAPI
  customSearch: (term: string | undefined) => void
}) {
  const t = useTranslations()
  const { state: settingsState } = useSettings()
  const { appid } = useParams<{ appid: string }>()
  const appDetails = appStore.GetAppOverviewByGameID(parseInt(appid))
  const appName = appDetails?.display_name
  const [selected, setSelected] = useState<string | undefined>()
  const [searchTerm, setSearchTerm] = useState(appName || '')

  useEffect(() => {
    async function getData() {
      const cache = await getCache(parseInt(appid))
      setSelected(cache?.videoId)
    }
    getData()
  }, [appid])

  function selectNewAudio(audio: {
    title: string
    videoId: string
    audioUrl: string
  }) {
    setSelected(audio.videoId)
    updateCache(parseInt(appid), { videoId: audio.videoId })
  }

  return (
    <div>
      <h2 style={{ margin: '20px 0' }}>{appName}</h2>
      <PanelSection>
        <PanelSectionRow>
          <Focusable
            style={{
              display: 'grid',
              gap: '6px',
              gridTemplateColumns: '2fr max-content max-content',
              height: 'max-content',
              background: 'var(--main-editor-bg-color)',
              borderRadius: '6px',
              padding: '10px'
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                customSearch(searchTerm)
              }}
            >
              <TextField
                disabled={loading}
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
              />
            </form>
            <DialogButton
              disabled={loading || !searchTerm?.length}
              focusable={!loading && Boolean(searchTerm?.length)}
              onClick={() => customSearch(searchTerm)}
            >
              {t('search')}
            </DialogButton>
            <DialogButton
              disabled={loading || !searchTerm?.length}
              focusable={!loading && Boolean(searchTerm?.length)}
              onClick={() => {
                setSearchTerm('')
                customSearch(undefined)
              }}
            >
              {t('clear')}
            </DialogButton>
          </Focusable>
        </PanelSectionRow>
      </PanelSection>
      {loading ? (
        <SteamSpinner />
      ) : (
        <>
          <Focusable
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '10px',
              flexDirection: 'row'
            }}
          >
            <NoMusic
              selected={selected === ''}
              selectNewAudio={selectNewAudio}
            />
            {videos.map((video, index) => (
              <AudioPlayer
                key={video.id}
                serverAPI={serverAPI}
                video={video}
                volume={settingsState.volume}
                handlePlay={(status) => {
                  handlePlay(index, status)
                }}
                selected={selected === video.id}
                selectNewAudio={selectNewAudio}
              />
            ))}
          </Focusable>
        </>
      )}
    </div>
  )
}
