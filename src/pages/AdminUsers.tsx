import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, UserCheck, UserX, ChevronDown, ChevronLeft, ChevronRight, Loader2, X, Award, Heart, User } from 'lucide-react';
import { adminApi, type AdminUserListItem, type AdminUserDetail } from '../services/api';

const ROLES = ['Admin', 'DiveCenter', 'Diver', 'Trainer'];

export default function AdminUsers() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;
  const totalPages = Math.ceil(totalCount / pageSize);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<AdminUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const result = await adminApi.getUsers(page, pageSize);
    if (result.ok) {
      setUsers(result.data.items);
      setTotalCount(result.data.totalCount);
      setError('');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  useEffect(() => {
    if (!selectedUserId) {
      setUserDetail(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    adminApi.getUser(selectedUserId).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setUserDetail(result.data);
      }
      setDetailLoading(false);
    });
    return () => { cancelled = true; };
  }, [selectedUserId]);

  const handleToggleActive = async (user: AdminUserListItem) => {
    if (user.isActive && !window.confirm(t('admin.confirmDeactivate'))) return;

    setActionLoading(user.id);
    const result = user.isActive
      ? await adminApi.deactivateUser(user.id)
      : await adminApi.activateUser(user.id);

    if (result.ok) {
      setUsers(prev =>
        prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u)
      );
    } else {
      alert(result.error);
    }
    setActionLoading(null);
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    if (!window.confirm(t('admin.confirmRoleChange'))) {
      setRoleDropdownOpen(null);
      return;
    }

    setActionLoading(userId);
    setRoleDropdownOpen(null);
    const result = await adminApi.changeUserRole(userId, newRole);

    if (result.ok) {
      setUsers(prev =>
        prev.map(u => u.id === userId ? { ...u, roles: [newRole] } : u)
      );
    } else {
      alert(result.error);
    }
    setActionLoading(null);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center ocean-gradient-light">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-ocean-200 border-t-ocean-500 rounded-full animate-spin" />
          <p className="text-abyss-500 text-sm font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 ocean-gradient-light">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-ocean-600 to-sea-500 rounded-xl flex items-center justify-center shadow-md">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-abyss-900">{t('admin.title')}</h1>
            <p className="text-abyss-500 text-sm">{t('admin.users')} ({totalCount})</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-coral-50 border border-coral-200 rounded-xl text-coral-700">
            {error}
          </div>
        )}

        {users.length === 0 ? (
          <div className="text-center py-16 text-abyss-400">{t('admin.noUsers')}</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-soft border border-ocean-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ocean-100 bg-ocean-50/50">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-abyss-500 uppercase tracking-wider">
                      {t('admin.users')}
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-abyss-500 uppercase tracking-wider">
                      {t('admin.email')}
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-abyss-500 uppercase tracking-wider">
                      {t('admin.role')}
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-abyss-500 uppercase tracking-wider">
                      {t('admin.status')}
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-abyss-500 uppercase tracking-wider">
                      {t('admin.createdAt')}
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-abyss-500 uppercase tracking-wider">
                      {t('admin.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ocean-100">
                  {users.map(user => (
                    <tr
                      key={user.id}
                      className="hover:bg-ocean-50/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedUserId(selectedUserId === user.id ? null : user.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-ocean-500 to-sea-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-white">
                              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-abyss-800">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-abyss-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); setRoleDropdownOpen(roleDropdownOpen === user.id ? null : user.id); }}
                            disabled={actionLoading === user.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-ocean-100 text-ocean-700 hover:bg-ocean-200 transition-colors"
                          >
                            {user.roles[0] || 'None'}
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          {roleDropdownOpen === user.id && (
                            <div className="absolute z-10 mt-1 bg-white border border-ocean-200 rounded-lg shadow-lg py-1 min-w-[140px]">
                              {ROLES.map(role => (
                                <button
                                  key={role}
                                  onClick={(e) => { e.stopPropagation(); handleChangeRole(user.id, role); }}
                                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-ocean-50 transition-colors ${
                                    user.roles.includes(role) ? 'text-ocean-700 font-medium bg-ocean-50' : 'text-abyss-700'
                                  }`}
                                >
                                  {role}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                          user.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {user.isActive ? t('admin.active') : t('admin.inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-abyss-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleActive(user); }}
                          disabled={actionLoading === user.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            user.isActive
                              ? 'text-red-600 hover:bg-red-50 border border-red-200'
                              : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                          } disabled:opacity-50`}
                        >
                          {user.isActive ? (
                            <>
                              <UserX className="w-3.5 h-3.5" />
                              {t('admin.deactivate')}
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              {t('admin.activate')}
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-ocean-100 bg-ocean-50/30">
                <p className="text-sm text-abyss-500">
                  {t('admin.showing')} {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} {t('admin.of')} {totalCount}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-lg border border-ocean-200 hover:bg-ocean-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-abyss-600" />
                  </button>
                  <span className="text-sm font-medium text-abyss-700 px-3">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-2 rounded-lg border border-ocean-200 hover:bg-ocean-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-abyss-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedUserId && (
          <div className="mt-6 bg-white rounded-2xl shadow-soft border border-ocean-100 overflow-hidden">
            <div className="p-5 border-b border-ocean-100 bg-gradient-to-r from-ocean-50 to-sea-50 flex items-center justify-between">
              <h3 className="font-bold text-abyss-900 flex items-center gap-2">
                <User className="w-5 h-5 text-ocean-500" />
                {t('admin.userDetail')}
              </h3>
              <button onClick={() => setSelectedUserId(null)} className="p-2 hover:bg-ocean-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-abyss-400" />
              </button>
            </div>
            {detailLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-ocean-500 animate-spin" />
              </div>
            ) : userDetail ? (
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-abyss-700 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-ocean-500" />
                    {t('admin.personalInfo')}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-abyss-400">{t('admin.email')}:</span> <span className="text-abyss-800">{userDetail.email}</span></p>
                    <p><span className="text-abyss-400">{t('admin.createdAt')}:</span> <span className="text-abyss-800">{new Date(userDetail.createdAt).toLocaleString()}</span></p>
                    {userDetail.updatedAt && (
                      <p><span className="text-abyss-400">{t('admin.updatedAt')}:</span> <span className="text-abyss-800">{new Date(userDetail.updatedAt).toLocaleString()}</span></p>
                    )}
                    {userDetail.bio && <p className="text-abyss-600 italic">{userDetail.bio}</p>}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-abyss-700 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-ocean-500" />
                    {t('admin.diverInfo')}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-abyss-400">{t('admin.certification')}:</span> <span className="text-abyss-800">{userDetail.certificationLevel || '—'}</span></p>
                    <p><span className="text-abyss-400">{t('admin.totalDives')}:</span> <span className="text-abyss-800">{userDetail.totalDives || 0}</span></p>
                    {userDetail.preferredSuitType && <p><span className="text-abyss-400">{t('admin.suitType')}:</span> <span className="text-abyss-800">{userDetail.preferredSuitType}</span></p>}
                    {userDetail.preferredDiveType && <p><span className="text-abyss-400">{t('admin.diveType')}:</span> <span className="text-abyss-800">{userDetail.preferredDiveType}</span></p>}
                    {userDetail.preferredMaxDepthM != null && <p><span className="text-abyss-400">{t('admin.maxDepth')}:</span> <span className="text-abyss-800">{userDetail.preferredMaxDepthM}m</span></p>}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-abyss-700 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-coral-500" />
                    {t('admin.emergencyContact')}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-abyss-400">{t('admin.contactName')}:</span> <span className="text-abyss-800">{userDetail.emergencyContactName || '—'}</span></p>
                    <p><span className="text-abyss-400">{t('admin.contactPhone')}:</span> <span className="text-abyss-800">{userDetail.emergencyContactPhone || '—'}</span></p>
                    <p><span className="text-abyss-400">{t('admin.contactRelation')}:</span> <span className="text-abyss-800">{userDetail.emergencyContactRelation || '—'}</span></p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
