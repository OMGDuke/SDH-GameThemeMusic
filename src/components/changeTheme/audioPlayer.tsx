import {
  DialogButton,
  Focusable,
  PanelSection,
  PanelSectionRow
} from 'decky-frontend-lib'
import React, { useEffect, useRef } from 'react'
import useTranslations from '../../hooks/useTranslations'

export default function AudioPlayer({
  audio,
  volume,
  handlePlay,
  selected,
  selectNewAudio
}: {
  audio: {
    appName: string
    title: string
    videoId: string
    audioUrl: string
    isPlaying: boolean
  }
  volume: number
  handlePlay: (startPlaying: boolean) => void
  selected: boolean
  selectNewAudio: (audio: {
    appName: string
    title: string
    videoId: string
    audioUrl: string
    disabled: false
  }) => void
}) {
  const t = useTranslations()
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [audioRef])

  useEffect(() => {
    if (audioRef.current) {
      audio.isPlaying ? audioRef.current.play() : audioRef.current.pause()
    }
  }, [audio.isPlaying])

  function togglePlay() {
    if (audioRef?.current) {
      audioRef.current.currentTime = 0
      handlePlay(!audio.isPlaying)
    }
  }

  function selectAudio() {
    selectNewAudio({
      appName: audio.appName,
      title: audio.title,
      videoId: audio.videoId,
      audioUrl: audio.audioUrl,
      disabled: false
    })
  }
  return (
    <PanelSection title={audio.title}>
      <audio
        ref={audioRef}
        src={audio.audioUrl}
        autoPlay={false}
        controlsList="nodownload"
        onPlay={() => audioRef.current?.play()}
        onPause={() => audioRef.current?.pause()}
      ></audio>
      <PanelSectionRow>
        <Focusable style={{ display: 'flex', gap: '6px' }}>
          <DialogButton onClick={togglePlay}>
            {audio.isPlaying ? t('stop') : t('play')}
          </DialogButton>
          <DialogButton
            disabled={selected}
            focusable={!selected}
            onClick={selectAudio}
          >
            {selected ? t('selected') : t('select')}
          </DialogButton>
        </Focusable>
      </PanelSectionRow>
    </PanelSection>
  )
}
