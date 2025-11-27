import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import AdminLayout from '../components/admin/AdminLayout'
import AdminProducts from '../components/admin/AdminProducts'
import AdminCategories from '../components/admin/AdminCategories'
import AdminInteractions from '../components/admin/AdminInteractions'
import AdminAnalytics from '../components/admin/AdminAnalytics'
import AdminUsers from '../components/admin/AdminUsers'
import AdminAudit from '../components/admin/AdminAudit'
import AdminGraphDebug from '../components/admin/AdminGraphDebug'
import AdminMarketing from '../components/admin/AdminMarketing'

export default function AdminPortal() {
  const location = useLocation()
  
  return (
    <Routes key={location.pathname}>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="products" replace />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="interactions" element={<AdminInteractions />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="marketing" element={<AdminMarketing />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="audit" element={<AdminAudit />} />
        <Route path="graph-debug" element={<AdminGraphDebug />} />
      </Route>
    </Routes>
  )
}
