import { ServerAPI } from 'decky-frontend-lib'
import YouTubeVideo from '../../types/YouTube'
import { Settings, defaultSettings } from '../hooks/useSettings'

type YouTubeInitialData = {
  title: string
  url: string
  thumbnail: string
}[]

async function getEndpoint(serverApi: ServerAPI) {
  const savedSettings = (
    await serverApi.callPluginMethod('get_setting', {
      key: 'settings',
      default: defaultSettings
    })
  ).result as Settings
  return savedSettings.pipedInstance
}

export async function getYouTubeSearchResults(
  serverAPI: ServerAPI,
  appName: string,
  customSearch?: boolean
): Promise<YouTubeVideo[] | undefined> {
  try {
    const searchTerm = `${encodeURIComponent(appName)}${
      customSearch ? '' : '%20Theme%20Music'
    }`
    const endpoint = await getEndpoint(serverAPI)
    const req = {
      method: 'GET',
      url: `${endpoint}/search?q=${searchTerm}&filter=all`,
      timeout: 8000
    }
    const res = await serverAPI.callServerMethod<
      { method: string; url: string },
      { body: string; status: number }
    >('http_request', req)
    if (res.success && res.result.status === 200) {
      const result: { items: YouTubeInitialData } = JSON.parse(res.result?.body)
      if (result.items.length) {
        const regex = /\/watch\?v=([A-Za-z0-9_-]+)/
        return result.items
          .map((res) => ({
            title: res.title,
            id: res.url.match(regex)?.[1] || '',
            thumbnail: res.thumbnail || 'https://i.ytimg.com/vi/0.jpg'
          }))
          .filter((res) => res.id.length)
      }
      return undefined
    }
  } catch (err) {
    return undefined
  }
  return undefined
}

type Audio = {
  mimeType: string
  url: string
  bitrate: number
}

export async function getAudioUrlFromVideoId(
  serverAPI: ServerAPI,
  video: { title: string; id: string }
): Promise<string | undefined> {
  try {
    const endpoint = await getEndpoint(serverAPI)
    const req = {
      method: 'GET',
      url: `${endpoint}/streams/${encodeURIComponent(video.id)}`
    }
    const res = await serverAPI.callServerMethod<
      { method: string; url: string },
      { body: string; status: number }
    >('http_request', req)

    if (res.success && res.result.status === 200) {
      const audioFormats: { audioStreams: Audio[] } = JSON.parse(
        res.result?.body
      )

      const audios = audioFormats.audioStreams.filter(
        (aud) => aud.mimeType?.includes('audio/webm')
      )
      const audio = audios.reduce((prev, current) => {
        return prev.bitrate > current.bitrate ? prev : current
      }, audios[0])

      return audio?.url
    }
  } catch (err) {
    return undefined
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

export async function getPipedInstances(
  serverAPI: ServerAPI
): Promise<{ name: string; url: string }[]> {
  const req = {
    method: 'GET',
    url: 'https://piped-instances.kavin.rocks/'
  }
  const res = await serverAPI.callServerMethod<
    { method: string; url: string },
    { body: string; status: number }
  >('http_request', req)
  if (res.success && res.result.status === 200) {
    const instances: {
      api_url: string
      cache: boolean
      cdn: boolean
      image_proxy_url: string
      last_checked: number
      locations: string
      name: string
      registered: number
      registration_disabled: boolean
      s3_enabled: boolean
      up_to_date: boolean
      uptime_24h: number
      uptime_7d: number
      uptime_30d: number
      version: string
    }[] = JSON.parse(res.result?.body)

    if (instances?.length) {
      return instances.map((ins) => ({
        name: `${ins.locations} ${ins.name || ins.api_url} ${
          ins.uptime_30d ? `| Uptime (30d): ${Math.floor(ins.uptime_30d)}%` : ''
        }`,
        url: ins.api_url
      }))
    }
    return []
  }
  return []
}
