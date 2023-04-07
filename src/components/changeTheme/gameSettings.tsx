import {
  DialogButton,
  Focusable,
  ServerAPI,
  SliderField,
  PanelSectionRow,
  useParams
} from 'decky-frontend-lib'
import React, { useEffect, useRef, useState } from 'react'
import { getCache, updateCache } from '../../cache/musicCache'

import { getAudioUrlFromVideoId, getAudio } from '../../actions/audio'
import useTranslations from '../../hooks/useTranslations'
import { useSettings } from '../../context/settingsContext'
import { FaVolumeUp } from 'react-icons/fa'
import Spinner from '../spinner'

export default function GameSettings({ serverAPI }: { serverAPI: ServerAPI }) {
  const t = useTranslations()
  const audioRef = useRef<HTMLAudioElement>(null)
  const { state: settingsState } = useSettings()
  const { appid } = useParams<{ appid: string }>()
  const appDetails = appStore.GetAppOverviewByGameID(parseInt(appid))
  const appName = appDetails?.display_name

  const [currentAudio, setCurrentAudio] = useState<string>()
  const [themeVolume, setThemeVolume] = useState(settingsState.volume)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getData() {
      setLoading(true)
      const cache = await getCache(parseInt(appid))
      if (cache?.volume) {
        setThemeVolume(cache.volume)
      }
      if (cache?.videoId?.length) {
        const newAudio = await getAudioUrlFromVideoId(serverAPI, {
          title: '',
          id: cache?.videoId
        })
        setCurrentAudio(newAudio)
      } else {
        const newAudio = await getAudio(serverAPI, appName as string)
        setCurrentAudio(newAudio?.audioUrl)
      }
      setLoading(false)
    }

    getData()
  }, [appid])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = themeVolume
    }
  }, [audioRef, themeVolume])

  function updateThemeVolume(newVol: number) {
    setThemeVolume(newVol)
    updateCache(parseInt(appid), { volume: newVol })
  }

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      isPlaying ? audioRef.current.play() : audioRef.current.pause()
    }
  }, [audioRef, isPlaying])

  return (
    <div>
      <h2 style={{ margin: '20px 0' }}>{appName}</h2>

      <Focusable
        style={{
          background: 'var(--main-editor-bg-color)',
          borderRadius: '6px',
          display: 'grid',
          gridGap: '16px',
          gridTemplateColumns: '2fr max-content max-content',
          height: 'max-content',
          padding: '10px 10px 10px 16px',
          alignItems: 'center'
        }}
      >
        <div style={{ padding: '0 10px' }}>
          <PanelSectionRow>
            <SliderField
              layout="below"
              bottomSeparator="none"
              label={t('volume')}
              description={t('gameVolumeDescription')}
              value={themeVolume * 100}
              onChange={(newVal) => updateThemeVolume(newVal / 100)}
              min={0}
              max={100}
              step={1}
              icon={<FaVolumeUp />}
              editableValue
            />
          </PanelSectionRow>
        </div>
        <DialogButton
          onClick={() => setIsPlaying((v) => !v)}
          disabled={loading}
          focusable={!loading}
          style={{ height: 'max-content' }}
        >
          {loading ? <Spinner /> : isPlaying ? t('stop') : t('play')}
        </DialogButton>
        <DialogButton
          onClick={() => updateThemeVolume(settingsState.volume)}
          style={{ height: 'max-content' }}
        >
          {t('resetVolume')}
        </DialogButton>
      </Focusable>

      <audio
        ref={audioRef}
        src={currentAudio}
        controlsList="nodownload"
        loop
        style={{ display: 'none' }}
      ></audio>
    </div>
  )
}
