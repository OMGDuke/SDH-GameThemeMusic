import { DialogButton, Focusable, ServerAPI } from 'decky-frontend-lib'
import React, { useEffect, useRef, useState } from 'react'
import useTranslations from '../../hooks/useTranslations'
import { getAudioUrlFromVideoId } from '../../actions/audio'
import YouTubeVideo from '../../../types/YouTube'
import { FaCheck } from 'react-icons/fa'
import Spinner from '../spinner'

export default function AudioPlayer({
  handlePlay,
  selected,
  selectNewAudio,
  serverAPI,
  video,
  volume
}: {
  serverAPI: ServerAPI
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
  const audioRef = useRef<HTMLAudioElement>(null)
  const [loading, setLoading] = useState(true)
  const [audioUrl, setAudio] = useState<string | undefined>()

  useEffect(() => {
    async function getData() {
      setLoading(true)
      const res = await getAudioUrlFromVideoId(serverAPI, video)
      setAudio(res)
      setLoading(false)
    }
    if (video.id.length) {
      getData()
    }
  }, [video.id])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [audioRef])

  useEffect(() => {
    if (audioRef.current) {
      video.isPlaying ? audioRef.current.play() : audioRef.current.pause()
    }
  }, [video.isPlaying])

  function togglePlay() {
    if (audioRef?.current) {
      audioRef.current.currentTime = 0
      handlePlay(!video.isPlaying)
    }
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
          gridTemplateRows: '129px max-content max-content',
          overflow: 'hidden',
          padding: '10px',
          width: '230px'
        }}
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          style={{
            overflow: 'hidden',
            width: '230px',
            height: '129px',
            borderRadius: '6px'
          }}
        />
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
      <audio
        ref={audioRef}
        src={audioUrl}
        autoPlay={false}
        controlsList="nodownload"
        onPlay={() => audioRef.current?.play()}
        onPause={() => audioRef.current?.pause()}
        style={{ display: 'none' }}
      ></audio>
    </div>
  )
}
