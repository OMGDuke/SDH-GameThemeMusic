import {
  DialogButton,
  Focusable,
  ServerAPI,
  SliderField,
  PanelSectionRow,
  useParams
} from 'decky-frontend-lib'
import React, { useEffect, useState } from 'react'
import { getCache, updateCache } from '../../cache/musicCache'

import { getAudioUrlFromVideoId, getAudio } from '../../actions/audio'
import useTranslations from '../../hooks/useTranslations'
import { useSettings } from '../../context/settingsContext'
import { FaVolumeUp } from 'react-icons/fa'
import Spinner from '../spinner'
import useAudioPlayer from '../../hooks/useAudioPlayer'

export default function GameSettings({ serverAPI }: { serverAPI: ServerAPI }) {
  const t = useTranslations()
  const { state: settingsState } = useSettings()
  const { appid } = useParams<{ appid: string }>()
  const appDetails = appStore.GetAppOverviewByGameID(parseInt(appid))
  const appName = appDetails?.display_name

  const [currentAudio, setCurrentAudio] = useState<string>()
  const [themeVolume, setThemeVolume] = useState(settingsState.volume)
  const [loading, setLoading] = useState(true)

  const audioPlayer = useAudioPlayer(currentAudio)

  useEffect(() => {
    async function getData() {
      setLoading(true)
      const cache = await getCache(parseInt(appid))
      if (typeof cache?.volume === 'number' && isFinite(cache.volume)) {
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

  function updateThemeVolume(newVol: number, reset?: boolean) {
    setThemeVolume(newVol)
    audioPlayer.setVolume(newVol)
    updateCache(parseInt(appid), { volume: reset ? undefined : newVol })
  }

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
          onClick={audioPlayer.togglePlay}
          disabled={loading}
          focusable={!loading}
          style={{ height: 'max-content' }}
        >
          {loading ? (
            <Spinner />
          ) : audioPlayer.isPlaying ? (
            t('stop')
          ) : (
            t('play')
          )}
        </DialogButton>
        <DialogButton
          onClick={() => updateThemeVolume(settingsState.volume, true)}
          style={{ height: 'max-content' }}
        >
          {t('resetVolume')}
        </DialogButton>
      </Focusable>
    </div>
  )
}
