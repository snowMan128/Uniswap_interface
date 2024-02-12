import { ComponentProps } from 'react'

export const UserIcon = (props: ComponentProps<'svg'>) => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M20.5625 3.5H7.4375C4.8125 3.5 3.5 4.8125 3.5 7.4375V20.5625C3.5 23.1875 4.8125 24.5 7.4375 24.5H20.5625C23.1875 24.5 24.5 23.1875 24.5 20.5625V7.4375C24.5 4.8125 23.1875 3.5 20.5625 3.5ZM14.0094 8.16667C15.9426 8.16667 17.5094 9.7335 17.5094 11.6667C17.5094 13.5998 15.9426 15.1667 14.0094 15.1667C12.0762 15.1667 10.5094 13.5998 10.5094 11.6667C10.5094 9.7335 12.0762 8.16667 14.0094 8.16667ZM20.5567 22.75H7.44334C7.29167 22.75 7.15168 22.75 7.01168 22.7383C7.16334 20.755 8.28338 18.1649 12.005 18.1649H15.995C19.705 18.1649 20.8367 20.7783 20.9883 22.7383C20.8483 22.75 20.7083 22.75 20.5567 22.75Z"
      fill={props.fill ?? 'currentColor'}
    />
  </svg>
)
