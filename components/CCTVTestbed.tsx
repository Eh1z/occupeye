'use client'

import { useRef, useState, useEffect } from 'react'
import { useObjectDetection, type DetectionPrediction } from '@/hooks/useObjectDetection'
import { LectureHall } from '@/lib/store/useRoomStore'
import { AlertCircle, Upload, Loader2, Camera, Lightbulb, Clock, Zap, Sparkles, FileText } from 'lucide-react'
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
    <div className="flex flex-col gap-4 rounded-lg border-2 border-slate-300 bg-white p-6 shadow-md dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-slate-900 dark:text-slate-50" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Upload Photo</h3>
        </div>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">
          {room.name}
        </span>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-3 rounded-lg border-3 border-dashed py-16 transition-all ${isDragging
          ? 'border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-900/20'
          : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-blue-400 dark:hover:bg-slate-800/50'
          } cursor-pointer`}
      >
        <Upload className="h-12 w-12 text-slate-400" />
        <div className="text-center">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {imageFile ? `✓ ${imageFile.name}` : 'Drag photo here or click to browse'}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Any image with people (classroom, meeting, crowd, etc.)</p>
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
            onLoad={() => console.log('Image loaded for detection')}
          />
          <canvas
            ref={canvasRef}
            className="absolute left-0 top-0 rounded-lg"
          />
        </div>
      )}

      {/* Detection Result */}
      {detectionResult && (
        <div className="rounded-lg bg-green-100 p-4 dark:bg-green-900/30">
          <p className="text-sm font-bold text-green-700 dark:text-green-300">
            Success! Detected: <span className="text-2xl">{detectionResult.count}</span> persons in the full image
          </p>
          {detectionResult.count > 0 && (
            <p className="mt-2 text-sm font-medium text-green-700 dark:text-green-300">
              This classroom is occupied and a lecture is ongoing.
            </p>
          )}
        </div>
      )}

      {/* Error States */}
      {detectionError && (
        <div className="rounded-lg bg-yellow-100 p-4 dark:bg-yellow-900/30">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Model Loading...</p>
              <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">{detectionError}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
                <Lightbulb className="h-4 w-4" />
                This usually takes 30-60 seconds on first load. Please wait...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {!isReady && !detectionError && (
        <div className="rounded-lg bg-blue-100 p-4 dark:bg-blue-900/30">
          <div className="flex gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Loading AI Model...</p>
              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                Initializing computer vision model on first use. This may take a minute...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detect Button */}
      <Button
        onClick={handleDetect}
        disabled={!previewUrl || !isReady || isProcessing}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-400"
        size="lg"
      >
        {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isReady && !previewUrl ? (
          <>
            <Clock className="mr-2 h-4 w-4" />
            Loading AI...
          </>
        ) : !previewUrl ? (
          <>
            <Camera className="mr-2 h-4 w-4" />
            Upload Photo First
          </>
        ) : isProcessing ? (
          <>
            <Zap className="mr-2 h-4 w-4" />
            Analyzing Photo...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Detect Occupants
          </>
        )}
      </Button>

      {/* Helper Text */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
          <FileText className="h-4 w-4" />
          What happens:
        </div>
        <ol className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
          <li>1. AI scans the full photo for people</li>
          <li>2. Shows green boxes around every detected person</li>
          <li>3. Counts groups larger than four and updates occupancy</li>
          <li>4. Uses full image analysis to detect crowded rooms reliably</li>
        </ol>
      </div>
    </div>
  )
}
