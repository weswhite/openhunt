import { useState, useEffect } from 'react'
import { api } from '../api/client'

export interface HuntCode {
  code: string
  species: string
  species_name: string
  sex_name: string
  gmu: string
  season_name: string
  method_name: string
}

export interface DrawResult {
  id: number
  hunt_code: string
  year: number
  residency: string
  total_quota: number | null
  resident_quota: number | null
  landowner_quota: number | null
  nonresident_quota: number | null
  youth_quota: number | null
  first_choice: number | null
  second_choice: number | null
  third_choice: number | null
  fourth_choice: number | null
  total_drawn: number | null
  drawn_out_at: number | null
}

export interface PointDist {
  id: number
  hunt_code: string
  year: number
  residency: string
  points: number
  applicants: number
  drawn: number
}

export interface HuntDetail {
  hunt: HuntCode
  drawResults: DrawResult[]
  pointDistributions: PointDist[]
}

export function useHuntDetail(code: string) {
  const [data, setData] = useState<HuntDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    api<HuntDetail>(`/api/hunts/${code}`)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [code])

  return { data, loading, error }
}
