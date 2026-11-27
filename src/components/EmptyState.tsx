import React from 'react'

interface EmptyStateProps {
  icon?: string
  title: string
  body?: string
  actionLabel?: string
  onAction?: () => void
}

/** Tampilan standar saat sebuah daftar atau halaman belum punya isi. */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '🛍️',
  title,
  body,
  actionLabel,
  onAction,
}) => (
  <div className="rounded-[18px] bg-white border border-[#EBDDC2] px-6 py-10 text-center">
    <p className="text-[34px] leading-none" aria-hidden="true">
      {icon}
    </p>
    <p className="mt-3 font-['Poppins:Bold'] text-[15px] text-[#1f1f1f]">{title}</p>
    {body && (
      <p className="mt-1 font-['Poppins:Regular'] text-[13px] text-[#6e6a63]">{body}</p>
    )}
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="mt-4 h-[42px] px-6 rounded-[12px] bg-[#17683A] hover:bg-[#12542e] font-['Poppins:Bold'] text-[13.5px] text-white transition-colors"
      >
        {actionLabel}
      </button>
    )}
  </div>
)
