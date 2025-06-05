import {
  DialogButton,
  Focusable,
  SliderField,
  PanelSectionRow,
  useParams
} from '@decky/ui'
import { useEffect, useState } from 'react'
import { getCache, updateCache } from '../../cache/musicCache'

import { getResolver } from '../../actions/audio'
import useTranslations from '../../hooks/useTranslations'
import { useSettings } from '../../hooks/useSettings'
import { FaVolumeUp } from 'react-icons/fa'
import Spinner from '../spinner'
import useAudioPlayer from '../../hooks/useAudioPlayer'
import { callable, FileSelectionType, openFilePicker } from '@decky/api'
import { logger } from '../../utils'

const getEnv = (env: string) => callable<[string], string>('get_env')(env)
const importAudio = (filePath: string) =>
  callable<[string], string>('import_audio')(filePath)

export default function GameSettings() {
  const t = useTranslations()
  const { settings, isLoading: settingsIsLoading } = useSettings()
  const { appid } = useParams<{ appid: string }>()
  const appDetails = appStore.GetAppOverviewByGameID(parseInt(appid))
  const appName = appDetails?.display_name

  const [currentAudio, setCurrentAudio] = useState<string>()
  const [themeVolume, setThemeVolume] = useState(settings.volume)
  const [loading, setLoading] = useState(true)

  const audioPlayer = useAudioPlayer(currentAudio)

  useEffect(() => {
    async function getData() {
      setLoading(true)
      const resolver = getResolver(settings.useYtDlp)
      const cache = await getCache(parseInt(appid))
      if (typeof cache?.volume === 'number' && isFinite(cache.volume)) {
        setThemeVolume(cache.volume)
      } else {
        setThemeVolume(settings.volume)
      }
      if (cache?.videoId?.length) {
        const newAudio = await resolver.getAudioUrlFromVideo({
          id: cache?.videoId
        })
        setCurrentAudio(newAudio)
      } else {
        const newAudio = await resolver.getAudio(appName as string)
        setCurrentAudio(newAudio?.audioUrl)
      }
      setLoading(false)
    }
    if (!settingsIsLoading) {
      getData()
    }
  }, [appid, settingsIsLoading])

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
          onClick={() => updateThemeVolume(settings.volume, true)}
          style={{ height: 'max-content' }}
        >
          {t('resetVolume')}
        </DialogButton>
      </Focusable>

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
            <DialogButton
              onClick={async () => {
                const res = await openFilePicker(
                  FileSelectionType.FILE,
                  await getEnv('DECKY_USER_HOME')
                )

                logger.debug('importing audio', res)
                await importAudio(res.realpath)

                const fileName = res.realpath.split('/').pop()

                if (!fileName)
                  throw new Error(`Failed to import audio: ${res.realpath}`)

                const videoId = fileName.split('.')[0]

                if (!videoId)
                  throw new Error(`Failed to import audio: ${fileName}`)

                await updateCache(parseInt(appid), { videoId })

                const audio = await getResolver(
                  settings.useYtDlp
                ).getAudioUrlFromVideo({
                  id: videoId
                })

                setCurrentAudio(audio)
              }}
              disabled={loading}
              style={{ height: 'max-content' }}
            >
              Import Music
            </DialogButton>
          </PanelSectionRow>
        </div>
      </Focusable>
    </div>
  )
}
