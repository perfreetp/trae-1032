import { useState } from 'react';
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
} from 'lucide-react';
import { reviews, workOrders, satisfactionData } from '../../data/mockData';
import { satisfactionMap, statusMap } from '../../utils';
import type { SatisfactionLevel } from '../../types';

const COLORS = ['#00B42A', '#165DFF', '#86909C', '#FF7D00', '#F53F3F'];

export default function Review() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSatisfaction, setEditSatisfaction] = useState<SatisfactionLevel>(3);
  const [editComment, setEditComment] = useState('');

  const pendingReviews = workOrders.filter(
    (o) => o.status === 'replied' || (o.status === 'closed' && !reviews.find((r) => r.orderId === o.id))
  );

  const completedReviews = reviews.map((r) => ({
    ...r,
    order: workOrders.find((o) => o.id === r.orderId),
  }));

  const startEdit = (review: typeof completedReviews[0]) => {
    setEditingId(review.id);
    setEditSatisfaction(review.satisfaction);
    setEditComment(review.comment);
  };

  const saveEdit = () => {
    alert('回访记录已更新！');
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditSatisfaction(3);
    setEditComment('');
  };

  const renderStars = (rating: SatisfactionLevel, interactive = false, onChange?: (v: SatisfactionLevel) => void) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(star as SatisfactionLevel)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
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
    { label: '重复投诉', value: reviews.filter((r) => r.isRepeat).length, icon: AlertTriangle, color: 'bg-danger-500' },
    { label: '平均满意度', value: '4.2', icon: Star, color: 'bg-railway-500' },
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
            <BarChart
              data={[
                { name: '客运服务部', satisfaction: 4.3 },
                { name: '车站管理部', satisfaction: 4.1 },
                { name: '车辆段', satisfaction: 3.9 },
                { name: '信息技术部', satisfaction: 4.5 },
                { name: '安全保卫部', satisfaction: 4.0 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E6EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#86909C" />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} stroke="#86909C" />
              <Tooltip />
              <Bar dataKey="satisfaction" fill="#165DFF" radius={[4, 4, 0, 0]} name="满意度" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-5 border-b border-neutral-200">
          <h3 className="text-base font-semibold text-neutral-700">待回访工单</h3>
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
              {pendingReviews.map((order) => (
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
                  <td className="py-3 px-4 text-neutral-500">{order.deadline}</td>
                  <td className="py-3 px-4">
                    <button className="flex items-center px-3 py-1 text-sm text-white bg-railway-500 rounded-md hover:bg-railway-600 transition-colors">
                      <Phone className="w-4 h-4 mr-1" />
                      回访
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-5 border-b border-neutral-200">
          <h3 className="text-base font-semibold text-neutral-700">回访记录</h3>
        </div>
        <div className="divide-y divide-neutral-100">
          {completedReviews.map((item) => (
            <div key={item.id} className="p-5 hover:bg-neutral-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-railway-600 font-mono text-xs">{item.orderId}</span>
                    <span className="text-neutral-700 font-medium">{item.order?.title}</span>
                    {item.isRepeat && (
                      <span className="px-2 py-0.5 text-xs bg-danger-100 text-danger-600 rounded-full flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        重复投诉
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-neutral-500 mb-3">
                    <span>旅客：{item.order?.passengerName}</span>
                    <span>电话：{item.order?.passengerPhone}</span>
                    <span>回访时间：{item.reviewTime}</span>
                  </div>
                  {editingId === item.id ? (
                    <div className="space-y-3 mt-3">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          满意度评分
                        </label>
                        {renderStars(editSatisfaction, true, (v) => setEditSatisfaction(v))}
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
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
