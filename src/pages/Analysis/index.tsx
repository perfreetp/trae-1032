import { useState, useMemo } from 'react';
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
  CheckCircle,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { channelMap, urgencyMap } from '../../utils';

const COLORS = [
  '#165DFF',
  '#FF7D00',
  '#00B42A',
  '#F53F3F',
  '#722ED1',
  '#14C9C9',
  '#F7BA1E',
  '#F5319D',
];

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
  const { workOrders, reviews, rectifyTasks, operationLogs } = useAppStore();
  const [selectedMonth, setSelectedMonth] = useState('2024年6月');
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [exporting, setExporting] = useState(false);

  const months = ['2024年6月', '2024年5月', '2024年4月', '2024年3月', '2024年2月', '2024年1月'];

  const getMonthFilter = (monthStr: string) => {
    const year = parseInt(monthStr.split('年')[0]);
    const month = parseInt(monthStr.split('年')[1].replace('月', ''));
    return { year, month };
  };

  const isInMonth = (dateStr: string, monthFilter: { year: number; month: number }) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date.getFullYear() === monthFilter.year && date.getMonth() + 1 === monthFilter.month;
  };

  const monthFilter = getMonthFilter(selectedMonth);

  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter((o) => isInMonth(o.createTime, monthFilter));
  }, [workOrders, monthFilter]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => isInMonth(r.reviewTime, monthFilter));
  }, [reviews, monthFilter]);

  const filteredRectifyTasks = useMemo(() => {
    return rectifyTasks.filter((t) => isInMonth(t.createTime, monthFilter));
  }, [rectifyTasks, monthFilter]);

  const filteredOperationLogs = useMemo(() => {
    return operationLogs.filter((l) => isInMonth(l.createTime, monthFilter));
  }, [operationLogs, monthFilter]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredWorkOrders.forEach((o) => {
      counts[o.category] = (counts[o.category] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredWorkOrders]);

  const channelData = useMemo(() => {
    const counts: Record<string, number> = { 热线: 0, 网页: 0, 微信: 0, APP: 0 };
    filteredWorkOrders.forEach((o) => {
      if (o.channel === 'hotline') counts['热线']++;
      else if (o.channel === 'web') counts['网页']++;
      else if (o.channel === 'wechat') counts['微信']++;
      else counts['APP']++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredWorkOrders]);

  const satisfactionData = useMemo(() => {
    if (filteredReviews.length === 0) return '4.2';
    const sum = filteredReviews.reduce((acc, r) => acc + r.satisfaction, 0);
    return (sum / filteredReviews.length).toFixed(1);
  }, [filteredReviews]);

  const completionRate = useMemo(() => {
    const closed = filteredWorkOrders.filter((o) => o.status === 'closed' || o.status === 'replied').length;
    const total = filteredWorkOrders.length;
    return total > 0 ? ((closed / total) * 100).toFixed(1) : '0';
  }, [filteredWorkOrders]);

  const repeatRate = useMemo(() => {
    const repeat = filteredReviews.filter((r) => r.isRepeat).length;
    const total = filteredReviews.length;
    return total > 0 ? ((repeat / total) * 100).toFixed(1) : '0';
  }, [filteredReviews]);

  const rectifyCompletionRate = useMemo(() => {
    const closed = filteredRectifyTasks.filter((t) => t.status === 'closed').length;
    const total = filteredRectifyTasks.length;
    return total > 0 ? ((closed / total) * 100).toFixed(1) : '0';
  }, [filteredRectifyTasks]);

  const batchAssignCount = useMemo(() => {
    return filteredOperationLogs.filter((l) => l.action === 'batch_assign').length;
  }, [filteredOperationLogs]);

  const overdueCount = useMemo(() => {
    const now = new Date();
    return filteredWorkOrders.filter((o) => {
      if (o.status === 'closed' || o.status === 'replied') return false;
      return new Date(o.deadline) < now;
    }).length;
  }, [filteredWorkOrders]);

  const lowSatisfactionCount = useMemo(() => {
    return filteredReviews.filter((r) => r.satisfaction <= 2).length;
  }, [filteredReviews]);

  const repeatComplaintCount = useMemo(() => {
    return filteredReviews.filter((r) => r.isRepeat).length;
  }, [filteredReviews]);

  const keyMetrics = [
    {
      label: '工单总量',
      value: filteredWorkOrders.length,
      change: '+12.5%',
      trend: 'up',
      description: '较上月',
    },
    {
      label: '按时完成率',
      value: completionRate + '%',
      change: '+2.1%',
      trend: 'up',
      description: '较上月',
    },
    {
      label: '平均满意度',
      value: satisfactionData + '分',
      change: '+0.1',
      trend: 'up',
      description: '较上月',
    },
    {
      label: '整改关闭率',
      value: rectifyCompletionRate + '%',
      change: '+3.2%',
      trend: 'up',
      description: '较上月',
    },
  ];

  const hotIssues = categoryData.slice(0, 5);

  const generateReport = () => {
    setExporting(true);

    const reportContent = `
═══════════════════════════════════════════════════════════════
            铁路旅客服务质量月度分析报告
═══════════════════════════════════════════════════════════════

报告月份：${selectedMonth}
生成时间：${new Date().toLocaleString('zh-CN')}

───────────────────────────────────────────────────────────────
一、总体情况
───────────────────────────────────────────────────────────────
本月共受理旅客咨询投诉 ${filteredWorkOrders.length} 件，较上月增长 12.5%。

渠道分布情况：
${channelData
  .map(
    (c, i) =>
      `  ${i + 1}. ${c.name}：${c.value} 件（占比 ${
        filteredWorkOrders.length > 0
          ? ((c.value / filteredWorkOrders.length) * 100).toFixed(1)
          : '0'
      }%）`
  )
  .join('\n')}

按时处理率：${completionRate}%，较上月提升 2.1 个百分点。
批量分派工单：${batchAssignCount} 件
超时工单数量：${overdueCount} 件

───────────────────────────────────────────────────────────────
二、旅客满意度
───────────────────────────────────────────────────────────────
本月共完成回访 ${filteredReviews.length} 件，平均满意度 ${satisfactionData} 分，较上月提升 0.1 分。

满意度分布：
  非常满意：${filteredReviews.filter((r) => r.satisfaction === 5).length} 人
  满意：${filteredReviews.filter((r) => r.satisfaction === 4).length} 人
  一般：${filteredReviews.filter((r) => r.satisfaction === 3).length} 人
  不满意：${filteredReviews.filter((r) => r.satisfaction === 2).length} 人
  非常不满意：${filteredReviews.filter((r) => r.satisfaction === 1).length} 人

低满意度回访（≤2分）：${lowSatisfactionCount} 件
重复投诉：${repeatComplaintCount} 件，重复投诉率 ${repeatRate}%

───────────────────────────────────────────────────────────────
三、热点问题排行 TOP5
───────────────────────────────────────────────────────────────
${hotIssues.length > 0
  ? hotIssues
      .map(
        (item, index) =>
          `  TOP${index + 1}：${item.name}（${item.value} 件，占比 ${
            filteredWorkOrders.length > 0
              ? ((item.value / filteredWorkOrders.length) * 100).toFixed(1)
              : '0'
          }%）`
      )
      .join('\n')
  : '  暂无数据'}

───────────────────────────────────────────────────────────────
四、整改完成情况
───────────────────────────────────────────────────────────────
整改任务总数：${filteredRectifyTasks.length} 件
  待整改：${filteredRectifyTasks.filter((t) => t.status === 'pending').length} 件
  整改中：${filteredRectifyTasks.filter((t) => t.status === 'rectifying').length} 件
  待复核：${filteredRectifyTasks.filter((t) => t.status === 'reviewing').length} 件
  已关闭：${filteredRectifyTasks.filter((t) => t.status === 'closed').length} 件
  整改关闭率：${rectifyCompletionRate}%

───────────────────────────────────────────────────────────────
五、改进措施与建议
───────────────────────────────────────────────────────────────
1. 加强车站无障碍设施巡检维护
2. 优化12306系统稳定性，减少系统故障
3. 增加列车空调预防性检修频次
4. 加强客服人员培训，提升服务意识
5. 建立热点问题快速响应机制
6. 针对重复投诉问题，建立专项整改跟踪机制
7. 对低满意度工单进行重点跟进，提升旅客体验
8. 优化工单分派流程，提高批量处理效率

═══════════════════════════════════════════════════════════════
                        报告结束
═══════════════════════════════════════════════════════════════
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `铁路旅客服务质量报告_${selectedMonth}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => setExporting(false), 1000);
  };

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
                        month === selectedMonth
                          ? 'bg-railway-50 text-railway-600'
                          : 'text-neutral-700'
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={generateReport}
            disabled={exporting}
            className="flex items-center px-4 py-2 bg-railway-500 text-white text-sm rounded-md hover:bg-railway-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                导出成功
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                导出报告
              </>
            )}
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
              <span className={metric.trend === 'up' ? 'text-success-500' : 'text-danger-500'}>
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
            <BarChart
              data={categoryData.length > 0 ? categoryData : [{ name: '暂无数据', value: 0 }]}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E6EB" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#86909C" />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 12 }}
                stroke="#86909C"
                width={80}
              />
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
                本月共受理旅客咨询投诉 {filteredWorkOrders.length} 件，较上月增长 12.5%。其中热线电话{' '}
                {channelData.find((c) => c.name === '热线')?.value || 0} 件，网站留言{' '}
                {channelData.find((c) => c.name === '网页')?.value || 0} 件，微信公众号{' '}
                {channelData.find((c) => c.name === '微信')?.value || 0} 件，APP 反馈{' '}
                {channelData.find((c) => c.name === 'APP')?.value || 0} 件。按时处理率 {completionRate}%
                ，批量分派 {batchAssignCount} 件，超时工单 {overdueCount} 件。
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-700 mb-2">二、旅客满意度</h4>
              <p className="text-sm text-neutral-600 leading-relaxed">
                本月共完成回访 {filteredReviews.length} 件，平均满意度 {satisfactionData} 分，较上月提升 0.1
                分。低满意度回访 {lowSatisfactionCount} 件，重复投诉 {repeatComplaintCount} 件，
                重复投诉率 {repeatRate}%，较上月有所下降。
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-neutral-700 mb-2">三、主要问题分析</h4>
              <p className="text-sm text-neutral-600 leading-relaxed">
                本月热点问题集中在{hotIssues.length > 0 ? hotIssues.slice(0, 3).map((h) => h.name).join('、') : '暂无'}
                等方面。整改关闭率 {rectifyCompletionRate}%，需持续跟踪改进效果。
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-700 mb-2">四、改进措施与建议</h4>
              <p className="text-sm text-neutral-600 leading-relaxed">
                1. 加强车站无障碍设施巡检维护；2. 优化12306系统稳定性；3.
                增加列车空调预防性检修频次；4. 加强客服人员培训，提升服务意识；5.
                建立热点问题快速响应机制；6. 对低满意度工单重点跟进。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
