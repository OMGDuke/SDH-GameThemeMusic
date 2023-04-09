import { ServerAPI } from 'decky-frontend-lib'
import YouTubeVideo from '../../types/YouTube'
import { getInitialState } from '../context/settingsContext'

type YouTubeInitialData = {
  title: string
  videoId: string
  videoThumbnails: { quality: 'default' | 'high'; url: string }[]
}[]

export async function getYouTubeSearchResults(
  serverAPI: ServerAPI,
  appName: string,
  customSearch?: boolean
): Promise<YouTubeVideo[] | undefined> {
  const settings = getInitialState()
  const searchTerm = `${encodeURIComponent(appName)}${
    customSearch ? '' : '%20Theme%20Music'
  }`
  const req = {
    method: 'GET',
    url: `${settings.invidiousInstance}/api/v1/search?type=video&page=1&sort_by=relevance&fields=title,videoId,videoThumbnails&q=${searchTerm}`,
    timeout: 8000
  }
  const res = await serverAPI.callServerMethod<
    { method: string; url: string },
    { body: string; status: number }
  >('http_request', req)
  if (res.success && res.result.status === 200) {
    const results: YouTubeInitialData = JSON.parse(res.result?.body)
    if (results.length) {
      return results.map((res) => ({
        title: res.title,
        id: res.videoId,
        thumbnail:
          res.videoThumbnails.find((thumb) => thumb.quality === 'high')?.url ||
          ''
      }))
    }
    return undefined
  }
  return undefined
}

type AdaptiveFormat = {
  audioQuality:
    | 'AUDIO_QUALITY_LOW'
    | 'AUDIO_QUALITY_MEDIUM'
    | 'AUDIO_QUALITY_ULTRALOW'
  type: string
  url: string
}

function getPreferredAudioQuality(audioArray: AdaptiveFormat[]) {
  const preferredAudioQuality = [
    'AUDIO_QUALITY_MEDIUM',
    'AUDIO_QUALITY_LOW',
    'AUDIO_QUALITY_ULTRALOW'
  ] as const

  for (const quality of preferredAudioQuality) {
    const foundAudio = audioArray.find(
      (audio) => audio.audioQuality === quality
    )
    if (foundAudio) {
      return foundAudio
    }
  }
  return undefined
}

export async function getAudioUrlFromVideoId(
  serverAPI: ServerAPI,
  video: { title: string; id: string }
): Promise<string | undefined> {
  const settings = getInitialState()
  const req = {
    method: 'GET',
    url: `${settings.invidiousInstance}/api/v1/videos/${encodeURIComponent(
      video.id
    )}?fields=adaptiveFormats`
  }
  const res = await serverAPI.callServerMethod<
    { method: string; url: string },
    { body: string; status: number }
  >('http_request', req)
  if (res.success && res.result.status === 200) {
    const audioFormats: { adaptiveFormats: AdaptiveFormat[] } = JSON.parse(
      res.result?.body
    )

    const audios = audioFormats.adaptiveFormats.filter((aud) =>
      aud.type.includes('audio/mp4')
    )
    const audio = getPreferredAudioQuality(audios)
    return audio?.url
  }
  return undefined
}

export async function getAudio(
  serverAPI: ServerAPI,
  appName: string
): Promise<{ videoId: string; audioUrl: string } | undefined> {
  const videos = await getYouTubeSearchResults(serverAPI, appName)
  if (videos?.length) {
    let audio: { videoId: string; audioUrl: string } | undefined
    let i
    for (i = 0; i < videos.length; i++) {
      const audioUrl = await getAudioUrlFromVideoId(serverAPI, videos[i])
      if (audioUrl?.length) {
        audio = { audioUrl, videoId: videos[i].id }
        break
      }
    }
    return audio
  }
  return undefined
}

export async function getInvidiousInstances(
  serverAPI: ServerAPI
): Promise<{ name: string; url: string }[]> {
  const req = {
    method: 'GET',
    url: 'https://api.invidious.io/instances.json?sort_by=type,location,users'
  }
  const res = await serverAPI.callServerMethod<
    { method: string; url: string },
    { body: string; status: number }
  >('http_request', req)
  if (res.success && res.result.status === 200) {
    const instances: {
      flag: string
      uri: string
      monitor?: { name: string; '30dRatio': { ratio: string } }
    }[] = JSON.parse(res.result?.body)
      .map((ins: (Record<string, unknown> | string)[]) =>
        ins.find((obj) => typeof obj === 'object')
      )
      .filter(
        (i: { api: boolean; type: 'https' | 'onion' }) =>
          i.api && i.type === 'https'
      )

    if (instances?.length) {
      return instances.map((ins) => ({
        name: `${ins.flag} ${ins?.monitor?.name || ins.uri} ${
          ins?.monitor?.['30dRatio']?.ratio
            ? `| Uptime: ${Math.round(
                parseFloat(ins.monitor['30dRatio'].ratio)
              )}%`
            : ''
        }`,
        url: ins.uri
      }))
    }
    return []
  }
  return []
}
