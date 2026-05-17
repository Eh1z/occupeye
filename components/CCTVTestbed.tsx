'use client'

import { useRef, useState, useEffect } from 'react'
import { useObjectDetection, type DetectionPrediction } from '@/hooks/useObjectDetection'
import { LectureHall } from '@/lib/store/useRoomStore'
import { AlertCircle, Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CCTVTestbedProps {
  room: LectureHall
  onDetectionComplete: (occupantCount: number) => void
}

export default function CCTVTestbed({ room, onDetectionComplete }: CCTVTestbedProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [detectionResult, setDetectionResult] = useState<{ count: number; predictions: DetectionPrediction[] } | null>(
    null
  )

  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { isReady, detectOccupants, error: detectionError } = useObjectDetection()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        handleImageFile(file)
      }
    }
  }

  const handleImageFile = (file: File) => {
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewUrl(e.target.result as string)
        setDetectionResult(null)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageFile(e.target.files[0])
    }
  }

  const handleDetect = async () => {
    if (!imageRef.current || !isReady) return

    try {
      setIsProcessing(true)
      const result = await detectOccupants(imageRef.current)

      setDetectionResult({
        count: result.personCount,
        predictions: result.predictions,
      })

      // Draw bounding boxes on canvas
      if (canvasRef.current && imageRef.current) {
        drawBoundingBoxes(result.predictions)
      }

      onDetectionComplete(result.personCount)
    } catch (err) {
      console.error('Detection failed:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const drawBoundingBoxes = (predictions: DetectionPrediction[]) => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    canvas.width = img.width
    canvas.height = img.height

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    predictions.forEach((pred) => {
      const [x, y, width, height] = pred.bbox

      // Draw rectangle
      ctx.strokeStyle = '#22c55e'
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, width, height)

      // Draw semi-transparent fill
      ctx.fillStyle = 'rgba(34, 197, 94, 0.1)'
      ctx.fillRect(x, y, width, height)

      // Draw score label
      ctx.fillStyle = '#22c55e'
      ctx.font = 'bold 12px sans-serif'
      ctx.fillText(`${(pred.score * 100).toFixed(0)}%`, x, y - 5)
    })
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-black">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">CCTV Test Module</h3>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-200">
          {room.name}
        </span>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed py-12 transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
            : 'border-zinc-300 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900/50 dark:hover:bg-zinc-900'
        } cursor-pointer`}
      >
        <Upload className="h-8 w-8 text-zinc-400" />
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {imageFile ? imageFile.name : 'Drop CCTV image or click to upload'}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">PNG, JPG, GIF up to 10MB</p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Image Preview */}
      {previewUrl && (
        <div className="relative">
          <img
            ref={imageRef}
            src={previewUrl}
            alt="Preview"
            className="w-full rounded-lg object-contain"
            style={{ maxHeight: '400px' }}
          />
          <canvas
            ref={canvasRef}
            className="absolute left-0 top-0 rounded-lg"
          />
        </div>
      )}

      {/* Detection Result */}
      {detectionResult && (
        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm font-medium text-green-700 dark:text-green-300">
            ✓ Detection Complete: <span className="text-lg font-bold">{detectionResult.count}</span> persons detected
          </p>
        </div>
      )}

      {/* Error States */}
      {detectionError && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-300">{detectionError}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {!isReady && (
        <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
          <div className="flex gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-700 dark:text-amber-300">Loading AI model...</p>
          </div>
        </div>
      )}

      {/* Detect Button */}
      <Button
        onClick={handleDetect}
        disabled={!previewUrl || !isReady || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isProcessing ? 'Analyzing...' : 'Detect Occupants'}
      </Button>
    </div>
  )
}
