import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  Star,
  Phone,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  Edit,
  Save,
  X,
  Check,
  Repeat,
  User,
  Plus,
  Calendar as CalendarIcon,
  UserCheck,
} from 'lucide-react';
import { useAppStore, formatDateTime } from '../../store/useAppStore';
import { satisfactionMap, statusMap } from '../../utils';
import type { SatisfactionLevel, WorkOrder, FollowUpTask } from '../../types';

const COLORS = ['#00B42A', '#165DFF', '#86909C', '#FF7D00', '#F53F3F'];

export default function Review() {
  const navigate = useNavigate();
  const {
    workOrders,
    reviews,
    addReview,
    updateReview,
    followUpTasks,
    addFollowUpTask,
    updateFollowUpTask,
    currentRole,
  } = useAppStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSatisfaction, setEditSatisfaction] = useState<SatisfactionLevel>(3);
  const [editComment, setEditComment] = useState('');
  const [editIsRepeat, setEditIsRepeat] = useState(false);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [reviewSatisfaction, setReviewSatisfaction] = useState<SatisfactionLevel>(3);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewIsRepeat, setReviewIsRepeat] = useState(false);
  const [reviewerName, setReviewerName] = useState('管理员');

  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [followUpAssignee, setFollowUpAssignee] = useState('');
  const [followUpDeadline, setFollowUpDeadline] = useState('');
  const [followUpRemark, setFollowUpRemark] = useState('');

  const canDoFollowUp = currentRole === 'reviewer' || currentRole === 'manager';

  const reviewedOrderIds = useMemo(() => new Set(reviews.map((r) => r.orderId)), [reviews]);

  const pendingReviews = useMemo(
    () => workOrders.filter((o) => o.status === 'replied' && !reviewedOrderIds.has(o.id)),
    [workOrders, reviewedOrderIds]
  );

  const completedReviews = useMemo(
    () =>
      reviews.map((r) => ({
        ...r,
        order: workOrders.find((o) => o.id === r.orderId),
      })),
    [reviews, workOrders]
  );

  const satisfactionData = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      counts[r.satisfaction]++;
    });
    return [
      { name: '非常满意', value: counts[5] },
      { name: '满意', value: counts[4] },
      { name: '一般', value: counts[3] },
      { name: '不满意', value: counts[2] },
      { name: '非常不满意', value: counts[1] },
    ];
  }, [reviews]);

  const avgSatisfaction = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.satisfaction, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const startEdit = (review: typeof completedReviews[0]) => {
    setEditingId(review.id);
    setEditSatisfaction(review.satisfaction);
    setEditComment(review.comment);
    setEditIsRepeat(review.isRepeat);
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateReview(editingId, {
      satisfaction: editSatisfaction,
      comment: editComment,
      isRepeat: editIsRepeat,
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditSatisfaction(3);
    setEditComment('');
    setEditIsRepeat(false);
  };

  const openReviewModal = (order: WorkOrder) => {
    setSelectedOrder(order);
    setReviewSatisfaction(3);
    setReviewComment('');
    setReviewIsRepeat(false);
    setShowReviewModal(true);
  };

  const submitReview = () => {
    if (!selectedOrder) return;
    addReview({
      orderId: selectedOrder.id,
      orderTitle: selectedOrder.title,
      passengerName: selectedOrder.passengerName,
      satisfaction: reviewSatisfaction,
      comment: reviewComment,
      reviewTime: formatDateTime(),
      isRepeat: reviewIsRepeat,
      reviewer: reviewerName,
    });
    setShowReviewModal(false);
    setSelectedOrder(null);
  };

  const openFollowUpModal = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setFollowUpAssignee('');
    setFollowUpDeadline('');
    setFollowUpRemark('');
    setShowFollowUpModal(true);
  };

  const submitFollowUp = () => {
    if (!selectedReviewId || !followUpAssignee || !followUpDeadline) return;
    const review = reviews.find((r) => r.id === selectedReviewId);
    if (!review) return;
    addFollowUpTask({
      orderId: review.orderId,
      orderTitle: review.orderTitle,
      reviewId: selectedReviewId,
      assignee: followUpAssignee,
      deadline: followUpDeadline,
      remark: followUpRemark,
      createBy: reviewerName,
    });
    setShowFollowUpModal(false);
    setSelectedReviewId(null);
  };

  const completeFollowUp = (taskId: string) => {
    updateFollowUpTask(taskId, {
      status: 'completed',
      completeTime: formatDateTime(),
    });
  };

  const followUpsWithReview = useMemo(
    () =>
      followUpTasks.map((t) => ({
        ...t,
        review: reviews.find((r) => r.id === t.reviewId),
        order: workOrders.find((o) => o.id === t.orderId),
      })),
    [followUpTasks, reviews, workOrders]
  );

  const pendingFollowUps = followUpsWithReview.filter((t) => t.status === 'pending');
  const completedFollowUps = followUpsWithReview.filter((t) => t.status === 'completed');

  const renderStars = (
    rating: SatisfactionLevel,
    interactive = false,
    onChange?: (v: SatisfactionLevel) => void
  ) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(star as SatisfactionLevel)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform p-0.5`}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'fill-warning-400 text-warning-400'
                  : 'text-neutral-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const stats = [
    { label: '已回访', value: reviews.length, icon: CheckCircle, color: 'bg-success-500' },
    { label: '待回访', value: pendingReviews.length, icon: Clock, color: 'bg-warning-500' },
    {
      label: '待跟进',
      value: pendingFollowUps.length,
      icon: AlertTriangle,
      color: 'bg-danger-500',
    },
    { label: '平均满意度', value: avgSatisfaction, icon: Star, color: 'bg-railway-500' },
  ];

  const deptSatisfactionData = useMemo(() => {
    const deptMap: Record<string, { total: number; count: number }> = {};
    completedReviews.forEach((r) => {
      const dept = r.order?.department || '未分配';
      if (!deptMap[dept]) {
        deptMap[dept] = { total: 0, count: 0 };
      }
      deptMap[dept].total += r.satisfaction;
      deptMap[dept].count++;
    });
    return Object.entries(deptMap).map(([name, data]) => ({
      name,
      满意度: data.count > 0 ? Math.round((data.total / data.count) * 10) / 10 : 0,
    }));
  }, [completedReviews]);

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

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-5 shadow-sm border border-neutral-200">
          <h3 className="text-base font-semibold text-neutral-700 mb-4">满意度分布</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={satisfactionData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {satisfactionData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {satisfactionData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-neutral-600">{item.name}</span>
                </div>
                <span className="text-neutral-500">{item.value}人</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 bg-white rounded-lg p-5 shadow-sm border border-neutral-200">
          <h3 className="text-base font-semibold text-neutral-700 mb-4">各部门满意度对比</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={deptSatisfactionData.length > 0 ? deptSatisfactionData : [
              { name: '客运服务部', 满意度: 4.3 },
              { name: '车站管理部', 满意度: 4.1 },
              { name: '车辆段', 满意度: 3.9 },
              { name: '信息技术部', 满意度: 4.5 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E6EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#86909C" />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} stroke="#86909C" />
              <Tooltip />
              <Bar dataKey="满意度" fill="#165DFF" radius={[4, 4, 0, 0]} name="满意度" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-neutral-700">待回访工单</h3>
          <span className="text-sm text-neutral-500">共 {pendingReviews.length} 条待回访</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">工单编号</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">标题</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">旅客</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">联系电话</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">状态</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">答复时间</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {pendingReviews.length > 0 ? (
                pendingReviews.map((order) => (
                  <tr key={order.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-4 text-railway-600 font-mono text-xs">{order.id}</td>
                    <td className="py-3 px-4 text-neutral-700">{order.title}</td>
                    <td className="py-3 px-4 text-neutral-600">{order.passengerName}</td>
                    <td className="py-3 px-4 text-neutral-600">{order.passengerPhone}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${statusMap[order.status].color}`}
                      >
                        {statusMap[order.status].label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-500">{order.replyTime || order.deadline}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => openReviewModal(order)}
                        className="flex items-center px-3 py-1 text-sm text-white bg-railway-500 rounded-md hover:bg-railway-600 transition-colors"
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        回访
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    暂无待回访工单
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-neutral-700">回访记录</h3>
          <span className="text-sm text-neutral-500">共 {completedReviews.length} 条记录</span>
        </div>
        <div className="divide-y divide-neutral-100">
          {completedReviews.length > 0 ? (
            completedReviews.map((item) => (
              <div key={item.id} className="p-5 hover:bg-neutral-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span
                        className="text-railway-600 font-mono text-xs cursor-pointer hover:underline"
                        onClick={() => navigate('/process', { state: { openOrderId: item.orderId } })}
                      >
                        {item.orderId}
                      </span>
                      <span className="text-neutral-700 font-medium">{item.orderTitle}</span>
                      {item.isRepeat && (
                        <span className="px-2 py-0.5 text-xs bg-danger-100 text-danger-600 rounded-full flex items-center">
                          <Repeat className="w-3 h-3 mr-1" />
                          重复投诉
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-neutral-500 mb-3">
                      <span>旅客：{item.passengerName}</span>
                      <span>回访人：{item.reviewer || '管理员'}</span>
                      <span>回访时间：{item.reviewTime}</span>
                    </div>
                    {editingId === item.id ? (
                      <div className="space-y-3 mt-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            满意度评分
                          </label>
                          {renderStars(editSatisfaction, true, (v) => setEditSatisfaction(v))}
                        </div>
                        <div className="flex items-center">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editIsRepeat}
                              onChange={(e) => setEditIsRepeat(e.target.checked)}
                              className="mr-2"
                            />
                            <span className="text-sm text-neutral-700">标记为重复投诉</span>
                          </label>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            回访备注
                          </label>
                          <textarea
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent resize-none"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={saveEdit}
                            className="flex items-center px-3 py-1 text-sm text-white bg-success-500 rounded-md hover:bg-success-600 transition-colors"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            保存
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex items-center px-3 py-1 text-sm text-neutral-600 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors"
                          >
                            <X className="w-4 h-4 mr-1" />
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-4">
                        <div className="flex items-center">
                          <span className="text-sm text-neutral-500 mr-2">满意度：</span>
                          {renderStars(item.satisfaction)}
                          <span className={`ml-2 text-sm ${satisfactionMap[item.satisfaction].color}`}>
                            {satisfactionMap[item.satisfaction].label}
                          </span>
                        </div>
                        {item.comment && (
                          <div className="flex-1">
                            <div className="flex items-start">
                              <MessageSquare className="w-4 h-4 text-neutral-400 mr-2 mt-0.5" />
                              <p className="text-sm text-neutral-600">{item.comment}</p>
                            </div>
                          </div>
                        )}
                        <button
                          onClick={() => startEdit(item)}
                          className="flex items-center px-2 py-1 text-sm text-railway-500 hover:text-railway-600 transition-colors"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          编辑
                        </button>
                        {canDoFollowUp && (item.satisfaction <= 2 || item.isRepeat) && (
                          <button
                            onClick={() => openFollowUpModal(item.id)}
                            className="flex items-center px-2 py-1 text-sm text-warning-600 hover:text-warning-700 transition-colors ml-2"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            二次跟进
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-neutral-400">暂无回访记录</div>
          )}
        </div>
      </div>

      {canDoFollowUp && pendingFollowUps.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-base font-semibold text-neutral-700">待跟进任务</h3>
            <span className="text-sm text-neutral-500">共 {pendingFollowUps.length} 条待跟进</span>
          </div>
          <div className="divide-y divide-neutral-100">
            {pendingFollowUps.map((item) => (
              <div key={item.id} className="p-5 hover:bg-neutral-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-railway-600 font-mono text-xs">{item.orderId}</span>
                      <span className="text-neutral-700 font-medium">{item.orderTitle}</span>
                      <span className="px-2 py-0.5 text-xs bg-warning-100 text-warning-600 rounded-full">
                        待跟进
                      </span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-neutral-500 mb-2">
                      <span className="flex items-center">
                        <UserCheck className="w-4 h-4 mr-1" />
                        跟进人：{item.assignee}
                      </span>
                      <span className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        计划完成：{item.deadline}
                      </span>
                      <span>创建人：{item.createBy}</span>
                    </div>
                    {item.remark && (
                      <div className="flex items-start">
                        <MessageSquare className="w-4 h-4 text-neutral-400 mr-2 mt-0.5" />
                        <p className="text-sm text-neutral-600">{item.remark}</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => completeFollowUp(item.id)}
                    className="flex items-center px-3 py-1 text-sm text-white bg-success-500 rounded-md hover:bg-success-600 transition-colors"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    完成跟进
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {canDoFollowUp && completedFollowUps.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-base font-semibold text-neutral-700">已跟进记录</h3>
            <span className="text-sm text-neutral-500">共 {completedFollowUps.length} 条</span>
          </div>
          <div className="divide-y divide-neutral-100">
            {completedFollowUps.map((item) => (
              <div key={item.id} className="p-5 hover:bg-neutral-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-railway-600 font-mono text-xs">{item.orderId}</span>
                      <span className="text-neutral-700 font-medium">{item.orderTitle}</span>
                      <span className="px-2 py-0.5 text-xs bg-success-100 text-success-600 rounded-full">
                        已跟进
                      </span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-neutral-500 mb-2">
                      <span>跟进人：{item.assignee}</span>
                      <span>完成时间：{item.completeTime || '-'}</span>
                      <span>创建人：{item.createBy}</span>
                    </div>
                    {item.remark && (
                      <div className="flex items-start">
                        <MessageSquare className="w-4 h-4 text-neutral-400 mr-2 mt-0.5" />
                        <p className="text-sm text-neutral-600">{item.remark}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showReviewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg w-[550px] animate-slide-up">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-700">旅客回访</h3>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedOrder(null);
                }}
                className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 bg-neutral-50 rounded-md">
                <p className="text-sm font-medium text-neutral-700">{selectedOrder.title}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-neutral-500">
                  <span>{selectedOrder.id}</span>
                  <span>旅客：{selectedOrder.passengerName}</span>
                  <span>电话：{selectedOrder.passengerPhone}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  满意度评分 <span className="text-danger-500">*</span>
                </label>
                {renderStars(reviewSatisfaction, true, (v) => setReviewSatisfaction(v))}
              </div>
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reviewIsRepeat}
                    onChange={(e) => setReviewIsRepeat(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-neutral-700 flex items-center">
                    <Repeat className="w-4 h-4 mr-1" />
                    是否重复投诉
                  </span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">回访人</label>
                <div className="flex items-center px-3 py-2 bg-neutral-50 rounded-md border border-neutral-200">
                  <User className="w-4 h-4 text-neutral-400 mr-2" />
                  <span className="text-sm text-neutral-700">{reviewerName}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">回访备注</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  placeholder="请输入回访记录和旅客反馈..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="p-4 border-t border-neutral-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 text-sm text-neutral-600 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={submitReview}
                className="px-4 py-2 text-sm text-white bg-success-500 rounded-md hover:bg-success-600 transition-colors flex items-center"
              >
                <Check className="w-4 h-4 mr-2" />
                保存回访
              </button>
            </div>
          </div>
        </div>
      )}

      {showFollowUpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg w-[550px] animate-slide-up">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-700">创建二次跟进任务</h3>
              <button
                onClick={() => {
                  setShowFollowUpModal(false);
                  setSelectedReviewId(null);
                }}
                className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  跟进负责人 <span className="text-danger-500">*</span>
                </label>
                <div className="flex items-center px-3 py-2 bg-neutral-50 rounded-md border border-neutral-200">
                  <User className="w-4 h-4 text-neutral-400 mr-2" />
                  <input
                    type="text"
                    value={followUpAssignee}
                    onChange={(e) => setFollowUpAssignee(e.target.value)}
                    placeholder="请输入跟进负责人姓名"
                    className="flex-1 bg-transparent outline-none text-sm text-neutral-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  计划完成时间 <span className="text-danger-500">*</span>
                </label>
                <div className="flex items-center px-3 py-2 bg-neutral-50 rounded-md border border-neutral-200">
                  <CalendarIcon className="w-4 h-4 text-neutral-400 mr-2" />
                  <input
                    type="date"
                    value={followUpDeadline}
                    onChange={(e) => setFollowUpDeadline(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm text-neutral-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">跟进说明</label>
                <textarea
                  value={followUpRemark}
                  onChange={(e) => setFollowUpRemark(e.target.value)}
                  rows={4}
                  placeholder="请输入跟进说明和注意事项..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="p-4 border-t border-neutral-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowFollowUpModal(false);
                  setSelectedReviewId(null);
                }}
                className="px-4 py-2 text-sm text-neutral-600 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={submitFollowUp}
                disabled={!followUpAssignee || !followUpDeadline}
                className="px-4 py-2 text-sm text-white bg-railway-500 rounded-md hover:bg-railway-600 transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 mr-2" />
                创建跟进
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
