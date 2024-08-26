import { useEffect, useState } from 'react'

import { getInvidiousInstances } from '../actions/audio'

const useInvidiousInstances = () => {
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
      const instanceList = await getInvidiousInstances()
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

export default useInvidiousInstances
