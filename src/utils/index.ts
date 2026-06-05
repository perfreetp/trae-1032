import type { WorkOrderStatus, UrgencyLevel, ChannelType, SatisfactionLevel, RectifyStatus } from '../types';

export const statusMap: Record<WorkOrderStatus, { label: string; color: string }> = {
  pending: { label: '待受理', color: 'bg-warning-100 text-warning-600' },
  assigned: { label: '已分派', color: 'bg-railway-100 text-railway-600' },
  processing: { label: '处理中', color: 'bg-warning-100 text-warning-600' },
  replied: { label: '已答复', color: 'bg-success-100 text-success-600' },
  closed: { label: '已关闭', color: 'bg-neutral-200 text-neutral-500' },
};

export const urgencyMap: Record<UrgencyLevel, { label: string; color: string }> = {
  normal: { label: '一般', color: 'bg-neutral-100 text-neutral-600' },
  urgent: { label: '紧急', color: 'bg-warning-100 text-warning-600' },
  critical: { label: '特急', color: 'bg-danger-100 text-danger-600' },
};

export const channelMap: Record<ChannelType, { label: string; icon: string }> = {
  hotline: { label: '热线电话', icon: 'Phone' },
  web: { label: '网站留言', icon: 'Globe' },
  wechat: { label: '微信公众号', icon: 'MessageSquare' },
  app: { label: 'APP反馈', icon: 'Smartphone' },
};

export const satisfactionMap: Record<SatisfactionLevel, { label: string; color: string }> = {
  1: { label: '非常不满意', color: 'text-danger-500' },
  2: { label: '不满意', color: 'text-warning-500' },
  3: { label: '一般', color: 'text-neutral-500' },
  4: { label: '满意', color: 'text-success-500' },
  5: { label: '非常满意', color: 'text-success-600' },
};

export const rectifyStatusMap: Record<RectifyStatus, { label: string; color: string }> = {
  pending: { label: '待整改', color: 'bg-warning-100 text-warning-600' },
  rectifying: { label: '整改中', color: 'bg-railway-100 text-railway-600' },
  reviewing: { label: '待复核', color: 'bg-warning-100 text-warning-600' },
  closed: { label: '已关闭', color: 'bg-success-100 text-success-600' },
};

export const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return dateStr;
};

export const isOverdue = (deadline: string) => {
  return new Date(deadline) < new Date();
};
