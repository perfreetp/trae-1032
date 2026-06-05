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
  CheckSquare,
  Square,
  AlertTriangle,
  Timer,
  History,
  CheckCircle as CheckCircleIcon,
  Bell,
  UserCheck,
} from 'lucide-react';
import { useAppStore, formatDateTime } from '../../store/useAppStore';
import { replyTemplates, problemCategories, departments } from '../../data/mockData';
import { statusMap, urgencyMap, channelMap, isOverdue } from '../../utils';
import type {
  WorkOrder,
  WorkOrderStatus,
  UrgencyLevel,
  ChannelType,
  OperationLog,
  UserRole,
} from '../../types';

export default function Process() {
  const location = useLocation();
  const locationState = location.state as
    | { searchKeyword?: string; openOrderId?: string; status?: WorkOrderStatus }
    | null;

  const {
    workOrders,
    updateWorkOrder,
    batchAssignWorkOrders,
    operationLogs,
    currentRole,
    urgeRecords,
    addUrgeRecord,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<WorkOrderStatus | 'all'>('all');
  const [timeWarningFilter, setTimeWarningFilter] = useState<'all' | 'warning' | 'overdue' | 'normal'>('all');
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showBatchAssignModal, setShowBatchAssignModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [assignDept, setAssignDept] = useState('');
  const [assignPerson, setAssignPerson] = useState('');
  const [assignRemark, setAssignRemark] = useState('');
  const [batchAssignDept, setBatchAssignDept] = useState('');
  const [batchAssignPerson, setBatchAssignPerson] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showUrgeModal, setShowUrgeModal] = useState(false);
  const [urgeTarget, setUrgeTarget] = useState('');
  const [urgeDescription, setUrgeDescription] = useState('');
  const [urgeExpectedTime, setUrgeExpectedTime] = useState('');

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
    if (locationState?.status) {
      setActiveTab(locationState.status);
    }
  }, [locationState, workOrders]);

  useEffect(() => {
    if (selectedOrder) {
      const updated = workOrders.find((o) => o.id === selectedOrder.id);
      if (updated) setSelectedOrder(updated);
    }
  }, [workOrders, selectedOrder?.id]);

  const getTimeWarningType = (deadline: string, status: WorkOrderStatus): 'normal' | 'warning' | 'overdue' | 'completed' => {
    if (status === 'closed' || status === 'replied') return 'completed';
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) return 'overdue';
    if (diffHours <= 4) return 'warning';
    return 'normal';
  };

  const getTimeWarningText = (deadline: string, status: WorkOrderStatus): string => {
    if (status === 'closed' || status === 'replied') return '已完成';
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffMs = deadlineDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffMs < 0) {
      const overdueHours = Math.abs(Math.floor(diffHours));
      return `已超时 ${overdueHours} 小时`;
    }
    if (diffHours < 1) {
      const mins = Math.floor(diffHours * 60);
      return `剩余 ${mins} 分钟`;
    }
    if (diffHours < 24) {
      return `剩余 ${Math.floor(diffHours)} 小时`;
    }
    const days = Math.floor(diffHours / 24);
    return `剩余 ${days} 天`;
  };

  const orderLogs = useMemo(() => {
    if (!selectedOrder) return [];
    return operationLogs
      .filter((log) => log.orderId === selectedOrder.id)
      .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
  }, [selectedOrder, operationLogs]);

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

    if (timeWarningFilter !== 'all') {
      result = result.filter(
        (o) =>
          o.status !== 'closed' &&
          o.status !== 'replied' &&
          getTimeWarningType(o.deadline, o.status) === timeWarningFilter
      );
    }

    return result;
  }, [workOrders, activeTab, searchKeyword, filters, timeWarningFilter]);

  const pendingOrderIds = useMemo(() => {
    return filteredOrders.filter((o) => o.status === 'pending').map((o) => o.id);
  }, [filteredOrders]);

  const tabCounts: Record<string, number> = {
    all: workOrders.length,
    pending: workOrders.filter((o) => o.status === 'pending').length,
    assigned: workOrders.filter((o) => o.status === 'assigned').length,
    processing: workOrders.filter((o) => o.status === 'processing').length,
    replied: workOrders.filter((o) => o.status === 'replied').length,
    closed: workOrders.filter((o) => o.status === 'closed').length,
  };

  const statusFilteredOrders = useMemo(() => {
    let result = [...workOrders];
    if (activeTab !== 'all') {
      result = result.filter((o) => o.status === activeTab);
    }
    return result;
  }, [workOrders, activeTab]);

  const timeWarningCounts = useMemo(() => {
    const activeOrders = statusFilteredOrders.filter(
      (o) => o.status !== 'closed' && o.status !== 'replied'
    );
    return {
      all: activeOrders.length,
      warning: activeOrders.filter((o) => getTimeWarningType(o.deadline, o.status) === 'warning')
        .length,
      overdue: activeOrders.filter((o) => getTimeWarningType(o.deadline, o.status) === 'overdue')
        .length,
      normal: activeOrders.filter((o) => getTimeWarningType(o.deadline, o.status) === 'normal')
        .length,
    };
  }, [statusFilteredOrders]);

  const orderUrges = useMemo(() => {
    if (!selectedOrder) return [];
    return urgeRecords.filter((u) => u.orderId === selectedOrder.id);
  }, [selectedOrder, urgeRecords]);

  const canUrge = currentRole === 'service' || currentRole === 'manager';

  const openUrgeModal = () => {
    setUrgeTarget('');
    setUrgeDescription('');
    setUrgeExpectedTime('');
    setShowUrgeModal(true);
  };

  const submitUrge = () => {
    if (!selectedOrder || !urgeTarget || !urgeExpectedTime) return;
    addUrgeRecord({
      orderId: selectedOrder.id,
      orderTitle: selectedOrder.title,
      target: urgeTarget,
      description: urgeDescription,
      expectedTime: urgeExpectedTime,
      operator: '当前用户',
    });
    setShowUrgeModal(false);
  };

  const tabs: { key: WorkOrderStatus | 'all'; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待受理' },
    { key: 'assigned', label: '已分派' },
    { key: 'processing', label: '处理中' },
    { key: 'replied', label: '已答复' },
    { key: 'closed', label: '已关闭' },
  ];

  const timeWarningTabs = [
    { key: 'all', label: '全部', icon: Clock },
    { key: 'warning', label: '即将超时', icon: Timer },
    { key: 'overdue', label: '已超时', icon: AlertTriangle },
    { key: 'normal', label: '正常', icon: CheckCircleIcon },
  ];

  const canAssign = currentRole === 'service' || currentRole === 'manager';
  const canReply = currentRole === 'service' || currentRole === 'manager';

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

  const handleBatchAssign = () => {
    if (selectedIds.length === 0 || !batchAssignDept || !batchAssignPerson) return;
    batchAssignWorkOrders(selectedIds, batchAssignDept, batchAssignPerson);
    setShowBatchAssignModal(false);
    setBatchAssignDept('');
    setBatchAssignPerson('');
    setSelectedIds([]);
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

  const toggleSelectAll = () => {
    if (selectedIds.length === pendingOrderIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds([...pendingOrderIds]);
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

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
            <div className="flex items-center space-x-3">
              {canAssign && selectedIds.length > 0 && (
                <button
                  onClick={() => setShowBatchAssignModal(true)}
                  className="px-4 py-2 text-sm text-white bg-railway-500 rounded-md hover:bg-railway-600 transition-colors flex items-center"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  批量分派 ({selectedIds.length})
                </button>
              )}
              <span className="text-sm text-neutral-500">共 {filteredOrders.length} 条记录</span>
            </div>
          </div>

          <div className="flex space-x-2 mb-4">
            {timeWarningTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = timeWarningFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setTimeWarningFilter(tab.key as any)}
                  className={`flex items-center px-3 py-1.5 text-sm rounded-md transition-colors ${
                    isActive
                      ? tab.key === 'overdue'
                        ? 'bg-danger-500 text-white'
                        : tab.key === 'warning'
                        ? 'bg-warning-500 text-white'
                        : tab.key === 'normal'
                        ? 'bg-success-500 text-white'
                        : 'bg-railway-500 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-1.5" />
                  {tab.label}
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
                    {timeWarningCounts[tab.key as keyof typeof timeWarningCounts]}
                  </span>
                </button>
              );
            })}
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
                {canAssign && (
                  <th className="text-left py-3 px-4 text-neutral-500 font-medium w-10">
                    <button onClick={toggleSelectAll} className="p-1">
                      {selectedIds.length === pendingOrderIds.length && pendingOrderIds.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-railway-500" />
                      ) : (
                        <Square className="w-4 h-4 text-neutral-400" />
                      )}
                    </button>
                  </th>
                )}
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
                  const timeWarning = getTimeWarningType(order.deadline, order.status);
                  const timeWarningText = getTimeWarningText(order.deadline, order.status);
                  const isPending = order.status === 'pending';
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      {canAssign && (
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          {isPending ? (
                            <button onClick={() => toggleSelect(order.id)} className="p-1">
                              {selectedIds.includes(order.id) ? (
                                <CheckSquare className="w-4 h-4 text-railway-500" />
                              ) : (
                                <Square className="w-4 h-4 text-neutral-400" />
                              )}
                            </button>
                          ) : null}
                        </td>
                      )}
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
                          {timeWarning === 'overdue' ? (
                            <AlertCircle className="w-4 h-4 text-danger-500 mr-1" />
                          ) : timeWarning === 'warning' ? (
                            <Timer className="w-4 h-4 text-warning-500 mr-1" />
                          ) : (
                            <Clock className="w-4 h-4 text-neutral-400 mr-1" />
                          )}
                          <span
                            className={
                              timeWarning === 'overdue'
                                ? 'text-danger-500'
                                : timeWarning === 'warning'
                                ? 'text-warning-500'
                                : 'text-neutral-500'
                            }
                          >
                            {timeWarningText}
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
                          {canAssign && order.status === 'pending' && (
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
                          {canReply && (order.status === 'assigned' || order.status === 'processing') && (
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
                  <td colSpan={canAssign ? 10 : 9} className="py-12 text-center text-neutral-400">
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

      {selectedOrder && !showAssignModal && !showReplyModal && !showFilterModal && !showBatchAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg w-[800px] max-h-[85vh] overflow-hidden animate-slide-up">
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
                  <div className="flex items-center mt-1">
                    {getTimeWarningType(selectedOrder.deadline, selectedOrder.status) === 'overdue' ? (
                      <AlertCircle className="w-4 h-4 text-danger-500 mr-1" />
                    ) : getTimeWarningType(selectedOrder.deadline, selectedOrder.status) === 'warning' ? (
                      <Timer className="w-4 h-4 text-warning-500 mr-1" />
                    ) : (
                      <Clock className="w-4 h-4 text-neutral-400 mr-1" />
                    )}
                    <span
                      className={
                        getTimeWarningType(selectedOrder.deadline, selectedOrder.status) === 'overdue'
                          ? 'text-danger-500'
                          : getTimeWarningType(selectedOrder.deadline, selectedOrder.status) === 'warning'
                          ? 'text-warning-500'
                          : 'text-neutral-700'
                      }
                    >
                      {selectedOrder.deadline} ({getTimeWarningText(selectedOrder.deadline, selectedOrder.status)})
                    </span>
                  </div>
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
                <div className="mb-4">
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
              {orderUrges.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-neutral-500 mb-2 flex items-center">
                    <Bell className="w-4 h-4 mr-1.5 text-warning-500" />
                    催办记录
                  </p>
                  <div className="space-y-2">
                    {orderUrges.map((urge) => (
                      <div
                        key={urge.id}
                        className="p-3 bg-warning-50 rounded-md border border-warning-100"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-neutral-700">
                            催办对象：{urge.target}
                          </p>
                          <span className="text-xs text-neutral-400">{urge.createTime}</span>
                        </div>
                        {urge.description && (
                          <p className="text-sm text-neutral-600 mb-1">{urge.description}</p>
                        )}
                        <p className="text-xs text-neutral-500">
                          期望完成：{urge.expectedTime} | 操作人：{urge.operator}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {orderLogs.length > 0 && (
                <div>
                  <p className="text-sm text-neutral-500 mb-3 flex items-center">
                    <History className="w-4 h-4 mr-1.5" />
                    操作轨迹
                  </p>
                  <div className="space-y-3">
                    {orderLogs.map((log, index) => (
                      <div key={log.id} className="flex">
                        <div className="flex flex-col items-center mr-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              index === 0 ? 'bg-railway-500' : 'bg-neutral-200'
                            }`}
                          >
                            <Clock
                              className={`w-4 h-4 ${index === 0 ? 'text-white' : 'text-neutral-500'}`}
                            />
                          </div>
                          {index < orderLogs.length - 1 && (
                            <div className="w-0.5 h-full bg-neutral-200 mt-1"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-neutral-700">{log.actionName}</p>
                            <span className="text-xs text-neutral-400">{log.createTime}</span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-1">
                            {log.operator}（{log.operatorRole}）
                          </p>
                          {log.remark && (
                            <p className="text-sm text-neutral-600 mt-1">{log.remark}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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
              {canAssign && selectedOrder.status === 'pending' && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="px-4 py-2 text-sm text-white bg-railway-500 rounded-md hover:bg-railway-600 transition-colors flex items-center"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  分派工单
                </button>
              )}
              {canReply && (selectedOrder.status === 'assigned' || selectedOrder.status === 'processing') && (
                <button
                  onClick={() => setShowReplyModal(true)}
                  className="px-4 py-2 text-sm text-white bg-success-500 rounded-md hover:bg-success-600 transition-colors flex items-center"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  提交答复
                </button>
              )}
              {canUrge &&
                selectedOrder.status !== 'closed' &&
                selectedOrder.status !== 'replied' &&
                getTimeWarningType(selectedOrder.deadline, selectedOrder.status) !== 'normal' && (
                  <button
                    onClick={openUrgeModal}
                    className="px-4 py-2 text-sm text-white bg-warning-500 rounded-md hover:bg-warning-600 transition-colors flex items-center"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    发起催办
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
                <p className="text-xs text-neutral-500 mt-1">{selectedOrder.id}</p>
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

      {showBatchAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg w-[500px] animate-slide-up">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-700">批量分派工单</h3>
              <button
                onClick={() => {
                  setShowBatchAssignModal(false);
                  setBatchAssignDept('');
                  setBatchAssignPerson('');
                }}
                className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 bg-railway-50 rounded-md border border-railway-100">
                <p className="text-sm text-railway-700 font-medium">
                  已选择 {selectedIds.length} 条待受理工单
                </p>
                <p className="text-xs text-railway-500 mt-1">
                  将统一分派至相同的责任部门和处理人员
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  责任部门 <span className="text-danger-500">*</span>
                </label>
                <select
                  value={batchAssignDept}
                  onChange={(e) => setBatchAssignDept(e.target.value)}
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
                  value={batchAssignPerson}
                  onChange={(e) => setBatchAssignPerson(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent"
                >
                  <option value="">请选择处理人员</option>
                  <option value="李坐席">李坐席</option>
                  <option value="王坐席">王坐席</option>
                  <option value="张坐席">张坐席</option>
                  <option value="赵坐席">赵坐席</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-neutral-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowBatchAssignModal(false);
                  setBatchAssignDept('');
                  setBatchAssignPerson('');
                }}
                className="px-4 py-2 text-sm text-neutral-600 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleBatchAssign}
                disabled={!batchAssignDept || !batchAssignPerson}
                className="px-4 py-2 text-sm text-white bg-railway-500 rounded-md hover:bg-railway-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                确认批量分派
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
                <p className="text-xs text-neutral-500 mt-1">{selectedOrder.id}</p>
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

      {showUrgeModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg w-[550px] animate-slide-up">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-700">发起催办</h3>
              <button
                onClick={() => setShowUrgeModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 bg-warning-50 rounded-md border border-warning-100">
                <p className="text-sm text-neutral-500">当前工单</p>
                <p className="text-sm font-medium text-neutral-700 mt-1">{selectedOrder.title}</p>
                <p className="text-xs text-neutral-500 mt-1">{selectedOrder.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  催办对象 <span className="text-danger-500">*</span>
                </label>
                <div className="flex items-center px-3 py-2 bg-neutral-50 rounded-md border border-neutral-200">
                  <UserCheck className="w-4 h-4 text-neutral-400 mr-2" />
                  <input
                    type="text"
                    value={urgeTarget}
                    onChange={(e) => setUrgeTarget(e.target.value)}
                    placeholder="请输入催办对象（如：信息技术部-张工）"
                    className="flex-1 bg-transparent outline-none text-sm text-neutral-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  期望完成时间 <span className="text-danger-500">*</span>
                </label>
                <div className="flex items-center px-3 py-2 bg-neutral-50 rounded-md border border-neutral-200">
                  <Clock className="w-4 h-4 text-neutral-400 mr-2" />
                  <input
                    type="datetime-local"
                    value={urgeExpectedTime}
                    onChange={(e) => setUrgeExpectedTime(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm text-neutral-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">催办说明</label>
                <textarea
                  value={urgeDescription}
                  onChange={(e) => setUrgeDescription(e.target.value)}
                  rows={4}
                  placeholder="请输入催办说明..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-warning-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="p-4 border-t border-neutral-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowUrgeModal(false)}
                className="px-4 py-2 text-sm text-neutral-600 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={submitUrge}
                disabled={!urgeTarget.trim() || !urgeExpectedTime}
                className="px-4 py-2 text-sm text-white bg-warning-500 rounded-md hover:bg-warning-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Bell className="w-4 h-4 mr-2" />
                确认催办
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
