import {
  DialogButton,
  Focusable,
  PanelSection,
  PanelSectionRow,
  SteamSpinner,
  useParams
} from 'decky-frontend-lib'
import React, { useEffect, useState } from 'react'
import { useSettings } from '../../context/settingsContext'
import AudioPlayer from './audioPlayer'
import { getCache, updateCache } from '../../cache/musicCache'
import useTranslations from '../../hooks/useTranslations'

export default function ChangePage({
  audios,
  loading,
  handlePlay
}: {
  audios: {
    appName: string
    title: string
    videoId: string
    audioUrl: string
    isPlaying: boolean
  }[]
  loading: boolean
  handlePlay: (idx: number, startPlaying: boolean) => void
}) {
  const t = useTranslations()
  const { state: settingsState } = useSettings()
  const { appid } = useParams<{ appid: string }>()
  const appDetails = appStore.GetAppOverviewByGameID(parseInt(appid))
  const appName = appDetails?.display_name
  const [selected, setSelected] = useState<string | undefined>()

  useEffect(() => {
    async function getData() {
      const cache = await getCache(parseInt(appid))
      let newSelected
      if (cache?.disabled) {
        newSelected = ''
      } else if (!cache?.videoId?.length) {
        newSelected = undefined
      } else {
        newSelected = cache?.videoId
      }
      setSelected(newSelected)
    }
    getData()
  }, [appid])

  function selectNewAudio(audio: {
    appName: string
    title: string
    videoId: string
    audioUrl: string
    disabled: boolean
  }) {
    let newSelected
    if (audio?.disabled) {
      newSelected = ''
    } else if (!audio.videoId?.length) {
      newSelected = undefined
    } else {
      newSelected = audio.videoId
    }
    setSelected(newSelected)
    updateCache(parseInt(appid), audio)
  }

  return (
    <div>
      <h1>{appName}</h1>
      {loading ? (
        <SteamSpinner />
      ) : (
        <>
          <PanelSection title={t('noMusicLabel')}>
            <PanelSectionRow>
              <Focusable style={{ display: 'flex' }}>
                <DialogButton focusable={false} disabled>
                  {t('play')}
                </DialogButton>
                <DialogButton
                  disabled={selected === ''}
                  focusable={selected !== ''}
                  onClick={() =>
                    selectNewAudio({
                      appName: appName,
                      title: '',
                      videoId: '',
                      audioUrl: '',
                      disabled: true
                    })
                  }
                >
                  {selected === '' ? t('selected') : t('select')}
                </DialogButton>
              </Focusable>
            </PanelSectionRow>
          </PanelSection>
          {audios.map((audio, index) => (
            <AudioPlayer
              audio={audio}
              volume={settingsState.volume}
              handlePlay={(status) => {
                handlePlay(index, status)
              }}
              selected={selected === audio.videoId}
              selectNewAudio={selectNewAudio}
            />
          ))}
        </>
      )}
    </div>
  )
}
