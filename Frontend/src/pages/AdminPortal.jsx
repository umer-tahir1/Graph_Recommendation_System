import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from '../components/admin/AdminLayout'
import AdminProducts from '../components/admin/AdminProducts'
import AdminCategories from '../components/admin/AdminCategories'
import AdminInteractions from '../components/admin/AdminInteractions'
import AdminAnalytics from '../components/admin/AdminAnalytics'
import AdminUsers from '../components/admin/AdminUsers'
import AdminAudit from '../components/admin/AdminAudit'
import AdminGraphDebug from '../components/admin/AdminGraphDebug'

export default function AdminPortal() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="products" replace />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="interactions" element={<AdminInteractions />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="audit" element={<AdminAudit />} />
        <Route path="graph-debug" element={<AdminGraphDebug />} />
      </Route>
    </Routes>
  )
}
