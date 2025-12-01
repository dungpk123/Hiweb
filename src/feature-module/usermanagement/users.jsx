import React, { useEffect, useState, useCallback } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import { ChevronUp, RotateCcw } from "feather-icons-react/build/IconComponents";
import { setToogleHeader } from "../../core/redux/action";
import { deleteUser } from "../../core/redux/action";
import { useDispatch, useSelector } from "react-redux";
import { PlusCircle, StopCircle, User, Zap } from "react-feather";
import Select from "react-select";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import Table from "../../core/pagination/datatable";
import AddUsers from "../../core/modals/usermanagement/addusers";
import EditUser from "../../core/modals/usermanagement/edituser";
import axios from "axios";
import { useTranslation } from "react-i18next";

const Users = () => {
  const { t } = useTranslation();
  // State management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  // Thêm state để lưu user đang được edit
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // STATE CHO PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);

  // Fetch users
  const API_URL = `${process.env.REACT_APP_API_URL}/user/users`;

  const fetchUsers = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError("");

        // Cập nhật API_URL với tham số phân trang và tìm kiếm
        let apiPath = `${API_URL}?page=${page}&per_page=${itemsPerPage}`;

        const token = localStorage.getItem("userToken");
        const response = await axios.get(apiPath, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `${token}`,
          },
        });

        if (response.data.status && response.data.code === 200) {
          const apiData = response.data;
          const mappedUsers = apiData.data.map((u) => ({
            uuid: u.uuid,
            id: u.id,
            user_name: u.user_name,
            is_active: u.is_active,
            is_verified: u.is_verified,
            first_name: u.first_name,
            last_name: u.last_name,
            full_name: u.full_name,
            email: u.email,
            phone_number: u.phone_number,
            department_id: u.department_id,
            avatar_url: u.avatar_url,
            last_login_at: u.last_login_at,
            deleted_at: u.deleted_at,
            locked_until: u.locked_until,
            "2fa": u["2fa"],
            salary_daily: u.salary_daily,
            salary_monthly: u.salary_monthly,
            created_at: u.created_at,
            updated_at: u.updated_at,
            department_name_vi: u.department_name_vi,
            department_name_en: u.department_name_en,
            block_name_vi: u.block_name_vi,
            block_name_en: u.block_name_en,
            is_manager: u.is_manager,
            roles: u.roles,
          }));

          setUsers(mappedUsers);
          setFilteredUsers(mappedUsers);

          setCurrentPage(apiData.pagination.current_page);
          setTotalPages(apiData.pagination.total_pages);
          setTotalItems(apiData.pagination.total);
        } else {
          setUsers([]);
          setFilteredUsers([]);
          setTotalPages(1);
          setTotalItems(0);
          setError("Không lấy được dữ liệu!");
        }
      } catch (err) {
        setError("Lỗi khi gọi API user!");
        setUsers([]);
        setFilteredUsers([]);
        setTotalPages(1);
        setTotalItems(0);
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [itemsPerPage, API_URL]
  );

  useEffect(() => {
    fetchUsers(currentPage, searchTerm);
  }, [currentPage, fetchUsers, searchTerm]);

  // Search function
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setCurrentPage(1);
    if (term === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.user_name?.toLowerCase().includes(term) ||
          user.full_name?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term) ||
          user.phone_number?.toLowerCase().includes(term) ||
          user.department_name_vi?.toLowerCase().includes(term) ||
          (user.is_active && "active".includes(term)) ||
          (!user.is_active && "inactive".includes(term))
      );
      setFilteredUsers(filtered);
    }
  };
  // Hàm xử lý chuyển trang
  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        setCurrentPage(page);
      }
    },
    [currentPage, totalPages]
  );

  const renderPagination = () => {
    const current = currentPage;
    const total = totalPages;
    const maxPagesToShow = 5;

    if (total <= 1) return null;

    const pages = [];

    if (total <= maxPagesToShow) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, current - 1);
      let end = Math.min(total - 1, current + 1);

      if (current > 3) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== total) {
          pages.push(i);
        }
      }

      let uniquePagesTemp = Array.from(
        new Set(pages.filter((p) => p !== "..."))
      ).sort((a, b) => a - b);

      if (current < total - 2) {
        if (uniquePagesTemp[uniquePagesTemp.length - 1] < total - 1) {
          if (pages[pages.length - 1] !== "...") {
            pages.push("...");
          }
        }
      }

      if (pages[pages.length - 1] !== total) {
        if (pages[pages.length - 1] !== "..." || pages.length === 1) {
          const tempSet = new Set([1]);

          for (
            let i = Math.max(2, current - 1);
            i <= Math.min(total - 1, current + 1);
            i++
          ) {
            tempSet.add(i);
          }

          if (current > 3) {
            finalPages.push("...");
          }

          const middlePages = Array.from(tempSet)
            .filter((p) => p !== 1 && p !== total)
            .sort((a, b) => a - b);

          finalPages.push(...middlePages);

          if (
            current < total - 2 &&
            middlePages.length > 0 &&
            middlePages[middlePages.length - 1] < total - 1
          ) {
            finalPages.push("...");
          }

          finalPages.push(total);
        }
      }
    }
    const finalPages = [];
    const tempSet = new Set();

    tempSet.add(1);

    for (let i = current - 1; i <= current + 1; i++) {
      if (i > 1 && i < total) {
        tempSet.add(i);
      }
    }

    tempSet.add(total);

    const sortedPages = Array.from(tempSet).sort((a, b) => a - b);

    sortedPages.forEach((page, index) => {
      if (index > 0 && page > sortedPages[index - 1] + 1) {
        finalPages.push("...");
      }
      finalPages.push(page);
    });
    return (
      <div
        className="dataTables_paginate paging_simple_numbers"
        id="DataTables_Table_0_paginate"
      >
        <ul className="pagination">
          {/* Previous Button */}
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
          {/* Page Numbers */}
          {finalPages.map((page, index) => {
            if (page === "...") {
              return (
                <li
                  key={`dot-${index}`}
                  className="paginate_button page-item disabled"
                >
                  <Link to="#" className="page-link">
                    ...
                  </Link>
                </li>
              );
            }
            return (
              <li
                key={page}
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
          {/* Next Button */}
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

  // Handle view user detail
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsDetailModalVisible(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsDetailModalVisible(false);
    setSelectedUser(null);
  };

  // Handle put user
  const handleEditUser = (user) => {
    console.log("User data for editing:", user);
    setEditingUser({
      ...user,
      uuid: user.uuid,
    });
    setShowEditModal(true);
  };

  // Hàm đóng modal edit
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
  };

  // Hàm xử lý sau khi update thành công
  const handleUserUpdated = () => {
    fetchUsers();
    handleCloseEditModal();
  };

  // Tooltips
  const renderTooltip = (props) => (
    <Tooltip id="pdf-tooltip" {...props}>
      Pdf
    </Tooltip>
  );
  const renderExcelTooltip = (props) => (
    <Tooltip id="excel-tooltip" {...props}>
      Excel
    </Tooltip>
  );
  const renderPrinterTooltip = (props) => (
    <Tooltip id="printer-tooltip" {...props}>
      Printer
    </Tooltip>
  );
  const renderRefreshTooltip = (props) => (
    <Tooltip id="refresh-tooltip" {...props}>
      Refresh
    </Tooltip>
  );
  const renderCollapseTooltip = (props) => (
    <Tooltip id="refresh-tooltip" {...props}>
      Collapse
    </Tooltip>
  );

  // Columns definition
  const columns = [
    {
      title: `${t('common.userName')}`,
      dataIndex: "user_name",
      sorter: (a, b) => a.user_name?.localeCompare(b.user_name),
    },
    {
      title: `${t('common.fullName')}`,
      dataIndex: "full_name",
      sorter: (a, b) => a.full_name?.localeCompare(b.full_name),
    },
    {
      title: `${t('common.phoneNumber')}`,
      dataIndex: "phone_number",
      sorter: (a, b) => a.phone_number?.localeCompare(b.phone_number),
    },
    {
      title: `${t('common.email')}`,
      dataIndex: "email",
      sorter: (a, b) => a.email?.localeCompare(b.email),
    },
    {
      title: `${t('common.createdAt')}`,
      dataIndex: "created_at",
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      render: (created_at) =>
        created_at ? new Date(created_at).toLocaleDateString() : "-",
    },
    {
      title: `${t('common.department')}`,
      dataIndex: "department_name_vi",
      sorter: (a, b) =>
        a.department_name_vi?.localeCompare(b.department_name_vi),
    },
    {
      title: `${t('common.status')}`,
      dataIndex: "is_active",
      render: (is_active) => (
        <span
          className={`badge ${
            is_active ? "badge-linesuccess" : "badge-linedanger"
          }`}
        >
          {is_active ? "Active" : "Inactive"}
        </span>
      ),
      sorter: (a, b) => a.is_active - b.is_active,
    },
    {
      title: `${t('common.actions')}`,
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <div className="edit-delete-action">
          <Link
            className="me-2 p-2"
            to="#"
            onClick={() => handleViewUser(record)}
          >
            <i
              data-feather="eye"
              className="feather feather-eye action-eye"
            ></i>
          </Link>
          <Link
            className="me-2 p-2"
            to="#"
            data-bs-toggle="modal"
            data-bs-target="#edit-units"
            onClick={() => handleEditUser(record)}
          >
            <i data-feather="edit" className="feather-edit"></i>
          </Link>
          <Link
            className="confirm-text p-2"
            to="#"
            onClick={() => showConfirmationAlert(record.id)}
          >
            <i data-feather="trash-2" className="feather-trash-2"></i>
          </Link>
        </div>
      ),
    },
  ];

  // Delete confirmation
  const MySwal = withReactContent(Swal);
  const showConfirmationAlert = (id) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonColor: "#00ff00",
      confirmButtonText: "Yes, delete it!",
      cancelButtonColor: "#ff0000",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteUser(id));
        MySwal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          className: "btn btn-success",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "btn btn-success",
          },
        }).then(() => {
          fetchUsers(currentPage, searchTerm);
        });
      }
    });
  };

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>{t('user-list.title')}</h4>
                <h6>{t('user-list.subTitle')}</h6>
              </div>
            </div>
            <ul className="table-top-head">
              <li>
                <OverlayTrigger placement="top" overlay={renderTooltip}>
                  <Link to="#">
                    <ImageWithBasePath
                      src="assets/img/icons/pdf.svg"
                      alt="img"
                    />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderExcelTooltip}>
                  <Link to="#" data-bs-toggle="tooltip" data-bs-placement="top">
                    <ImageWithBasePath
                      src="assets/img/icons/excel.svg"
                      alt="img"
                    />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderPrinterTooltip}>
                  <Link to="#" data-bs-toggle="tooltip" data-bs-placement="top">
                    <i data-feather="printer" className="feather-printer" />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderRefreshTooltip}>
                  <Link
                    to="#"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    onClick={fetchUsers}
                  >
                    <RotateCcw />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>
                  <Link
                    to="#"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    id="collapse-header"
                    className={data ? "active" : ""}
                    onClick={() => {
                      dispatch(setToogleHeader(!data));
                    }}
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
                data-bs-target="#add-units"
              >
                <PlusCircle className="me-2" />
                {t('user-list.add_new')}
              </Link>
            </div>
          </div>

          {/* User List Card */}
          <div className="card table-list-card">
            <div className="card-body">
              <div className="table-top">
                <div className="search-set">
                  <div className="search-input">
                    <input
                      type="text"
                      placeholder="Search by name, email, phone, department..."
                      className="form-control form-control-sm formsearch"
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                    <Link to="#" className="btn btn-searchset">
                      <i data-feather="search" className="feather-search" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Filter Section */}
              <div id="filter_inputs">
                <div className="card-body pb-0">
                  <div className="row">
                    <div className="col-lg-3 col-sm-6 col-12">
                      <div className="input-blocks">
                        <User className="info-img" />
                        <Select
                          className="select"
                          options={[]}
                          placeholder="Choose User"
                        />
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6 col-12">
                      <div className="input-blocks">
                        <StopCircle className="info-img" />
                        <Select
                          className="select"
                          options={status}
                          placeholder="Choose Status"
                        />
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6 col-12">
                      <div className="input-blocks">
                        <Zap className="info-img" />
                        <Select className="select" placeholder="Choose Role" />
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6 col-12">
                      <div className="input-blocks">
                        <Link to="#" className="btn btn-filters ms-auto">
                          <i data-feather="search" className="feather-search" />
                          Search
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="table-responsive">
                {loading ? (
                  <p>{t('common.loading')}</p>
                ) : error ? (
                  <p className="text-danger">{error}</p>
                ) : (
                  <>
                    <div className="mb-3">
                      <small className="text-muted">
                        {t("user-list.total", {
                          count: filteredUsers.length,
                          total: totalItems,
                        })}
                        {searchTerm && (
                          <span>
                            {" "}
                            {t('user-list.search_keyword')}&quot;<strong>{searchTerm}</strong>
                            &quot;
                          </span>
                        )}
                      </small>
                    </div>
                    <Table columns={columns} dataSource={filteredUsers} />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* User Detail Modal */}
          {isDetailModalVisible && selectedUser && (
            <div
              className="modal fade show"
              style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{t('user-list.detailUserTitle')}</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={handleCloseModal}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-4 text-center">
                        {selectedUser.avatar_url ? (
                          <img
                            src={selectedUser.avatar_url}
                            alt="Avatar"
                            className="rounded-circle"
                            style={{
                              width: "150px",
                              height: "150px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mx-auto"
                            style={{ width: "150px", height: "150px" }}
                          >
                            <span className="text-white">No Avatar</span>
                          </div>
                        )}
                      </div>
                      <div className="col-md-8">
                        <div className="row mb-3">
                          <div className="col-sm-4">
                            <strong>{t('common.userName')}</strong>
                          </div>
                          <div className="col-sm-8">
                            {selectedUser.user_name}
                          </div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-sm-4">
                            <strong>{t('common.fullName')}</strong>
                          </div>
                          <div className="col-sm-8">
                            {selectedUser.full_name}
                          </div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-sm-4">
                            <strong>{t('common.firstName')}</strong>
                          </div>
                          <div className="col-sm-8">
                            {selectedUser.first_name || "N/A"}
                          </div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-sm-4">
                            <strong>{t('common.lastName')}</strong>
                          </div>
                          <div className="col-sm-8">
                            {selectedUser.last_name || "N/A"}
                          </div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-sm-4">
                            <strong>{t('common.email')}</strong>
                          </div>
                          <div className="col-sm-8">{selectedUser.email}</div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-sm-4">
                            <strong>{t('common.phoneNumber')}</strong>
                          </div>
                          <div className="col-sm-8">
                            {selectedUser.phone_number || "N/A"}
                          </div>
                        </div>

                        {/* Department & Block Information */}
                        <div className="row mb-3">
                          <div className="col-sm-4">
                            <strong>{t('common.department')} (VI):</strong>
                          </div>
                          <div className="col-sm-8">
                            {selectedUser.department_name_vi || "N/A"}
                          </div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-sm-4">
                            <strong>{t('common.department')} (EN):</strong>
                          </div>
                          <div className="col-sm-8">
                            {selectedUser.department_name_en || "N/A"}
                          </div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-sm-4">
                            <strong>{t('user-list.block')} (VI):</strong>
                          </div>
                          <div className="col-sm-8">
                            {selectedUser.block_name_vi || "N/A"}
                          </div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-sm-4">
                            <strong>{t('user-list.block')} (EN):</strong>
                          </div>
                          <div className="col-sm-8">
                            {selectedUser.block_name_en || "N/A"}
                          </div>
                        </div>

                        {/* Status Information */}
                        <div className="row mb-3">
                          <div className="col-sm-4">
                            <strong>{t('common.status')}</strong>
                          </div>
                          <div className="col-sm-8">
                            <span
                              className={`badge ${
                                selectedUser.is_active
                                  ? "badge-linesuccess"
                                  : "badge-linedanger"
                              }`}
                            >
                              {selectedUser.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-sm-4">
                            <strong>{t('common.verified')}:</strong>
                          </div>
                          <div className="col-sm-8">
                            <span
                              className={`badge ${
                                selectedUser.is_verified
                                  ? "badge-linesuccess"
                                  : "badge-linedanger"
                              }`}
                            >
                              {selectedUser.is_verified
                                ? "Verified"
                                : "Not Verified"}
                            </span>
                          </div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-sm-4">
                            <strong>2FA:</strong>
                          </div>
                          <div className="col-sm-8">
                            <span
                              className={`badge ${
                                selectedUser["2fa"]
                                  ? "badge-linesuccess"
                                  : "badge-linedanger"
                              }`}
                            >
                              {selectedUser["2fa"] ? "Enabled" : "Disabled"}
                            </span>
                          </div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-sm-4">
                            <strong>{t('common.manager')}</strong>
                          </div>
                          <div className="col-sm-8">
                            <span
                              className={`badge ${
                                selectedUser.is_manager
                                  ? "badge-linesuccess"
                                  : "badge-linedanger"
                              }`}
                            >
                              {selectedUser.is_manager ? "Yes" : "No"}
                            </span>
                          </div>
                        </div>

                        {/* Salary Information */}
                        <div className="row mb-3">
                          <div className="col-sm-4">
                            <strong>{t('user-list.dailySalary')}</strong>
                          </div>
                          <div className="col-sm-8">
                            {selectedUser.salary_daily
                              ? `$${parseFloat(
                                  selectedUser.salary_daily
                                ).toLocaleString()}`
                              : "N/A"}
                          </div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-sm-4">
                            <strong>{t('user-list.monthlySalary')}</strong>
                          </div>
                          <div className="col-sm-8">
                            {selectedUser.salary_monthly
                              ? `$${parseFloat(
                                  selectedUser.salary_monthly
                                ).toLocaleString()}`
                              : "N/A"}
                          </div>
                        </div>

                        {/* Timestamps */}
                        <div className="row mb-3">
                          <div className="col-sm-4">
                            <strong>{t('common.createdAt')}</strong>
                          </div>
                          <div className="col-sm-8">
                            {selectedUser.created_at
                              ? new Date(
                                  selectedUser.created_at
                                ).toLocaleString()
                              : "N/A"}
                          </div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-sm-4">
                            <strong>{t('common.updatedAt')}</strong>
                          </div>
                          <div className="col-sm-8">
                            {selectedUser.updated_at
                              ? new Date(
                                  selectedUser.updated_at
                                ).toLocaleString()
                              : "N/A"}
                          </div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-sm-4">
                            <strong>{t('user-list.lastLogin')}</strong>
                          </div>
                          <div className="col-sm-8">
                            {selectedUser.last_login_at
                              ? new Date(
                                  selectedUser.last_login_at
                                ).toLocaleString()
                              : "Never"}
                          </div>
                        </div>

                        {/* Additional Status */}
                        {selectedUser.deleted_at && (
                          <div className="row mb-3">
                            <div className="col-sm-4">
                              <strong>Deleted At:</strong>
                            </div>
                            <div className="col-sm-8">
                              {new Date(
                                selectedUser.deleted_at
                              ).toLocaleString()}
                            </div>
                          </div>
                        )}
                        {selectedUser.locked_until && (
                          <div className="row mb-3">
                            <div className="col-sm-4">
                              <strong>Locked Until:</strong>
                            </div>
                            <div className="col-sm-8">
                              {new Date(
                                selectedUser.locked_until
                              ).toLocaleString()}
                            </div>
                          </div>
                        )}
                        <div className="row mb-3">
                          <div className="col-sm-4">
                            <strong>{t('common.roles')}</strong>
                          </div>
                          <div className="col-sm-8">
                            {selectedUser.roles.details ? (
                              <span>
                                {selectedUser.roles.details
                                  .map((role) => role.name_en)
                                  .join(", ")}
                              </span>
                            ) : (
                              "N/A"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseModal}
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {renderPagination()}
      </div>
      <AddUsers />
      <EditUser
        userData={editingUser}
        show={showEditModal}
        onClose={handleCloseEditModal}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
};

export default Users;
