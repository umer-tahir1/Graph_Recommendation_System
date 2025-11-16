import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { emitClientAuditLog } from '@/api'
import { useAuth } from '../contexts/AuthContext'

const sanitizePayload = (value) => {
  if (value === undefined) return null
  try {
    return JSON.parse(JSON.stringify(value))
  } catch (err) {
    return value ?? null
  }
}

export function useAuditEmitter() {
  const { user } = useAuth()

  const emitAudit = useCallback(async (event, options = {}) => {
    if (!event?.action) {
      console.warn('Audit emitter requires an action string')
      return
    }
    const payload = {
      action: event.action,
      target_type: event.targetType,
      target_id: event.targetId,
      target_display: event.targetDisplay,
      before_state: sanitizePayload(event.before),
      after_state: sanitizePayload(event.after),
      metadata: {
        client_admin_id: user?.id,
        client_admin_email: user?.email,
        client_timestamp: new Date().toISOString(),
        ...event.metadata,
      },
    }

    if (options.localOnly) {
      return
    }

    try {
      await emitClientAuditLog(payload)
    } catch (error) {
      if (!options.silent) {
        toast.error('Unable to send audit hint')
      }
      console.warn('Audit emitter error', error)
    }
  }, [user])

  return { emitAudit }
}
