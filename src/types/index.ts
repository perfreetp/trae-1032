export type WorkOrderStatus = 'pending' | 'assigned' | 'processing' | 'replied' | 'closed';
export type UrgencyLevel = 'normal' | 'urgent' | 'critical';
export type ChannelType = 'hotline' | 'web' | 'wechat' | 'app';
export type SatisfactionLevel = 1 | 2 | 3 | 4 | 5;
export type RectifyStatus = 'pending' | 'rectifying' | 'reviewing' | 'closed';

export interface WorkOrder {
  id: string;
  title: string;
  channel: ChannelType;
  passengerName: string;
  passengerPhone: string;
  trainNo?: string;
  station?: string;
  category: string;
  urgency: UrgencyLevel;
  status: WorkOrderStatus;
  createTime: string;
  deadline: string;
  content: string;
  attachment?: string;
  assignee?: string;
  department?: string;
}

export interface ProcessLog {
  id: string;
  orderId: string;
  operator: string;
  action: string;
  content: string;
  createTime: string;
}

export interface Review {
  id: string;
  orderId: string;
  satisfaction: SatisfactionLevel;
  comment: string;
  reviewTime: string;
  isRepeat: boolean;
}

export interface RectifyTask {
  id: string;
  orderId: string;
  department: string;
  measure: string;
  status: RectifyStatus;
  deadline: string;
  completeTime?: string;
  reviewer?: string;
}

export interface Department {
  id: string;
  name: string;
  manager: string;
}

export interface ServiceStandard {
  id: string;
  category: string;
  title: string;
  content: string;
  updateTime: string;
}

export interface ReplyTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
}

export interface TrendData {
  date: string;
  count: number;
}

export interface CategoryData {
  name: string;
  value: number;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  processingRate: number;
  avgSatisfaction: number;
  todayOrders: number;
  overdueOrders: number;
}
