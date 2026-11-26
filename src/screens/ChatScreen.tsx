import React, { useRef, useState } from 'react'
import {
  assetPathPrefix,
  CARD_THEME_GRADIENTS,
  ChatThread,
  ProductItem,
} from '../data/lulusinData'
import { fileToCompressedDataUrl, validateImageFile } from '../lib/image'
import { CameraCapture } from '../components/CameraCapture'

interface ChatScreenProps {
  threads: ChatThread[]
  activeThreadId: string
  products: ProductItem[]
  onSelectThread: (threadId: string) => void
  onSendMessage: (threadId: string, text: string, imageUrl?: string) => void
  onViewProduct: (product: ProductItem) => void
  onOpenAturCod: (product: ProductItem) => void
  onShowToast?: (msg: string) => void
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  threads,
  activeThreadId,
  products,
  onSelectThread,
  onSendMessage,
  onViewProduct,
  onOpenAturCod,
  onShowToast,
}) => {
  const [threadSearch, setThreadSearch] = useState('')
  const [draft, setDraft] = useState('')
  const [mobileShowDetail, setMobileShowDetail] = useState(true)
  const [pendingImage, setPendingImage] = useState<string | null>(null)
  const [isReadingImage, setIsReadingImage] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const activeThread =
    threads.find((t) => t.id === activeThreadId) ?? threads[0]

  const attachedProduct =
    products.find((p) => p.id === activeThread?.attachedProductId) ??
    products[0]

  const filteredThreads = threads.filter((t) => {
    const q = threadSearch.trim().toLowerCase()
    if (!q) return true
    const lastMsg =
      t.messages[t.messages.length - 1]?.text?.toLowerCase() ?? 'ajakan cod'
    return t.partner.name.toLowerCase().includes(q) || lastMsg.includes(q)
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((!draft.trim() && !pendingImage) || !activeThread) return
    onSendMessage(activeThread.id, draft.trim(), pendingImage ?? undefined)
    setDraft('')
    setPendingImage(null)
  }

  const handlePickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const problem = validateImageFile(file)
    if (problem) {
      onShowToast?.(problem)
      return
    }
    setIsReadingImage(true)
    try {
      setPendingImage(await fileToCompressedDataUrl(file, 1024, 0.8))
    } catch {
      onShowToast?.('Gambar tidak dapat dibaca. Coba pilih foto lain.')
    } finally {
      setIsReadingImage(false)
    }
  }

  const quickReplies = ['Masih ada?', 'Bisa nego?', 'Ketemu di mana?']

  return (
    <main className="max-w-[1264px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-12">
      <div className="flex flex-col lg:flex-row gap-6 min-h-[680px]">
        {/* Left Thread List Card */}
        <aside
          className={`w-full lg:w-[336px] shrink-0 rounded-[20px] bg-white border border-[#EBDDC2] shadow-[0_4px_18px_rgba(110,86,40,0.05)] p-4 sm:p-5 flex-col ${
            mobileShowDetail ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <h1 className="font-['Poppins:Bold'] text-[20px] text-[#1f1f1f]">
            Pesan
          </h1>

          <div className="mt-3.5 h-[42px] rounded-full bg-[#FDF4E3] border border-[#EBDDC2] px-3.5 flex items-center gap-2.5">
            <img
              src={`${assetPathPrefix}/76ff5.svg`}
              alt=""
              className="block shrink-0"
            />
            <input
              type="text"
              value={threadSearch}
              onChange={(e) => setThreadSearch(e.target.value)}
              placeholder="Cari percakapan…"
              className="w-full bg-transparent outline-none font-['Poppins:Regular'] text-[12.5px] text-[#1f1f1f] placeholder:text-[#a39c8f]"
            />
          </div>

          <div className="mt-4 space-y-1.5">
            {filteredThreads.map((thread) => {
              const isSelected = thread.id === activeThread?.id
              const lastMsg = thread.messages[thread.messages.length - 1]
              const lastTextMsg = [...thread.messages]
                .reverse()
                .find((m) => m.text)
              const previewText =
                lastMsg?.imageUrl && !lastMsg.text
                  ? '📷 Foto'
                  : (lastTextMsg?.text?.replace('\n', ' ') ??
                    'Ajakan COD dikirim')

              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => {
                    onSelectThread(thread.id)
                    setMobileShowDetail(true)
                  }}
                  className={`w-full rounded-[14px] p-3 flex items-center gap-3 text-left transition-colors ${
                    isSelected ? 'bg-[#E2F1E5]' : 'hover:bg-[#FDF4E3]/70'
                  }`}
                >
                  <div
                    style={{ backgroundColor: thread.partner.avatarBg }}
                    className="size-[42px] rounded-full flex items-center justify-center font-['Poppins:Bold'] text-[15px] text-white shrink-0"
                  >
                    {thread.partner.initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-['Poppins:Bold'] text-[13.5px] text-[#1f1f1f] truncate">
                        {thread.partner.name}
                      </span>
                      <span className="font-['Poppins:Regular'] text-[10.5px] text-[#a39c8f] shrink-0">
                        {thread.lastTime}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <span className="font-['Poppins:Regular'] text-[11.5px] text-[#6e6a63] truncate">
                        {previewText}
                      </span>
                      {thread.unreadCount > 0 && (
                        <span className="size-[18px] rounded-full bg-[#F5A314] font-['Poppins:Bold'] text-[10px] text-[#1f1f1f] flex items-center justify-center shrink-0">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        {/* Right Active Conversation Card */}
        {activeThread && (
          <section
            className={`flex-1 rounded-[20px] bg-white border border-[#EBDDC2] shadow-[0_4px_18px_rgba(110,86,40,0.05)] flex-col overflow-hidden ${
              mobileShowDetail ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* Conversation Header */}
            <div className="px-5 py-3.5 border-b border-[#EBDDC2] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setMobileShowDetail(false)}
                  className="lg:hidden size-[32px] rounded-full bg-[#FDF4E3] border border-[#EBDDC2] flex items-center justify-center shrink-0"
                  aria-label="Daftar pesan"
                >
                  <img
                    src={`${assetPathPrefix}/90b47.svg`}
                    alt=""
                    className="block"
                  />
                </button>

                <div className="relative shrink-0">
                  <div
                    style={{ backgroundColor: activeThread.partner.avatarBg }}
                    className="size-[44px] rounded-full flex items-center justify-center font-['Poppins:Bold'] text-[17px] text-white"
                  >
                    {activeThread.partner.initials}
                  </div>
                  <span className="absolute bottom-0 right-0 size-[12px] rounded-full bg-[#22C55E] ring-2 ring-white" />
                </div>

                <div className="min-w-0">
                  <h2 className="font-['Poppins:Bold'] text-[15px] text-[#1f1f1f] truncate">
                    {activeThread.partner.name}
                  </h2>
                  <p className="font-['Poppins:Regular'] text-[11.5px] text-[#17683a] truncate">
                    {activeThread.onlineStatus}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenAturCod(attachedProduct)}
                className="p-2 rounded-full hover:bg-[#FDF4E3] transition-colors"
                title="Atur Pertemuan COD"
              >
                <img
                  src={`${assetPathPrefix}/306d2.svg`}
                  alt="Menu"
                  className="block"
                />
              </button>
            </div>

            {/* Attached Product Strip */}
            <div className="mx-4 sm:mx-5 mt-3.5 rounded-[14px] bg-[#FDF4E3] border border-[#EBDDC2] p-2.5 sm:p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`size-[44px] rounded-[10px] flex items-center justify-center shrink-0 relative overflow-hidden ${
                    CARD_THEME_GRADIENTS[attachedProduct.theme]
                  }`}
                >
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-white/15" />
                  <img
                    src={`${assetPathPrefix}/f1248.svg`}
                    alt=""
                    className="relative z-10 block"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-['Poppins:Bold'] text-[13px] text-[#1f1f1f] truncate">
                    {attachedProduct.title}
                  </p>
                  <p className="font-['Poppins:Bold'] text-[13px] text-[#17683a]">
                    {attachedProduct.priceLabel}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onViewProduct(attachedProduct)}
                className="h-[32px] px-4 rounded-full border-[1.5px] border-[#17683A] bg-white hover:bg-[#E2F1E5]/50 font-['Poppins:Bold'] text-[11.5px] text-[#17683a] shrink-0"
              >
                Lihat
              </button>
            </div>

            {/* Messages List */}
            <div className="flex-1 px-4 sm:px-5 py-4 space-y-4 overflow-y-auto">
              <div className="flex justify-center">
                <span className="px-3.5 py-1 rounded-full bg-[#F2E6CC] font-['Poppins:Bold'] text-[10.5px] text-[#6e6a63]">
                  Hari ini
                </span>
              </div>

              {activeThread.messages.map((msg) => {
                const isMe = msg.sender === 'me'

                if (msg.codInvite) {
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isMe ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        onClick={() => onOpenAturCod(attachedProduct)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onOpenAturCod(attachedProduct)
                        }}
                        className="w-full max-w-[300px] rounded-[16px] border-[1.5px] border-[#17683A] bg-white overflow-hidden shadow-2xs cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="bg-[#17683A] px-4 py-2.5 flex items-center gap-2">
                          <img
                            src={`${assetPathPrefix}/7f089.svg`}
                            alt=""
                            className="block shrink-0"
                          />
                          <span className="font-['Poppins:Bold'] text-[13px] text-white">
                            Ajakan COD
                          </span>
                        </div>

                        <div className="p-3.5 space-y-2 text-[12px] font-['Poppins:Regular'] text-[#1f1f1f]">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={`${assetPathPrefix}/c08ea.svg`}
                              alt=""
                              className="block shrink-0"
                            />
                            <span>{msg.codInvite.dateLabel}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <img
                              src={`${assetPathPrefix}/58e12.svg`}
                              alt=""
                              className="block shrink-0"
                            />
                            <span>{msg.codInvite.location}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <img
                              src={`${assetPathPrefix}/12ab4.svg`}
                              alt=""
                              className="block shrink-0"
                            />
                            <span>{msg.codInvite.priceAndMethod}</span>
                          </div>
                          <p className="pt-1 font-['Poppins:Regular'] text-[10.5px] text-[#b26a00]">
                            {msg.codInvite.statusNote}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isMe ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[82%] sm:max-w-[340px] px-4 py-2.5 text-[13.5px] font-['Poppins:Regular'] leading-relaxed whitespace-pre-line ${
                        isMe
                          ? 'bg-[#17683A] text-white rounded-[16px] rounded-br-[4px]'
                          : 'bg-[#FFFDF8] border border-[#EBDDC2] text-[#1f1f1f] rounded-[16px] rounded-bl-[4px]'
                      }`}
                    >
                      {msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt="Foto terlampir"
                          className={`block w-full max-w-[260px] rounded-[10px] object-cover ${
                            msg.text ? 'mb-2' : ''
                          }`}
                        />
                      )}
                      {msg.text}
                    </div>
                    <span className="mt-1 font-['Poppins:Regular'] text-[10.5px] text-[#a39c8f]">
                      {msg.time}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Quick Reply Chips */}
            <div className="px-4 sm:px-5 pb-3 flex flex-wrap items-center gap-2">
              {quickReplies.map((qr) => (
                <button
                  key={qr}
                  type="button"
                  onClick={() => onSendMessage(activeThread.id, qr)}
                  className="h-[30px] px-3.5 rounded-full border border-[#17683A] bg-white hover:bg-[#E2F1E5]/60 font-['Poppins:Bold'] text-[12px] text-[#17683a] transition-colors"
                >
                  {qr}
                </button>
              ))}
            </div>

            {/* Pratinjau gambar yang akan dikirim */}
            {pendingImage && (
              <div className="px-4 sm:px-5 pb-2 flex items-center gap-3">
                <div className="relative">
                  <img
                    src={pendingImage}
                    alt="Gambar yang akan dikirim"
                    className="size-[64px] rounded-[10px] object-cover border border-[#EBDDC2]"
                  />
                  <button
                    type="button"
                    onClick={() => setPendingImage(null)}
                    aria-label="Batal lampirkan gambar"
                    className="absolute -top-2 -right-2 size-[22px] rounded-full bg-[#1F1F1F] text-white text-[13px] leading-none flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
                <span className="font-['Poppins:Regular'] text-[12px] text-[#6e6a63]">
                  Siap dikirim. Tambahkan pesan atau langsung kirim.
                </span>
              </div>
            )}

            {/* Message Input Bar */}
            <form
              onSubmit={handleSubmit}
              className="px-4 sm:px-5 py-3.5 border-t border-[#EBDDC2] flex items-center gap-3"
            >
              <button
                type="button"
                onClick={() => onOpenAturCod(attachedProduct)}
                title="Buat Ajakan COD"
                className="size-[38px] rounded-full bg-[#F2E6CC] hover:bg-[#ead8b5] flex items-center justify-center shrink-0 transition-colors"
              >
                <img
                  src={`${assetPathPrefix}/6ff1c.svg`}
                  alt="Atur COD"
                  className="block"
                />
              </button>

              {showCamera && (
                <CameraCapture
                  title="Kirim foto"
                  onClose={() => setShowCamera(false)}
                  onUnavailable={() => {
                    setShowCamera(false)
                    imageInputRef.current?.click()
                  }}
                  onCapture={(dataUrl) => {
                    setPendingImage(dataUrl)
                    setShowCamera(false)
                  }}
                />
              )}
              <button
                type="button"
                onClick={() => {
                  if (navigator.mediaDevices?.getUserMedia) setShowCamera(true)
                  else imageInputRef.current?.click()
                }}
                title="Ambil foto dengan kamera"
                aria-label="Ambil foto dengan kamera"
                className="size-[38px] rounded-full bg-[#F2E6CC] hover:bg-[#ead8b5] flex items-center justify-center shrink-0 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#17683A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePickImage}
              />
              <button
                type="button"
                disabled={isReadingImage}
                onClick={() => imageInputRef.current?.click()}
                title="Lampirkan foto dari galeri"
                aria-label="Lampirkan foto"
                className="size-[38px] rounded-full bg-[#F2E6CC] hover:bg-[#ead8b5] disabled:opacity-60 flex items-center justify-center shrink-0 transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#17683A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
              </button>

              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Tulis pesan…"
                className="flex-1 h-[44px] rounded-full bg-[#FDF4E3] border border-[#EBDDC2] focus:border-[#17683a] px-4 outline-none font-['Poppins:Regular'] text-[14px] text-[#1f1f1f] placeholder:text-[#a39c8f]"
              />

              <button
                type="submit"
                aria-label="Kirim pesan"
                className="size-[44px] rounded-full bg-[#17683A] hover:bg-[#12542e] flex items-center justify-center shrink-0 transition-colors"
              >
                <img
                  src={`${assetPathPrefix}/8e3c2.svg`}
                  alt=""
                  className="block"
                />
              </button>
            </form>
          </section>
        )}
      </div>
    </main>
  )
}
