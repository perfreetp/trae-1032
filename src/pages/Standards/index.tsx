import { useState } from 'react';
import {
  Search,
  BookOpen,
  FileText,
  ChevronRight,
  ChevronDown,
  Clock,
  Folder,
  HelpCircle,
} from 'lucide-react';
import { serviceStandards } from '../../data/mockData';
import type { ServiceStandard } from '../../types';

const categories = [
  { id: 'all', name: '全部标准', icon: BookOpen },
  { id: '客运服务', name: '客运服务', icon: Folder },
  { id: '车站服务', name: '车站服务', icon: Folder },
  { id: '票务服务', name: '票务服务', icon: Folder },
  { id: '车辆设施', name: '车辆设施', icon: Folder },
  { id: '安全检查', name: '安全检查', icon: Folder },
  { id: '餐饮服务', name: '餐饮服务', icon: Folder },
];

const knowledgeBase = [
  {
    id: 'KB001',
    question: '旅客投诉的处理流程是什么？',
    answer: '旅客投诉处理流程：1. 受理登记；2. 分类分派；3. 调查处理；4. 答复反馈；5. 回访归档。一般投诉3个工作日内处理完毕，紧急投诉24小时内处理。',
  },
  {
    id: 'KB002',
    question: '如何申请列车晚点赔偿？',
    answer: '列车晚点赔偿申请：1. 保留购票凭证和乘车记录；2. 在12306APP或车站服务台提交申请；3. 提供身份证、车票信息；4. 经核实后，赔偿款项将在15个工作日内退回原支付账户。',
  },
  {
    id: 'KB003',
    question: '遗失物品如何查找？',
    answer: '遗失物品查找：1. 立即联系车站服务台或拨打12306；2. 提供乘车信息、物品描述、联系方式；3. 工作人员协助查找并反馈结果；4. 找到后可预约自取或快递寄送。',
  },
  {
    id: 'KB004',
    question: '特殊重点旅客有哪些服务？',
    answer: '特殊重点旅客服务：1. 优先购票、优先进站、优先乘车；2. 提供轮椅、担架等辅助器具；3. 专人引导接送；4. 重点旅客候车室休息；5. 列车上重点照顾。可提前预约或现场申请。',
  },
];

export default function Standards() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'standards' | 'knowledge'>('standards');

  const filteredStandards = serviceStandards.filter((s) => {
    const matchCategory = activeCategory === 'all' || s.category === activeCategory;
    const matchSearch =
      s.title.includes(searchQuery) ||
      s.content.includes(searchQuery) ||
      s.category.includes(searchQuery);
    return matchCategory && matchSearch;
  });

  const filteredKnowledge = knowledgeBase.filter(
    (k) => k.question.includes(searchQuery) || k.answer.includes(searchQuery)
  );

  const getCategoryCount = (catId: string) => {
    if (catId === 'all') return serviceStandards.length;
    return serviceStandards.filter((s) => s.category === catId).length;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-5 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('standards')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'standards'
                    ? 'bg-railway-500 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <BookOpen className="w-4 h-4 inline mr-2" />
                服务标准
              </button>
              <button
                onClick={() => setActiveTab('knowledge')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'knowledge'
                    ? 'bg-railway-500 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <HelpCircle className="w-4 h-4 inline mr-2" />
                知识库
              </button>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="搜索标准条款或问题..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-72 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {activeTab === 'standards' && (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
              <div className="p-4 border-b border-neutral-200">
                <h3 className="text-sm font-semibold text-neutral-700">标准分类</h3>
              </div>
              <nav className="p-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                        activeCategory === cat.id
                          ? 'bg-railway-50 text-railway-600'
                          : 'text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className="w-4 h-4 mr-2" />
                        {cat.name}
                      </div>
                      <span className="text-xs text-neutral-400">{getCategoryCount(cat.id)}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="col-span-3 bg-white rounded-lg shadow-sm border border-neutral-200">
              <div className="p-4 border-b border-neutral-200">
                <h3 className="text-sm font-semibold text-neutral-700">
                  {categories.find((c) => c.id === activeCategory)?.name}（共 {filteredStandards.length} 条）
                </h3>
              </div>
              <div className="divide-y divide-neutral-100 max-h-[600px] overflow-y-auto">
                {filteredStandards.map((standard: ServiceStandard) => (
                  <div key={standard.id} className="hover:bg-neutral-50 transition-colors">
                    <button
                      onClick={() => setExpandedId(expandedId === standard.id ? null : standard.id)}
                      className="w-full p-4 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-railway-500 mr-3" />
                        <div>
                          <h4 className="text-sm font-medium text-neutral-700">{standard.title}</h4>
                          <div className="flex items-center mt-1 text-xs text-neutral-500">
                            <span className="px-2 py-0.5 bg-railway-50 text-railway-600 rounded mr-2">
                              {standard.category}
                            </span>
                            <Clock className="w-3 h-3 mr-1" />
                            更新于 {standard.updateTime}
                          </div>
                        </div>
                      </div>
                      {expandedId === standard.id ? (
                        <ChevronDown className="w-5 h-5 text-neutral-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-neutral-400" />
                      )}
                    </button>
                    {expandedId === standard.id && (
                      <div className="px-4 pb-4 pl-12">
                        <div className="p-4 bg-neutral-50 rounded-md">
                          <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-sans leading-relaxed">
                            {standard.content}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'knowledge' && (
          <div className="col-span-4 bg-white rounded-lg shadow-sm border border-neutral-200">
            <div className="p-4 border-b border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-700">
                常见问题解答（共 {filteredKnowledge.length} 条）
              </h3>
            </div>
            <div className="divide-y divide-neutral-100">
              {filteredKnowledge.map((item) => (
                <div key={item.id} className="hover:bg-neutral-50 transition-colors">
                  <button
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="w-full p-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center">
                      <HelpCircle className="w-5 h-5 text-warning-500 mr-3" />
                      <h4 className="text-sm font-medium text-neutral-700">{item.question}</h4>
                    </div>
                    {expandedId === item.id ? (
                      <ChevronDown className="w-5 h-5 text-neutral-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-neutral-400" />
                    )}
                  </button>
                  {expandedId === item.id && (
                    <div className="px-4 pb-4 pl-12">
                      <div className="p-4 bg-success-50 rounded-md border border-success-100">
                        <p className="text-sm text-neutral-700 leading-relaxed">{item.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
