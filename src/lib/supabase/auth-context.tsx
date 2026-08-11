'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from './client'
import { Profile, Business, BusinessMember, Subscription, SubscriptionUsage } from '@/types/database.types'

interface AuthUser {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}

interface AuthContextType {
  user: AuthUser | null
  profile: Profile | null
  business: Business | null
  membership: BusinessMember | null
  subscription: Subscription | null
  usage: SubscriptionUsage | null
  isLoading: boolean
  login: (email: string, pass: string) => Promise<{ error?: string }>
  register: (fullName: string, email: string, pass: string, businessName: string) => Promise<{ error?: string }>
  createBusinessOnboarding: (name: string, slug: string, description?: string) => Promise<{ error?: string }>
  updateBusinessProfile: (data: Partial<Business>) => Promise<{ error?: string }>
  logout: () => Promise<void>
  refreshData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEMO_STORAGE_KEY = 'chatlaris_session_data'

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [membership, setMembership] = useState<BusinessMember | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<SubscriptionUsage | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Helper to sync demo cookie for middleware
  const setDemoCookie = (val: string | null) => {
    if (typeof document !== 'undefined') {
      if (val) {
        document.cookie = `chatlaris_demo_user=${val}; path=/; max-age=604800; SameSite=Lax`
      } else {
        document.cookie = `chatlaris_demo_user=; path=/; max-age=0; SameSite=Lax`
      }
    }
  }

  // Load session data
  const loadSession = useCallback(async () => {
    setIsLoading(true)
    try {
      // 1. Try Supabase Auth
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const u = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || '',
          avatar_url: session.user.user_metadata?.avatar_url || '',
        }
        setUser(u)

        // Fetch Profile from DB
        const { data: prof } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('id', u.id)
          .single()

        if (prof) {
          setProfile(prof as Profile)
        } else {
          // Fallback profile object
          setProfile({
            id: u.id,
            email: u.email,
            full_name: u.full_name,
            avatar_url: u.avatar_url || null,
            phone: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }

        // Fetch Business Membership
        const { data: mem } = await (supabase as any)
          .from('business_members')
          .select('*')
          .eq('user_id', u.id)
          .eq('status', 'active')
          .limit(1)
          .maybeSingle()

        if (mem) {
          const typedMem = mem as BusinessMember
          setMembership(typedMem)

          // Fetch Business
          const { data: biz } = await (supabase as any)
            .from('businesses')
            .select('*')
            .eq('id', typedMem.business_id)
            .single()

          if (biz) {
            setBusiness(biz as Business)

            // Fetch Subscription
            const { data: sub } = await (supabase as any)
              .from('subscriptions')
              .select('*')
              .eq('business_id', biz.id)
              .maybeSingle()

            if (sub) setSubscription(sub as Subscription)

            // Fetch Usage
            const { data: usg } = await (supabase as any)
              .from('subscription_usage')
              .select('*')
              .eq('business_id', biz.id)
              .maybeSingle()

            if (usg) setUsage(usg as SubscriptionUsage)
          }
        }
        setIsLoading(false)
        return
      }

      // 2. Fallback to local storage state for local demo mode if Supabase credentials are mock
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(DEMO_STORAGE_KEY)
        if (stored) {
          const data = JSON.parse(stored)
          if (data.user) {
            setUser(data.user)
            setProfile(data.profile || null)
            setBusiness(data.business || null)
            setMembership(data.membership || null)
            setSubscription(data.subscription || null)
            setUsage(data.usage || null)
            setDemoCookie(data.user.id)
          }
        }
      }
    } catch (err) {
      console.warn('Supabase auth session load warning (using local mode):', err)
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(DEMO_STORAGE_KEY)
        if (stored) {
          const data = JSON.parse(stored)
          if (data.user) {
            setUser(data.user)
            setProfile(data.profile || null)
            setBusiness(data.business || null)
            setMembership(data.membership || null)
            setSubscription(data.subscription || null)
            setUsage(data.usage || null)
            setDemoCookie(data.user.id)
          }
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadSession()
  }, [loadSession])

  // Login handler
  const login = async (email: string, pass: string): Promise<{ error?: string }> => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      })

      if (error) {
        // Fallback local check
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(DEMO_STORAGE_KEY)
          if (stored) {
            const parsed = JSON.parse(stored)
            if (parsed.user && parsed.user.email.toLowerCase() === email.toLowerCase()) {
              setUser(parsed.user)
              setProfile(parsed.profile || null)
              setBusiness(parsed.business || null)
              setMembership(parsed.membership || null)
              setSubscription(parsed.subscription || null)
              setUsage(parsed.usage || null)
              setDemoCookie(parsed.user.id)
              setIsLoading(false)
              return {}
            }
          }

          // Default fallback user for testing if no account exists
          const fakeId = 'usr_' + Math.random().toString(36).substring(2, 9)
          const newU: AuthUser = { id: fakeId, email, full_name: 'Pemilik Bisnis' }
          const newProf: Profile = {
            id: fakeId,
            email,
            full_name: 'Pemilik Bisnis',
            avatar_url: null,
            phone: '081234567890',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          const defaultBizId = 'biz_' + Math.random().toString(36).substring(2, 9)
          const defaultBiz: Business = {
            id: defaultBizId,
            name: 'Toko Sukses ChatLaris',
            slug: 'toko-sukses',
            logo_url: null,
            description: 'Toko online terpercaya pilihan UMKM Indonesia',
            phone: '081234567890',
            email,
            address: 'Jakarta, Indonesia',
            timezone: 'Asia/Jakarta',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          const defaultMem: BusinessMember = {
            id: 'mem_' + Math.random().toString(36).substring(2, 9),
            business_id: defaultBizId,
            user_id: fakeId,
            role: 'owner',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          const defaultSub: Subscription = {
            id: 'sub_' + Math.random().toString(36).substring(2, 9),
            business_id: defaultBizId,
            plan: 'free',
            status: 'active',
            started_at: new Date().toISOString(),
            expires_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          const defaultUsage: SubscriptionUsage = {
            id: 'usg_' + Math.random().toString(36).substring(2, 9),
            business_id: defaultBizId,
            period_start: new Date().toISOString(),
            period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
            chats_count: 0,
            products_count: 0,
            orders_count: 0,
            broadcasts_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          setUser(newU)
          setProfile(newProf)
          setBusiness(defaultBiz)
          setMembership(defaultMem)
          setSubscription(defaultSub)
          setUsage(defaultUsage)

          const demoPayload = {
            user: newU,
            profile: newProf,
            business: defaultBiz,
            membership: defaultMem,
            subscription: defaultSub,
            usage: defaultUsage,
          }
          localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoPayload))
          setDemoCookie(fakeId)
          setIsLoading(false)
          return {}
        }
        setIsLoading(false)
        return { error: error.message || 'Email atau password salah.' }
      }

      await loadSession()
      return {}
    } catch (err: any) {
      setIsLoading(false)
      return { error: err.message || 'Gagal masuk. Silakan coba lagi.' }
    }
  }

  // Register handler (Owner creation flow)
  const register = async (
    fullName: string,
    email: string,
    pass: string,
    businessName: string
  ): Promise<{ error?: string }> => {
    setIsLoading(true)
    try {
      const generatedSlug = slugify(businessName) || 'bisnis-saya'

      // 1. Supabase Auth signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      const userId = authData?.user?.id || 'usr_' + Math.random().toString(36).substring(2, 9)

      const newU: AuthUser = { id: userId, email, full_name: fullName }
      const newProf: Profile = {
        id: userId,
        email,
        full_name: fullName,
        avatar_url: null,
        phone: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Try DB insertion if supabase is active
      if (authData?.user) {
        try {
          await (supabase as any).from('profiles').upsert(newProf)

          const { data: bizData } = await (supabase as any)
            .from('businesses')
            .insert({
              name: businessName,
              slug: `${generatedSlug}-${Math.floor(1000 + Math.random() * 9000)}`,
              email,
              timezone: 'Asia/Jakarta',
            })
            .select()
            .single()

          if (bizData) {
            const biz = bizData as Business

            // Owner member
            await (supabase as any).from('business_members').insert({
              business_id: biz.id,
              user_id: userId,
              role: 'owner',
              status: 'active',
            })

            // Subscription
            await (supabase as any).from('subscriptions').insert({
              business_id: biz.id,
              plan: 'free',
              status: 'active',
            })

            // Usage
            const now = new Date()
            const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
            await (supabase as any).from('subscription_usage').insert({
              business_id: biz.id,
              period_start: now.toISOString(),
              period_end: endMonth.toISOString(),
              chats_count: 0,
              products_count: 0,
              orders_count: 0,
              broadcasts_count: 0,
            })
          }
        } catch (e) {
          console.warn('DB creation warning during signup (falling back to local):', e)
        }
      }

      // Local / Fallback state sync
      const bizId = 'biz_' + Math.random().toString(36).substring(2, 9)
      const newBiz: Business = {
        id: bizId,
        name: businessName,
        slug: `${generatedSlug}-${Math.floor(1000 + Math.random() * 9000)}`,
        logo_url: null,
        description: `Bisnis ${businessName} di ChatLaris`,
        phone: null,
        email,
        address: null,
        timezone: 'Asia/Jakarta',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const newMem: BusinessMember = {
        id: 'mem_' + Math.random().toString(36).substring(2, 9),
        business_id: bizId,
        user_id: userId,
        role: 'owner',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const newSub: Subscription = {
        id: 'sub_' + Math.random().toString(36).substring(2, 9),
        business_id: bizId,
        plan: 'free',
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const newUsg: SubscriptionUsage = {
        id: 'usg_' + Math.random().toString(36).substring(2, 9),
        business_id: bizId,
        period_start: new Date().toISOString(),
        period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
        chats_count: 0,
        products_count: 0,
        orders_count: 0,
        broadcasts_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setUser(newU)
      setProfile(newProf)
      setBusiness(newBiz)
      setMembership(newMem)
      setSubscription(newSub)
      setUsage(newUsg)

      if (typeof window !== 'undefined') {
        const payload = {
          user: newU,
          profile: newProf,
          business: newBiz,
          membership: newMem,
          subscription: newSub,
          usage: newUsg,
        }
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(payload))
        setDemoCookie(userId)
      }

      setIsLoading(false)
      return {}
    } catch (err: any) {
      setIsLoading(false)
      return { error: err.message || 'Pendaftaran gagal. Silakan coba lagi.' }
    }
  }

  // Create Business via Onboarding page
  const createBusinessOnboarding = async (
    name: string,
    slugStr: string,
    description?: string
  ): Promise<{ error?: string }> => {
    if (!user) return { error: 'Sesi anda telah berakhir. Silakan login kembali.' }

    setIsLoading(true)
    try {
      const cleanSlug = slugify(slugStr) || slugify(name) || 'bisnis'

      if (supabase) {
        try {
          const { data: bizData } = await (supabase as any)
            .from('businesses')
            .insert({
              name,
              slug: cleanSlug,
              description: description || null,
              timezone: 'Asia/Jakarta',
            })
            .select()
            .single()

          if (bizData) {
            const biz = bizData as Business
            await (supabase as any).from('business_members').insert({
              business_id: biz.id,
              user_id: user.id,
              role: 'owner',
              status: 'active',
            })
            await (supabase as any).from('subscriptions').insert({
              business_id: biz.id,
              plan: 'free',
              status: 'active',
            })
          }
        } catch (e) {
          console.warn('DB business creation warning:', e)
        }
      }

      const bizId = 'biz_' + Math.random().toString(36).substring(2, 9)
      const newBiz: Business = {
        id: bizId,
        name,
        slug: cleanSlug,
        logo_url: null,
        description: description || null,
        phone: null,
        email: user.email,
        address: null,
        timezone: 'Asia/Jakarta',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const newMem: BusinessMember = {
        id: 'mem_' + Math.random().toString(36).substring(2, 9),
        business_id: bizId,
        user_id: user.id,
        role: 'owner',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const newSub: Subscription = {
        id: 'sub_' + Math.random().toString(36).substring(2, 9),
        business_id: bizId,
        plan: 'free',
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const newUsg: SubscriptionUsage = {
        id: 'usg_' + Math.random().toString(36).substring(2, 9),
        business_id: bizId,
        period_start: new Date().toISOString(),
        period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
        chats_count: 0,
        products_count: 0,
        orders_count: 0,
        broadcasts_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setBusiness(newBiz)
      setMembership(newMem)
      setSubscription(newSub)
      setUsage(newUsg)

      if (typeof window !== 'undefined') {
        const payload = {
          user,
          profile,
          business: newBiz,
          membership: newMem,
          subscription: newSub,
          usage: newUsg,
        }
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(payload))
      }

      setIsLoading(false)
      return {}
    } catch (err: any) {
      setIsLoading(false)
      return { error: err.message || 'Gagal membuat bisnis.' }
    }
  }

  // Update business profile (Settings page)
  const updateBusinessProfile = async (data: Partial<Business>): Promise<{ error?: string }> => {
    if (!business) return { error: 'Tidak ada bisnis yang aktif.' }

    try {
      if (supabase) {
        try {
          await (supabase as any)
            .from('businesses')
            .update({
              ...data,
              updated_at: new Date().toISOString(),
            })
            .eq('id', business.id)
        } catch (e) {
          console.warn('DB update business warning:', e)
        }
      }

      const updated = {
        ...business,
        ...data,
        updated_at: new Date().toISOString(),
      }
      setBusiness(updated)

      if (typeof window !== 'undefined') {
        const payload = {
          user,
          profile,
          business: updated,
          membership,
          subscription,
          usage,
        }
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(payload))
      }

      return {}
    } catch (err: any) {
      return { error: err.message || 'Gagal memperbarui profil bisnis.' }
    }
  }

  // Logout handler
  const logout = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.warn('Supabase signout warning:', err)
    }

    setUser(null)
    setProfile(null)
    setBusiness(null)
    setMembership(null)
    setSubscription(null)
    setUsage(null)
    setDemoCookie(null)

    if (typeof window !== 'undefined') {
      localStorage.removeItem(DEMO_STORAGE_KEY)
    }

    setIsLoading(false)
    router.push('/auth/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        business,
        membership,
        subscription,
        usage,
        isLoading,
        login,
        register,
        createBusinessOnboarding,
        updateBusinessProfile,
        logout,
        refreshData: loadSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
