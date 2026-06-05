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
} from '../types';
import {
  workOrders as initialWorkOrders,
  reviews as initialReviews,
  rectifyTasks as initialRectifyTasks,
  replyTemplates as initialReplyTemplates,
  departments as initialDepartments,
  serviceStandards as initialServiceStandards,
} from '../data/mockData';

interface AppState {
  workOrders: WorkOrder[];
  reviews: Review[];
  rectifyTasks: RectifyTask[];
  replyTemplates: ReplyTemplate[];
  departments: Department[];
  serviceStandards: ServiceStandard[];
  addWorkOrder: (order: Omit<WorkOrder, 'id' | 'createTime' | 'status'>) => void;
  updateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  addReview: (review: Omit<Review, 'id'>) => void;
  updateReview: (id: string, updates: Partial<Review>) => void;
  addRectifyTask: (task: Omit<RectifyTask, 'id'>) => void;
  updateRectifyTask: (id: string, updates: Partial<RectifyTask>) => void;
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

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      workOrders: initialWorkOrders,
      reviews: initialReviews,
      rectifyTasks: initialRectifyTasks,
      replyTemplates: initialReplyTemplates,
      departments: initialDepartments,
      serviceStandards: initialServiceStandards,

      addWorkOrder: (order) => {
        const newOrder: WorkOrder = {
          ...order,
          id: generateId('WO'),
          status: 'pending',
          createTime: formatDateTime(),
        };
        set({ workOrders: [newOrder, ...get().workOrders] });
      },

      updateWorkOrder: (id, updates) => {
        set({
          workOrders: get().workOrders.map((o) =>
            o.id === id ? { ...o, ...updates } : o
          ),
        });
      },

      addReview: (review) => {
        const newReview: Review = {
          ...review,
          id: generateId('R'),
        };
        set({ reviews: [newReview, ...get().reviews] });
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

      updateRectifyTask: (id, updates) => {
        set({
          rectifyTasks: get().rectifyTasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        });
      },

      resetData: () => {
        set({
          workOrders: initialWorkOrders,
          reviews: initialReviews,
          rectifyTasks: initialRectifyTasks,
          replyTemplates: initialReplyTemplates,
          departments: initialDepartments,
          serviceStandards: initialServiceStandards,
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
