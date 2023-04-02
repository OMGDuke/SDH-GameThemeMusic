import { ServerAPI } from 'decky-frontend-lib'

type YouTubeInitialData = {
  contents: {
    twoColumnSearchResultsRenderer: {
      primaryContents: {
        sectionListRenderer: {
          contents: {
            itemSectionRenderer: {
              contents: {
                videoRenderer: {
                  title: { runs: { text: string }[] }
                  videoId: string
                }
              }[]
            }
          }[]
        }
      }
    }
  }
}

async function getYouTubeSearchResults(
  serverAPI: ServerAPI,
  appName: string
): Promise<{ title: string; videoId: string } | undefined> {
  const req = {
    method: 'GET',
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
      appName
    )}%20Theme%20Music`
  }
  const res = await serverAPI.callServerMethod<
    { method: string; url: string },
    { body: string; status: number }
  >('http_request', req)
  if (res.success && res.result.status === 200) {
    const regex = /ytInitialData\s*=\s*({.*?});/
    const match = res.result.body.match(regex)

    if (match) {
      const ytInitialData: YouTubeInitialData = JSON.parse(match[1])
      const results: { title: string; videoId: string }[] | undefined =
        ytInitialData?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents
          ?.find(
            (obj) =>
              Object.prototype.hasOwnProperty.call(
                obj,
                'itemSectionRenderer'
              ) &&
              obj?.itemSectionRenderer?.contents?.[0] &&
              obj?.itemSectionRenderer?.contents?.filter((vidObj) =>
                Object.prototype.hasOwnProperty.call(vidObj, 'videoRenderer')
              )?.length
          )
          ?.itemSectionRenderer?.contents?.filter((obj) =>
            Object.prototype.hasOwnProperty.call(obj, 'videoRenderer')
          )
          .map((res) => ({
            title: res?.videoRenderer?.title?.runs?.[0]?.text,
            videoId: res?.videoRenderer?.videoId
          }))
          .filter(
            (res: { title: string; videoId: string }) => res.videoId?.length
          )
      return results?.[0]
    } else {
      return undefined
    }
  }
  return undefined
}

async function getAudioUrlFromVideoId(
  serverAPI: ServerAPI,
  videoId: string
): Promise<string | undefined> {
  const req = {
    method: 'GET',
    url: `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`
  }
  const res = await serverAPI.callServerMethod<
    { method: string; url: string },
    { body: string; status: number }
  >('http_request', req)
  if (res.success && res.result.status === 200) {
    const configJsonMatch = res.result.body.match(
      /ytInitialPlayerResponse\s*=\s*({.+?})\s*;/
    )
    if (!configJsonMatch) {
      throw new Error('Failed to extract player response')
    }

    const configJson = JSON.parse(configJsonMatch[1])
    const streamMap = configJson.streamingData.adaptiveFormats.filter(
      (f: { mimeType: string }) => f.mimeType.startsWith('audio/')
    )[0]

    const signature = streamMap?.signatureCipher
      ? streamMap.signatureCipher
          .split('&')
          .find((s: string) => s.startsWith('s='))
          .substr(2)
      : undefined
    const url = streamMap?.url
      ? `${streamMap.url}&${signature ? `sig=${signature}` : 'ratebypass=yes'}`
      : undefined
    return url
  }
  return undefined
}

export async function getAudio(
  serverAPI: ServerAPI,
  appName: string
): Promise<string | undefined> {
  const video = await getYouTubeSearchResults(serverAPI, appName)
  if (video?.videoId) {
    return getAudioUrlFromVideoId(serverAPI, video.videoId)
  }
  return undefined
}
