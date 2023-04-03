import { DialogButton, Focusable, ServerAPI } from 'decky-frontend-lib'
import React, { useEffect, useRef, useState } from 'react'
import useTranslations from '../../hooks/useTranslations'
import { getAudioUrlFromVideoId } from '../../actions/audio'
import YouTubeVideo from '../../../types/YouTube'

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
    videoId: string | undefined
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
          background: selected
            ? 'var(--main-light-blue-background)'
            : 'var(--main-editor-bg-color)',
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
            color: selected
              ? 'var(--main-editor-bg-color)'
              : 'var(--main-editor-text-color)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '230px',
            height: '68px'
          }}
        >
          {video.title}
        </p>

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
          <DialogButton
            disabled={selected || loading}
            focusable={!selected && !loading}
            onClick={selectAudio}
          >
            {selected ? t('selected') : t('select')}
          </DialogButton>
        </div>
      </Focusable>
      <audio
        ref={audioRef}
        src={audioUrl}
        autoPlay={false}
        controlsList="nodownload"
        onPlay={() => audioRef.current?.play()}
        onPause={() => audioRef.current?.pause()}
      ></audio>
    </div>
  )
}
