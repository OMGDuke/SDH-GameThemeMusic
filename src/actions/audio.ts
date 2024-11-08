import { call } from '@decky/api'
import { YouTubeVideo, YouTubeInitialData, Audio, YouTubeVideoPreview } from '../../types/YouTube'
import { Settings, defaultSettings } from '../hooks/useSettings'

abstract class AudioResolver {
  abstract getYouTubeSearchResults(appName: string, customSearch?: boolean): AsyncIterable<YouTubeVideoPreview>;
  abstract getAudioUrlFromVideo(video: YouTubeVideo): Promise<string | undefined>;

  async getAudio(
    appName: string
  ): Promise<{ videoId: string; audioUrl: string } | undefined> {
    const videos = this.getYouTubeSearchResults(appName)
    for await (const video of videos) {
      const audioUrl = await this.getAudioUrlFromVideo(video)
      if (audioUrl?.length) {
        return { audioUrl, videoId: video.id }
      }
    }
    return undefined
  }
}

class InvidiousAudioResolver extends AudioResolver {
  async getEndpoint() {
    const savedSettings = await call<[string, Settings], Settings>(
      'get_setting',
      'settings',
      defaultSettings
    )
    return savedSettings.invidiousInstance
  }

  async* getYouTubeSearchResults(
    appName: string,
    customSearch?: boolean
  ): AsyncIterable<YouTubeVideoPreview> {
    try {
      const searchTerm = `${encodeURIComponent(appName)}${customSearch ? '' : '%20Theme%20Music'}`
      const endpoint = await this.getEndpoint()
      const res = await fetch(
        `${endpoint}/api/v1/search?type=video&page=1&q=${searchTerm}`
      )
      if (res.status === 200) {
        const results: YouTubeInitialData = await res.json()
        if (results.length) {
          yield* results
            .map((res) => ({
              title: res.title,
              id: res.videoId,
              thumbnail:
                res.videoThumbnails?.[0].url || 'https://i.ytimg.com/vi/0.jpg'
            }))
            .filter((res) => res.id.length)
        }
      }
    } catch (err) {
      console.debug(err)
    }
    return
  }

  async getAudioUrlFromVideo(
    video: YouTubeVideo
  ): Promise<string | undefined> {
    try {
      const endpoint = await this.getEndpoint()
      const res = await fetch(
        `${endpoint}/api/v1/videos/${encodeURIComponent(video.id)}?fields=adaptiveFormats`
      )
      if (res.status === 200) {
        const result = await res.json()
        const audioFormats: { adaptiveFormats: Audio[] } = result

        const audios = audioFormats.adaptiveFormats.filter((aud) =>
          aud.type?.includes('audio/webm')
        )
        const audio = audios.reduce((prev, current) => {
          return prev.audioSampleRate > current.audioSampleRate ? prev : current
        }, audios[0])

        return audio?.url
      }
    } catch (err) {
      console.log(err)
    }
    return undefined
  }
}

class YtDlpAudioResolver extends AudioResolver {
  async* getYouTubeSearchResults(
    appName: string,
    customSearch?: boolean
  ): AsyncIterable<YouTubeVideoPreview> {
    try {
      const searchTerm = `${encodeURIComponent(appName)}${customSearch ? '' : ' Theme Music'}`
      await call<[string]>('search_yt', searchTerm)
      let result = await call<[], YouTubeVideoPreview | null>('next_yt_result')
      while (result) {
        yield result
        result = await call<[], YouTubeVideoPreview | null>('next_yt_result')
      }
      return
    } catch (err) {
      console.error(err)
    }
    return
  }

  async getAudioUrlFromVideo(video: YouTubeVideo): Promise<string | undefined> {
    if (video.url) {
      return video.url;
    } else {
      // We need to retrieve the audio URL first.
      // This may return a local filesystem URL if the file has been downloaded before.
      const result = await call<[string], string | null>('single_yt_url', video.id)
      return result || undefined;
    }
  }
}

export function getResolver(useYtDlp: boolean): AudioResolver {
  if (useYtDlp) {
    return new YtDlpAudioResolver();
  } else {
    return new InvidiousAudioResolver();
  }
}

type InvidiousInstance = {
  flag: string
  region: string
  stats: {
    version: string
    software: {
      name: string
      version: string
      branch: string
    }
    openRegistrations: boolean
    usage: {
      users: {
        total: number
        activeHalfyear: number
        activeMonth: number
      }
    }
    metadata: {
      updatedAt: number
      lastChannelRefreshedAt: number
    }
    playback?: {
      totalRequests?: number
      successfulRequests?: number
      ratio?: number
    }
  } | null
  cors: boolean | null
  api: boolean | null
  type: string
  uri: string
  monitor: {
    token: string
    url: string
    alias: string
    last_status: number
    uptime: number
    down: boolean
    down_since: string | null
    up_since: string | null
    error: string | null
    period: number
    apdex_t: number
    string_match: string
    enabled: boolean
    published: boolean
    disabled_locations: string[]
    recipients: string[]
    last_check_at: string
    next_check_at: string
    created_at: string
    mute_until: string | null
    favicon_url: string
    custom_headers: Record<string, string>
    http_verb: string
    http_body: string
    ssl: {
      tested_at: string
      expires_at: string
      valid: boolean
      error: string | null
    }
  }
}

type InvidiousInstances = InvidiousInstance[]

export async function getInvidiousInstances(): Promise<
  { name: string; url: string }[]
> {
  try {
    const res = await fetch(
      'https://api.invidious.io/instances.json?&sort_by=users,health'
    )
    if (res.status === 200) {
      const instances: InvidiousInstances = (await res.json()).map(
        ([, instance]: [string, InvidiousInstance]) => instance
      )
      if (instances?.length) {
        return instances
          .filter((ins) => ins.type === 'https')
          .map((ins) => ({
            name: `${ins.flag} ${ins.monitor?.alias ?? ins.uri} | ${ins.stats?.usage.users.total} Users${ins.monitor?.uptime
              ? ` | Uptime: ${(ins.monitor.uptime / 100).toLocaleString(
                'en',
                {
                  style: 'percent'
                }
              )}`
              : ''
              }`,
            url: ins.uri
          }))
      }
    }
  } catch (err) {
    console.debug(err)
  }
  return []
}
