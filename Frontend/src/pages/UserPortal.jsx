import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserPortalLayout from '@/components/user/portal/UserPortalLayout';
import UserHome from './UserHome';
import UserCategoryPage from '@/components/user/portal/UserCategoryPage';
import UserProductFullPage from '@/components/user/portal/UserProductFullPage';

export default function UserPortal() {
  return (
    <Routes>
      <Route element={<UserPortalLayout />}>
        <Route index element={<UserHome />} />
        <Route path="category/:categorySlug" element={<UserCategoryPage />} />
        <Route path="category/:categorySlug/products/:productId" element={<UserProductFullPage />} />
      </Route>
    </Routes>
  );
}
