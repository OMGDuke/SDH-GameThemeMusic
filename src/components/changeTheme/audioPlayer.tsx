import { DialogButton, Focusable } from '@decky/ui'
import React, { useEffect, useState } from 'react'
import useTranslations from '../../hooks/useTranslations'
import { getAudioUrlFromVideoId } from '../../actions/audio'
import YouTubeVideo from '../../../types/YouTube'
import { FaCheck } from 'react-icons/fa'
import Spinner from '../spinner'
import useAudioPlayer from '../../hooks/useAudioPlayer'

export default function AudioPlayer({
  handlePlay,
  selected,
  selectNewAudio,
  video,
  volume
}: {
  video: YouTubeVideo & { isPlaying: boolean }
  volume: number
  handlePlay: (startPlaying: boolean) => void
  selected: boolean
  selectNewAudio: (audio: {
    title: string
    videoId: string
    audioUrl: string
  }) => void
}) {
  const t = useTranslations()
  const [loading, setLoading] = useState(true)
  const [audioUrl, setAudio] = useState<string | undefined>()

  const audioPlayer = useAudioPlayer(audioUrl)

  useEffect(() => {
    async function getData() {
      setLoading(true)
      const res = await getAudioUrlFromVideoId(video)
      setAudio(res)
      setLoading(false)
    }
    if (video.id.length) {
      getData()
    }
  }, [video.id])

  useEffect(() => {
    if (audioPlayer.isReady) {
      audioPlayer.setVolume(volume)
    }
  }, [audioPlayer.isReady, volume])

  useEffect(() => {
    if (audioPlayer.isReady) {
      video.isPlaying ? audioPlayer.play() : audioPlayer.stop()
    }
  }, [video.isPlaying])

  function togglePlay() {
    handlePlay(!video.isPlaying)
  }

  function selectAudio() {
    if (audioUrl?.length && video.id.length)
      selectNewAudio({
        title: video.title,
        videoId: video.id,
        audioUrl: audioUrl
      })
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

        {loading ? (
          <div
            style={{
              height: '85px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
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
                {selected ? t('selected') : t('select')}
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
