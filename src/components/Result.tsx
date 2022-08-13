import { HTMLProps } from 'react'
import cx from 'classnames'

export const Result = ({ className, children, ...props }: HTMLProps<HTMLDivElement>) => (
  <div className={cx('flex flex-col', className)} {...props}>
    {children}
  </div>
)

export const ResultLabel = ({ children, ...props }: HTMLProps<HTMLLabelElement>) => (
  <label className='mb-0 text-neutral-2 text-sm font-bold uppercase' {...props}>
    {children}
  </label>
)

export const ResultValue = ({ className, children, ...props }: HTMLProps<HTMLSpanElement>) => (
  <span
    className={cx(
      'inline-flex flex-row items-center text-neutral-1 text-lg font-medium',
      className
    )}
    {...props}
  >
    {children}
  </span>
)

export const ResultSymbol = ({ children, ...props }: HTMLProps<HTMLSpanElement>) => (
  <span className='text-blue' {...props}>
    {children}
  </span>
)

type ResultPercentageProps = { percentage: number } & HTMLProps<HTMLSpanElement>

export const ResultGreenRed = ({
  percentage,
  children,
  className,
  ...props
}: ResultPercentageProps) => (
  <span
    className={cx('text-xs', percentage >= 0 ? 'text-green' : 'text-red', className)}
    {...props}
  >
    {children}
  </span>
)
