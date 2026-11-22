import { Route, Routes } from 'react-router'
import { AdminLayout } from '@/components/admin/AdminLayout'
import NotFound from '@/pages/public/NotFound'
import { AlbumEditor, AlbumsList } from './Albums'
import Channels from './Channels'
import Dashboard from './Dashboard'
import Documents from './Documents'
import Faqs from './Faqs'
import { ContactPage, DonationsPage, RequestsPage } from './Inboxes'
import Login from './Login'
import { PostEditor, PostsList } from './Posts'
import Settings from './Settings'
import Users from './Users'

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="requests/:type" element={<RequestsPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="donations" element={<DonationsPage />} />
        <Route path="channels" element={<Channels />} />
        <Route path="posts" element={<PostsList />} />
        <Route path="posts/:id" element={<PostEditor />} />
        <Route path="faqs" element={<Faqs />} />
        <Route path="documents" element={<Documents />} />
        <Route path="albums" element={<AlbumsList />} />
        <Route path="albums/:id" element={<AlbumEditor />} />
        <Route path="settings" element={<Settings />} />
        <Route path="users" element={<Users />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
