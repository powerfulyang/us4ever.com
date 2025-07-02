export interface PushSubscriptionKeys {
  p256dh: string
  auth: string
}

export interface WebPushSubscription {
  endpoint: string
  keys: PushSubscriptionKeys
}

export interface PushSubscriptionJSON {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}
