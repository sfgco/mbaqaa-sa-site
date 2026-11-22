import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { LocaleRoot } from '@/components/layout/LocaleRoot'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { RequireAuth } from '@/components/layout/RequireAuth'

// Public (code-split per route)
const Landing = lazy(() => import('@/routes/public/Landing'))
const Contact = lazy(() => import('@/routes/public/Contact'))
const Page = lazy(() => import('@/routes/public/Page'))
const MediaCenter = lazy(() => import('@/routes/public/MediaCenter'))
const News = lazy(() => import('@/routes/public/News'))
const NewsPost = lazy(() => import('@/routes/public/NewsPost'))
const Gallery = lazy(() => import('@/routes/public/Gallery'))
const Album = lazy(() => import('@/routes/public/Album'))
const Videos = lazy(() => import('@/routes/public/Videos'))
const Faq = lazy(() => import('@/routes/public/Faq'))
const Strategy = lazy(() => import('@/routes/public/Strategy'))
const Governance = lazy(() => import('@/routes/public/Governance'))
const Documents = lazy(() => import('@/routes/public/Documents'))
const DocumentView = lazy(() => import('@/routes/public/DocumentView'))
const Donate = lazy(() => import('@/routes/public/Donate'))
const DonateSuccess = lazy(() => import('@/routes/public/DonateSuccess'))
const DonateClothes = lazy(() => import('@/routes/public/DonateClothes'))
const Volunteer = lazy(() => import('@/routes/public/Volunteer'))
const Partners = lazy(() => import('@/routes/public/Partners'))
const NotFound = lazy(() => import('@/routes/public/NotFound'))

// Admin (lazy, behind RequireAuth)
const AdminLayout = lazy(() => import('@/components/layout/AdminLayout'))
const Login = lazy(() => import('@/routes/admin/Login'))
const Dashboard = lazy(() => import('@/routes/admin/Dashboard'))
const Pages = lazy(() => import('@/routes/admin/Pages'))
const PageEdit = lazy(() => import('@/routes/admin/PageEdit'))
const Posts = lazy(() => import('@/routes/admin/Posts'))
const PostEdit = lazy(() => import('@/routes/admin/PostEdit'))
const AdminGallery = lazy(() => import('@/routes/admin/Gallery'))
const AlbumEdit = lazy(() => import('@/routes/admin/AlbumEdit'))
const AdminVideos = lazy(() => import('@/routes/admin/Videos'))
const Faqs = lazy(() => import('@/routes/admin/Faqs'))
const FaqCategories = lazy(() => import('@/routes/admin/FaqCategories'))
const AdminDocuments = lazy(() => import('@/routes/admin/Documents'))
const DocumentCategories = lazy(() => import('@/routes/admin/DocumentCategories'))
const Navigation = lazy(() => import('@/routes/admin/Navigation'))
const Requests = lazy(() => import('@/routes/admin/Requests'))
const DonationChannels = lazy(() => import('@/routes/admin/DonationChannels'))
const DonationNotifications = lazy(() => import('@/routes/admin/DonationNotifications'))
const Settings = lazy(() => import('@/routes/admin/Settings'))
const Users = lazy(() => import('@/routes/admin/Users'))

function RedirectSlug({ to }: { to: string }) {
  const { slug } = useParams()
  return <Navigate to={`${to}/${slug ?? ''}`} replace />
}

function publicRoutes(prefix: '' | '/en') {
  return (
    <Route path={prefix || '/'} element={<PublicLayout />}>
      <Route index element={<Landing />} />
      <Route path="contact" element={<Contact />} />
      <Route path="pages/:slug" element={<Page />} />
      <Route path="media" element={<MediaCenter />} />
      <Route path="media/news" element={<News />} />
      <Route path="media/news/:slug" element={<NewsPost />} />
      <Route path="media/gallery" element={<Gallery />} />
      <Route path="media/gallery/:slug" element={<Album />} />
      <Route path="media/videos" element={<Videos />} />
      <Route path="faq" element={<Faq />} />
      <Route path="about/strategy" element={<Strategy />} />
      <Route path="about/governance" element={<Governance />} />
      <Route path="documents" element={<Documents />} />
      <Route path="documents/:slug" element={<DocumentView />} />
      <Route path="donate" element={<Donate />} />
      <Route path="donate/success" element={<DonateSuccess />} />
      <Route path="donate/clothes" element={<DonateClothes />} />
      <Route path="volunteer" element={<Volunteer />} />
      <Route path="partners" element={<Partners />} />
      {/* Legacy paths */}
      <Route path="blog" element={<Navigate to={`${prefix}/media/news`} replace />} />
      <Route path="blog/:slug" element={<RedirectSlug to={`${prefix}/media/news`} />} />
      <Route path="gallery" element={<Navigate to={`${prefix}/media/gallery`} replace />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
}

const adminRoute = (el: React.ReactNode, role?: 'admin') => <RequireAuth role={role}>{el}</RequireAuth>

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
      <Routes>
        <Route element={<LocaleRoot />}>
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={adminRoute(<AdminLayout />)}>
            <Route index element={<Dashboard />} />
            <Route path="pages" element={<Pages />} />
            <Route path="pages/:id" element={<PageEdit />} />
            <Route path="posts" element={<Posts />} />
            <Route path="posts/:id" element={<PostEdit />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="gallery/:id" element={<AlbumEdit />} />
            <Route path="videos" element={<AdminVideos />} />
            <Route path="faqs" element={<Faqs />} />
            <Route path="faq-categories" element={<FaqCategories />} />
            <Route path="documents" element={<AdminDocuments />} />
            <Route path="document-categories" element={<DocumentCategories />} />
            <Route path="navigation" element={adminRoute(<Navigation />, 'admin')} />
            <Route path="requests/:type" element={<Requests />} />
            <Route path="donation-channels" element={adminRoute(<DonationChannels />, 'admin')} />
            <Route path="donation-notifications" element={adminRoute(<DonationNotifications />, 'admin')} />
            <Route path="settings" element={adminRoute(<Settings />, 'admin')} />
            <Route path="users" element={adminRoute(<Users />, 'admin')} />
          </Route>
          {publicRoutes('/en')}
          {publicRoutes('')}
        </Route>
      </Routes>
    </Suspense>
  )
}
