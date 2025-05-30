import type { TRPCLink } from '@trpc/client'
import type { AppRouter } from '@/server/api/root'
import { observable } from '@trpc/server/observable'
import { toast } from 'react-toastify'

export const errorToastLink: TRPCLink<AppRouter> = () => {
  // here we just got initialized in the app - this happens once per app
  // useful for storing cache for instance
  return ({ next, op }) => {
    // this is when passing the result to the next link
    // each link needs to return an observable which propagates results
    return observable((observer) => {
      return next(op).subscribe({
        next(value) {
          // console.log("we received value", value);
          observer.next(value)
        },
        error(err) {
          // console.log("we received error", err);
          observer.error(err)
          toast(err.message, {
            type: 'error',
          })
        },
        complete() {
          observer.complete()
        },
      })
    })
  }
}
