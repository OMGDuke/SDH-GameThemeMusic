import { DialogButton, Focusable } from '@decky/ui'
import { useEffect, useState } from 'react'
import useTranslations from '../../hooks/useTranslations'
import { getResolver } from '../../actions/audio'
import { YouTubeVideoPreview } from '../../../types/YouTube'
import { FaCheck } from 'react-icons/fa'
import Spinner from '../spinner'
import useAudioPlayer from '../../hooks/useAudioPlayer'
import { useSettings } from '../../hooks/useSettings'

export default function AudioPlayer({
  handlePlay,
  selected,
  selectNewAudio,
  video,
  volume
}: {
  video: YouTubeVideoPreview & { isPlaying: boolean }
  volume: number
  handlePlay: (startPlaying: boolean) => void
  selected: boolean
  selectNewAudio: (audio: {
    title: string
    videoId: string
    audioUrl: string
  }) => Promise<void>
}) {
  const t = useTranslations()
  // If the URL is defined already, we don't need to load anything here.
  const [loading, setLoading] = useState(video.url === undefined)
  const [downloading, setDownloading] = useState(false)
  const [audioUrl, setAudio] = useState<string | undefined>()
  const { settings, isLoading: settingsLoading } = useSettings()

  const audioPlayer = useAudioPlayer(audioUrl)

  useEffect(() => {
    async function getData() {
      const resolver = getResolver(settings.useYtDlp)
      setLoading(true)
      const res = await resolver.getAudioUrlFromVideo(video)
      setAudio(res)
      setLoading(false)
    }
    if (video.id.length && !settingsLoading) {
      getData()
    }
  }, [video.id, settingsLoading])

  useEffect(() => {
    if (audioPlayer.isReady) {
      audioPlayer.setVolume(volume)
    }
  }, [audioPlayer.isReady, volume])

  useEffect(() => {
    if (audioPlayer.isReady) {
      if (video.isPlaying) audioPlayer.play()
      else audioPlayer.stop()
    }
  }, [video.isPlaying])

  function togglePlay() {
    handlePlay(!video.isPlaying)
  }

  async function selectAudio() {
    if (audioUrl?.length && video.id.length) {
      setDownloading(true)
      await selectNewAudio({
        title: video.title,
        videoId: video.id,
        audioUrl: audioUrl
      })
      setDownloading(false)
    }
  }

  if (!loading && !audioUrl) return <></>
  return (
    <div>
      <Focusable
        style={{
          background: 'var(--main-editor-bg-color)',
          borderRadius: '6px',
          display: 'grid',
          gridTemplateRows: 'max-content max-content max-content',
          overflow: 'hidden',
          padding: '10px',
          width: '230px'
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '230px',
            height: 0,
            paddingBottom: '56.25%',
            overflow: 'hidden'
          }}
        >
          <img
            src={video.thumbnail}
            alt={video.title}
            style={{
              overflow: 'hidden',
              width: '230px',
              borderRadius: '6px',
              position: 'absolute',
              top: '50%',
              left: 0,
              transform: 'translateY(-50%)',
              height: 'auto'
            }}
          />
        </div>
        <p
          style={{
            color: 'var(--main-editor-text-color)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '230px',
            height: '68px'
          }}
        >
          {video.title}
        </p>

        {loading || downloading ? (
          <div
            style={{
              height: '85px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {downloading && <div>Downloading...</div>}
            <Spinner />
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              width: '230px'
            }}
          >
            <DialogButton
              onClick={togglePlay}
              disabled={loading}
              focusable={!loading}
            >
              {video.isPlaying ? t('stop') : t('play')}
            </DialogButton>
            <div style={{ position: 'relative' }}>
              <DialogButton
                disabled={selected || loading}
                focusable={!selected && !loading}
                onClick={selectAudio}
              >
                {selected
                  ? t('selected')
                  : settings.downloadAudio
                    ? t('download')
                    : t('select')}
              </DialogButton>
              {selected ? (
                <div
                  style={{
                    height: '20px',
                    width: '20px',
                    position: 'absolute',
                    bottom: '-6px',
                    right: '-6px',
                    background: '#59bf40',
                    borderRadius: '50%',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FaCheck />
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
        )}
      </Focusable>
    </div>
  )
}
