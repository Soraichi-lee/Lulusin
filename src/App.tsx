import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ChatMessage,
  ChatThread,
  INITIAL_CHATS,
  INITIAL_POINT_HISTORY,
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  INITIAL_WTB_REQUESTS,
  PointHistoryEntry,
  ProductItem,
  ScreenId,
  TransactionRecord,
  TransactionType,
  UMKM_PARTNERS,
  UMKM_VOUCHERS,
  UmkmVoucher,
  WtbRequest,
} from './data/lulusinData'
import { Navbar } from './components/Navbar'
import { AuthScreens } from './screens/AuthScreens'
import { BerandaScreen } from './screens/BerandaScreen'
import { PencarianScreen } from './screens/PencarianScreen'
import { DetailBarangScreen } from './screens/DetailBarangScreen'
import { ChatScreen } from './screens/ChatScreen'
import { PasangBarangScreen } from './screens/PasangBarangScreen'
import { AturCodScreen } from './screens/AturCodScreen'
import { PapanWtbScreen } from './screens/PapanWtbScreen'
import { EcoPointsScreen } from './screens/EcoPointsScreen'
import { TransaksiScreen } from './screens/TransaksiScreen'
import { UmkmKampusScreen } from './screens/UmkmKampusScreen'
import { SorotBarangScreen } from './screens/SorotBarangScreen'
import * as api from './lib/api'
import { KtmStatusBanner } from './components/KtmStatusBanner'
import { isBackendEnabled, supabase } from './lib/supabase'

const AUTO_REPLIES = [
  'Siap kak, masih ada kok.',
  'Boleh kak, nanti kabari jamnya ya.',
  'Oke kak, aku bisa COD di perpus pusat.',
  'Bisa nego tipis kak, langsung atur COD aja.',
]

const todayLabel = () => {
  const d = new Date()
  return `${d.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][d.getMonth()]}`
}
const nowTime = () => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`
}


// ---- Penyimpanan chat di browser (sementara, sebelum ada backend) ----
const CHATS_STORAGE_KEY = 'lulusin:chats:v1'

const loadChats = (): ChatThread[] => {
  try {
    const raw = window.localStorage.getItem(CHATS_STORAGE_KEY)
    if (!raw) return INITIAL_CHATS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0
      ? (parsed as ChatThread[])
      : INITIAL_CHATS
  } catch {
    return INITIAL_CHATS
  }
}

const saveChats = (chats: ChatThread[]) => {
  try {
    window.localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats))
  } catch {
    // Kuota penuh (biasanya karena banyak foto): simpan tanpa gambar.
    try {
      const slim = chats.map((t) => ({
        ...t,
        messages: t.messages.map(({ imageUrl: _drop, ...m }) => m),
      }))
      window.localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(slim))
    } catch {
      /* penyimpanan tidak tersedia, abaikan */
    }
  }
}

export default function App() {
  const [screen, setScreen] = useState<ScreenId>('masuk')
  const [history, setHistory] = useState<ScreenId[]>([])
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS)
  const [wishlist, setWishlist] = useState<string[]>([])
  const [chats, setChats] = useState<ChatThread[]>(loadChats)
  const [activeThreadId, setActiveThreadId] = useState('thread-nadia')

  // ---- Status backend (Supabase) ----
  const [authReady, setAuthReady] = useState(!isBackendEnabled)
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<api.Profile | null>(null)
  const [ktmNim, setKtmNim] = useState('')
  const chatsRef = useRef(chats)
  const activeThreadIdRef = useRef(activeThreadId)
  const screenRef = useRef(screen)
  chatsRef.current = chats
  activeThreadIdRef.current = activeThreadId
  screenRef.current = screen
  const [transactions, setTransactions] =
    useState<TransactionRecord[]>(INITIAL_TRANSACTIONS)
  const [wtb, setWtb] = useState<WtbRequest[]>(INITIAL_WTB_REQUESTS)
  const [ecoPoints, setEcoPoints] = useState(1250)
  const [pointHistory, setPointHistory] =
    useState<PointHistoryEntry[]>(INITIAL_POINT_HISTORY)
  const [selectedProductId, setSelectedProductId] = useState(
    'kalkulator-casio-991',
  )
  const [codProductId, setCodProductId] = useState('kalkulator-casio-991')
  const [sorotProductId, setSorotProductId] = useState('sepeda-lipat')
  const [searchQuery, setSearchQuery] = useState('kalkulator')
  const [searchType, setSearchType] = useState<TransactionType | 'Semua'>(
    'Semua',
  )
  const [searchKey, setSearchKey] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3200)
  }, [])

  const navigate = useCallback(
    (next: ScreenId) => {
      setHistory((h) => (screen === next ? h : [...h, screen]))
      setScreen(next)
    },
    [screen],
  )

  const goBack = () => {
    setHistory((h) => {
      const prev = h[h.length - 1]
      setScreen(prev ?? 'beranda')
      return h.slice(0, -1)
    })
  }

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [screen, selectedProductId])

  const findProduct = (id: string) =>
    products.find((p) => p.id === id) ?? products[0]

  const addPoints = (delta: number, title: string) => {
    setEcoPoints((p) => p + delta)
    setPointHistory((h) => [
      { id: `ph-${Date.now()}`, title, date: todayLabel(), delta },
      ...h,
    ])
  }

  const selectProduct = (p: ProductItem) => {
    setSelectedProductId(p.id)
    navigate('detail-barang')
  }

  const toggleWishlist = (id: string) => {
    setWishlist((w) => {
      const has = w.includes(id)
      showToast(has ? 'Dihapus dari favorit.' : 'Disimpan ke favorit.')
      return has ? w.filter((x) => x !== id) : [...w, id]
    })
  }

  const openChatWithSeller = (product: ProductItem) => {
    if (isBackendEnabled && api.UUID_RE.test(product.seller.id)) {
      void openRealChat(product)
      return
    }
    const existing = chats.find((t) => t.partner.id === product.seller.id)
    if (existing) {
      setChats((cs) =>
        cs.map((t) =>
          t.id === existing.id
            ? { ...t, attachedProductId: product.id, unreadCount: 0 }
            : t,
        ),
      )
      setActiveThreadId(existing.id)
    } else {
      const id = `thread-${product.seller.id}`
      setChats((cs) => [
        {
          id,
          partner: product.seller,
          onlineStatus: `Online · ${product.seller.faculty}`,
          unreadCount: 0,
          lastTime: nowTime(),
          attachedProductId: product.id,
          messages: [],
        },
        ...cs,
      ])
      setActiveThreadId(id)
    }
    navigate('chat')
  }

  useEffect(() => {
    // Percakapan asli (id 'c-...') disimpan server, bukan di browser.
    saveChats(chats.filter((t) => !t.id.startsWith('c-')))
  }, [chats])

  const sendMessage = (threadId: string, text: string, imageUrl?: string) => {
    if (threadId.startsWith('c-')) {
      void sendRealMessage(threadId, text, imageUrl)
      return
    }
    const time = nowTime()
    setChats((cs) =>
      cs.map((t) =>
        t.id === threadId
          ? {
              ...t,
              lastTime: time,
              messages: [
                ...t.messages,
                {
                  id: `m-${Date.now()}`,
                  sender: 'me',
                  text: text || undefined,
                  imageUrl,
                  time,
                },
              ],
            }
          : t,
      ),
    )
    window.setTimeout(() => {
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)]
      setChats((cs) =>
        cs.map((t) =>
          t.id === threadId
            ? {
                ...t,
                lastTime: nowTime(),
                messages: [
                  ...t.messages,
                  {
                    id: `r-${Date.now()}`,
                    sender: 'them',
                    text: reply,
                    time: nowTime(),
                  },
                ],
              }
            : t,
        ),
      )
    }, 1400)
  }

  const openAturCod = (product: ProductItem) => {
    setCodProductId(product.id)
    navigate('atur-cod')
  }

  const confirmCod: Parameters<typeof AturCodScreen>[0]['onConfirmCod'] = ({
    product,
    spotName,
    dayShort,
    dayFull,
    dateNum,
    time,
    paymentMethod,
    agreedPriceLabel,
  }) => {
    const firstName = product.seller.name.split(' ')[0]
    const thread = chats.find((t) => t.partner.id === product.seller.id)
    const threadId = thread?.id ?? `thread-${product.seller.id}`
    const invite = {
      id: `cod-${Date.now()}`,
      sender: 'me' as const,
      time: nowTime(),
      codInvite: {
        dateLabel: `${dayFull}, ${dateNum} Nov · ${time}`,
        location: spotName,
        priceAndMethod: `${agreedPriceLabel} · ${paymentMethod.startsWith('Tunai') ? 'Tunai' : 'QRIS'}`,
        statusNote: `Menunggu jawaban ${firstName}…`,
      },
    }
    setChats((cs) =>
      thread
        ? cs.map((t) =>
            t.id === threadId
              ? { ...t, lastTime: nowTime(), messages: [...t.messages, invite] }
              : t,
          )
        : [
            {
              id: threadId,
              partner: product.seller,
              onlineStatus: `Online · ${product.seller.faculty}`,
              unreadCount: 0,
              lastTime: nowTime(),
              attachedProductId: product.id,
              messages: [invite],
            },
            ...cs,
          ],
    )

    const banner = `${dayShort}, ${dateNum} Nov · ${time} · ${spotName}`
    setTransactions((ts) => {
      const existing = ts.find(
        (t) =>
          t.productId === product.id &&
          t.role === 'Pembelian' &&
          t.status !== 'Selesai' &&
          t.status !== 'Dibatalkan',
      )
      if (existing) {
        return ts.map((t) =>
          t.id === existing.id
            ? {
                ...t,
                status: 'COD dijadwalkan',
                stepIndex: 2,
                codBannerText: banner,
                scheduleOrNote: banner,
                paymentMethod,
                finalPrice: agreedPriceLabel,
              }
            : t,
        )
      }
      return [
        {
          id: `trx-${Date.now()}`,
          code: `#TRX-${String(Math.floor(1000 + Math.random() * 8999))}`,
          role: 'Pembelian',
          productId: product.id,
          title: product.title,
          subtitle: `${agreedPriceLabel} · dari ${product.seller.name}`,
          scheduleOrNote: banner,
          status: 'COD dijadwalkan',
          stepIndex: 2,
          codBannerText: banner,
          paymentMethod,
          originalPrice: product.priceLabel,
          finalPrice: agreedPriceLabel,
          partnerThreadId: threadId,
        },
        ...ts,
      ]
    })
    showToast(`Ajakan COD terkirim ke ${product.seller.name}!`)
    navigate('transaksi')
  }

  // =====================================================================
  // Backend (Supabase): sesi, profil, barang, dan chat sungguhan
  // =====================================================================
  const applyThreads = useCallback((threads: ChatThread[]) => {
    setChats((cs) => {
      const prev = new Map<string, ChatThread>(cs.map((t) => [t.id, t]))
      const real = threads.map((t) => ({
        ...t,
        unreadCount: prev.get(t.id)?.unreadCount ?? 0,
      }))
      return [...real, ...cs.filter((t) => !t.id.startsWith('c-'))]
    })
  }, [])

  const refreshThreads = useCallback(async () => {
    if (!userId) return
    applyThreads(await api.fetchThreads(userId))
  }, [userId, applyThreads])
  const refreshThreadsRef = useRef(refreshThreads)
  refreshThreadsRef.current = refreshThreads

  const sendRealMessage = async (
    threadId: string,
    text: string,
    imageUrl?: string,
  ) => {
    const res = await api.sendChatMessage(threadId.slice(2), text, imageUrl)
    if (res.error || !res.row) {
      showToast(res.error ?? 'Pesan gagal dikirim.')
      return
    }
    const row = res.row
    const msg: ChatMessage = {
      id: row.id,
      sender: 'me',
      text: row.body ?? undefined,
      imageUrl,
      time: nowTime(),
    }
    setChats((cs) =>
      cs.map((t) =>
        t.id === threadId && !t.messages.some((m) => m.id === msg.id)
          ? { ...t, lastTime: msg.time, messages: [...t.messages, msg] }
          : t,
      ),
    )
  }

  const openRealChat = async (product: ProductItem) => {
    if (!userId) {
      showToast('Masuk dulu untuk mengirim pesan.')
      return
    }
    if (product.seller.id === userId) {
      showToast('Ini barang milikmu sendiri.')
      return
    }
    const res = await api.openConversation(product.id, product.seller.id)
    if (res.error || !res.id) {
      showToast(res.error ?? 'Tidak dapat membuka chat.')
      return
    }
    const key = `c-${res.id}`
    if (!chatsRef.current.some((t) => t.id === key)) {
      applyThreads(await api.fetchThreads(userId))
    }
    setActiveThreadId(key)
    setChats((cs) => cs.map((t) => (t.id === key ? { ...t, unreadCount: 0 } : t)))
    navigate('chat')
  }

  // Sesi login: pulihkan saat halaman dibuka dan ikuti perubahan.
  useEffect(() => {
    if (!supabase) return
    let alive = true
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return
      setUserId(data.session?.user.id ?? null)
      setAuthReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null)
    })
    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [])

  // Saat pengguna masuk/keluar: muat profil, barang, dan percakapan.
  useEffect(() => {
    if (!isBackendEnabled) return
    if (!userId) {
      setProfile(null)
      setProducts(INITIAL_PRODUCTS)
      setChats((cs) => cs.filter((t) => !t.id.startsWith('c-')))
      return
    }
    let alive = true
    ;(async () => {
      const [prof, remote, threads, nim] = await Promise.all([
        api.fetchProfile(userId),
        api.fetchProducts(),
        api.fetchThreads(userId),
        api.fetchMyKtmNim(userId),
      ])
      if (!alive) return
      setProfile(prof)
      setKtmNim(nim)
      setProducts([...remote, ...INITIAL_PRODUCTS])
      applyThreads(threads)
      // Dari halaman masuk: arahkan sesuai status KTM.
      setScreen((cur) => {
        if (cur !== 'masuk') return cur
        setHistory([])
        return prof && (prof.ktmStatus === 'none' || prof.ktmStatus === 'rejected')
          ? 'verifikasi-ktm'
          : 'beranda'
      })
    })()
    return () => {
      alive = false
    }
  }, [userId, applyThreads])

  // Tamu tidak boleh membuka halaman di luar masuk/daftar.
  useEffect(() => {
    if (!isBackendEnabled || !authReady || userId) return
    const open = screen === 'masuk' || screen === 'daftar' || screen === 'verifikasi-ktm'
    if (!open) setScreen('masuk')
  }, [authReady, userId, screen])

  // Segarkan status KTM (mis. setelah admin menyetujui) saat berpindah halaman.
  useEffect(() => {
    if (!isBackendEnabled || !userId) return
    if (screen === 'masuk' || screen === 'daftar') return
    let alive = true
    api.fetchProfile(userId).then((p) => {
      if (alive && p) setProfile(p)
    })
    return () => {
      alive = false
    }
  }, [screen, userId])

  // Selama KTM berstatus 'pending', cek berkala agar pengguna langsung tahu hasilnya.
  const ktmStatus = profile?.ktmStatus
  useEffect(() => {
    if (!isBackendEnabled || !userId || ktmStatus !== 'pending') return
    const timer = window.setInterval(() => {
      api.fetchProfile(userId).then((p) => {
        if (p) setProfile(p)
      })
    }, 15000)
    return () => window.clearInterval(timer)
  }, [userId, ktmStatus])

  // Beri tahu saat status KTM berubah (mis. disetujui admin).
  const prevKtmStatus = useRef<api.KtmStatus | undefined>(undefined)
  useEffect(() => {
    const before = prevKtmStatus.current
    prevKtmStatus.current = ktmStatus
    if (!before || before === ktmStatus) return
    if (ktmStatus === 'verified') {
      showToast('Selamat! KTM-mu sudah terverifikasi. Kamu bisa memasang barang dan chat.')
    } else if (ktmStatus === 'rejected') {
      showToast('Verifikasi KTM ditolak. Silakan kirim ulang foto yang lebih jelas.')
    }
  }, [ktmStatus])

  // Pesan & percakapan baru masuk secara real-time.
  useEffect(() => {
    if (!isBackendEnabled || !userId) return
    return api.subscribeChat({
      onMessage: (row) => {
        const key = `c-${row.conversation_id}`
        if (!chatsRef.current.some((t) => t.id === key)) {
          void refreshThreadsRef.current()
          return
        }
        void api.hydrateMessage(row, userId).then((msg) => {
          setChats((cs) =>
            cs.map((t) => {
              if (t.id !== key || t.messages.some((m) => m.id === msg.id)) return t
              const open =
                activeThreadIdRef.current === key && screenRef.current === 'chat'
              return {
                ...t,
                lastTime: msg.time,
                messages: [...t.messages, msg],
                unreadCount:
                  msg.sender === 'them' && !open ? t.unreadCount + 1 : t.unreadCount,
              }
            }),
          )
        })
      },
      onConversation: () => {
        void refreshThreadsRef.current()
      },
    })
  }, [userId])

  const KTM_STATUS_TEXT: Record<api.KtmStatus, string> = {
    none: 'belum dikirim',
    pending: 'sedang ditinjau petugas',
    verified: 'terverifikasi',
    rejected: 'ditolak, silakan kirim ulang',
  }

  const publishProduct = async (item: ProductItem, goToSorot: boolean) => {
    let fresh: ProductItem = { ...item, highlighted: false }
    if (isBackendEnabled) {
      if (!profile) {
        showToast('Masuk dulu untuk memasang barang.')
        return
      }
      if (profile.ktmStatus !== 'verified') {
        showToast(`Pasang barang butuh KTM terverifikasi. Status KTM-mu: ${KTM_STATUS_TEXT[profile.ktmStatus]}.`)
        return
      }
      showToast('Mengunggah barang…')
      const res = await api.createProduct(fresh, profile)
      if (res.error || !res.product) {
        showToast(res.error ?? 'Gagal memasang barang.')
        return
      }
      fresh = res.product
    }
    setProducts((ps) => [fresh, ...ps])
    if (item.type === 'Donasi') addPoints(100, `Donasi ${item.title}`)
    if (goToSorot) {
      setSorotProductId(fresh.id)
      showToast('Barang tayang! Lanjutkan pilih paket Sorot Barang.')
      navigate('sorot-barang')
    } else {
      showToast(`"${item.title}" berhasil dipasang di Beranda.`)
      navigate('beranda')
    }
  }

  const redeemVoucher = (v: UmkmVoucher) => {
    if (ecoPoints < v.pointsCost) return
    addPoints(-v.pointsCost, `Voucher ${v.name}`)
    const code = `LLS-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
    showToast(`Voucher ${v.name} aktif! Kode: ${code}`)
  }

  const confirmDone = (id: string) => {
    const trx = transactions.find((t) => t.id === id)
    if (!trx) return
    setTransactions((ts) =>
      ts.map((t) =>
        t.id === id
          ? { ...t, status: 'Selesai', stepIndex: 3, ecoPointsEarned: 20, reviewed: false }
          : t,
      ),
    )
    addPoints(20, `Transaksi ${trx.title}`)
    showToast('Transaksi selesai! +20 Eco-Points masuk.')
  }

  const review = (id: string) => {
    const trx = transactions.find((t) => t.id === id)
    if (!trx) return
    setTransactions((ts) =>
      ts.map((t) => (t.id === id ? { ...t, reviewed: true } : t)),
    )
    addPoints(5, `Ulasan ${trx.title}`)
    showToast('Terima kasih atas ulasanmu! +5 Eco-Points.')
  }

  const chatFromTrx = (t: TransactionRecord) => {
    const thread = chats.find((c) => c.id === t.partnerThreadId)
    if (thread) {
      setActiveThreadId(thread.id)
      navigate('chat')
    } else {
      openChatWithSeller(findProduct(t.productId))
    }
  }

  const offerWtb = (req: WtbRequest) => {
    setWtb((ws) =>
      ws.map((w) => (w.id === req.id ? { ...w, offersCount: w.offersCount + 1 } : w)),
    )
    const thread = chats.find((c) => c.id === req.partnerThreadId)
    if (thread) {
      setActiveThreadId(thread.id)
      sendMessage(thread.id, `Halo kak, aku punya "${req.title}". Masih dicari?`)
    }
    showToast(`Tawaran untuk "${req.title}" dikirim.`)
    navigate('chat')
  }

  const paySorot: Parameters<typeof SorotBarangScreen>[0]['onPay'] = ({
    product,
    days,
    method,
    points,
  }) => {
    if (method === 'points') addPoints(-points, `Sorot ${product.title}`)
    setProducts((ps) => {
      const target = ps.find((p) => p.id === product.id)
      if (!target) return ps
      return [{ ...target, highlighted: true }, ...ps.filter((p) => p.id !== product.id)]
    })
    showToast(`"${product.title}" disorot selama ${days} hari!`)
    navigate('beranda')
  }

  const unread = chats.reduce((n, t) => n + t.unreadCount, 0)
  const isAuth = screen === 'masuk' || screen === 'daftar' || screen === 'verifikasi-ktm'

  const sorotProduct = findProduct(sorotProductId)
  const myProducts = products.filter(
    (p) => p.seller.id === 'raka' || (userId !== null && p.seller.id === userId) || ['sepeda-lipat', 'laptop-stand', 'lampu-belajar-led'].includes(p.id),
  )
  const comparison =
    products.find((p) => p.id === 'laptop-stand' && p.id !== sorotProduct.id) ??
    products.find((p) => p.id !== sorotProduct.id)!

  const renderScreen = () => {
    switch (screen) {
      case 'beranda':
        return (
          <BerandaScreen
            userName={isBackendEnabled ? (profile?.fullName ?? '') : undefined}
            products={products}
            ecoPoints={ecoPoints}
            wishlistIds={wishlist}
            onToggleWishlist={toggleWishlist}
            onSelectProduct={selectProduct}
            onNavigate={navigate}
            onOpenSearchWithType={(t) => {
              setSearchType(t)
              setSearchQuery('')
              setSearchKey((k) => k + 1)
              navigate('pencarian')
            }}
            onShowToast={showToast}
          />
        )
      case 'pencarian':
        return (
          <PencarianScreen
            key={searchKey}
            products={products}
            searchQuery={searchQuery}
            initialTypeFilter={searchType}
            wishlistIds={wishlist}
            onToggleWishlist={toggleWishlist}
            onSelectProduct={selectProduct}
          />
        )
      case 'detail-barang':
        return (
          <DetailBarangScreen
            key={selectedProductId}
            product={findProduct(selectedProductId)}
            allProducts={products}
            wishlistIds={wishlist}
            onToggleWishlist={toggleWishlist}
            onSelectProduct={selectProduct}
            onNavigate={navigate}
            onOpenChatWithSeller={openChatWithSeller}
            onOpenAturCod={openAturCod}
            onShowToast={showToast}
          />
        )
      case 'chat':
        return (
          <ChatScreen
            threads={chats}
            activeThreadId={activeThreadId}
            products={products}
            onSelectThread={(id) => {
              setActiveThreadId(id)
              setChats((cs) => cs.map((t) => (t.id === id ? { ...t, unreadCount: 0 } : t)))
            }}
            onSendMessage={sendMessage}
            onViewProduct={selectProduct}
            onOpenAturCod={openAturCod}
            onShowToast={showToast}
          />
        )
      case 'pasang-barang':
        return (
          <PasangBarangScreen
            onPublishProduct={publishProduct}
            onNavigate={navigate}
            onShowToast={showToast}
          />
        )
      case 'atur-cod':
        return (
          <AturCodScreen
            key={codProductId}
            product={findProduct(codProductId)}
            onBack={goBack}
            onConfirmCod={confirmCod}
          />
        )
      case 'papan-wtb':
        return (
          <PapanWtbScreen
            currentUser={
              isBackendEnabled && profile
                ? {
                    name: profile.fullName,
                    initials: api.sellerFromProfile(profile).initials,
                    facultyProdi: profile.facultyProdi,
                  }
                : undefined
            }
            requests={wtb}
            onAddRequest={(r) => {
              setWtb((ws) => [r, ...ws])
              showToast('Permintaanmu sudah tayang di Papan WTB.')
            }}
            onOfferItem={offerWtb}
          />
        )
      case 'eco-points':
        return (
          <EcoPointsScreen
            ecoPoints={ecoPoints}
            vouchers={UMKM_VOUCHERS}
            history={pointHistory}
            onRedeem={redeemVoucher}
            onBack={goBack}
            onSeeAllUmkm={() => navigate('umkm-kampus')}
          />
        )
      case 'transaksi':
        return (
          <TransaksiScreen
            transactions={transactions}
            products={products}
            onViewProduct={selectProduct}
            onChatPartner={chatFromTrx}
            onConfirmDone={confirmDone}
            onReview={review}
            onOpenEcoPoints={() => navigate('eco-points')}
          />
        )
      case 'umkm-kampus':
        return (
          <UmkmKampusScreen
            partners={UMKM_PARTNERS}
            onRedeemPromo={() => navigate('eco-points')}
            onPartnerClick={(p) =>
              p.pointsRequired
                ? navigate('eco-points')
                : showToast(`${p.name}: ${p.promoDesc ?? 'Segera hadir promo baru.'}`)
            }
            onRegisterPartner={() =>
              showToast('Formulir mitra UMKM dikirim. Tim Lulusin akan menghubungimu.')
            }
          />
        )
      case 'sorot-barang':
        return (
          <SorotBarangScreen
            key={sorotProductId}
            product={sorotProduct}
            myProducts={myProducts}
            comparisonProduct={comparison}
            ecoPoints={ecoPoints}
            onChangeProduct={setSorotProductId}
            onBack={goBack}
            onPay={paySorot}
          />
        )
      default:
        return null
    }
  }

  if (!authReady) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#FDF4E3] font-['Poppins:Regular'] text-[14px] text-[#6e6a63]">
        Memuat…
      </div>
    )
  }

  return (
    <div className="min-h-dvh w-full bg-[#FDF4E3]">
      {isAuth ? (
        <AuthScreens
          mode={screen as 'masuk' | 'daftar' | 'verifikasi-ktm'}
          onNavigate={navigate}
          onShowToast={showToast}
          account={
            isBackendEnabled && profile
              ? {
                  name: profile.fullName,
                  facultyProdi: profile.facultyProdi,
                  nim: ktmNim,
                  ktmStatus: profile.ktmStatus,
                }
              : undefined
          }
          onLogin={
            isBackendEnabled
              ? async (email, password) => {
                  const r = await api.signIn(email, password)
                  if (r.error) return r.error
                  // Pindah ke Beranda segera; data akun dimuat di latar belakang.
                  if (r.userId) setUserId(r.userId)
                  setHistory([])
                  setScreen('beranda')
                  showToast('Berhasil masuk. Selamat datang!')
                  return null
                }
              : undefined
          }
          onRegister={
            isBackendEnabled
              ? async (d) => {
                  const r = await api.signUp(d)
                  if (r.error) return r.error
                  if (r.needsEmailConfirm) {
                    showToast('Akun dibuat. Cek emailmu untuk konfirmasi, lalu masuk.')
                    navigate('masuk')
                  } else {
                    navigate('verifikasi-ktm')
                  }
                  return null
                }
              : undefined
          }
          onSubmitKtm={
            isBackendEnabled
              ? async (nim, photo) => {
                  const r = await api.submitKtm(nim, photo)
                  if (r.error) return r.error
                  setKtmNim(nim.trim())
                  if (userId) setProfile(await api.fetchProfile(userId))
                  showToast('Foto KTM terkirim! Menunggu peninjauan petugas.')
                  navigate('beranda')
                  return null
                }
              : undefined
          }
        />
      ) : (
        <>
          <Navbar
            currentScreen={screen}
            onNavigate={(next) => {
              if (next === 'masuk' && isBackendEnabled) void api.signOut()
              navigate(next)
            }}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={() => {
              setSearchType('Semua')
              setSearchKey((k) => k + 1)
              navigate('pencarian')
            }}
            ecoPoints={ecoPoints}
            unreadChatCount={unread}
            account={
              isBackendEnabled
                ? {
                    name: profile?.fullName || 'Pengguna',
                    facultyProdi: profile?.facultyProdi ?? '',
                    ktmStatus: profile?.ktmStatus ?? 'none',
                  }
                : undefined
            }
          />
          {isBackendEnabled && profile && screen !== 'verifikasi-ktm' && (
            <KtmStatusBanner
              status={profile.ktmStatus}
              onOpenVerification={() => navigate('verifikasi-ktm')}
            />
          )}
          {renderScreen()}
        </>
      )}

      {toast && (
        <div
          role="status"
          className="fixed left-1/2 -translate-x-1/2 bottom-24 md:bottom-8 z-50 max-w-[92vw] px-5 py-3 rounded-full bg-[#0F4F2B] text-white font-['Poppins:Bold'] text-[13px] shadow-[0_12px_28px_rgba(15,79,43,0.3)]"
        >
          {toast}
        </div>
      )}
    </div>
  )
}
