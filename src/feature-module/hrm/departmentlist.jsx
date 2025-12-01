import React, { useState, useEffect, useCallback } from "react";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import { Link } from "react-router-dom/dist";
import {
  ChevronUp,
  Filter,
  Grid,
  List,
  PlusCircle,
  RotateCcw,
  Users,
  Star,
} from "feather-icons-react/build/IconComponents";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import { all_routes } from "../../Router/all_routes";
import { useSelector, useDispatch } from "react-redux";
import Table from "../../core/pagination/datatable";
import AddDepartmentList from "../../core/modals/hrm/adddepartmentlist";
import EditDepartmentList from "../../core/modals/hrm/editdepartmentlist";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { setToogleHeader } from "../../core/redux/action";

const API_URL = `${process.env.REACT_APP_API_URL}/department/departments`;

const DepartmentList = () => {
  const route = all_routes;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);
  const currentLang = localStorage.getItem("i18nextLng");
  const MySwal = withReactContent(Swal);
  const [totalDepartmentsCount, setTotalDepartmentsCount] = useState(0);

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

  const toggleFilterVisibility = () => {
    setIsFilterVisible((prevVisibility) => !prevVisibility);
  };

  const levelList = [
    { value: "0", label: "Level 0" },
    { value: "1", label: "Level 1" },
    { value: "2", label: "Level 2" },
  ];

  const filterLevelList = [
    { value: "all", label: t("common.allLevels") || "All Levels" },
    ...levelList,
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

  // Logic gọi API lấy danh sách
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

  // Logic gọi API xóa
  const deleteDepartment = async (id) => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.delete(API_URL, {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
        data: {
          id: id,
        },
      });

      const result = response.data;
      if (result.status) {
        // Cập nhật lại danh sách phòng ban sau khi xóa thành công
        await fetchDepartments();
        MySwal.fire({
          title: t("common.deleted") || "Deleted!",
          text:
            t("common.deleted_success") ||
            "Department has been deleted successfully.",
          icon: "success",
          confirmButtonText: t("common.ok") || "OK",
          customClass: {
            confirmButton: "btn btn-success",
          },
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
        text:
          t("common.delete_connection_error") ||
          "Could not connect to the server.",
        icon: "error",
        confirmButtonText: t("common.ok") || "OK",
      });
    }
  };

  // Cấu hình i18n cho SweetAlert2 và gọi hàm xóa
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
    fetchDepartments(1);
  }, [fetchDepartments]);

  // Logic lọc dữ liệu
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

  // Cột được cập nhật
  const columns = [
    {
      title: t("department.title") || "Department Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: t("department.slug"),
      dataIndex: "slug",
      sorter: (a, b) => a.slug.localeCompare(b.slug),
    },
    {
      title: t("department.level"),
      dataIndex: "level",
      sorter: (a, b) => a.level - b.level,
    },
    {
      title: t("department.parentDepartment"),
      dataIndex: "parentName",
      sorter: (a, b) => a.parentName.localeCompare(b.parentName),
    },
    {
      title: t("department.createdAt"),
      dataIndex: "createdAt",
      render: (text) => new Date(text).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: t("department.updatedAt"),
      dataIndex: "updatedAt",
      render: (text) => new Date(text).toLocaleDateString(),
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
    },
    {
      title: t("common.actions") || "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (text, record) => (
        <td className="action-table-data">
          <div className="edit-delete-action">
            <Link
              className="me-2 p-2"
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#edit-department"
              onClick={() => handleEditClick(record)}
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
        </td>
      ),
    },
  ];

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
          {/* /product list */}
          <div className="card table-list-card">
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
                    <Link to={route.departmentlist} className="btn-list active">
                      <List />
                    </Link>
                    <Link to={route.departmentgrid} className="btn-grid">
                      <Grid />
                    </Link>
                  </div>
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
              {/* /Filter */}
              {loading && (
                <div className="text-center mt-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">
                      {t("common.loading")}
                    </span>
                  </div>
                  <p className="mt-2">{t("department.loading")}</p>
                </div>
              )}

              {!loading && error && (
                <div
                  className="alert alert-danger text-center mt-5"
                  role="alert"
                >
                  {t("common.error.title")} : {error}
                </div>
              )}

              {!loading && !error && filteredDepartments.length > 0 && (
                <div className="table-responsive">
                  <Table columns={columns} dataSource={filteredDepartments} />
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
                  <p>{t("department.noParent")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <AddDepartmentList onDepartmentAdded={fetchDepartments} />
      <EditDepartmentList
        initialData={departmentToEdit}
        onUpdate={handleDepartmentUpdated}
        onCloseModal={handleCloseEditModal}
      />
    </div>
  );
};

export default DepartmentList;
