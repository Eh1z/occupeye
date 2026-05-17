'use client'

import { useEffect, useRef, useState } from 'react'
import * as tf from '@tensorflow/tfjs'
import * as cocoSsd from '@tensorflow-models/coco-ssd'

export interface DetectionPrediction {
  class: string
  score: number
  bbox: [number, number, number, number]
}

export interface DetectionResult {
  predictions: DetectionPrediction[]
  personCount: number
}

interface UseObjectDetectionReturn {
  isLoading: boolean
  isReady: boolean
  error: string | null
  detectOccupants: (imageElement: HTMLImageElement | HTMLCanvasElement) => Promise<DetectionResult>
}

export function useObjectDetection(): UseObjectDetectionReturn {
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load the COCO-SSD model
        const model = await cocoSsd.load()
        modelRef.current = model
        setIsReady(true)
        setIsLoading(false)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load detection model'
        setError(errorMessage)
        setIsLoading(false)
      }
    }

    loadModel()

    return () => {
      if (modelRef.current) {
        modelRef.current.dispose?.()
      }
    }
  }, [])

  const detectOccupants = async (imageElement: HTMLImageElement | HTMLCanvasElement): Promise<DetectionResult> => {
    if (!modelRef.current) {
      throw new Error('Model not loaded yet')
    }

    try {
      const predictions = await modelRef.current.detect(imageElement as HTMLImageElement)

      // Filter for person class and score > 0.45
      const personPredictions = predictions
        .filter((pred) => pred.class === 'person' && pred.score > 0.45)
        .map((pred) => ({
          class: pred.class,
          score: pred.score,
          bbox: pred.bbox as [number, number, number, number],
        }))

      return {
        predictions: personPredictions,
        personCount: personPredictions.length,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Detection failed'
      throw new Error(`Detection error: ${errorMessage}`)
    }
  }

  return {
    isLoading,
    isReady,
    error,
    detectOccupants,
  }
}
