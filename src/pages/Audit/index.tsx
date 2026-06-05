import { useMemo, useState } from 'react';
import {
  Shield,
  Clock,
  User,
  CheckCircle,
  XCircle,
  FileText,
  Search,
  Filter,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { UserRole, AuditActionType } from '../../types';

const roleNameMap: Record<UserRole, string> = {
  service: '客服人员',
  reviewer: '回访人员',
  manager: '管理人员',
};

const actionColorMap: Record<AuditActionType, string> = {
  role_switch: 'bg-neutral-100 text-neutral-600',
  unauthorized_access: 'bg-danger-100 text-danger-600',
  assign: 'bg-railway-100 text-railway-600',
  batch_assign: 'bg-railway-100 text-railway-600',
  reply: 'bg-success-100 text-success-600',
  review: 'bg-info-100 text-info-600',
  rectify_confirm: 'bg-warning-100 text-warning-600',
  rectify_measure: 'bg-warning-100 text-warning-600',
  rectify_close: 'bg-success-100 text-success-600',
  export_report: 'bg-neutral-100 text-neutral-600',
  urge: 'bg-warning-100 text-warning-600',
  followup_create: 'bg-info-100 text-info-600',
  followup_complete: 'bg-success-100 text-success-600',
};

export default function Audit() {
  const { auditLogs } = useAppStore();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [actionFilter, setActionFilter] = useState<AuditActionType | ''>('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [resultFilter, setResultFilter] = useState<'' | 'success' | 'denied'>('');

  const filteredLogs = useMemo(() => {
    let result = auditLogs;

    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      result = result.filter(
        (log) =>
          log.operator.toLowerCase().includes(kw) ||
          log.actionName.toLowerCase().includes(kw) ||
          (log.orderId && log.orderId.toLowerCase().includes(kw)) ||
          (log.targetPage && log.targetPage.toLowerCase().includes(kw))
      );
    }

    if (actionFilter) {
      result = result.filter((log) => log.action === actionFilter);
    }

    if (roleFilter) {
      result = result.filter((log) => log.operatorRole === roleFilter);
    }

    if (resultFilter) {
      result = result.filter((log) => log.result === resultFilter);
    }

    return result.sort(
      (a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    );
  }, [auditLogs, searchKeyword, actionFilter, roleFilter, resultFilter]);

  const stats = useMemo(
    () => ({
      total: auditLogs.length,
      success: auditLogs.filter((l) => l.result === 'success').length,
      denied: auditLogs.filter((l) => l.result === 'denied').length,
      today: auditLogs.filter((l) => l.createTime.startsWith('2024-06-06')).length,
    }),
    [auditLogs]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-800">权限审计</h2>
          <p className="text-sm text-neutral-500 mt-1">查看系统关键操作的审计记录</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">总记录数</p>
              <p className="text-2xl font-semibold text-neutral-800 mt-1">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-railway-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-railway-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">成功操作</p>
              <p className="text-2xl font-semibold text-success-600 mt-1">{stats.success}</p>
            </div>
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">被拒绝</p>
              <p className="text-2xl font-semibold text-danger-600 mt-1">{stats.denied}</p>
            </div>
            <div className="w-10 h-10 bg-danger-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-danger-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">今日记录</p>
              <p className="text-2xl font-semibold text-neutral-800 mt-1">{stats.today}</p>
            </div>
            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-5 border-b border-neutral-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-base font-semibold text-neutral-700">审计记录列表</h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center px-3 py-2 bg-neutral-50 rounded-md border border-neutral-200">
                <Search className="w-4 h-4 text-neutral-400 mr-2" />
                <input
                  type="text"
                  placeholder="搜索操作人、工单、页面..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="bg-transparent outline-none text-sm text-neutral-700 w-48"
                />
              </div>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value as AuditActionType | '')}
                className="px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent"
              >
                <option value="">全部动作</option>
                <option value="role_switch">切换角色</option>
                <option value="unauthorized_access">无权访问</option>
                <option value="assign">分派工单</option>
                <option value="batch_assign">批量分派</option>
                <option value="reply">提交答复</option>
                <option value="review">旅客回访</option>
                <option value="rectify_confirm">整改确认</option>
                <option value="rectify_measure">提交措施</option>
                <option value="rectify_close">复核关闭</option>
                <option value="export_report">导出报告</option>
                <option value="urge">发起催办</option>
                <option value="followup_create">创建跟进</option>
                <option value="followup_complete">完成跟进</option>
              </select>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
                className="px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent"
              >
                <option value="">全部角色</option>
                <option value="service">客服人员</option>
                <option value="reviewer">回访人员</option>
                <option value="manager">管理人员</option>
              </select>
              <select
                value={resultFilter}
                onChange={(e) => setResultFilter(e.target.value as '' | 'success' | 'denied')}
                className="px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent"
              >
                <option value="">全部结果</option>
                <option value="success">成功</option>
                <option value="denied">被拒绝</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  操作时间
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  操作人
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  角色
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  动作
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  目标
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  结果
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-neutral-600">{log.createTime}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-neutral-400 mr-2" />
                        <span className="text-sm text-neutral-700">{log.operator}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-600">
                      {roleNameMap[log.operatorRole]}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${actionColorMap[log.action]}`}
                      >
                        {log.actionName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-600">
                      {log.orderId && <span className="font-mono text-railway-600">{log.orderId}</span>}
                      {log.targetPage && <span>页面：{log.targetPage}</span>}
                      {log.targetRole && <span>切换为：{roleNameMap[log.targetRole]}</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                          log.result === 'success'
                            ? 'bg-success-100 text-success-600'
                            : 'bg-danger-100 text-danger-600'
                        }`}
                      >
                        {log.result === 'success' ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            成功
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            被拒绝
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    暂无审计记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-neutral-200">
          <span className="text-sm text-neutral-500">
            共 {filteredLogs.length} 条记录
          </span>
        </div>
      </div>
    </div>
  );
}
