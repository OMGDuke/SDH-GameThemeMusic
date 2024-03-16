import { useEffect, useMemo, useState } from 'react'
import { useAudioLoaderCompatState } from '../state/AudioLoaderCompatState'

const useAudioPlayer = (
  audioUrl: string | undefined
): {
  play: () => void
  pause: () => void
  stop: () => void
  setVolume: (volume: number) => void
  togglePlay: () => void
  isPlaying: boolean
  isReady: boolean
} => {
  const { setOnThemePage, onAppPage } = useAudioLoaderCompatState()
  if (!onAppPage) {
    setOnThemePage(true)
  }

  const audioPlayer: HTMLAudioElement = useMemo(() => {
    const audio = new Audio()
    audio.preload = 'auto'
    return audio
  }, [])

  audioPlayer.oncanplaythrough = () => {
    setIsReady(true)
    setOnThemePage(true)
  }

  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (audioUrl?.length) {
      audioPlayer.src = audioUrl
      audioPlayer.loop = true
    }
  }, [audioUrl])

  useEffect(() => {
    return () => {
      unload()
    }
  }, [])

  function play() {
    if (audioPlayer.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
      audioPlayer.play()
      setIsPlaying(true)
      setOnThemePage(true)
    }
  }

  function pause() {
    if (!audioPlayer.paused && !audioPlayer.ended) {
      audioPlayer.pause()
      setIsPlaying(false)
    }
  }

  function stop() {
    if (!audioPlayer.paused || audioPlayer.currentTime > 0) {
      audioPlayer.pause()
      audioPlayer.currentTime = 0
      setIsPlaying(false)
    }
  }

  function togglePlay() {
    isPlaying ? stop() : play()
  }

  function setVolume(newVolume: number) {
    audioPlayer.volume = newVolume
  }

  function unload() {
    stop()
    audioPlayer.src = ''
    setIsPlaying(false)
    setIsReady(false)
    setOnThemePage(false)
  }

  return {
    play,
    pause,
    stop,
    setVolume,
    togglePlay,
    isPlaying,
    isReady
  }
}

export default useAudioPlayer
