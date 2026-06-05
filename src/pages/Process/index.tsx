import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Search,
  Filter,
  UserPlus,
  MessageSquare,
  Clock,
  AlertCircle,
  Check,
  FileText,
  Eye,
  X,
  File,
  ChevronDown,
} from 'lucide-react';
import { useAppStore, formatDateTime } from '../../store/useAppStore';
import { replyTemplates, problemCategories, departments } from '../../data/mockData';
import { statusMap, urgencyMap, channelMap, isOverdue } from '../../utils';
import type {
  WorkOrder,
  WorkOrderStatus,
  UrgencyLevel,
  ChannelType,
} from '../../types';

export default function Process() {
  const location = useLocation();
  const locationState = location.state as { searchKeyword?: string; openOrderId?: string } | null;

  const { workOrders, updateWorkOrder } = useAppStore();

  const [activeTab, setActiveTab] = useState<WorkOrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [assignDept, setAssignDept] = useState('');
  const [assignPerson, setAssignPerson] = useState('');
  const [assignRemark, setAssignRemark] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const [filters, setFilters] = useState({
    channel: '' as ChannelType | '',
    category: '',
    urgency: '' as UrgencyLevel | '',
    department: '',
    overdue: '' as '' | 'yes' | 'no',
  });

  useEffect(() => {
    if (locationState?.searchKeyword) {
      setSearchKeyword(locationState.searchKeyword);
    }
    if (locationState?.openOrderId) {
      const order = workOrders.find((o) => o.id === locationState.openOrderId);
      if (order) setSelectedOrder(order);
    }
  }, [locationState, workOrders]);

  useEffect(() => {
    if (selectedOrder) {
      const updated = workOrders.find((o) => o.id === selectedOrder.id);
      if (updated) setSelectedOrder(updated);
    }
  }, [workOrders, selectedOrder?.id]);

  const filteredOrders = useMemo(() => {
    let result = workOrders;

    if (activeTab !== 'all') {
      result = result.filter((o) => o.status === activeTab);
    }

    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(kw) ||
          o.title.toLowerCase().includes(kw) ||
          o.passengerName.toLowerCase().includes(kw) ||
          o.passengerPhone.includes(kw)
      );
    }

    if (filters.channel) {
      result = result.filter((o) => o.channel === filters.channel);
    }
    if (filters.category) {
      result = result.filter((o) => o.category === filters.category);
    }
    if (filters.urgency) {
      result = result.filter((o) => o.urgency === filters.urgency);
    }
    if (filters.department) {
      result = result.filter((o) => o.department === filters.department);
    }
    if (filters.overdue) {
      result = result.filter((o) => {
        const overdue = isOverdue(o.deadline) && o.status !== 'closed';
        return filters.overdue === 'yes' ? overdue : !overdue;
      });
    }

    return result;
  }, [workOrders, activeTab, searchKeyword, filters]);

  const tabCounts: Record<string, number> = {
    all: workOrders.length,
    pending: workOrders.filter((o) => o.status === 'pending').length,
    assigned: workOrders.filter((o) => o.status === 'assigned').length,
    processing: workOrders.filter((o) => o.status === 'processing').length,
    replied: workOrders.filter((o) => o.status === 'replied').length,
    closed: workOrders.filter((o) => o.status === 'closed').length,
  };

  const tabs: { key: WorkOrderStatus | 'all'; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待受理' },
    { key: 'assigned', label: '已分派' },
    { key: 'processing', label: '处理中' },
    { key: 'replied', label: '已答复' },
    { key: 'closed', label: '已关闭' },
  ];

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = replyTemplates.find((t) => t.id === templateId);
    if (template) {
      setReplyContent(template.content);
    }
  };

  const handleAssign = () => {
    if (!selectedOrder || !assignDept || !assignPerson) return;
    updateWorkOrder(selectedOrder.id, {
      status: 'assigned',
      department: assignDept,
      assignee: assignPerson,
      assignTime: formatDateTime(),
      assignRemark: assignRemark,
    });
    setShowAssignModal(false);
    setAssignDept('');
    setAssignPerson('');
    setAssignRemark('');
  };

  const handleReply = () => {
    if (!selectedOrder || !replyContent) return;
    updateWorkOrder(selectedOrder.id, {
      status: 'replied',
      replyContent: replyContent,
      replyTime: formatDateTime(),
    });
    setShowReplyModal(false);
    setReplyContent('');
    setSelectedTemplate('');
  };

  const clearFilters = () => {
    setFilters({
      channel: '',
      category: '',
      urgency: '',
      department: '',
      overdue: '',
    });
  };

  const hasActiveFilters =
    filters.channel || filters.category || filters.urgency || filters.department || filters.overdue;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="搜索工单编号、标题、旅客姓名、手机号..."
                  className="pl-9 pr-4 py-2 w-80 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilterModal(true)}
                className={`flex items-center px-3 py-2 text-sm border rounded-md hover:bg-neutral-50 transition-colors ${
                  hasActiveFilters
                    ? 'border-railway-500 bg-railway-50 text-railway-600'
                    : 'border-neutral-300'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                筛选
                {hasActiveFilters && (
                  <span className="ml-1 w-2 h-2 bg-railway-500 rounded-full"></span>
                )}
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-neutral-500">共 {filteredOrders.length} 条记录</span>
            </div>
          </div>

          <div className="flex space-x-1 border-b border-neutral-200 -mx-4 px-4">
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
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">工单编号</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">标题</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">旅客</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">分类</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">紧急程度</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">状态</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">责任部门</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">处理时限</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const overdue = isOverdue(order.deadline) && order.status !== 'closed';
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="py-3 px-4 text-railway-600 font-mono text-xs">{order.id}</td>
                      <td className="py-3 px-4 text-neutral-700 max-w-xs truncate">
                        {order.title}
                      </td>
                      <td className="py-3 px-4 text-neutral-600">{order.passengerName}</td>
                      <td className="py-3 px-4 text-neutral-600">{order.category}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            urgencyMap[order.urgency].color
                          }`}
                        >
                          {urgencyMap[order.urgency].label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            statusMap[order.status].color
                          }`}
                        >
                          {statusMap[order.status].label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        {order.department || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {overdue ? (
                            <AlertCircle className="w-4 h-4 text-danger-500 mr-1" />
                          ) : (
                            <Clock className="w-4 h-4 text-neutral-400 mr-1" />
                          )}
                          <span className={overdue ? 'text-danger-500' : 'text-neutral-500'}>
                            {order.deadline}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            className="p-1 text-neutral-500 hover:text-railway-500 transition-colors"
                            title="查看详情"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {order.status === 'pending' && (
                            <button
                              className="p-1 text-neutral-500 hover:text-railway-500 transition-colors"
                              title="分派工单"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                                setShowAssignModal(true);
                              }}
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                          )}
                          {(order.status === 'assigned' || order.status === 'processing') && (
                            <button
                              className="p-1 text-neutral-500 hover:text-success-500 transition-colors"
                              title="答复工单"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                                setShowReplyModal(true);
                              }}
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-neutral-400">
                    暂无符合条件的工单记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-neutral-200 flex items-center justify-between">
          <span className="text-sm text-neutral-500">
            显示 1-{filteredOrders.length} 条，共 {filteredOrders.length} 条
          </span>
        </div>
      </div>

      {selectedOrder && !showAssignModal && !showReplyModal && !showFilterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg w-[750px] max-h-[85vh] overflow-hidden animate-slide-up">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-700">工单详情</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-neutral-500">工单编号</p>
                  <p className="text-sm font-mono text-railway-600 mt-1">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">工单状态</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                      statusMap[selectedOrder.status].color
                    }`}
                  >
                    {statusMap[selectedOrder.status].label}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">工单标题</p>
                  <p className="text-sm text-neutral-700 mt-1">{selectedOrder.title}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">渠道来源</p>
                  <p className="text-sm text-neutral-700 mt-1">
                    {channelMap[selectedOrder.channel].label}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">旅客姓名</p>
                  <p className="text-sm text-neutral-700 mt-1">{selectedOrder.passengerName}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">联系电话</p>
                  <p className="text-sm text-neutral-700 mt-1">{selectedOrder.passengerPhone}</p>
                </div>
                {selectedOrder.trainNo && (
                  <div>
                    <p className="text-sm text-neutral-500">车次</p>
                    <p className="text-sm text-neutral-700 mt-1">{selectedOrder.trainNo}</p>
                  </div>
                )}
                {selectedOrder.station && (
                  <div>
                    <p className="text-sm text-neutral-500">站点</p>
                    <p className="text-sm text-neutral-700 mt-1">{selectedOrder.station}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-neutral-500">问题分类</p>
                  <p className="text-sm text-neutral-700 mt-1">{selectedOrder.category}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">紧急程度</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                      urgencyMap[selectedOrder.urgency].color
                    }`}
                  >
                    {urgencyMap[selectedOrder.urgency].label}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">创建时间</p>
                  <p className="text-sm text-neutral-700 mt-1">{selectedOrder.createTime}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">处理时限</p>
                  <p className="text-sm text-neutral-700 mt-1">{selectedOrder.deadline}</p>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm text-neutral-500 mb-1">问题描述</p>
                <div className="p-3 bg-neutral-50 rounded-md text-sm text-neutral-700 whitespace-pre-wrap">
                  {selectedOrder.content}
                </div>
              </div>
              {selectedOrder.attachments && selectedOrder.attachments.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-neutral-500 mb-2">附件</p>
                  <div className="space-y-2">
                    {selectedOrder.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center p-3 bg-neutral-50 rounded-md border border-neutral-200"
                      >
                        <File className="w-4 h-4 text-railway-500 mr-2" />
                        <span className="text-sm text-neutral-700 flex-1">{att.name}</span>
                        <span className="text-xs text-neutral-400">{formatFileSize(att.size)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedOrder.assignee && (
                <div className="mb-4">
                  <p className="text-sm text-neutral-500 mb-1">处理人员</p>
                  <p className="text-sm text-neutral-700">
                    {selectedOrder.department} - {selectedOrder.assignee}
                  </p>
                  {selectedOrder.assignTime && (
                    <p className="text-xs text-neutral-400 mt-1">
                      分派时间：{selectedOrder.assignTime}
                    </p>
                  )}
                </div>
              )}
              {selectedOrder.replyContent && (
                <div>
                  <p className="text-sm text-neutral-500 mb-1">答复内容</p>
                  <div className="p-3 bg-success-50 rounded-md text-sm text-neutral-700 whitespace-pre-wrap border border-success-100">
                    {selectedOrder.replyContent}
                  </div>
                  {selectedOrder.replyTime && (
                    <p className="text-xs text-neutral-400 mt-1">
                      答复时间：{selectedOrder.replyTime}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-neutral-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-sm text-neutral-600 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors"
              >
                关闭
              </button>
              {selectedOrder.status === 'pending' && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="px-4 py-2 text-sm text-white bg-railway-500 rounded-md hover:bg-railway-600 transition-colors flex items-center"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  分派工单
                </button>
              )}
              {(selectedOrder.status === 'assigned' || selectedOrder.status === 'processing') && (
                <button
                  onClick={() => setShowReplyModal(true)}
                  className="px-4 py-2 text-sm text-white bg-success-500 rounded-md hover:bg-success-600 transition-colors flex items-center"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  提交答复
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showAssignModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg w-[500px] animate-slide-up">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-700">分派工单</h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setAssignDept('');
                  setAssignPerson('');
                  setAssignRemark('');
                }}
                className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 bg-neutral-50 rounded-md">
                <p className="text-sm text-neutral-500">当前工单</p>
                <p className="text-sm font-medium text-neutral-700 mt-1">{selectedOrder.title}</p>
                <p className="text-xs text-neutral-400 mt-1">{selectedOrder.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  责任部门 <span className="text-danger-500">*</span>
                </label>
                <select
                  value={assignDept}
                  onChange={(e) => setAssignDept(e.target.value)}
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
                  处理人员 <span className="text-danger-500">*</span>
                </label>
                <select
                  value={assignPerson}
                  onChange={(e) => setAssignPerson(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent"
                >
                  <option value="">请选择处理人员</option>
                  <option value="李坐席">李坐席</option>
                  <option value="王坐席">王坐席</option>
                  <option value="张坐席">张坐席</option>
                  <option value="赵坐席">赵坐席</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">备注说明</label>
                <textarea
                  value={assignRemark}
                  onChange={(e) => setAssignRemark(e.target.value)}
                  rows={3}
                  placeholder="请输入分派备注..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="p-4 border-t border-neutral-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setAssignDept('');
                  setAssignPerson('');
                  setAssignRemark('');
                }}
                className="px-4 py-2 text-sm text-neutral-600 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAssign}
                disabled={!assignDept || !assignPerson}
                className="px-4 py-2 text-sm text-white bg-railway-500 rounded-md hover:bg-railway-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4 mr-2" />
                确认分派
              </button>
            </div>
          </div>
        </div>
      )}

      {showReplyModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg w-[650px] max-h-[85vh] overflow-hidden animate-slide-up">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-700">提交答复</h3>
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setSelectedTemplate('');
                  setReplyContent('');
                }}
                className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto max-h-[60vh]">
              <div className="p-3 bg-neutral-50 rounded-md">
                <p className="text-sm text-neutral-500">当前工单</p>
                <p className="text-sm font-medium text-neutral-700 mt-1">{selectedOrder.title}</p>
                <p className="text-xs text-neutral-400 mt-1">{selectedOrder.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  选择答复模板
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {replyTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`p-3 text-left border rounded-md text-sm transition-colors ${
                        selectedTemplate === template.id
                          ? 'border-railway-500 bg-railway-50'
                          : 'border-neutral-300 hover:border-railway-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-neutral-500" />
                        <span className="font-medium text-neutral-700">{template.title}</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">{template.category}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  答复内容 <span className="text-danger-500">*</span>
                </label>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={8}
                  placeholder="请输入答复内容..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent resize-none"
                  required
                />
              </div>
            </div>
            <div className="p-4 border-t border-neutral-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setSelectedTemplate('');
                  setReplyContent('');
                }}
                className="px-4 py-2 text-sm text-neutral-600 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleReply}
                disabled={!replyContent.trim()}
                className="px-4 py-2 text-sm text-white bg-success-500 rounded-md hover:bg-success-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4 mr-2" />
                提交答复
              </button>
            </div>
          </div>
        </div>
      )}

      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg w-[550px] animate-slide-up">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-700">筛选条件</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">渠道来源</label>
                  <select
                    value={filters.channel}
                    onChange={(e) =>
                      setFilters({ ...filters, channel: e.target.value as ChannelType | '' })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent"
                  >
                    <option value="">全部渠道</option>
                    {(Object.keys(channelMap) as ChannelType[]).map((ch) => (
                      <option key={ch} value={ch}>
                        {channelMap[ch].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">问题分类</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent"
                  >
                    <option value="">全部分类</option>
                    {problemCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">紧急程度</label>
                  <select
                    value={filters.urgency}
                    onChange={(e) =>
                      setFilters({ ...filters, urgency: e.target.value as UrgencyLevel | '' })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent"
                  >
                    <option value="">全部</option>
                    {(['normal', 'urgent', 'critical'] as UrgencyLevel[]).map((level) => (
                      <option key={level} value={level}>
                        {urgencyMap[level].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">责任部门</label>
                  <select
                    value={filters.department}
                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent"
                  >
                    <option value="">全部部门</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">超时状态</label>
                <select
                  value={filters.overdue}
                  onChange={(e) =>
                    setFilters({ ...filters, overdue: e.target.value as '' | 'yes' | 'no' })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent"
                >
                  <option value="">全部</option>
                  <option value="yes">已超时</option>
                  <option value="no">未超时</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-neutral-200 flex justify-between">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-800 transition-colors"
              >
                清空筛选条件
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="px-4 py-2 text-sm text-neutral-600 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="px-4 py-2 text-sm text-white bg-railway-500 rounded-md hover:bg-railway-600 transition-colors"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
