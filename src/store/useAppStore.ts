import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  WorkOrder,
  Review,
  RectifyTask,
  ReplyTemplate,
  Department,
  ServiceStandard,
  WorkOrderStatus,
  UrgencyLevel,
  ChannelType,
  RectifyStatus,
  SatisfactionLevel,
  UserRole,
  OperationLog,
  FollowUpTask,
  ActionType,
} from '../types';
import {
  workOrders as initialWorkOrders,
  reviews as initialReviews,
  rectifyTasks as initialRectifyTasks,
  replyTemplates as initialReplyTemplates,
  departments as initialDepartments,
  serviceStandards as initialServiceStandards,
  operationLogs as initialOperationLogs,
  followUpTasks as initialFollowUpTasks,
} from '../data/mockData';

interface AppState {
  workOrders: WorkOrder[];
  reviews: Review[];
  rectifyTasks: RectifyTask[];
  replyTemplates: ReplyTemplate[];
  departments: Department[];
  serviceStandards: ServiceStandard[];
  operationLogs: OperationLog[];
  followUpTasks: FollowUpTask[];
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  addWorkOrder: (order: Omit<WorkOrder, 'id' | 'createTime' | 'status'>, operator?: string) => void;
  updateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  batchAssignWorkOrders: (ids: string[], department: string, assignee: string, operator?: string) => void;
  addReview: (review: Omit<Review, 'id'>, operator?: string) => void;
  updateReview: (id: string, updates: Partial<Review>) => void;
  addRectifyTask: (task: Omit<RectifyTask, 'id'>) => void;
  updateRectifyTask: (id: string, updates: Partial<RectifyTask>, operator?: string) => void;
  addOperationLog: (log: Omit<OperationLog, 'id' | 'createTime'>) => void;
  addFollowUpTask: (task: Omit<FollowUpTask, 'id' | 'createTime' | 'status'>) => void;
  updateFollowUpTask: (id: string, updates: Partial<FollowUpTask>) => void;
  resetData: () => void;
}

const generateId = (prefix: string) => {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `${prefix}${dateStr}${random}`;
};

const formatDateTime = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
};

const actionNameMap: Record<ActionType, string> = {
  create: '创建工单',
  assign: '分派工单',
  batch_assign: '批量分派工单',
  reply: '提交答复',
  review: '旅客回访',
  rectify_confirm: '确认整改责任',
  rectify_measure: '提交整改措施',
  rectify_close: '复核关闭整改',
  followup_create: '创建二次跟进',
  followup_complete: '完成二次跟进',
};

const roleNameMap: Record<UserRole, string> = {
  service: '客服人员',
  reviewer: '回访人员',
  manager: '管理人员',
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      workOrders: initialWorkOrders,
      reviews: initialReviews,
      rectifyTasks: initialRectifyTasks,
      replyTemplates: initialReplyTemplates,
      departments: initialDepartments,
      serviceStandards: initialServiceStandards,
      operationLogs: initialOperationLogs,
      followUpTasks: initialFollowUpTasks,
      currentRole: 'manager',

      setCurrentRole: (role) => {
        set({ currentRole: role });
      },

      addWorkOrder: (order, operator = '系统') => {
        const newOrder: WorkOrder = {
          ...order,
          id: generateId('WO'),
          status: 'pending',
          createTime: formatDateTime(),
        };
        set({ workOrders: [newOrder, ...get().workOrders] });
        get().addOperationLog({
          orderId: newOrder.id,
          action: 'create',
          actionName: actionNameMap.create,
          operator,
          operatorRole: roleNameMap[get().currentRole],
          remark: '新建工单',
        });
      },

      updateWorkOrder: (id, updates) => {
        set({
          workOrders: get().workOrders.map((o) =>
            o.id === id ? { ...o, ...updates } : o
          ),
        });
      },

      batchAssignWorkOrders: (ids, department, assignee, operator = '系统') => {
        const now = formatDateTime();
        set({
          workOrders: get().workOrders.map((o) =>
            ids.includes(o.id)
              ? {
                  ...o,
                  status: 'assigned',
                  department,
                  assignee,
                  assignTime: now,
                }
              : o
          ),
        });
        ids.forEach((id) => {
          get().addOperationLog({
            orderId: id,
            action: 'batch_assign',
            actionName: actionNameMap.batch_assign,
            operator,
            operatorRole: roleNameMap[get().currentRole],
            remark: `批量分派至 ${department} - ${assignee}`,
            details: { department, assignee, totalCount: ids.length },
          });
        });
      },

      addReview: (review, operator = '系统') => {
        const newReview: Review = {
          ...review,
          id: generateId('R'),
        };
        set({ reviews: [newReview, ...get().reviews] });
        get().addOperationLog({
          orderId: newReview.orderId,
          action: 'review',
          actionName: actionNameMap.review,
          operator,
          operatorRole: roleNameMap[get().currentRole],
          remark: `满意度：${newReview.satisfaction}分`,
          details: { satisfaction: newReview.satisfaction, isRepeat: newReview.isRepeat },
        });
      },

      updateReview: (id, updates) => {
        set({
          reviews: get().reviews.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        });
      },

      addRectifyTask: (task) => {
        const newTask: RectifyTask = {
          ...task,
          id: generateId('RT'),
        };
        set({ rectifyTasks: [newTask, ...get().rectifyTasks] });
      },

      updateRectifyTask: (id, updates, operator = '系统') => {
        set({
          rectifyTasks: get().rectifyTasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        });
        const task = get().rectifyTasks.find((t) => t.id === id);
        if (task && updates.status) {
          const actionMap: Record<string, ActionType> = {
            rectifying: 'rectify_confirm',
            reviewing: 'rectify_measure',
            closed: 'rectify_close',
          };
          const action = actionMap[updates.status];
          if (action) {
            get().addOperationLog({
              orderId: task.orderId,
              action,
              actionName: actionNameMap[action],
              operator,
              operatorRole: roleNameMap[get().currentRole],
              remark: `整改状态变更为：${updates.status}`,
              details: { rectifyTaskId: id, status: updates.status },
            });
          }
        }
      },

      addOperationLog: (log) => {
        const newLog: OperationLog = {
          ...log,
          id: generateId('LOG'),
          createTime: formatDateTime(),
        };
        set({ operationLogs: [newLog, ...get().operationLogs] });
      },

      addFollowUpTask: (task) => {
        const newTask: FollowUpTask = {
          ...task,
          id: generateId('FU'),
          status: 'pending',
          createTime: formatDateTime(),
        };
        set({ followUpTasks: [newTask, ...get().followUpTasks] });
        get().addOperationLog({
          orderId: newTask.orderId,
          action: 'followup_create',
          actionName: actionNameMap.followup_create,
          operator: newTask.assignee,
          operatorRole: roleNameMap[get().currentRole],
          remark: `创建二次跟进任务，计划完成时间：${newTask.deadline}`,
          details: { followUpId: newTask.id },
        });
      },

      updateFollowUpTask: (id, updates) => {
        set({
          followUpTasks: get().followUpTasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        });
        const task = get().followUpTasks.find((t) => t.id === id);
        if (task && updates.status === 'completed') {
          get().addOperationLog({
            orderId: task.orderId,
            action: 'followup_complete',
            actionName: actionNameMap.followup_complete,
            operator: task.assignee,
            operatorRole: roleNameMap[get().currentRole],
            remark: '二次跟进任务完成',
            details: { followUpId: id, result: updates.result },
          });
        }
      },

      resetData: () => {
        set({
          workOrders: initialWorkOrders,
          reviews: initialReviews,
          rectifyTasks: initialRectifyTasks,
          replyTemplates: initialReplyTemplates,
          departments: initialDepartments,
          serviceStandards: initialServiceStandards,
          operationLogs: initialOperationLogs,
          followUpTasks: initialFollowUpTasks,
          currentRole: 'manager',
        });
      },
    }),
    {
      name: 'railway-service-storage',
    }
  )
);

export { generateId, formatDateTime };

export type {
  WorkOrder,
  Review,
  RectifyTask,
  ReplyTemplate,
  Department,
  ServiceStandard,
  WorkOrderStatus,
  UrgencyLevel,
  ChannelType,
  RectifyStatus,
  SatisfactionLevel,
};
