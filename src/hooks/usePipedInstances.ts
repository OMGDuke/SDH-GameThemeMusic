import { ServerAPI } from 'decky-frontend-lib'
import { useEffect, useState } from 'react'

import { getPipedInstances } from '../actions/audio'

const usePipedInstances = (serverAPI: ServerAPI) => {
  const [instances, setInstances] = useState<
    {
      name: string
      url: string
    }[]
  >([])

  const [instancesLoading, setInstancesLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    async function getData() {
      setInstancesLoading(true)
      const instanceList = await getPipedInstances(serverAPI)
      if (ignore) {
        return
      }
      setInstancesLoading(false)
      return setInstances(instanceList)
    }
    getData()
    return () => {
      ignore = true
    }
  }, [])

  return {
    instances,
    instancesLoading
  }
}

export default usePipedInstances
