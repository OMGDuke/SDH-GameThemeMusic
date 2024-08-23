import { useEffect, useState } from 'react'

import { getPipedInstances } from '../actions/audio'

const usePipedInstances = () => {
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
      const instanceList = await getPipedInstances()
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
