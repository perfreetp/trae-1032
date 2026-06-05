export type WorkOrderStatus = 'pending' | 'assigned' | 'processing' | 'replied' | 'closed';
export type UrgencyLevel = 'normal' | 'urgent' | 'critical';
export type ChannelType = 'hotline' | 'web' | 'wechat' | 'app';
export type SatisfactionLevel = 1 | 2 | 3 | 4 | 5;
export type RectifyStatus = 'pending' | 'rectifying' | 'reviewing' | 'closed';

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

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
  attachments?: Attachment[];
  assignee?: string;
  department?: string;
  replyContent?: string;
  replyTime?: string;
  assignTime?: string;
  assignRemark?: string;
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
  orderTitle: string;
  passengerName: string;
  satisfaction: SatisfactionLevel;
  comment: string;
  reviewTime: string;
  isRepeat: boolean;
  reviewer?: string;
  remark?: string;
}

export interface RectifyTask {
  id: string;
  orderId: string;
  orderTitle: string;
  department: string;
  responsiblePerson?: string;
  problemDescription: string;
  measure?: string;
  status: RectifyStatus;
  deadline: string;
  assignTime?: string;
  completeTime?: string;
  reviewer?: string;
  reviewComment?: string;
  reviewEvaluation?: string;
  closeTime?: string;
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
