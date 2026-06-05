import { useState, useMemo } from 'react';
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
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  User,
} from 'lucide-react';
import { useAppStore, formatDateTime } from '../../store/useAppStore';
import { rectifyStatusMap } from '../../utils';
import { departments } from '../../data/mockData';
import type { RectifyTask, RectifyStatus } from '../../types';

export default function Rectify() {
  const { rectifyTasks, updateRectifyTask, currentRole } = useAppStore();
  const canOperate = currentRole === 'manager';

  const [activeTab, setActiveTab] = useState<RectifyStatus | 'all'>('all');
  const [selectedTask, setSelectedTask] = useState<RectifyTask | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showMeasureModal, setShowMeasureModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeRemark, setCloseRemark] = useState('');
  const [confirmDept, setConfirmDept] = useState('');
  const [confirmPerson, setConfirmPerson] = useState('');
  const [measureContent, setMeasureContent] = useState('');
  const [closeEvaluation, setCloseEvaluation] = useState<'优秀' | '良好' | '合格' | '不合格'>('良好');
  const [closeReviewer, setCloseReviewer] = useState('管理员');

  const filteredTasks = useMemo(
    () =>
      activeTab === 'all'
        ? rectifyTasks
        : rectifyTasks.filter((t) => t.status === activeTab),
    [rectifyTasks, activeTab]
  );

  const tabCounts: Record<string, number> = useMemo(
    () => ({
      all: rectifyTasks.length,
      pending: rectifyTasks.filter((t) => t.status === 'pending').length,
      rectifying: rectifyTasks.filter((t) => t.status === 'rectifying').length,
      reviewing: rectifyTasks.filter((t) => t.status === 'reviewing').length,
      closed: rectifyTasks.filter((t) => t.status === 'closed').length,
    }),
    [rectifyTasks]
  );

  const tabs: { key: RectifyStatus | 'all'; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待整改' },
    { key: 'rectifying', label: '整改中' },
    { key: 'reviewing', label: '待复核' },
    { key: 'closed', label: '已关闭' },
  ];

  const openConfirmModal = (task: RectifyTask) => {
    setSelectedTask(task);
    setConfirmDept(task.department);
    setConfirmPerson('');
    setShowConfirmModal(true);
  };

  const openMeasureModal = (task: RectifyTask) => {
    setSelectedTask(task);
    setMeasureContent(task.measure || '');
    setShowMeasureModal(true);
  };

  const openCloseModal = (task: RectifyTask) => {
    setSelectedTask(task);
    setCloseRemark('');
    setCloseEvaluation('良好');
    setShowCloseModal(true);
  };

  const handleConfirm = () => {
    if (!selectedTask || !confirmDept || !confirmPerson) return;
    updateRectifyTask(selectedTask.id, {
      status: 'rectifying',
      department: confirmDept,
      responsiblePerson: confirmPerson,
      assignTime: formatDateTime(),
    });
    setShowConfirmModal(false);
    setConfirmDept('');
    setConfirmPerson('');
    setSelectedTask(null);
  };

  const handleMeasureSubmit = () => {
    if (!selectedTask || !measureContent) return;
    updateRectifyTask(selectedTask.id, {
      status: 'reviewing',
      measure: measureContent,
      completeTime: formatDateTime(),
    });
    setShowMeasureModal(false);
    setMeasureContent('');
    setSelectedTask(null);
  };

  const handleClose = () => {
    if (!selectedTask || !closeRemark) return;
    updateRectifyTask(selectedTask.id, {
      status: 'closed',
      reviewComment: closeRemark,
      reviewEvaluation: closeEvaluation,
      reviewer: closeReviewer,
      closeTime: formatDateTime(),
    });
    setShowCloseModal(false);
    setCloseRemark('');
    setSelectedTask(null);
  };

  const stats = [
    { label: '待整改', value: tabCounts.pending, icon: Clock, color: 'bg-warning-500' },
    { label: '整改中', value: tabCounts.rectifying, icon: Wrench, color: 'bg-railway-500' },
    { label: '待复核', value: tabCounts.reviewing, icon: Eye, color: 'bg-warning-500' },
    { label: '已关闭', value: tabCounts.closed, icon: CheckCircle, color: 'bg-success-500' },
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
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">责任人</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">整改期限</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">状态</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">完成时间</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer"
                    onClick={() => setSelectedTask(task)}
                  >
                    <td className="py-3 px-4 text-railway-600 font-mono text-xs">{task.id}</td>
                    <td className="py-3 px-4 text-neutral-700 max-w-xs truncate">
                      {task.orderTitle}
                    </td>
                    <td className="py-3 px-4 text-neutral-600">{task.department}</td>
                    <td className="py-3 px-4 text-neutral-600">
                      {task.responsiblePerson || '-'}
                    </td>
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
                      {task.completeTime || task.closeTime || '-'}
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
                        {canOperate && task.status === 'pending' && (
                          <button
                            className="p-1 text-neutral-500 hover:text-success-500 transition-colors"
                            title="确认责任"
                            onClick={(e) => {
                              e.stopPropagation();
                              openConfirmModal(task);
                            }}
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        {canOperate && task.status === 'rectifying' && (
                          <button
                            className="p-1 text-neutral-500 hover:text-success-500 transition-colors"
                            title="提交整改措施"
                            onClick={(e) => {
                              e.stopPropagation();
                              openMeasureModal(task);
                            }}
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                        {canOperate && task.status === 'reviewing' && (
                          <button
                            className="p-1 text-neutral-500 hover:text-success-500 transition-colors"
                            title="复核关闭"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCloseModal(task);
                            }}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    暂无整改任务
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTask &&
        !showConfirmModal &&
        !showMeasureModal &&
        !showCloseModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-lg w-[700px] max-h-[85vh] overflow-hidden animate-slide-up">
              <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-700">整改任务详情</h3>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 overflow-y-auto max-h-[65vh]">
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
                    <p className="text-sm text-neutral-500">责任人</p>
                    <p className="text-sm text-neutral-700 mt-1">
                      {selectedTask.responsiblePerson || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">整改期限</p>
                    <p className="text-sm text-neutral-700 mt-1">{selectedTask.deadline}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">分派时间</p>
                    <p className="text-sm text-neutral-700 mt-1">
                      {selectedTask.assignTime || '-'}
                    </p>
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
                  {selectedTask.closeTime && (
                    <div>
                      <p className="text-sm text-neutral-500">关闭时间</p>
                      <p className="text-sm text-neutral-700 mt-1">{selectedTask.closeTime}</p>
                    </div>
                  )}
                  {selectedTask.reviewEvaluation && (
                    <div>
                      <p className="text-sm text-neutral-500">整改评价</p>
                      <p className="text-sm text-neutral-700 mt-1">
                        {selectedTask.reviewEvaluation}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <p className="text-sm text-neutral-500 mb-2">关联工单</p>
                  <div className="p-3 bg-neutral-50 rounded-md">
                    <p className="text-sm font-medium text-neutral-700">
                      {selectedTask.orderTitle}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">{selectedTask.orderId}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-neutral-500 mb-2">问题描述</p>
                  <div className="p-3 bg-warning-50 rounded-md border border-warning-100">
                    <p className="text-sm text-neutral-700">
                      {selectedTask.problemDescription}
                    </p>
                  </div>
                </div>
                {selectedTask.measure && (
                  <div className="mb-4">
                    <p className="text-sm text-neutral-500 mb-2">整改措施</p>
                    <div className="p-3 bg-railway-50 rounded-md border border-railway-100">
                      <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-sans leading-relaxed">
                        {selectedTask.measure}
                      </pre>
                    </div>
                  </div>
                )}
                {selectedTask.reviewComment && (
                  <div>
                    <p className="text-sm text-neutral-500 mb-2">复核意见</p>
                    <div className="p-3 bg-success-50 rounded-md border border-success-100">
                      <p className="text-sm text-neutral-700">{selectedTask.reviewComment}</p>
                    </div>
                  </div>
                )}
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
                    onClick={() => openConfirmModal(selectedTask)}
                    className="px-4 py-2 text-sm text-white bg-railway-500 rounded-md hover:bg-railway-600 transition-colors flex items-center"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    确认责任
                  </button>
                )}
                {selectedTask.status === 'rectifying' && (
                  <button
                    onClick={() => openMeasureModal(selectedTask)}
                    className="px-4 py-2 text-sm text-white bg-railway-500 rounded-md hover:bg-railway-600 transition-colors flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    提交整改措施
                  </button>
                )}
                {selectedTask.status === 'reviewing' && (
                  <button
                    onClick={() => openCloseModal(selectedTask)}
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

      {showConfirmModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg w-[500px] animate-slide-up">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-700">确认责任部门</h3>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedTask(null);
                }}
                className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 bg-neutral-50 rounded-md">
                <p className="text-sm font-medium text-neutral-700">{selectedTask.orderTitle}</p>
                <p className="text-xs text-neutral-500 mt-1">{selectedTask.id}</p>
              </div>
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
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  责任人 <span className="text-danger-500">*</span>
                </label>
                <select
                  value={confirmPerson}
                  onChange={(e) => setConfirmPerson(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent"
                >
                  <option value="">请选择责任人</option>
                  <option value="李工">李工</option>
                  <option value="王工">王工</option>
                  <option value="张工">张工</option>
                  <option value="赵工">赵工</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-neutral-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedTask(null);
                }}
                className="px-4 py-2 text-sm text-neutral-600 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                disabled={!confirmDept || !confirmPerson}
                className="px-4 py-2 text-sm text-white bg-success-500 rounded-md hover:bg-success-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4 mr-2" />
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {showMeasureModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg w-[600px] animate-slide-up">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-700">提交整改措施</h3>
              <button
                onClick={() => {
                  setShowMeasureModal(false);
                  setSelectedTask(null);
                }}
                className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 bg-neutral-50 rounded-md">
                <p className="text-sm font-medium text-neutral-700">{selectedTask.orderTitle}</p>
                <p className="text-xs text-neutral-500 mt-1">{selectedTask.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  整改措施 <span className="text-danger-500">*</span>
                </label>
                <textarea
                  value={measureContent}
                  onChange={(e) => setMeasureContent(e.target.value)}
                  rows={8}
                  placeholder="请详细描述整改措施、落实方案、完成时间节点等..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent resize-none"
                  required
                />
              </div>
            </div>
            <div className="p-4 border-t border-neutral-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowMeasureModal(false);
                  setSelectedTask(null);
                }}
                className="px-4 py-2 text-sm text-neutral-600 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleMeasureSubmit}
                disabled={!measureContent.trim()}
                className="px-4 py-2 text-sm text-white bg-success-500 rounded-md hover:bg-success-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 mr-2" />
                提交
              </button>
            </div>
          </div>
        </div>
      )}

      {showCloseModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg w-[550px] animate-slide-up">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-700">复核关闭</h3>
              <button
                onClick={() => {
                  setShowCloseModal(false);
                  setSelectedTask(null);
                }}
                className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
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
                <div className="flex space-x-2">
                  {(['优秀', '良好', '合格', '不合格'] as const).map((level) => (
                    <label
                      key={level}
                      className={`flex items-center px-3 py-2 border rounded-md cursor-pointer transition-colors ${
                        closeEvaluation === level
                          ? 'border-railway-500 bg-railway-50 text-railway-700'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="evaluation"
                        value={level}
                        checked={closeEvaluation === level}
                        onChange={() => setCloseEvaluation(level)}
                        className="mr-2"
                      />
                      <span className="text-sm">{level}</span>
                      {level === '优秀' && <ThumbsUp className="w-4 h-4 ml-1" />}
                      {level === '不合格' && <ThumbsDown className="w-4 h-4 ml-1" />}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">复核人</label>
                <div className="flex items-center px-3 py-2 bg-neutral-50 rounded-md border border-neutral-200">
                  <User className="w-4 h-4 text-neutral-400 mr-2" />
                  <span className="text-sm text-neutral-700">{closeReviewer}</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-neutral-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCloseModal(false);
                  setSelectedTask(null);
                }}
                className="px-4 py-2 text-sm text-neutral-600 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleClose}
                disabled={!closeRemark.trim()}
                className="px-4 py-2 text-sm text-white bg-success-500 rounded-md hover:bg-success-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
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
