import type { UseFormRegisterReturn } from 'react-hook-form'

/** Hidden anti-spam field. Humans never see or fill it. */
export function Honeypot(props: UseFormRegisterReturn) {
  return (
    <div aria-hidden="true" className="absolute -start-[10000px] size-px overflow-hidden">
      <label>
        Website
        <input type="text" tabIndex={-1} autoComplete="off" {...props} />
      </label>
    </div>
  )
}
