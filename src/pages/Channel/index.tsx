import { useState } from 'react';
import {
  Phone,
  Globe,
  MessageSquare,
  Smartphone,
  Plus,
  Paperclip,
  Clock,
  Send,
} from 'lucide-react';
import { workOrders, problemCategories, trains, stations } from '../../data/mockData';
import { channelMap, statusMap, urgencyMap } from '../../utils';
import type { ChannelType, UrgencyLevel } from '../../types';

const channelIcons: Record<ChannelType, any> = {
  hotline: Phone,
  web: Globe,
  wechat: MessageSquare,
  app: Smartphone,
};

export default function Channel() {
  const [activeChannel, setActiveChannel] = useState<ChannelType>('hotline');
  const [formData, setFormData] = useState({
    title: '',
    passengerName: '',
    passengerPhone: '',
    trainNo: '',
    station: '',
    category: '',
    urgency: 'normal' as UrgencyLevel,
    content: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('工单已提交！');
    setFormData({
      title: '',
      passengerName: '',
      passengerPhone: '',
      trainNo: '',
      station: '',
      category: '',
      urgency: 'normal',
      content: '',
    });
  };

  const getDeadlineHint = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'critical':
        return '4小时内处理';
      case 'urgent':
        return '24小时内处理';
      default:
        return '3个工作日内处理';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {(Object.keys(channelMap) as ChannelType[]).map((channel) => {
          const Icon = channelIcons[channel];
          const count = workOrders.filter((o) => o.channel === channel).length;
          const isActive = activeChannel === channel;
          return (
            <button
              key={channel}
              onClick={() => setActiveChannel(channel)}
              className={`p-5 rounded-lg border transition-all text-left ${
                isActive
                  ? 'bg-railway-50 border-railway-500 shadow-md'
                  : 'bg-white border-neutral-200 hover:border-railway-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`p-2 rounded-lg ${
                    isActive ? 'bg-railway-500' : 'bg-neutral-100'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? 'text-white' : 'text-neutral-600'}`}
                  />
                </div>
                <span
                  className={`text-2xl font-bold ${
                    isActive ? 'text-railway-600' : 'text-neutral-700'
                  }`}
                >
                  {count}
                </span>
              </div>
              <p className={`mt-3 text-sm ${isActive ? 'text-railway-600' : 'text-neutral-600'}`}>
                {channelMap[channel].label}
              </p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-neutral-200">
          <div className="p-5 border-b border-neutral-200">
            <div className="flex items-center">
              <Plus className="w-5 h-5 text-railway-500 mr-2" />
              <h3 className="text-base font-semibold text-neutral-700">
                录入{channelMap[activeChannel].label}工单
              </h3>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-5">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  工单标题 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="请输入工单标题"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  问题分类 <span className="text-danger-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent"
                  required
                >
                  <option value="">请选择问题分类</option>
                  {problemCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  旅客姓名 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.passengerName}
                  onChange={(e) => setFormData({ ...formData, passengerName: e.target.value })}
                  placeholder="请输入旅客姓名"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  联系电话 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.passengerPhone}
                  onChange={(e) => setFormData({ ...formData, passengerPhone: e.target.value })}
                  placeholder="请输入联系电话"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  车次
                </label>
                <select
                  value={formData.trainNo}
                  onChange={(e) => setFormData({ ...formData, trainNo: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent"
                >
                  <option value="">请选择车次（可选）</option>
                  {trains.map((train) => (
                    <option key={train} value={train}>
                      {train}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  站点
                </label>
                <select
                  value={formData.station}
                  onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent"
                >
                  <option value="">请选择站点（可选）</option>
                  {stations.map((station) => (
                    <option key={station} value={station}>
                      {station}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                紧急程度 <span className="text-danger-500">*</span>
              </label>
              <div className="flex space-x-4">
                {(['normal', 'urgent', 'critical'] as UrgencyLevel[]).map((level) => (
                  <label
                    key={level}
                    className={`flex items-center px-4 py-2 rounded-md border cursor-pointer transition-colors ${
                      formData.urgency === level
                        ? level === 'critical'
                          ? 'border-danger-500 bg-danger-50 text-danger-700'
                          : level === 'urgent'
                          ? 'border-warning-500 bg-warning-50 text-warning-700'
                          : 'border-railway-500 bg-railway-50 text-railway-700'
                        : 'border-neutral-300 hover:border-neutral-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="urgency"
                      value={level}
                      checked={formData.urgency === level}
                      onChange={(e) =>
                        setFormData({ ...formData, urgency: e.target.value as UrgencyLevel })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm">{urgencyMap[level].label}</span>
                    <Clock className="w-4 h-4 ml-2" />
                    <span className="text-xs ml-1 text-neutral-500">
                      {getDeadlineHint(level)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                问题描述 <span className="text-danger-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="请详细描述旅客反映的问题..."
                rows={4}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent resize-none"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                附件上传
              </label>
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-railway-400 transition-colors cursor-pointer">
                <Paperclip className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">
                  点击或拖拽文件到此处上传
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  支持图片、PDF、Word文档，单个文件不超过10MB
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="px-6 py-2 text-sm text-neutral-600 bg-neutral-100 rounded-md mr-3 hover:bg-neutral-200 transition-colors"
              >
                重置
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm text-white bg-railway-500 rounded-md hover:bg-railway-600 transition-colors flex items-center"
              >
                <Send className="w-4 h-4 mr-2" />
                提交工单
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
            <div className="p-5 border-b border-neutral-200">
              <h3 className="text-base font-semibold text-neutral-700">今日录入</h3>
            </div>
            <div className="p-4">
              <div className="text-center py-4">
                <span className="text-4xl font-bold text-railway-600">12</span>
                <p className="text-sm text-neutral-500 mt-1">件工单</p>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="p-2 bg-neutral-50 rounded">
                  <p className="text-lg font-semibold text-neutral-700">8</p>
                  <p className="text-xs text-neutral-500">热线</p>
                </div>
                <div className="p-2 bg-neutral-50 rounded">
                  <p className="text-lg font-semibold text-neutral-700">2</p>
                  <p className="text-xs text-neutral-500">网页</p>
                </div>
                <div className="p-2 bg-neutral-50 rounded">
                  <p className="text-lg font-semibold text-neutral-700">2</p>
                  <p className="text-xs text-neutral-500">其他</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
            <div className="p-5 border-b border-neutral-200">
              <h3 className="text-base font-semibold text-neutral-700">最近工单</h3>
            </div>
            <div className="divide-y divide-neutral-100">
              {workOrders.slice(0, 4).map((order) => (
                <div key={order.id} className="p-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-700 truncate">
                        {order.title}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {order.id} · {order.createTime}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ml-2 whitespace-nowrap ${
                        statusMap[order.status].color
                      }`}
                    >
                      {statusMap[order.status].label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
