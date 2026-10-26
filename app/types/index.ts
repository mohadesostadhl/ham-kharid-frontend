export type CampaignStatus = 'draft' | 'active' | 'funded' | 'successful' | 'failed'
export interface User {
  id: number
  username: string
  display_name: string
  role: 'buyer' | 'seller'
}
export interface AuthState {
  user: User | null
  csrf_token: string
}
export interface Category {
  id: number
  name: string
  slug: string
}
export interface Product {
  id: number
  name: string
  description: string
  category: number
  category_name: string
  retail_price: number
  unit: string
  visual: string
  seller_name: string
}
export interface Campaign {
  id: number
  title: string
  product: Product
  group_price: number
  min_quantity: number
  capacity: number
  buyer_limit: number
  reserved_quantity: number
  deadline: string
  status: CampaignStatus
  progress: number
  participant_count: number
}
export interface Reservation {
  id: number
  campaign: Campaign
  quantity: number
  status: 'active' | 'cancelled' | 'converted' | 'released'
  created_at: string
}
export interface Order {
  id: number
  campaign_id: number
  campaign_title: string
  buyer_name: string
  unit_price: number
  quantity: number
  total: number
  status: 'confirmed' | 'shipped' | 'completed'
  created_at: string
}
export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
