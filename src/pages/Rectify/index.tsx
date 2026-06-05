import { useState } from 'react';
import {
  Wrench,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  UserCheck,
  FileText,
  Send,
  X,
  Check,
} from 'lucide-react';
import { rectifyTasks, workOrders, departments } from '../../data/mockData';
import { rectifyStatusMap } from '../../utils';
import type { RectifyTask, RectifyStatus } from '../../types';

export default function Rectify() {
  const [activeTab, setActiveTab] = useState<RectifyStatus | 'all'>('all');
  const [selectedTask, setSelectedTask] = useState<RectifyTask | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeRemark, setCloseRemark] = useState('');
  const [confirmDept, setConfirmDept] = useState('');

  const filteredTasks =
    activeTab === 'all'
      ? rectifyTasks
      : rectifyTasks.filter((t) => t.status === activeTab);

  const tabCounts: Record<string, number> = {
    all: rectifyTasks.length,
    pending: rectifyTasks.filter((t) => t.status === 'pending').length,
    rectifying: rectifyTasks.filter((t) => t.status === 'rectifying').length,
    reviewing: rectifyTasks.filter((t) => t.status === 'reviewing').length,
    closed: rectifyTasks.filter((t) => t.status === 'closed').length,
  };

  const tabs: { key: RectifyStatus | 'all'; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待整改' },
    { key: 'rectifying', label: '整改中' },
    { key: 'reviewing', label: '待复核' },
    { key: 'closed', label: '已关闭' },
  ];

  const handleConfirm = () => {
    alert('责任部门已确认！');
    setShowConfirmModal(false);
    setConfirmDept('');
  };

  const handleClose = () => {
    alert('整改任务已复核关闭！');
    setShowCloseModal(false);
    setCloseRemark('');
  };

  const stats = [
    { label: '待整改', value: tabCounts.pending, icon: Clock, color: 'bg-warning-500' },
    { label: '整改中', value: tabCounts.rectifying, icon: Wrench, color: 'bg-railway-500' },
    { label: '待复核', value: tabCounts.reviewing, icon: Eye, color: 'bg-warning-500' },
    { label: '已完成', value: tabCounts.closed, icon: CheckCircle, color: 'bg-success-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg p-5 shadow-sm border border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-neutral-700 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-4 border-b border-neutral-200">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === tab.key
                    ? 'border-railway-500 text-railway-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-800'
                }`}
              >
                {tab.label}
                <span
                  className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === tab.key
                      ? 'bg-railway-100 text-railway-600'
                      : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {tabCounts[tab.key]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">任务编号</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">关联工单</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">责任部门</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">整改期限</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">状态</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">完成时间</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => {
                const order = workOrders.find((o) => o.id === task.orderId);
                return (
                  <tr
                    key={task.id}
                    className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer"
                    onClick={() => setSelectedTask(task)}
                  >
                    <td className="py-3 px-4 text-railway-600 font-mono text-xs">{task.id}</td>
                    <td className="py-3 px-4 text-neutral-700 max-w-xs truncate">
                      {order?.title}
                    </td>
                    <td className="py-3 px-4 text-neutral-600">{task.department}</td>
                    <td className="py-3 px-4 text-neutral-600">{task.deadline}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          rectifyStatusMap[task.status].color
                        }`}
                      >
                        {rectifyStatusMap[task.status].label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-500">
                      {task.completeTime || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-1 text-neutral-500 hover:text-railway-500 transition-colors"
                          title="查看详情"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTask(task);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {task.status === 'pending' && (
                          <button
                            className="p-1 text-neutral-500 hover:text-success-500 transition-colors"
                            title="确认责任"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTask(task);
                              setConfirmDept(task.department);
                              setShowConfirmModal(true);
                            }}
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        {task.status === 'reviewing' && (
                          <button
                            className="p-1 text-neutral-500 hover:text-success-500 transition-colors"
                            title="复核关闭"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTask(task);
                              setShowCloseModal(true);
                            }}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTask && !showConfirmModal && !showCloseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[650px] max-h-[80vh] overflow-hidden">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-700">整改任务详情</h3>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-neutral-500">任务编号</p>
                  <p className="text-sm font-mono text-railway-600 mt-1">{selectedTask.id}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">任务状态</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                      rectifyStatusMap[selectedTask.status].color
                    }`}
                  >
                    {rectifyStatusMap[selectedTask.status].label}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">责任部门</p>
                  <p className="text-sm text-neutral-700 mt-1">{selectedTask.department}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">整改期限</p>
                  <p className="text-sm text-neutral-700 mt-1">{selectedTask.deadline}</p>
                </div>
                {selectedTask.completeTime && (
                  <div>
                    <p className="text-sm text-neutral-500">完成时间</p>
                    <p className="text-sm text-neutral-700 mt-1">{selectedTask.completeTime}</p>
                  </div>
                )}
                {selectedTask.reviewer && (
                  <div>
                    <p className="text-sm text-neutral-500">复核人</p>
                    <p className="text-sm text-neutral-700 mt-1">{selectedTask.reviewer}</p>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <p className="text-sm text-neutral-500 mb-2">关联工单</p>
                <div className="p-3 bg-neutral-50 rounded-md">
                  <p className="text-sm font-medium text-neutral-700">
                    {workOrders.find((o) => o.id === selectedTask.orderId)?.title}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">{selectedTask.orderId}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-2">整改措施</p>
                <div className="p-4 bg-warning-50 rounded-md border border-warning-100">
                  <div className="flex items-start">
                    <FileText className="w-4 h-4 text-warning-600 mr-2 mt-0.5" />
                    <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-sans leading-relaxed">
                      {selectedTask.measure}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-neutral-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 text-sm text-neutral-600 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors"
              >
                关闭
              </button>
              {selectedTask.status === 'pending' && (
                <button
                  onClick={() => {
                    setConfirmDept(selectedTask.department);
                    setShowConfirmModal(true);
                  }}
                  className="px-4 py-2 text-sm text-white bg-railway-500 rounded-md hover:bg-railway-600 transition-colors flex items-center"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  确认责任
                </button>
              )}
              {selectedTask.status === 'reviewing' && (
                <button
                  onClick={() => setShowCloseModal(true)}
                  className="px-4 py-2 text-sm text-white bg-success-500 rounded-md hover:bg-success-600 transition-colors flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  复核关闭
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[450px]">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-700">确认责任部门</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  责任部门 <span className="text-danger-500">*</span>
                </label>
                <select
                  value={confirmDept}
                  onChange={(e) => setConfirmDept(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent"
                >
                  <option value="">请选择部门</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">责任说明</label>
                <textarea
                  rows={3}
                  placeholder="请输入责任界定说明..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="p-4 border-t border-neutral-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm text-neutral-600 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-sm text-white bg-success-500 rounded-md hover:bg-success-600 transition-colors flex items-center"
              >
                <Check className="w-4 h-4 mr-2" />
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {showCloseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[500px]">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-700">复核关闭</h3>
              <button
                onClick={() => setShowCloseModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start p-3 bg-success-50 rounded-md border border-success-100">
                <AlertTriangle className="w-5 h-5 text-warning-500 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-neutral-700">
                  确认整改措施已落实到位，复核通过后将关闭此整改任务。请填写复核意见。
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  复核意见 <span className="text-danger-500">*</span>
                </label>
                <textarea
                  value={closeRemark}
                  onChange={(e) => setCloseRemark(e.target.value)}
                  rows={4}
                  placeholder="请输入复核意见..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">整改评价</label>
                <div className="flex space-x-3">
                  {['优秀', '良好', '合格', '不合格'].map((level) => (
                    <label
                      key={level}
                      className="flex items-center px-3 py-2 border border-neutral-300 rounded-md cursor-pointer hover:border-railway-400 transition-colors"
                    >
                      <input type="radio" name="evaluation" className="mr-2" />
                      <span className="text-sm text-neutral-700">{level}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-neutral-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCloseModal(false)}
                className="px-4 py-2 text-sm text-neutral-600 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm text-white bg-success-500 rounded-md hover:bg-success-600 transition-colors flex items-center"
              >
                <Send className="w-4 h-4 mr-2" />
                确认关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
