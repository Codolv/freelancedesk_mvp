"use client"

import { useEffect, useState } from "react"
import { useToast } from "./use-toast"

export function ToastComponent() {
  const { toasts, dismiss } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || toasts.length === 0) return null

  const toast = toasts[0]

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`rounded-lg border p-4 shadow-lg ${
        toast.variant === "destructive" 
          ? "border-red-200 bg-red-50 text-red-900" 
          : "border-gray-200 bg-white text-gray-900"
      }`}>
        <div className="flex items-start justify-between">
          <div>
            {toast.title && (
              <h3 className="font-semibold">{toast.title}</h3>
            )}
            {toast.description && (
              <p className="text-sm mt-1">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => dismiss()}
            className="ml-4 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
