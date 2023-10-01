import { useEffect, useMemo, useState } from 'react'

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
  const audioPlayer: HTMLAudioElement = useMemo(() => {
    return new Audio()
  }, [])

  audioPlayer.oncanplay = () => {
    setIsReady(true)
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
    return fadeOutAudio
  }, [])

  function fadeOutAudio(): void {
    const fadeOutInterval = 50
    const fadeOutTime = 1000
    const volumeStep = audioPlayer.volume / (fadeOutTime / fadeOutInterval)
    let currentVolume = audioPlayer.volume

    setTimeout(() => {
      const fadeOutIntervalId = setInterval(() => {
        currentVolume -= volumeStep
        if (currentVolume <= 0) {
          currentVolume = 0
          clearInterval(fadeOutIntervalId)
          audioPlayer.volume = currentVolume
          unload()
        } else {
          audioPlayer.volume = currentVolume
        }
      }, fadeOutInterval)
    }, 0)
  }

  function play() {
    audioPlayer.play()
    setIsPlaying(true)
  }

  function pause() {
    audioPlayer.pause()
    setIsPlaying(false)
  }

  function stop() {
    audioPlayer.pause()
    audioPlayer.currentTime = 0
    setIsPlaying(false)
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
