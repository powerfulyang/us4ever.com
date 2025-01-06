'use client'

import { trackRequestProgress } from '@/lib/fetch'
import React, { useRef, useState } from 'react'

export function DuplexStreaming() {
  const [isUploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [response, setResponse] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)

    // Create request object with upload progress tracking
    const request = new Request('/api/upload', {
      method: 'POST',
      body: formData,
    })

    try {
      setUploading(true)
      // Use trackRequestProgress to wrap request and add progress listener
      const trackedRequest = await trackRequestProgress(request, (event) => {
        // event.loaded represents uploaded bytes
        // event.total represents total file size in bytes
        const progress = Math.round((event.loaded / event.total) * 100)
        setUploadProgress(progress)
      })

      const result = await window.fetch(trackedRequest)
      const data = await result.json()
      setResponse(JSON.stringify(data, null, 2))
    }
    catch (error) {
      console.error('Upload failed:', error)
    }
    finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">File Upload Progress Demo - Using Fetch Duplex Streaming</h1>

      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Choose File
          </button>
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600">
              Selected:
              {selectedFile.name}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-300"
        >
          Start Upload
        </button>

        {uploadProgress > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Upload Progress:
              {uploadProgress}
              %
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              >
              </div>
            </div>
          </div>
        )}

        {response && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h3 className="font-medium mb-2">Server Response:</h3>
            <pre className="text-sm whitespace-pre-wrap">{response}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
