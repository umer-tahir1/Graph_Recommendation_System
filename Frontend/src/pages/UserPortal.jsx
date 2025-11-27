import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import UserPortalLayout from '@/components/user/portal/UserPortalLayout'
import UserPortalIndexRedirect from '@/components/user/portal/UserPortalIndexRedirect'
import UserCategoryPage from '@/components/user/portal/UserCategoryPage'
import UserProductFullPage from '@/components/user/portal/UserProductFullPage'

export default function UserPortal() {
  const location = useLocation()
  
  return (
    <Routes key={location.pathname}>
      <Route element={<UserPortalLayout />}>
        <Route index element={<UserPortalIndexRedirect />} />
        <Route path="category/:categorySlug" element={<UserCategoryPage />} />
        <Route path="category/:categorySlug/products/:productId" element={<UserProductFullPage />} />
      </Route>
    </Routes>
  )
}
