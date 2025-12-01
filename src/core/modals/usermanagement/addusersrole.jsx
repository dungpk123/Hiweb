import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Select from "react-select";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

const API_USER_ROLES = `${process.env.REACT_APP_API_URL}/role/userRoles`;
const API_ROLES_URL = `${process.env.REACT_APP_API_URL}/role/roles`;
const API_USER_LIST = `${process.env.REACT_APP_API_URL}/role/userRoles`; 

const AddUsersRoles = ({ onUserAdded }) => {
  const { t } = useTranslation();
  const currentLang = localStorage.getItem("i18nextLng");
  const MySwal = withReactContent(Swal);

  // State cho Form
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    description: "",
  });

  // State cho Options
  const [userOptions, setUserOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);

  const getRoleName = useCallback(
    (role) => {
      if (!role) return "N/A";
      const nameEn = role.name_en || "";
      const nameVi = role.name_vi || "";

      if (currentLang === "en") {
        return nameEn || nameVi || role.slug || "N/A";
      }
      return nameVi || nameEn || role.slug || "N/A";
    },
    [currentLang]
  );

  // 1. Fetch danh sách ROLES 
  const fetchRoleList = useCallback(async () => {
    try {
      const token = localStorage.getItem("userToken");
      let allRoles = [];
      let currentPage = 1;
      let totalPages = 1;
      const perPage = 10;

      while (currentPage <= totalPages) {
        const response = await axios.get(API_ROLES_URL, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `${token}`,
          },
          params: {
            per_page: perPage,
            page: currentPage,
          },
        });

        if (response.data.status && Array.isArray(response.data.data)) {
          allRoles = allRoles.concat(response.data.data);
          totalPages = response.data.pagination?.total_pages || 1;
          currentPage++;
        } else {
          break;
        }
      }

      const options = allRoles.map((role) => ({
        value: String(role.id),
        label: getRoleName(role),
        nameEn: role.name_en?.toLowerCase() || "",
        nameVi: role.name_vi?.toLowerCase() || "",
      }));

      // Sắp xếp
      options.sort((a, b) =>
        a.label.localeCompare(b.label, currentLang === "en" ? "en" : "vi")
      );

      setRoleOptions(options);
    } catch (err) {
      console.error("Fetch Role List error:", err);
      MySwal.fire(
        t("common.error") || "Lỗi",
        t("role.fetch_error") || "Không thể tải danh sách vai trò.",
        "error"
      );
    }
  }, [getRoleName, currentLang, MySwal, t]);

  // Fetch danh sách USERS 
  const fetchUserList = useCallback(async () => {
    try {
      const token = localStorage.getItem("userToken");
      let allUsers = [];
      let currentPage = 1;
      let totalPages = 1;
      const perPage = 50;

      while (currentPage <= totalPages) {
        const response = await axios.get(API_USER_LIST, {
          headers: { Authorization: `${token}` },
          params: { per_page: perPage, page: currentPage },
        });

        if (response.data.status && Array.isArray(response.data.data)) {
          allUsers = allUsers.concat(response.data.data);
          totalPages = response.data.pagination?.total_pages || 1;
          currentPage++;
        } else break;
      }

      const options = allUsers.map((user) => ({
        value: user.user_id,
        label: user.user_name,
        fullName: user.full_name,
      }));

      const unique = options.filter(
        (v, i, a) => a.findIndex((t) => t.value === v.value) === i
      );

      setUserOptions(unique);
    } catch (error) {
      console.error("Fetch user error:", error);
    }
  }, []);

  useEffect(() => {
    fetchRoleList();
  }, [currentLang]); // chạy lại khi đổi ngôn ngữ

  // Chạy khi component mount
  useEffect(() => {
    fetchUserList();
  }, []);

  // Cập nhật fullName khi user được chọn
  const handleUserSelect = (selectedOption) => {
    setSelectedUserId(selectedOption ? selectedOption.value : null);
    // Tự động điền full_name nếu có
    setFormData((prev) => ({
      ...prev,
      fullName: selectedOption ? selectedOption.fullName : "",
      userName: selectedOption ? selectedOption.label : "",
    }));
  };

  const handleRoleSelect = (selectedOption) => {
    setSelectedRoleId(selectedOption ? selectedOption.value : null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setSelectedUserId(null);
    setSelectedRoleId(null);
    setFormData({
      userName: "",
      fullName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      description: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUserId || !selectedRoleId) {
      MySwal.fire(
        t("common.warning") || "Cảnh báo",
        t("user.select_user_role") ||
          "Vui lòng chọn Tên Người dùng và Vai trò.",
        "warning"
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      MySwal.fire(
        t("common.warning") || "Cảnh báo",
        t("user.password_match_error") || "Mật khẩu không khớp.",
        "warning"
      );
      return;
    }

    // Dữ liệu cần gửi đi 
    const postData = {
      user_id: selectedUserId,
      role_id: selectedRoleId,
    };

    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      const response = await axios.post(API_USER_ROLES, postData, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `${token}`,
        },
      });

      if (response.data.status) {
        MySwal.fire(
          t("common.success") || "Thành công!",
          t("user.add_success") || "Người dùng đã được thêm thành công.",
          "success"
        );
        resetForm();
        const closeButton = document.querySelector(
          "#add-user .close[data-bs-dismiss='modal']"
        );
        if (closeButton) {
          closeButton.click();
        }

        if (onUserAdded) {
          onUserAdded();
        }
      } else {
        MySwal.fire(
          t("common.error") || "Lỗi",
          response.data.msg || "Không thể thêm người dùng.",
          "error"
        );
      }
    } catch (err) {
      console.error("Add User error:", err);
      MySwal.fire(
        t("common.error") || "Lỗi",
        t("common.api_error") || "Lỗi kết nối hoặc API.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        className="modal fade"
        id="add-user"
        tabIndex="-1"
        aria-labelledby="addUserModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered custom-modal-two">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content">
                <div className="modal-header border-0 custom-modal-header">
                  <div className="page-title">
                    <h4>{t("user.add_new") || "Thêm Người dùng mới"}</h4>
                  </div>
                  <button
                    type="button"
                    className="close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body custom-modal-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      {/* Trường User Name */}
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>{t("common.userName") || "User Name"}</label>
                          <Select
                            className="select"
                            options={userOptions}
                            placeholder={
                              t("user.select_user") || "Chọn Người dùng"
                            }
                            onChange={handleUserSelect}
                            value={userOptions.find(
                              (opt) => opt.value === selectedUserId
                            )}
                            filterOption={(option, inputValue) => {
                              const label = option.label.toLowerCase();
                              const fullName =
                                option.fullName?.toLowerCase() || "";
                              const search = inputValue.toLowerCase();

                              return (
                                label.includes(search) ||
                                fullName.includes(search)
                              );
                            }}
                            isDisabled={loading}
                          />
                        </div>
                      </div>

                      {/* Trường Full Name */}
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>{t("common.fullName") || "Full Name"}</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            name="fullName"
                            placeholder={t("common.fullName") || "Full Name"}
                            disabled 
                          />
                        </div>
                      </div>

                      {/* Trường Role  */}
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>{t("common.role") || "Role"}</label>
                          <Select
                            className="select"
                            options={roleOptions}
                            placeholder={t("user.selectRole") || "Chọn Vai trò"}
                            onChange={handleRoleSelect}
                            value={roleOptions.find(
                              (opt) => opt.value === selectedRoleId
                            )}
                            isDisabled={loading}
                            filterOption={(option, inputValue) => {
                              const search = inputValue.toLowerCase();
                              return (
                                option.label.toLowerCase().includes(search) ||
                                option.data.nameEn.includes(search) ||
                                option.data.nameVi.includes(search)
                              );
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer-btn">
                      <button
                        type="button"
                        className="btn btn-cancel me-2"
                        data-bs-dismiss="modal"
                        onClick={resetForm}
                      >
                        {t("common.cancel") || "Cancel"}
                      </button>
                      <button
                        type="submit"
                        className="btn btn-submit"
                        disabled={loading}
                      >
                        {loading
                          ? t("common.loading") || "Đang gửi..."
                          : t("common.save") || "Submit"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
AddUsersRoles.propTypes = {
  onUserAdded: PropTypes.func,
};

export default AddUsersRoles;
