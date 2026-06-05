import { useState } from 'react';
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
} from 'lucide-react';
import {
  dashboardStats,
  trendData7,
  trendData30,
  categoryData,
  channelData,
  workOrders,
} from '../../data/mockData';
import { statusMap, urgencyMap, channelMap } from '../../utils';

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
  const [trendDays, setTrendDays] = useState<7 | 30>(7);
  const trendData = trendDays === 7 ? trendData7 : trendData30;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-6 gap-4">
        <StatCard
          icon={FileText}
          title="工单总量"
          value={dashboardStats.totalOrders}
          trend="up"
          trendValue="+12.5%"
          color="bg-railway-500"
        />
        <StatCard
          icon={Clock}
          title="待处理"
          value={dashboardStats.pendingOrders}
          trend="down"
          trendValue="-8.3%"
          color="bg-warning-500"
        />
        <StatCard
          icon={CheckCircle}
          title="处理率"
          value={dashboardStats.processingRate}
          unit="%"
          trend="up"
          trendValue="+2.1%"
          color="bg-success-500"
        />
        <StatCard
          icon={Star}
          title="平均满意度"
          value={dashboardStats.avgSatisfaction}
          unit="分"
          trend="up"
          trendValue="+0.3"
          color="bg-railway-400"
        />
        <StatCard
          icon={Calendar}
          title="今日工单"
          value={dashboardStats.todayOrders}
          trend="up"
          trendValue="+15.2%"
          color="bg-railway-600"
        />
        <StatCard
          icon={AlertTriangle}
          title="超时工单"
          value={dashboardStats.overdueOrders}
          trend="down"
          trendValue="-40%"
          color="bg-danger-500"
        />
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
                      width: `${(item.value / categoryData[0].value) * 100}%`,
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
            <button className="text-sm text-railway-500 hover:text-railway-600">
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
                {workOrders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b border-neutral-100 hover:bg-neutral-50">
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
    </div>
  );
}
