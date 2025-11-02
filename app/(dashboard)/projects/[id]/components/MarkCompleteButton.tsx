'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { markProjectComplete, markProjectActive } from '../actions'
import { toast } from 'sonner'
import { CheckCircle, RotateCcw } from 'lucide-react'

interface MarkCompleteButtonProps {
  projectId: string
  currentStatus: string
  isFreelancer: boolean
}

export function MarkCompleteButton({ projectId, currentStatus, isFreelancer }: MarkCompleteButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleMarkComplete = async () => {
    setIsLoading(true)
    try {
      const result = await markProjectComplete(projectId)
      if (result.success) {
        toast.success(result.message)
        // Refresh the page to update the UI
        window.location.reload()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Fehler beim Abschließen des Projekts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkActive = async () => {
    setIsLoading(true)
    try {
      const result = await markProjectActive(projectId)
      if (result.success) {
        toast.success(result.message)
        // Refresh the page to update the UI
        window.location.reload()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Fehler beim Aktualisieren des Projektstatus')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isFreelancer) {
    return null
  }

  if (currentStatus === 'completed') {
    return (
      <Button
        onClick={handleMarkActive}
        disabled={isLoading}
        variant="outline"
        className="flex items-center gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        {isLoading ? 'Wird aktualisiert...' : 'Als aktiv markieren'}
      </Button>
    )
  }

  return (
    <Button
      onClick={handleMarkComplete}
      disabled={isLoading}
      variant="default"
      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
    >
      <CheckCircle className="h-4 w-4" />
      {isLoading ? 'Wird abgeschlossen...' : 'Als abgeschlossen markieren'}
    </Button>
  )
}
