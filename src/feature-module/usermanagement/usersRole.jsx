import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router-dom";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import {
  ChevronUp,
  RotateCcw,
  Filter,
  PlusCircle,
  Zap,
} from "feather-icons-react/build/IconComponents";
import Select from "react-select";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import Table from "../../core/pagination/datatable";
import AddUsersRoles from "../../core/modals/usermanagement/addusersrole";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

const API_URL = `${import.meta.env.VITE_API_URL}/role/userRoles`;
const API_ROLES_URL = `${import.meta.env.VITE_API_URL}/role/roles`;

const UsersRoles = () => {
  const { t } = useTranslation();
  const currentLang = localStorage.getItem("i18nextLng");

  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State cho Tìm kiếm và Lọc
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState(null);

  // State UI
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [roleOptions, setRoleOptions] = useState([]);

  // Hàm tiện ích để lấy tên vai trò theo ngôn ngữ
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

  const fetchRoleList = useCallback(async () => {
    try {
      const token = localStorage.getItem("userToken");
      let allRoles = [];
      let currentPage = 1;
      let totalPages = 1;
      const perPage = 10;

      // LẶP LẠI ĐẾN KHI HẾT TẤT CẢ CÁC TRANG
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

          if (response.data.pagination) {
            totalPages = response.data.pagination.total_pages;
          } else {
            break;
          }
          currentPage++;
        } else {
          console.error("Lỗi khi tải danh sách vai trò:", response.data.msg);
          break;
        }
      }

      const options = allRoles.map((role) => ({
        value: String(role.id),
        label: getRoleName(role),
        name_vi: role.name_vi,
        name_en: role.name_en,
      }));

      const allRolesOption = {
        value: null,
        label: t("common.all"),
      };

      // Sắp xếp
      options.sort((a, b) =>
        a.label.localeCompare(b.label, currentLang === "en" ? "en" : "vi")
      );

      setRoleOptions([allRolesOption, ...options]);
    } catch (err) {
      console.error("Fetch Role List error:", err);
      setRoleOptions([{ value: null, label: t("common.selectRole") }]);
    }
  }, [getRoleName, t]);

  const fetchUserRoles = useCallback(
    async (page = 1, keyword = "", roleId = null) => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("userToken");
        let apiPath = `${API_URL}?page=${page}&per_page=10`;
        if (keyword) {
          apiPath += `&keyword=${encodeURIComponent(keyword)}`;
        }
        const validRoleId =
          roleId && roleId !== "null" && String(roleId).trim() !== "";

        if (validRoleId) {
          apiPath += `&role_id=${roleId}`;
        }

        const response = await axios.get(apiPath, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `${token}`,
          },
        });

        if (response.data.status) {
          setData(response.data.data);
          setTotalPages(response.data.pagination.total_pages);
          setTotalItems(response.data.pagination.total);
          setCurrentPage(response.data.pagination.current_page);
        } else {
          setData([]);
          setTotalPages(1);
          setTotalItems(0);
          setCurrentPage(1);
          setError(response.data.msg || "Lỗi khi tải dữ liệu người dùng.");
        }
      } catch (err) {
        console.error("Fetch User Roles error:", err);
        setError("Lỗi kết nối hoặc API.");
        setData([]);
        setTotalPages(1);
        setTotalItems(0);
        setCurrentPage(1);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Chạy khi component mount (hoặc ngôn ngữ thay đổi) để lấy danh sách role
  useEffect(() => {
    fetchRoleList();
  }, [fetchRoleList]);

  //Chạy khi search/filter thay đổi. Tự động tìm kiếm và reset về trang 1
  useEffect(() => {
    fetchUserRoles(1, searchKeyword, selectedRoleId);
  }, [fetchUserRoles, searchKeyword, selectedRoleId]);

  // Xử lý chuyển trang
  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        fetchUserRoles(page, searchKeyword, selectedRoleId);
      }
    },
    [currentPage, totalPages, searchKeyword, selectedRoleId, fetchUserRoles]
  );

  // Hàm thực hiện lại tìm kiếm/lọc trên trang hiện tại
  const handleSearch = useCallback(() => {
    fetchUserRoles(currentPage, searchKeyword, selectedRoleId);
  }, [currentPage, searchKeyword, selectedRoleId, fetchUserRoles]);

  // Hàm xóa tìm kiếm/lọc
  const handleClearSearch = () => {
    setSearchKeyword("");
    setSelectedRoleId(null);
  };

  const toggleFilterVisibility = () => {
    setIsFilterVisible((prevVisibility) => !prevVisibility);
  };

  const currentRole = useMemo(() => {
    return roleOptions.find((opt) => opt.value === selectedRoleId);
  }, [roleOptions, selectedRoleId]);

  const MySwal = withReactContent(Swal);

  const showConfirmationAlert = useCallback(
    (userId, roleId, userName, roleName) => {
      MySwal.fire({
        title: t("common.are_you_sure") || "Bạn có chắc chắn?",
        text:
          t("user.delete_role_confirm", {
            userName,
            roleName,
          }) ||
          `Bạn có chắc muốn xóa vai trò "${roleName}" khỏi người dùng "${userName}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545", 
        confirmButtonText: t("common.yes_delete") || "Có, xóa nó!",
        cancelButtonColor: "#6c757d",
        cancelButtonText: t("common.cancel") || "Hủy bỏ",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const token = localStorage.getItem("userToken"); 

            const response = await axios.delete(API_URL, {
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `${token}`,
              },
              data: {
                user_id: userId,
                role_id: roleId,
              },
            });

            if (response.data.status) {
              MySwal.fire({
                title: t("common.deleted") || "Đã Xóa!",
                text:
                  t("user.deleted_role_success") ||
                  "Vai trò đã được xóa thành công.",
                icon: "success",
                confirmButtonText: t("common.ok") || "OK",
                customClass: {
                  confirmButton: "btn btn-success",
                },
              }); 
              fetchUserRoles(currentPage, searchKeyword, selectedRoleId);
            } else {
              MySwal.fire({
                title: t("common.error") || "Lỗi!",
                text: response.data.msg || "Không thể xóa vai trò.",
                icon: "error",
                confirmButtonText: t("common.ok") || "OK",
              });
            }
          } catch (error) {
            console.error("Error deleting user role:", error);
            MySwal.fire({
              title: t("common.error") || "Lỗi!",
              text:
                t("common.network_error") ||
                "Lỗi kết nối hoặc API không phản hồi.",
              icon: "error",
              confirmButtonText: t("common.ok") || "OK",
            });
          }
        } else {
          MySwal.close();
        }
      });
    },
    [currentPage, fetchUserRoles, searchKeyword, selectedRoleId, t, MySwal]
  );

  // --- Cột hiển thị (columns) ---
  const columns = useMemo(
    () => [
      {
        title: t("common.userName") || "User Name",
        dataIndex: "user_name",
        render: (text, record) => (
          <span className="userimgname">
            <Link to="#" className="userslist-img bg-img">
              <ImageWithBasePath alt="" src={"assets/img/user-default.jpg"} />
            </Link>
            <div>
              <Link to="#">{record.user_name}</Link>
            </div>
          </span>
        ),
        sorter: (a, b) => (a.user_name || "").localeCompare(b.user_name || ""),
      },
      {
        title: t("common.fullName") || "Full Name",
        dataIndex: "full_name",
        sorter: (a, b) => (a.full_name || "").localeCompare(b.full_name || ""),
      },
      {
        title: t("common.role") || "Role",
        dataIndex: "role_name_localized",
        render: (text, record) => getRoleName(record),
        sorter: (a, b) => getRoleName(a).localeCompare(getRoleName(b)),
      },
      {
        title: t("common.slug") || "slug",
        dataIndex: "slug",
        sorter: (a, b) => (a.slug || "").localeCompare(b.slug || ""),
      },
      {
        title: t("common.actions") || "Actions",
        dataIndex: "actions",
        key: "actions",
        render: (_, record) => (
          <td className="action-table-data">
            {" "}
            <div className="edit-delete-action">
              {/* View */}{" "}
              <Link className="me-2 p-2" to="#">
                {" "}
                <i
                  data-feather="eye"
                  className="feather feather-eye action-eye"
                ></i>{" "}
              </Link>
              {" "}
              <Link
                className="confirm-text p-2"
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  const roleNameLocalized = getRoleName(record);
                  showConfirmationAlert(
                    record.user_id,
                    record.role_id,
                    record.user_name,
                    roleNameLocalized
                  );
                }}
              >
                {" "}
                <i data-feather="trash-2" className="feather-trash-2"></i>{" "}
              </Link>{" "}
            </div>{" "}
          </td>
        ),
      },
    ],
    [getRoleName, t, showConfirmationAlert]
  );

  // --- UI Helper Functions --
  const renderRefreshTooltip = (props) => (
    <Tooltip id="refresh-tooltip" {...props}>
      {t("common.refresh") || "Refresh"}
    </Tooltip>
  );
  const renderCollapseTooltip = (props) => (
    <Tooltip id="collapse-tooltip" {...props}>
      {t("common.collapse") || "Collapse"}
    </Tooltip>
  );

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const current = currentPage;
    const total = totalPages;

    if (total <= 1) return null;

    if (total <= maxVisiblePages) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (current > 3) {
        pages.push("...");
      }

      for (
        let i = Math.max(2, current - 1);
        i <= Math.min(total - 1, current + 1);
        i++
      ) {
        if (i !== 1 && i !== total) {
          pages.push(i);
        }
      }

      const uniquePagesTemp = Array.from(
        new Set(pages.filter((p) => p !== "..."))
      );

      if (current < total - 2) {
        if (
          uniquePagesTemp.length > 0 &&
          uniquePagesTemp[uniquePagesTemp.length - 1] < total - 1
        ) {
          pages.push("...");
        }
      }

      // Thêm trang cuối nếu chưa có và total > 1
      if (total > 1 && uniquePagesTemp.indexOf(total) === -1) {
        pages.push(total);
      }
    }

    const uniquePages = Array.from(new Set(pages));

    return (
      <div
        className="dataTables_paginate paging_simple_numbers"
        id="DataTables_Table_0_paginate"
      >
        <ul className="pagination">
          <li
            className={`paginate_button page-item previous ${
              current === 1 ? "disabled" : ""
            }`}
            onClick={() => handlePageChange(current - 1)}
          >
            <Link to="#" className="page-link">
              <FontAwesomeIcon icon={faAngleLeft} />
            </Link>
          </li>
          {uniquePages.map((page, index) => {
            if (page === "...") {
              return (
                <li key={index} className="paginate_button page-item disabled">
                  <Link to="#" className="page-link">
                    ...
                  </Link>
                </li>
              );
            }
            return (
              <li
                key={index}
                className={`paginate_button page-item ${
                  page === current ? "active" : ""
                }`}
                onClick={() => handlePageChange(page)}
              >
                <Link to="#" className="page-link">
                  {page}
                </Link>
              </li>
            );
          })}
          <li
            className={`paginate_button page-item next ${
              current === total ? "disabled" : ""
            }`}
            onClick={() => handlePageChange(current + 1)}
          >
            <Link to="#" className="page-link">
              <FontAwesomeIcon icon={faAngleRight} />
            </Link>
          </li>
        </ul>
      </div>
    );
  };

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>{t("user.title")}</h4>
                <h6>{t("user.subtitle")}</h6>
              </div>
            </div>
            <ul className="table-top-head">
              {/* Nút Refresh */}
              <li>
                <OverlayTrigger placement="top" overlay={renderRefreshTooltip}>
                  <Link onClick={handleSearch}>
                    <RotateCcw />
                  </Link>
                </OverlayTrigger>
              </li>
              {/* Nút Collapse Header */}
              <li>
                <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>
                  <Link
                    id="collapse-header"
                    className={isHeaderCollapsed ? "active" : ""}
                    onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                  >
                    <ChevronUp />
                  </Link>
                </OverlayTrigger>
              </li>
            </ul>
            <div className="page-btn">
              <Link
                to="#"
                className="btn btn-added"
                data-bs-toggle="modal"
                data-bs-target="#add-user"
              >
                <PlusCircle className="me-2" />
                {t("user.add_new") || "Thêm Người dùng mới"}
              </Link>
            </div>
          </div>
          {/* /product list */}
          <div className="card table-list-card">
            <div className="card-body">
              <div className="table-top">
                <div className="search-set">
                  <div className="search-input">
                    <input
                      type="text"
                      placeholder={
                        t("user.search_placeholder") ||
                        "Tìm kiếm User Name, Full Name..."
                      }
                      className="form-control form-control-sm formsearch"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                      }}
                    />
                    <Link
                      to="#"
                      className="btn btn-searchset"
                      onClick={handleSearch}
                    >
                      <i data-feather="search" className="feather-search" />
                    </Link>
                  </div>
                </div>
                <div className="search-path">
                  <Link
                    className={`btn btn-filter ${
                      isFilterVisible ? "setclose" : ""
                    }`}
                    id="filter_search"
                    onClick={toggleFilterVisibility}
                  >
                    <Filter className="filter-icon" />
                    <span onClick={toggleFilterVisibility}>
                      <ImageWithBasePath
                        src="assets/img/icons/closes.svg"
                        alt="img"
                      />
                    </span>
                  </Link>
                </div>
              </div>
              {/* /Filter */}
              <div
                className={`card${isFilterVisible ? " visible" : ""}`}
                id="filter_inputs"
                style={{ display: isFilterVisible ? "block" : "none" }}
              >
                <div className="card-body pb-0">
                  <div className="row">
                    <div className="col-lg-3 col-sm-6 col-12">
                      <div className="input-blocks">
                        <Zap className="info-img" />
                        <Select
                          className="select"
                          options={roleOptions}
                          placeholder={t("user.select_role") || "Chọn Vai trò"}
                          value={currentRole}
                          onChange={(option) => {
                            setSelectedRoleId(option ? option.value : null);
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6 col-12">
                      <div className="input-blocks">
                        <button
                          className="btn btn-danger"
                          onClick={handleClearSearch}
                        >
                          <RotateCcw className="me-2" />
                          {t("user.clear_filter") || "Xóa lọc"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table List */}
              <div className="table-responsive">
                <Table
                  columns={columns}
                  dataSource={data}
                  loading={loading}
                  totalItems={totalItems}
                  errorMessage={error}
                />
              </div>

              {/* Pagination */}
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <div className="dataTables_info">
                  {t("common.showing") || "Showing"}{" "}
                  {(currentPage - 1) * 10 + 1} {t("common.to") || "to"}{" "}
                  {Math.min(currentPage * 10, totalItems)}{" "}
                  {t("common.of") || "of"} {totalItems}{" "}
                  {t("common.entries") || "entries"}
                </div>
                {renderPagination()}
              </div>
            </div>
          </div>
          {/* /product list */}
        </div>
      </div>

      {/* Modals */}
      <AddUsersRoles
        onUserAdded={() => fetchUserRoles(1, searchKeyword, selectedRoleId)}
      />
    </div>
  );
};

export default UsersRoles;
