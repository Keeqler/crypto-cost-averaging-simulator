import { Dispatch, Fragment, SetStateAction } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownFilled } from '@fluentui/react-icons'
import cx from 'classnames'

type Props = {
  label?: string
  options: { value: string; label: string; icon?: string }[]
  value: string
  setValue: Dispatch<SetStateAction<string>>
}

export const Select = ({ label, options, value, setValue }: Props) => {
  const selectedItem = options.find(option => option.value === value) as Props['options'][0]

  return (
    <div className='w-full flex flex-col self-end'>
      {!!label && (
        <label className='mb-1 text-neutral-2 text-sm font-bold uppercase'>{label}</label>
      )}

      <Listbox value={value} onChange={setValue}>
        {({ open }) => (
          <div className='relative font-medium text-neutral-1 cursor-pointer'>
            <Listbox.Button className='w-full h-10 px-4 relative flex flex-row justify-between items-center text-left border border-neutral-6 rounded-md bg-neutral-7 transition-colors hover:bg-neutral-6'>
              <span className='flex items-center gap-2 truncate'>
                {!!selectedItem && !!selectedItem.icon && (
                  <img src={selectedItem.icon} alt={selectedItem.label} className='w-4 h-4' />
                )}

                {!!selectedItem && selectedItem.label}
              </span>

              <ChevronDownFilled
                className={cx('h-5 w-5 text-neutral-2', open && 'rotate-180')}
                aria-hidden='true'
              />
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              enter='transition ease-in duration-100'
              enterTo='opacity-100'
              enterFrom='opacity-0'
              leave='transition ease-in duration-100'
              leaveFrom='opacity-100'
              leaveTo='opacity-0'
              unmount={false}
            >
              <Listbox.Options className='z-10 mt-1 w-full max-h-40 absolute border border-neutral-6 bg-neutral-7 rounded-md text-base overflow-auto focus:outline-none'>
                {options.map(option => (
                  <Listbox.Option
                    key={'option-' + option.value}
                    className='h-10 px-4 relative flex items-center select-none transition-colors hover:bg-neutral-6 :bg-neutral-6'
                    value={option.value}
                  >
                    {({ selected }) => (
                      <span
                        className={cx('flex items-center gap-2 truncate', selected && 'opacity-50')}
                      >
                        {!!option.icon && (
                          <img src={option.icon} alt={option.label} className='w-4 h-4' />
                        )}
                        {option.label}
                      </span>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        )}
      </Listbox>
    </div>
  )
}
