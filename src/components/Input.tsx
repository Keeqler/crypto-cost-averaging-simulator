import { Dispatch, SetStateAction } from 'react'

type Props = {
  label?: string
  value: string
  setValue: Dispatch<SetStateAction<string>>
}

export const Input = ({ label, value, setValue }: Props) => {
  return (
    <div className='relative flex flex-col'>
      {!!label && (
        <label className='mb-1 text-neutral-2 text-sm font-bold uppercase'>{label}</label>
      )}

      <div className='w-full h-10 relative font-medium text-base'>
        <span className='px-4 absolute top-1/2 -translate-y-1/2 text-blue'>$</span>

        <input
          value={value}
          onChange={event => event.target.value.match(/^\d+$|^$/) && setValue(event.target.value)}
          type='text'
          className='w-full h-full pl-7 pr-4 border border-neutral-6 rounded-md text-neutral-1 bg-neutral-7'
        />
      </div>
    </div>
  )
}
