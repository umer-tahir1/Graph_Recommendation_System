import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function UserPortalIndexRedirect() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to the first hardcoded category
    navigate('/portal/category/laptops', { replace: true })
  }, [navigate])

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-200">
      Redirecting to catalog...
    </div>
  )
}
