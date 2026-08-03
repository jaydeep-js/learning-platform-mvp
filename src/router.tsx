import { createBrowserRouter, Outlet, ScrollRestoration } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import IconSprite from './components/icons/IconSprite'
import AppLayout from './components/layout/AppLayout'
import { ToastProvider } from './components/ui/Toast'
import { AuthProvider } from './features/auth/AuthProvider'
import HomePage from './features/catalog/HomePage'
import CategoriesPage from './features/catalog/CategoriesPage'
import CategoryPage from './features/catalog/CategoryPage'
import SubcategoryPage from './features/catalog/SubcategoryPage'
import TopicPage from './features/catalog/TopicPage'
import LessonPage from './features/catalog/LessonPage'
import SearchPage from './features/catalog/SearchPage'
import NotFoundPage from './features/catalog/NotFoundPage'
import AuthPage from './features/auth/AuthPage'
import AdminLoginPage from './features/auth/AdminLoginPage'
import ProfilePage from './features/auth/ProfilePage'
import DashboardPage from './features/learning/DashboardPage'

/* Root: sprite + providers render once, above every layout. */
function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <IconSprite />
          <Outlet />
          <ScrollRestoration />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

/* The /admin subtree is lazy-loaded so the learner bundle never ships admin code. */
export const router = createBrowserRouter([
  {
    Component: Root,
    children: [
      {
        Component: AppLayout,
        children: [
          { index: true, Component: HomePage },
          { path: 'categories', Component: CategoriesPage },
          { path: 'categories/:categorySlug', Component: CategoryPage },
          { path: 'categories/:categorySlug/:subcategorySlug', Component: SubcategoryPage },
          { path: 'topics/:topicSlug', Component: TopicPage },
          { path: 'topics/:topicSlug/lessons/:n', Component: LessonPage },
          { path: 'search', Component: SearchPage },
          { path: 'dashboard', Component: DashboardPage },
          { path: 'profile', Component: ProfilePage },
          { path: '*', Component: NotFoundPage },
        ],
      },
      { path: 'auth', Component: AuthPage },
      { path: 'auth/reset', lazy: async () => ({ Component: (await import('./features/auth/ResetPasswordPage')).default }) },
      { path: 'admin/login', Component: AdminLoginPage },
      {
        path: 'admin',
        lazy: async () => ({ Component: (await import('./features/auth/RequireAdmin')).default }),
        children: [
          {
            lazy: async () => ({ Component: (await import('./components/layout/AdminLayout')).default }),
            children: [
              { index: true, lazy: async () => ({ Component: (await import('./features/admin/AdminDashboardPage')).default }) },
              { path: 'categories', lazy: async () => ({ Component: (await import('./features/admin/AdminCategoriesPage')).default }) },
              { path: 'subcategories', lazy: async () => ({ Component: (await import('./features/admin/AdminSubcategoriesPage')).default }) },
              { path: 'topics', lazy: async () => ({ Component: (await import('./features/admin/AdminTopicsPage')).default }) },
              { path: 'topics/new', lazy: async () => ({ Component: (await import('./features/admin/TopicEditorPage')).default }) },
              { path: 'topics/:topicSlug/edit', lazy: async () => ({ Component: (await import('./features/admin/TopicEditorPage')).default }) },
            ],
          },
        ],
      },
    ],
  },
])
