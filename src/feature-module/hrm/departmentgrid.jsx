import React, { useState, useEffect, useCallback } from "react";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import { Link } from "react-router-dom/dist";
import { useTranslation } from "react-i18next";
import { all_routes } from "../../Router/all_routes";
import {
  Edit,
  Filter,
  Grid,
  List,
  MoreVertical,
  PlusCircle,
  RotateCcw,
  Trash2,
  Users,
  Star,
} from "feather-icons-react/build/IconComponents";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Swal from "sweetalert2";
import Select from "react-select";
import { ChevronUp } from "react-feather";
import { useDispatch, useSelector } from "react-redux";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import withReactContent from "sweetalert2-react-content";

import AddDepartment from "../../core/modals/hrm/adddepartment";
import EditDepartment from "../../core/modals/hrm/editdepartmentlist";
import { setToogleHeader } from "../../core/redux/action";

const API_URL = `${import.meta.env.VITE_API_URL}/department/departments`;

const DepartmentGrid = () => {
  const route = all_routes;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);
  const [totalDepartmentsCount, setTotalDepartmentsCount] = useState(0);

  const currentLang = localStorage.getItem("i18nextLng");

  const [departmentToEdit, setDepartmentToEdit] = useState(null);

  // State cho lọc và tìm kiếm
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [allDepartments, setAllDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState(null);

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const MySwal = withReactContent(Swal);

  const toggleFilterVisibility = () => {
    setIsFilterVisible((prevVisibility) => !prevVisibility);
  };

  // Dữ liệu giả định cho Level
  const levelList = [
    { value: "0", label: "Level 0" },
    { value: "1", label: "Level 1" },
    { value: "2", label: "Level 2" },
  ];

  // Hàm để lấy tên phòng ban theo ngôn ngữ
  const getDepartmentName = useCallback(
    (department) => {
      if (currentLang === "en") {
        return department.name_en || department.name_vi;
      }
      return department.name_vi || department.name_en;
    },
    [currentLang]
  );

  const handleEditClick = (record) => {
    const fullData = allDepartments.find((dept) => dept.id === record.id);

    if (fullData) {
      setDepartmentToEdit(fullData);
    } else {
      console.error("Không tìm thấy dữ liệu gốc để chỉnh sửa:", record);
      setDepartmentToEdit(null);
    }
  };

  const fetchDepartments = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("userToken");
        const apiPath = `${API_URL}?page=${page}`;
        const response = await axios.get(apiPath, {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        });
        const result = response.data;

        if (result.status && result.data) {
          // Lưu trữ cả dữ liệu gốc để tiện cho việc lọc Client-Side
          setAllDepartments(result.data);
          setTotalDepartmentsCount(result.pagination.total || 0);
          setCurrentPage(result.pagination.current_page || 1);
          setTotalPages(result.pagination.total_pages || 1);
        } else {
          setError(
            result.msg ||
              t("department.fetch_error") ||
              "Lỗi khi tải dữ liệu phòng ban."
          );
        }
      } catch (err) {
        setError(err.response?.data?.msg || err.message || "Lỗi kết nối API.");
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  // Hàm xử lý logic lọc
  const filteredDepartments = allDepartments
    .filter((dept) => {
      // 1. Lọc theo Level
      if (
        selectedLevel &&
        selectedLevel.value !== "all" &&
        String(dept.level) !== selectedLevel.value
      ) {
        return false;
      }

      // 2. Lọc theo Tên/Slug (Search Term)
      if (searchTerm.trim() === "") {
        return true;
      }

      const lowerSearchTerm = searchTerm.toLowerCase().trim();
      const nameVi = (dept.name_vi || "").toLowerCase();
      const nameEn = (dept.name_en || "").toLowerCase();
      const slug = (dept.slug || "").toLowerCase();

      return (
        nameVi.includes(lowerSearchTerm) ||
        nameEn.includes(lowerSearchTerm) ||
        slug.includes(lowerSearchTerm)
      );
    })
    .map((dept) => ({
      id: dept.id,
      slug: dept.slug,
      name: getDepartmentName(dept),
      level: dept.level,
      createdAt: dept.created_at,
      updatedAt: dept.updated_at,
      parentName:
        currentLang === "en"
          ? dept.parent_name_en || "N/A"
          : dept.parent_name_vi || "N/A",
    }));

  // Hàm gọi API xóa (Giữ nguyên)
  const deleteDepartment = async (id) => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.delete(API_URL, {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
        data: { id: id },
      });

      const result = response.data;
      if (result.status) {
        await fetchDepartments();
        MySwal.fire({
          title: t("common.deleted") || "Deleted!",
          text:
            t("common.deleted_success") ||
            "Department has been deleted successfully.",
          icon: "success",
          confirmButtonText: t("common.ok") || "OK",
          customClass: { confirmButton: "btn btn-success" },
        });
      } else {
        MySwal.fire({
          title: t("common.delete_failed") || "Delete failed.",
          text:
            result.msg ||
            t("common.delete_api_error") ||
            "An error occurred during deletion.",
          icon: "error",
          confirmButtonText: t("common.ok") || "OK",
        });
      }
    } catch (err) {
      console.error("Delete API error:", err);
      MySwal.fire({
        title: t("common.delete_failed") || "Delete failed.",
        text: t("common.err.connection") || "Could not connect to the server.",
        icon: "error",
        confirmButtonText: t("common.ok") || "OK",
      });
    }
  };

  // Cấu hình i18n cho SweetAlert2
  const showConfirmationAlert = (id) => {
    MySwal.fire({
      title: t("common.are_you_sure") || "Are you sure?",
      text: t("common.cant_revert") || "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonColor: "#00ff00",
      confirmButtonText: t("common.yes_delete") || "Yes, delete it!",
      cancelButtonColor: "#ff0000",
      cancelButtonText: t("common.cancel") || "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteDepartment(id);
      } else {
        MySwal.close();
      }
    });
  };

  const handleDepartmentUpdated = () => {
    fetchDepartments();

    MySwal.fire({
      title: t("common.updated") || "Updated!",
      text:
        t("common.updated_success") ||
        "Department has been updated successfully.",
      icon: "success",
      confirmButtonText: t("common.ok") || "OK",
      customClass: {
        confirmButton: "btn btn-success",
      },
    });
  };

  // Hàm xử lý khi click vào trang
  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages && page !== currentPage) {
      fetchDepartments(page);
    }
  };

  // Hàm render các nút phân trang theo logic 1, 2, 3, ..., n-1, n
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const current = currentPage;
    const total = totalPages;
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
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push("...");
      }

      if (total > 1) {
        pages.push(total);
      }
    }
    return (
      <div
        className="dataTables_paginate paging_simple_numbers"
        id="DataTables_Table_0_paginate"
      >
        {" "}
        <ul className="pagination">
          {" "}
          <li
            className={`paginate_button page-item previous ${
              current === 1 ? "disabled" : ""
            }`}
            onClick={() => handlePageChange(current - 1)}
          >
            {" "}
            <Link to="#" className="page-link">
              <FontAwesomeIcon icon={faAngleLeft} />
            </Link>{" "}
          </li>{" "}
          {pages.map((page, index) => {
            if (page === "...") {
              return (
                <li key={index} className="paginate_button page-item disabled">
                  {" "}
                  <Link to="#" className="page-link">
                    ...{" "}
                  </Link>{" "}
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
                {" "}
                <Link to="#" className="page-link">
                  {page}{" "}
                </Link>{" "}
              </li>
            );
          })}{" "}
          <li
            className={`paginate_button page-item next ${
              current === total ? "disabled" : ""
            }`}
            onClick={() => handlePageChange(current + 1)}
          >
            {" "}
            <Link to="#" className="page-link">
              <FontAwesomeIcon icon={faAngleRight} />
            </Link>{" "}
          </li>{" "}
        </ul>{" "}
      </div>
    );
  };

  const handleCloseEditModal = () => {
    setDepartmentToEdit(null);

    const closeButton = document.querySelector(
      '#edit-department .close[data-bs-dismiss="modal"]'
    );
    if (closeButton) {
      closeButton.click();
    }
  };

  // Dùng useEffect để load lần đầu
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const filterLevelList = [
    { value: "all", label: t("common.allLevels") || "All Levels" },
    ...levelList,
  ];

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

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>{t("department.title")}</h4>
                <h6>{t("department.description")}</h6>
              </div>
            </div>
            <ul className="table-top-head">
              <li>
                <OverlayTrigger placement="top" overlay={renderTooltip}>
                  <Link>
                    <ImageWithBasePath
                      src="assets/img/icons/pdf.svg"
                      alt="img"
                    />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderExcelTooltip}>
                  <Link data-bs-toggle="tooltip" data-bs-placement="top">
                    <ImageWithBasePath
                      src="assets/img/icons/excel.svg"
                      alt="img"
                    />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderPrinterTooltip}>
                  <Link data-bs-toggle="tooltip" data-bs-placement="top">
                    <i data-feather="printer" className="feather-printer" />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderRefreshTooltip}>
                  <Link
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    onClick={fetchDepartments}
                  >
                    <RotateCcw />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>
                  <Link
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    id="collapse-header"
                    className={data ? "active" : ""}
                    onClick={() => dispatch(setToogleHeader(!data))}
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
                data-bs-target="#add-department"
              >
                <PlusCircle className="me-2" />
                {t("department.addNewDepartment")}
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-body pb-0">
              <div className="table-top table-top-new">
                <div className="search-set mb-0">
                  <div className="total-employees">
                    <h6>
                      <Users />
                      {t("department.total")}{" "}
                      <span>{totalDepartmentsCount}</span>
                    </h6>
                  </div>
                  <div className="search-input">
                    <Link to="#" className="btn btn-searchset">
                      <i data-feather="search" className="feather-search" />
                    </Link>
                    <input
                      type="search"
                      className="form-control"
                      placeholder={t("department.inputSearchPlaceholder")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="search-path d-flex align-items-center search-path-new">
                  <div className="d-flex">
                    <Link className="btn btn-filter" id="filter_search">
                      <Filter
                        className="filter-icon"
                        onClick={toggleFilterVisibility}
                      />
                      <span>
                        <ImageWithBasePath
                          src="assets/img/icons/closes.svg"
                          alt="img"
                        />
                      </span>
                    </Link>
                    <Link to={route.departmentlist} className="btn-list">
                      <List />
                    </Link>
                    <Link to={route.departmentgrid} className="btn-grid active">
                      <Grid />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Bộ lọc chi tiết */}
              <div
                className={`card${isFilterVisible ? " visible" : ""}`}
                id="filter_inputs"
                style={{ display: isFilterVisible ? "block" : "none" }}
              >
                <div className="card-body pb-0">
                  <div className="row">
                    <div className="col-lg-3 col-sm-6 col-12">
                      <div className="input-blocks">
                        <Star className="info-img" />
                        <Select
                          className="select"
                          options={filterLevelList}
                          placeholder={t("department.level")}
                          value={selectedLevel}
                          onChange={(selectedOption) =>
                            setSelectedLevel(selectedOption)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center mt-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">{t("common.loading")}</span>
              </div>
              <p className="mt-2">{t("department.loading")}</p>
            </div>
          )}

          {!loading && error && (
            <div className="alert alert-danger text-center mt-5" role="alert">
              {t("common.error.title")} :{" "}
              {error || t("common.error.connection")}
            </div>
          )}

          {!loading && !error && filteredDepartments.length > 0 && (
            <div className="employee-grid-widget">
              <div className="row employee-grid-container">
                {filteredDepartments.map((dept) => (
                  <div
                    className="col-xxl-3 col-xl-4 col-lg-6 col-md-6 mb-4"
                    key={dept.id}
                  >
                    <div className="employee-grid-profile">
                      <div className="profile-head">
                        <div className="dep-name">
                          <h5 className="active">{dept.name}</h5>
                        </div>
                        <div className="profile-head-action">
                          <div className="dropdown profile-action">
                            <Link
                              to="#"
                              className="action-icon dropdown-toggle"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              <MoreVertical />
                            </Link>
                            <ul className="dropdown-menu">
                              <li>
                                <Link
                                  to="#"
                                  className="dropdown-item"
                                  data-bs-toggle="modal"
                                  data-bs-target="#edit-department"
                                  onClick={() => handleEditClick(dept)}
                                >
                                  <Edit className="info-img" />{" "}
                                  {t("common.edit") || "Edit"}
                                </Link>
                              </li>
                              <li>
                                <Link
                                  to="#"
                                  className="dropdown-item confirm-text mb-0"
                                  onClick={() => showConfirmationAlert(dept.id)}
                                >
                                  <Trash2 className="info-img" />{" "}
                                  {t("common.delete") || "Delete"}
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="profile-info department-profile-info">
                        <div className="department-details">
                          <p>
                            <strong>{t("department.slug")}:</strong> {dept.slug}
                            <br />
                            <strong>{t("department.level")}:</strong>{" "}
                            {dept.level}
                            <br />
                            <strong>{t("department.createdAt")}:</strong>{" "}
                            {new Date(dept.createdAt).toLocaleDateString()}
                            <br />
                            <strong>{t("department.updatedAt")}:</strong>{" "}
                            {new Date(dept.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        {dept.parentName && dept.parentName !== "N/A" && (
                          <div className="mt-2">
                            <strong>{t("department.parentDepartment")}:</strong>{" "}
                            {dept.parentName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && !error && totalPages > 1 && (
            <div className="card-footer">
              {" "}
              <div className="row">
                {" "}
                <div className="col-lg-12">{renderPagination()} </div>{" "}
              </div>{" "}
            </div>
          )}

          {!loading && !error && filteredDepartments.length === 0 && (
            <div className="text-center mt-5">
              <p>
                {t("department.noDepartmentsFound") ||
                  "Không tìm thấy phòng ban nào."}
              </p>
            </div>
          )}
        </div>
      </div>
      <AddDepartment onDepartmentAdded={fetchDepartments} />
      <EditDepartment
        initialData={departmentToEdit}
        onUpdate={handleDepartmentUpdated}
        onCloseModal={handleCloseEditModal}
      />
    </div>
  );
};

export default DepartmentGrid;
