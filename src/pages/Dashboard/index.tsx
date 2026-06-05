import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  FileText,
  Clock,
  CheckCircle,
  Star,
  Calendar,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  X,
  File,
  UserPlus,
  MessageSquare,
  Inbox,
  Users,
  ThumbsDown,
  Wrench,
  Award,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { statusMap, urgencyMap, channelMap, isOverdue } from '../../utils';
import type { WorkOrder } from '../../types';
import { replyTemplates, departments } from '../../data/mockData';

const COLORS = ['#165DFF', '#FF7D00', '#00B42A', '#F53F3F', '#722ED1'];

const StatCard = ({
  icon: Icon,
  title,
  value,
  unit,
  trend,
  trendValue,
  color,
}: {
  icon: any;
  title: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  color: string;
}) => (
  <div className="bg-white rounded-lg p-5 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-neutral-500">{title}</p>
        <div className="flex items-baseline mt-2">
          <span className="text-3xl font-bold text-neutral-700">{value}</span>
          {unit && <span className="ml-1 text-sm text-neutral-500">{unit}</span>}
        </div>
        {trend && trendValue && (
          <div className="flex items-center mt-2 text-sm">
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-success-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-danger-500 mr-1" />
            )}
            <span className={trend === 'up' ? 'text-success-500' : 'text-danger-500'}>
              {trendValue}
            </span>
            <span className="text-neutral-400 ml-1">较上周</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { workOrders, reviews, updateWorkOrder, rectifyTasks, followUpTasks } = useAppStore();

  const [trendDays, setTrendDays] = useState<7 | 30>(7);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [assignDept, setAssignDept] = useState('');
  const [assignPerson, setAssignPerson] = useState('');
  const [assignRemark, setAssignRemark] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    if (selectedOrder) {
      const updated = workOrders.find((o) => o.id === selectedOrder.id);
      if (updated) setSelectedOrder(updated);
    }
  }, [workOrders, selectedOrder?.id]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = workOrders.filter((o) => o.createTime.startsWith(today));
    const pendingOrders = workOrders.filter((o) => o.status === 'pending' || o.status === 'assigned' || o.status === 'processing');
    const closedOrders = workOrders.filter((o) => o.status === 'closed' || o.status === 'replied');
    const processingRate = workOrders.length > 0 ? Math.round((closedOrders.length / workOrders.length) * 100) : 0;
    const overdueOrders = workOrders.filter((o) => isOverdue(o.deadline) && o.status !== 'closed');
    
    const avgSatisfaction = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.satisfaction, 0) / reviews.length).toFixed(1)
      : '4.5';

    return {
      totalOrders: workOrders.length,
      pendingOrders: pendingOrders.length,
      processingRate,
      avgSatisfaction,
      todayOrders: todayOrders.length,
      overdueOrders: overdueOrders.length,
    };
  }, [workOrders, reviews]);

  const closeLoopStats = useMemo(() => {
    const createdNotAssigned = workOrders.filter((o) => o.status === 'pending').length;
    const assignedNotReplied = workOrders.filter(
      (o) => o.status === 'assigned' || o.status === 'processing'
    ).length;
    const repliedNotReviewed = workOrders.filter((o) => o.status === 'replied').length;
    const reviewedOrders = reviews.map((r) => r.orderId);
    const lowSatisfactionPending = followUpTasks.filter(
      (t) => t.status === 'pending'
    ).length;
    const rectifyPendingClose = rectifyTasks.filter(
      (t) => t.status === 'pending' || t.status === 'rectifying' || t.status === 'reviewing'
    ).length;
    const closedOrders = workOrders.filter((o) => o.status === 'closed').length;

    return [
      {
        key: 'created_not_assigned',
        label: '已新建未分派',
        value: createdNotAssigned,
        icon: Inbox,
        color: 'bg-railway-100 text-railway-600',
        bgColor: 'bg-railway-50',
        route: '/process',
        state: { status: 'pending' as const },
      },
      {
        key: 'assigned_not_replied',
        label: '已分派未答复',
        value: assignedNotReplied,
        icon: Users,
        color: 'bg-warning-100 text-warning-600',
        bgColor: 'bg-warning-50',
        route: '/process',
        state: { status: 'assigned' as const },
      },
      {
        key: 'replied_not_reviewed',
        label: '已答复未回访',
        value: repliedNotReviewed,
        icon: MessageSquare,
        color: 'bg-info-100 text-info-600',
        bgColor: 'bg-info-50',
        route: '/review',
        state: null,
      },
      {
        key: 'low_satisfaction_pending',
        label: '低满意度待跟进',
        value: lowSatisfactionPending,
        icon: ThumbsDown,
        color: 'bg-danger-100 text-danger-600',
        bgColor: 'bg-danger-50',
        route: '/review',
        state: null,
      },
      {
        key: 'rectify_pending_close',
        label: '整改待关闭',
        value: rectifyPendingClose,
        icon: Wrench,
        color: 'bg-neutral-100 text-neutral-600',
        bgColor: 'bg-neutral-50',
        route: '/rectify',
        state: null,
      },
      {
        key: 'closed',
        label: '已闭环',
        value: closedOrders,
        icon: Award,
        color: 'bg-success-100 text-success-600',
        bgColor: 'bg-success-50',
        route: '/process',
        state: { status: 'closed' as const },
      },
    ];
  }, [workOrders, reviews, rectifyTasks, followUpTasks]);

  const trendData = useMemo(() => {
    const days = trendDays;
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = workOrders.filter((o) => o.createTime.startsWith(dateStr)).length;
      data.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        count,
      });
    }
    return data;
  }, [workOrders, trendDays]);

  const channelData = useMemo(() => {
    const counts: Record<string, number> = {};
    workOrders.forEach((o) => {
      const label = channelMap[o.channel].label;
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [workOrders]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    workOrders.forEach((o) => {
      counts[o.category] = (counts[o.category] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [workOrders]);

  const latestOrders = useMemo(() => {
    return [...workOrders]
      .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
      .slice(0, 5);
  }, [workOrders]);

  const handleViewAll = () => {
    navigate('/process');
  };

  const handleOrderClick = (order: WorkOrder) => {
    setSelectedOrder(order);
  };

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
      assignTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
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
      replyTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });
    setShowReplyModal(false);
    setReplyContent('');
    setSelectedTemplate('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-6 gap-4">
        <StatCard
          icon={FileText}
          title="工单总量"
          value={stats.totalOrders}
          trend="up"
          trendValue="+12.5%"
          color="bg-railway-500"
        />
        <StatCard
          icon={Clock}
          title="待处理"
          value={stats.pendingOrders}
          trend="down"
          trendValue="-8.3%"
          color="bg-warning-500"
        />
        <StatCard
          icon={CheckCircle}
          title="处理率"
          value={stats.processingRate}
          unit="%"
          trend="up"
          trendValue="+2.1%"
          color="bg-success-500"
        />
        <StatCard
          icon={Star}
          title="平均满意度"
          value={stats.avgSatisfaction}
          unit="分"
          trend="up"
          trendValue="+0.3"
          color="bg-railway-400"
        />
        <StatCard
          icon={Calendar}
          title="今日工单"
          value={stats.todayOrders}
          trend="up"
          trendValue="+15.2%"
          color="bg-railway-600"
        />
        <StatCard
          icon={AlertTriangle}
          title="超时工单"
          value={stats.overdueOrders}
          trend="down"
          trendValue="-40%"
          color="bg-danger-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-5 border-b border-neutral-200">
          <h3 className="text-base font-semibold text-neutral-700">闭环完整度看板</h3>
          <p className="text-sm text-neutral-500 mt-1">点击各状态可跳转到对应列表</p>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-6 gap-4">
            {closeLoopStats.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => navigate(item.route, { state: item.state })}
                  className={`p-4 rounded-lg ${item.bgColor} hover:shadow-md transition-all text-left group`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-bold text-neutral-800">{item.value}</span>
                  </div>
                  <p className="text-sm font-medium text-neutral-700 group-hover:text-railway-600 transition-colors">
                    {item.label}
                  </p>
                </button>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center">
              <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden flex">
                {closeLoopStats.map((item, index) => {
                  const total = closeLoopStats.reduce((sum, i) => sum + i.value, 0);
                  const width = total > 0 ? (item.value / total) * 100 : 0;
                  const colors: Record<string, string> = {
                    created_not_assigned: 'bg-railway-500',
                    assigned_not_replied: 'bg-warning-500',
                    replied_not_reviewed: 'bg-info-500',
                    low_satisfaction_pending: 'bg-danger-500',
                    rectify_pending_close: 'bg-neutral-400',
                    closed: 'bg-success-500',
                  };
                  return (
                    <div
                      key={item.key}
                      className={`h-full ${colors[item.key]}`}
                      style={{ width: `${width}%` }}
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-neutral-500">
                共 {closeLoopStats.reduce((sum, i) => sum + i.value, 0)} 条工单
              </span>
              <span className="text-xs text-neutral-500">
                闭环率：
                {closeLoopStats.reduce((sum, i) => sum + i.value, 0) > 0
                  ? (
                      (closeLoopStats.find((i) => i.key === 'closed')?.value || 0) /
                      closeLoopStats.reduce((sum, i) => sum + i.value, 0) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-lg p-5 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-neutral-700">工单趋势</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setTrendDays(7)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  trendDays === 7
                    ? 'bg-railway-500 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                近7天
              </button>
              <button
                onClick={() => setTrendDays(30)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  trendDays === 30
                    ? 'bg-railway-500 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                近30天
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E6EB" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#86909C" />
              <YAxis tick={{ fontSize: 12 }} stroke="#86909C" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E6EB',
                  borderRadius: '6px',
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#165DFF"
                strokeWidth={2}
                dot={{ fill: '#165DFF', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg p-5 shadow-sm border border-neutral-200">
          <h3 className="text-base font-semibold text-neutral-700 mb-4">渠道分布</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={channelData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {channelData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {channelData.map((item, index) => (
              <div key={item.name} className="flex items-center text-xs">
                <span
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-neutral-600">{item.name}</span>
                <span className="ml-auto text-neutral-500">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-5 shadow-sm border border-neutral-200">
          <h3 className="text-base font-semibold text-neutral-700 mb-4">问题类型分布</h3>
          <div className="space-y-3">
            {categoryData.slice(0, 6).map((item, index) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-600">{item.name}</span>
                  <span className="text-neutral-500">{item.value}件</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(item.value / (categoryData[0]?.value || 1)) * 100}%`,
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 bg-white rounded-lg p-5 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-neutral-700">最新工单</h3>
            <button
              onClick={handleViewAll}
              className="text-sm text-railway-500 hover:text-railway-600 transition-colors"
            >
              查看全部
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-2 text-neutral-500 font-medium">工单编号</th>
                  <th className="text-left py-3 px-2 text-neutral-500 font-medium">标题</th>
                  <th className="text-left py-3 px-2 text-neutral-500 font-medium">渠道</th>
                  <th className="text-left py-3 px-2 text-neutral-500 font-medium">紧急程度</th>
                  <th className="text-left py-3 px-2 text-neutral-500 font-medium">状态</th>
                  <th className="text-left py-3 px-2 text-neutral-500 font-medium">创建时间</th>
                </tr>
              </thead>
              <tbody>
                {latestOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer"
                    onClick={() => handleOrderClick(order)}
                  >
                    <td className="py-3 px-2 text-railway-600 font-mono text-xs">{order.id}</td>
                    <td className="py-3 px-2 text-neutral-700 max-w-xs truncate">{order.title}</td>
                    <td className="py-3 px-2 text-neutral-600">{channelMap[order.channel].label}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${urgencyMap[order.urgency].color}`}
                      >
                        {urgencyMap[order.urgency].label}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${statusMap[order.status].color}`}
                      >
                        {statusMap[order.status].label}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-neutral-500">{order.createTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedOrder && !showAssignModal && !showReplyModal && (
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
                提交答复
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
