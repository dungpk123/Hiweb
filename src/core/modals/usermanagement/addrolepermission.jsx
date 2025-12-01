

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

const API_ROLE_PERMISSIONS = `${process.env.REACT_APP_API_URL}/role/rolePermissions`;
const API_USER_ROLES = `${process.env.REACT_APP_API_URL}/role/Roles`;
const API_PERMISSIONS = `${process.env.REACT_APP_API_URL}/role/permissions`;

const AddRolePermission = ({ onSuccess }) => {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({
    role_id: "",
    permission_id: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const fetchAllPages = async (baseUrl, token, perPage = 100) => {
      try {
        const headers = {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `${token}`,
        };
        // First page
        const firstRes = await axios.get(`${baseUrl}?page=1&per_page=${perPage}`, { headers });
        if (!(firstRes.data && firstRes.data.status && firstRes.data.code === 200)) {
          return [];
        }
        let allData = Array.isArray(firstRes.data.data) ? firstRes.data.data.slice() : [];
        const totalPages = firstRes.data.pagination?.total_pages || 1;
        for (let p = 2; p <= totalPages; p++) {
          try {
            const res = await axios.get(`${baseUrl}?page=${p}&per_page=${perPage}`, { headers });
            if (res.data && res.data.status && res.data.code === 200 && Array.isArray(res.data.data)) {
              allData = allData.concat(res.data.data);
            } else {
              break;
            }
          } catch (e) {
            break;
          }
        }
        return allData;
      } catch (err) {
        return [];
      }
    };

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const [allRoles, allPermissions] = await Promise.all([
          fetchAllPages(API_USER_ROLES, token),
          fetchAllPages(API_PERMISSIONS, token),
        ]);
        if (allRoles && allRoles.length) setRoles(allRoles);
        if (allPermissions && allPermissions.length) setPermissions(allPermissions);
      } catch (err) {
        // Nếu cần có thể setError chung ở đây
      }
    };
    fetchData();
  }, []);

  const getDisplayName = (item) => {
    if (!item) return '';
    const lang = (i18n && i18n.language) ? String(i18n.language).toLowerCase() : '';
    const isVietnamese = lang === 'vi' || lang.startsWith('vi');
    return isVietnamese
      ? (item.name_vi || item.name_en || item.slug)
      : (item.name_en || item.name_vi || item.slug);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("userToken");
      const res = await axios.post(
        API_ROLE_PERMISSIONS,
        form,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `${token}`,
          },
        }
      );
      const isHttp2xx = res && res.status >= 200 && res.status < 300;
      const isApiSuccess = res.data && (res.data.status === true || [200, 201].includes(res.data.code));
      console.debug("AddRolePermission - POST response:", res && res.status, res && res.data);
      if (isHttp2xx || isApiSuccess) {
        // Show user feedback on success
        Swal.fire({
          title: t('common.success') || 'Thành công',
          text: t('addrolepermission.success') || 'Thêm role-permission thành công.',
          icon: 'success',
          confirmButtonText: t('common.ok') || 'OK',
        });
        onSuccess && onSuccess();
        window.$('#add-role-permission').modal('hide');
        return;
      }
      setError("Không thêm được role-permission");
    } catch (err) {
      console.debug("AddRolePermission - POST error:", err && err.response ? err.response : err);
      if (err.response) {
        // Prefer explicit status checks first
        if (err.response.status === 409) {
          setError(err.response.data?.message || "Role-permission đã tồn tại hoặc dữ liệu bị trùng!");
        } else if (err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError(`Lỗi gọi API${err.response.status ? `: ${err.response.status}` : ""}${err.response.statusText ? ` ${err.response.statusText}` : ""}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade" id="add-role-permission" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{t("permissions.role")}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">{t('permissions.role')}</label>
                <select
                  className="form-control"
                  name="role_id"
                  value={form.role_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">{t('permissions.selectRole')}</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {getDisplayName(role)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">{t('sidebar.userManagement.permissions')}</label>
                <select
                  className="form-control"
                  name="permission_id"
                  value={form.permission_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">{t("permissions.selectpermission")}</option>
                  {permissions.map((perm) => (
                    <option key={perm.id} value={perm.id}>
                      {getDisplayName(perm)}
                    </option>
                  ))}
                </select>
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">{t("addrolepermission.cancel",)}</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? t("addrolepermission.saving") : t("addrolepermission.save")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

AddRolePermission.propTypes = {
  onSuccess: PropTypes.func,
};

export default AddRolePermission;