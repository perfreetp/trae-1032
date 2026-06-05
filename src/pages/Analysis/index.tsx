import { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Download,
  Calendar,
  BarChart3,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { categoryData, trendData30, channelData, workOrders, reviews } from '../../data/mockData';

const COLORS = ['#165DFF', '#FF7D00', '#00B42A', '#F53F3F', '#722ED1', '#14C9C9', '#F7BA1E', '#F5319D'];

const monthlyData = [
  { month: '1月', 工单量: 280, 满意度: 4.0 },
  { month: '2月', 工单量: 265, 满意度: 4.1 },
  { month: '3月', 工单量: 310, 满意度: 4.1 },
  { month: '4月', 工单量: 325, 满意度: 4.2 },
  { month: '5月', 工单量: 340, 满意度: 4.2 },
  { month: '6月', 工单量: 357, 满意度: 4.2 },
];

const deptData = [
  { name: '客运服务部', 工单量: 85, 完成率: 94, 满意度: 4.3 },
  { name: '车站管理部', 工单量: 72, 完成率: 91, 满意度: 4.1 },
  { name: '车辆段', 工单量: 63, 完成率: 93, 满意度: 3.9 },
  { name: '信息技术部', 工单量: 45, 完成率: 97, 满意度: 4.5 },
  { name: '安全保卫部', 工单量: 28, 完成率: 96, 满意度: 4.0 },
];

export default function Analysis() {
  const [selectedMonth, setSelectedMonth] = useState('2024年6月');
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  const months = ['2024年6月', '2024年5月', '2024年4月', '2024年3月', '2024年2月', '2024年1月'];

  const keyMetrics = [
    {
      label: '工单总量',
      value: '357',
      change: '+12.5%',
      trend: 'up',
      description: '较上月',
    },
    {
      label: '按时完成率',
      value: '93.6%',
      change: '+2.1%',
      trend: 'up',
      description: '较上月',
    },
    {
      label: '平均满意度',
      value: '4.2分',
      change: '+0.1',
      trend: 'up',
      description: '较上月',
    },
    {
      label: '重复投诉率',
      value: '3.2%',
      change: '-1.5%',
      trend: 'down',
      description: '较上月',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-5 shadow-sm border border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                className="flex items-center px-4 py-2 border border-neutral-300 rounded-md text-sm hover:bg-neutral-50 transition-colors"
              >
                <Calendar className="w-4 h-4 mr-2 text-neutral-500" />
                {selectedMonth}
                <ChevronDown className="w-4 h-4 ml-2 text-neutral-500" />
              </button>
              {showMonthDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-neutral-200 rounded-md shadow-lg z-10">
                  {months.map((month) => (
                    <button
                      key={month}
                      onClick={() => {
                        setSelectedMonth(month);
                        setShowMonthDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 transition-colors ${
                        month === selectedMonth ? 'bg-railway-50 text-railway-600' : 'text-neutral-700'
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button className="flex items-center px-4 py-2 bg-railway-500 text-white text-sm rounded-md hover:bg-railway-600 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            导出报告
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {keyMetrics.map((metric) => (
          <div
            key={metric.label}
            className="bg-white rounded-lg p-5 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
          >
            <p className="text-sm text-neutral-500">{metric.label}</p>
            <div className="flex items-baseline mt-2">
              <span className="text-3xl font-bold text-neutral-700">{metric.value}</span>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp
                className={`w-4 h-4 mr-1 ${
                  metric.trend === 'up' ? 'text-success-500' : 'text-danger-500'
                }`}
              />
              <span
                className={metric.trend === 'up' ? 'text-success-500' : 'text-danger-500'}
              >
                {metric.change}
              </span>
              <span className="text-neutral-400 ml-1">{metric.description}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-5 shadow-sm border border-neutral-200">
          <h3 className="text-base font-semibold text-neutral-700 mb-4">热点问题排行 TOP10</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E6EB" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#86909C" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} stroke="#86909C" width={80} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} name="工单数量">
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg p-5 shadow-sm border border-neutral-200">
          <h3 className="text-base font-semibold text-neutral-700 mb-4">月度工单趋势</h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E6EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#86909C" />
              <YAxis tick={{ fontSize: 12 }} stroke="#86909C" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="工单量"
                stroke="#165DFF"
                strokeWidth={2}
                dot={{ fill: '#165DFF', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="满意度"
                stroke="#00B42A"
                strokeWidth={2}
                dot={{ fill: '#00B42A', r: 4 }}
                yAxisId={0}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-5 shadow-sm border border-neutral-200">
          <h3 className="text-base font-semibold text-neutral-700 mb-4">渠道来源分布</h3>
          <ResponsiveContainer width="100%" height={220}>
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

        <div className="col-span-2 bg-white rounded-lg p-5 shadow-sm border border-neutral-200">
          <h3 className="text-base font-semibold text-neutral-700 mb-4">各部门工作质量对比</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E6EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#86909C" />
              <YAxis tick={{ fontSize: 12 }} stroke="#86909C" />
              <Tooltip />
              <Legend />
              <Bar dataKey="工单量" fill="#165DFF" name="工单量" radius={[4, 4, 0, 0]} />
              <Bar dataKey="完成率" fill="#00B42A" name="完成率(%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="满意度" fill="#FF7D00" name="满意度(分)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-railway-500 mr-2" />
            <h3 className="text-base font-semibold text-neutral-700">月度质量报告摘要</h3>
          </div>
          <span className="text-sm text-neutral-500">{selectedMonth}</span>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-neutral-700 mb-2">一、总体情况</h4>
              <p className="text-sm text-neutral-600 leading-relaxed">
                本月共受理旅客咨询投诉 {workOrders.length} 件，较上月增长 12.5%。其中热线电话 156 件，网站留言 89 件，微信公众号 67 件，APP 反馈 45 件。按时处理率 93.6%，较上月提升 2.1 个百分点。
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-700 mb-2">二、旅客满意度</h4>
              <p className="text-sm text-neutral-600 leading-relaxed">
                本月共完成回访 {reviews.length} 件，平均满意度 4.2 分，较上月提升 0.1 分。其中非常满意 128 人，满意 96 人，一般 42 人，不满意及以下 26 人，整体满意度处于较好水平。
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-neutral-700 mb-2">三、主要问题分析</h4>
              <p className="text-sm text-neutral-600 leading-relaxed">
                本月热点问题集中在票务服务（85件）、车站服务（72件）和车辆设施（63件）三个方面。其中票务问题主要集中在退票改签、系统故障；车站问题主要是候车环境、无障碍设施；车辆问题主要是空调故障、卫生清洁。
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-700 mb-2">四、改进措施与建议</h4>
              <p className="text-sm text-neutral-600 leading-relaxed">
                1. 加强车站无障碍设施巡检维护；2. 优化12306系统稳定性；3. 增加列车空调预防性检修频次；4. 加强客服人员培训，提升服务意识；5. 建立热点问题快速响应机制。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
