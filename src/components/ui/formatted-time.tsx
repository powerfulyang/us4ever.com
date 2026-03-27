'use client'

import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import * as React from 'react'
import { cn } from '@/utils/cn'

dayjs.extend(utc)
dayjs.extend(timezone)

interface FormattedTimeProps extends React.TimeHTMLAttributes<HTMLTimeElement> {
  date: string | number | Date | dayjs.Dayjs
  format?: string
}

export function FormattedTime({
  date,
  format = 'YYYY年MM月DD日 HH:mm',
  className,
  ...props
}: FormattedTimeProps) {
  const formatted = React.useMemo(() => {
    if (!date)
      return ''
    // 强制使用 +8 时区 (Asia/Beijing / Asia/Shanghai)
    return dayjs(date).tz('Asia/Shanghai').format(format)
  }, [date, format])

  return (
    <time
      className={cn(className)}
      {...props}
    >
      {formatted}
    </time>
  )
}
