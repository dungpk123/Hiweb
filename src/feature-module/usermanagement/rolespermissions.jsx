import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import { Link } from "react-router-dom";
import {
  ChevronUp,
  RotateCcw,
  PlusCircle,
} from "feather-icons-react/build/IconComponents";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { setToogleHeader } from "../../core/redux/action";
import { Filter } from "react-feather";
import Select from "react-select";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import Table from "../../core/pagination/datatable";
import AddRole from "../../core/modals/usermanagement/addrole";
import EditRole from "../../core/modals/usermanagement/editrole";
import moment from "moment";

import { useTranslation } from "react-i18next";

const API_URL = `${import.meta.env.VITE_API_URL}/role/roles`;

const RolesPermissions = () => {
  const { t, i18n } = useTranslation();
  const data = useSelector((state) => state.toggle_header);
  const dispatch = useDispatch();
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // State cho roles (dữ liệu đang hiển thị)
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State cho role đang chọn để edit
  const [selectedRole, setSelectedRole] = useState(null);

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotalRolesCount] = useState(0);

  // State cho search
  const [searchQuery, setSearchQuery] = useState("");

  // Options for filter combobox (loaded from API)
  const [roleOptions, setRoleOptions] = useState([]);
  const [selectedFilterRole, setSelectedFilterRole] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isFiltering, setIsFiltering] = useState(false);

  // --- Hàm Lấy TẤT CẢ Roles cho Filter/Search ---
  const fetchAllRolesData = useCallback(async () => {
    try {
      const token = localStorage.getItem("userToken");
      const firstResp = await axios.get(`${API_URL}?page=1`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `${token}`,
        },
      });

      const firstResult = firstResp.data;
      let allRaw = [];
      if (firstResult && firstResult.status && firstResult.code === 200) {
        allRaw = [...firstResult.data];
        const totalPagesApi = firstResult.pagination
          ? firstResult.pagination.total_pages || 1
          : 1;

        if (totalPagesApi > 1) {
          const requests = [];
          for (let p = 2; p <= totalPagesApi; p++) {
            requests.push(
              axios.get(`${API_URL}?page=${p}`, {
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                  Authorization: `${token}`,
                },
              })
            );
          }
          const responses = await Promise.all(requests);
          responses.forEach((r) => {
            if (r && r.data && r.data.status && r.data.code === 200) {
              allRaw = allRaw.concat(r.data.data);
            }
          });
        }
      }

      // Map roles
      const mappedRoles = allRaw.map((r) => ({
        key: r.id,
        id: r.id,
        slug: r.slug,
        name_vi: r.name_vi,
        name_en: r.name_en,
        rolename:
          i18n && i18n.language === "vi"
            ? r.name_vi || r.name_en || r.slug
            : r.name_en || r.name_vi || r.slug,
        createdon: r.created_at,
        updatedon: r.updated_at,
      }));

      // Map options for filter
      const options = allRaw.map((r) => {
        const label =
          i18n && i18n.language === "vi"
            ? r.name_vi || r.name_en || r.slug
            : r.name_en || r.name_vi || r.slug;
        return { value: r.id, label };
      });

      const seen = new Set();
      const uniqueOptions = [];
      options.forEach((o) => {
        if (!seen.has(o.value)) {
          seen.add(o.value);
          uniqueOptions.push(o);
        }
      });
      // Thêm tùy chọn 'All'
      const withAllOption = [
        { value: null, label: t("common.all") || "All" },
        ...uniqueOptions,
      ];
      setRoleOptions(withAllOption);

      return mappedRoles;
    } catch (err) {
      console.error("Lỗi khi lấy TẤT CẢ roles:", err);
      return [];
    }
  }, [i18n, t]);

  // --- Hàm Lấy Roles Phân Trang  ---
  const fetchRoles = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("userToken");
        const apiPath = `${API_URL}?page=${page}`;

        const response = await axios.get(apiPath, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `${token}`,
          },
        });

        const result = response.data;
        if (result.status && result.code === 200) {
          const mappedRoles = result.data.map((r) => ({
            key: r.id,
            id: r.id,
            slug: r.slug,
            name_vi: r.name_vi,
            name_en: r.name_en,
            rolename:
              i18n && i18n.language === "vi"
                ? r.name_vi || r.name_en || r.slug
                : r.name_en || r.name_vi || r.slug,
            createdon: r.created_at,
            updatedon: r.updated_at,
          }));
          setRoles(mappedRoles);

          // Cập nhật thông tin phân trang
          if (result.pagination) {
            setTotalRolesCount(result.pagination.total || 0);
            setCurrentPage(result.pagination.current_page || 1);
            setTotalPages(result.pagination.total_pages || 1);
          } else {
            setTotalRolesCount(mappedRoles.length);
            setCurrentPage(1);
            setTotalPages(1);
          }
        } else {
          setError(t("roles-permissions.fetchError"));
        }
      } catch (err) {
        setError(t("roles-permissions.apiError"));
      } finally {
        setLoading(false);
      }
    },
    [i18n, t]
  );

  // --- Hàm Áp dụng Filter và Search  ---
  const applyFiltersAndSearch = useCallback(async () => {
    const isFilterActive =
      (searchQuery && searchQuery.trim()) ||
      selectedFilterRole != null ||
      selectedDate != null;

    if (!isFilterActive) {
      fetchRoles(1);
      setIsFiltering(false);
      return;
    }

    setIsFiltering(true);
    setError("");

    try {
      //  Lấy tất cả dữ liệu để lọc/tìm kiếm local
      const allRoles = await fetchAllRolesData();

      const q = (searchQuery || "").trim().toLowerCase();
      const filterRoleId =
        selectedFilterRole != null ? Number(selectedFilterRole) : null;

      // Áp dụng filter
      const filtered = allRoles.filter((item) => {
        let ok = true;

        // Filter theo Role ID (chọn từ dropdown)
        if (filterRoleId != null) {
          ok = ok && Number(item.id) === filterRoleId;
        }

        // Filter theo ngày tạo
        if (selectedDate) {
          try {
            const dateStr = moment(selectedDate).format("YYYY-MM-DD");
            const itemDateStr = moment(item.createdon).format("YYYY-MM-DD");
            ok = ok && itemDateStr === dateStr;
          } catch (e) {
            console.error("Lỗi parse ngày:", e);
          }
        }

        if (!ok) return false;

        if (q) {
          const isMatch =
            (item.slug && item.slug.toLowerCase().includes(q)) ||
            (item.name_en && item.name_en.toLowerCase().includes(q)) ||
            (item.name_vi && item.name_vi.toLowerCase().includes(q)) ||
            (item.rolename && item.rolename.toLowerCase().includes(q));

          return isMatch;
        }

        return ok;
      });

      setRoles(filtered);
      setTotalRolesCount(filtered.length);
      setCurrentPage(1);
      setTotalPages(1);
    } catch (err) {
      console.error("Lỗi khi áp dụng filter/search:", err);
      setError(t("common.error.title"));
    } finally {
      setIsFiltering(false);
    }
  }, [searchQuery, selectedFilterRole, selectedDate, fetchAllRolesData, t]);

  const handleFilterRoleChange = (option) => {
    setSelectedFilterRole(
      option && option.value !== null ? option.value : null
    );
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleFilterVisibility = () => {
    const opening = !isFilterVisible;
    setIsFilterVisible(opening);
    if (opening) {
      if (roleOptions.length <= 1) {
        fetchAllRolesData();
      }
    } else {
      setSelectedFilterRole(null);
      setSelectedDate(null);
    }
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages && page !== currentPage) {
      fetchRoles(page);
    }
  };

  // Fetch roles khi component mount lần đầu
  useEffect(() => {
    fetchRoles(1);
  }, [fetchRoles]);

  //Trigger auto-search/filter khi có thay đổi
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      applyFiltersAndSearch();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedFilterRole, selectedDate, applyFiltersAndSearch]);

  //  Fetch all roles options khi mở filter lần đầu
  useEffect(() => {
    if (isFilterVisible && roleOptions.length <= 1) {
      fetchAllRolesData();
    }
  }, [isFilterVisible, fetchAllRolesData, roleOptions.length]);

  const renderPagination = () => {
    if (searchQuery || selectedFilterRole != null || selectedDate != null) {
      return null;
    }

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
        if (i !== 1 && i !== total) {
          pages.push(i);
        }
      }

      if (current < total - 2) {
        pages.push("...");
      }

      if (total > 1 && pages[pages.length - 1] !== total) {
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

  const columns = [
    {
      title: t("roles-permissions.slug"),
      dataIndex: "slug",
      sorter: (a, b) => (a.slug || "").localeCompare(b.slug || ""),
    },
    {
      title: t("roles-permissions.rolesName"),
      dataIndex: "rolename",
      sorter: (a, b) => {
        const aName =
          i18n && i18n.language === "vi"
            ? a.name_vi || a.name_en || a.slug
            : a.name_en || a.name_vi || a.slug;
        const bName =
          i18n && i18n.language === "vi"
            ? b.name_vi || b.name_en || b.slug
            : b.name_en || b.name_vi || b.slug;
        return (aName || "").localeCompare(bName || "");
      },
      render: (text, record) => {
        return i18n && i18n.language === "vi"
          ? record.name_vi || record.name_en || record.slug
          : record.name_en || record.name_vi || record.slug;
      },
    },
    {
      title: t("roles-permissions.createRole"),
      dataIndex: "createdon",
      sorter: (a, b) => new Date(b.createdon) - new Date(a.createdon),
      render: (text) => moment(text).format("YYYY-MM-DD HH:mm"), // Format ngày tháng
    },
    {
      title: t("roles-permissions.updateRoleDate"),
      dataIndex: "updatedon",
      sorter: (a, b) => new Date(b.updatedon) - new Date(a.updatedon),
      render: (text) => moment(text).format("YYYY-MM-DD HH:mm"), // Format ngày tháng
    },
    {
      title: t("roles-permissions.actions"),
      dataIndex: "actions",
      key: "actions",

      render: (_, record) => (
        <div className="edit-delete-action">
          <Link
            className="me-2 p-2"
            to="#"
            data-bs-toggle="modal"
            data-bs-target="#edit-units"
            onClick={() => setSelectedRole(record)}
          >
            <i data-feather="edit" className="feather-edit"></i>
          </Link>
          <Link className="confirm-text p-2" to="#">
            <i
              data-feather="trash-2"
              className="feather-trash-2"
              onClick={() => showConfirmationAlert(record.id)}
            ></i>
          </Link>
        </div>
      ),
    },
  ];

  const MySwal = withReactContent(Swal);

  const showConfirmationAlert = (id) => {
    MySwal.fire({
      title: `${t("common.are_you_sure")}`,
      text: `${t("common.cant_revert")}`,
      showCancelButton: true,
      confirmButtonColor: "#00ff00",
      confirmButtonText: `${t("common.yes_delete")}`,
      cancelButtonColor: "#ff0000",
      cancelButtonText: `${t("common.cancel")}`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("userToken");
          const requestBody = { id };

          await axios.delete(API_URL, {
            headers: {
              Authorization: `${token}`,
            },
            data: requestBody,
          });

          await applyFiltersAndSearch(); // Refresh list after delete

          MySwal.fire({
            title: `${t("common.deleted")}`,
            text: `${t("common.deleted_success")}`,
            icon: "success",
            confirmButtonText: `${t("common.ok")}`,
          });
        } catch (error) {
          console.error("Lỗi khi xóa:", error);
          MySwal.fire({
            title: `${t("common.error.title")}`,
            text: `${t("common.error.title")}`,
            icon: "error",
            confirmButtonText: `${t("common.ok")}`,
          });
        }
      } else {
        MySwal.close();
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
                <h4>{t("roles-permissions.title")}</h4>
                <h6>{t("roles-permissions.subTitle")}</h6>
              </div>
            </div>
            <ul className="table-top-head">
              <li>
                <OverlayTrigger placement="top" overlay={renderTooltip}>
                  <Link>
                    <ImageWithBasePath
                      src="assets/img/icons/pdf.svg"
                      alt="PDF"
                    />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderExcelTooltip}>
                  <Link data-bs-toggle="tooltip" data-bs-placement="top">
                    <ImageWithBasePath
                      src="assets/img/icons/excel.svg"
                      alt="Excel"
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
                  {/* Cập nhật: Refresh list sau khi search/filter nếu có */}
                  <Link
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    onClick={() => {
                      if (
                        searchQuery ||
                        selectedFilterRole != null ||
                        selectedDate != null
                      ) {
                        applyFiltersAndSearch(); // Refresh kết quả filter/search
                      } else {
                        fetchRoles(currentPage); // Refresh trang hiện tại
                      }
                    }}
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
              <a
                to="#"
                className="btn btn-added"
                data-bs-toggle="modal"
                data-bs-target="#add-units"
              >
                <PlusCircle className="me-2" />
                {t("roles-permissions.addButton")}
              </a>
            </div>
          </div>
          {/* /product list */}
          <div className="card table-list-card">
            <div className="card-body">
              <div className="table-top">
                <div className="search-set">
                  <div className="search-input">
                    <input
                      type="search"
                      placeholder={t("common.search")}
                      className="form-control form-control-sm formsearch"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
                <div className="search-path">
                  <Link
                    className={`btn btn-filter ${
                      isFilterVisible ? "setclose" : ""
                    }`}
                    id="filter_search"
                  >
                    <Filter
                      className="filter-icon"
                      onClick={toggleFilterVisibility}
                    />
                    <span onClick={toggleFilterVisibility}>
                      <ImageWithBasePath
                        src="assets/img/icons/closes.svg"
                        alt="Close"
                      />
                    </span>
                  </Link>
                </div>
                {/* Inline filter controls */}
                <div
                  className={`${
                    isFilterVisible ? "" : "d-none"
                  } d-flex align-items-center ms-3 filter-inline`}
                >
                  <div className="me-2" style={{ minWidth: 220 }}>
                    <Select
                      className="select"
                      options={roleOptions}
                      value={
                        roleOptions.find(
                          (o) => o.value === selectedFilterRole
                        ) || { value: null, label: t("common.all") || "All" }
                      }
                      onChange={handleFilterRoleChange}
                      isClearable={false} // Bỏ isClearable để luôn có option "All"
                      placeholder={t("common.chooseRole")}
                    />
                  </div>
                </div>
              </div>
              <div className="table-responsive">
                {loading || isFiltering ? (
                  <p>{t("common.loading")}</p>
                ) : error ? (
                  <p className="text-danger">{error}</p>
                ) : (
                  <Table columns={columns} dataSource={roles} />
                )}
              </div>
              {/* Phần Phân Trang */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div
                  className="dataTables_info"
                  id="DataTables_Table_0_info"
                  role="status"
                  aria-live="polite"
                >
                  {/* Hiển thị số lượng bản ghi nếu không phân trang */}
                  {(searchQuery ||
                    selectedFilterRole != null ||
                    selectedDate != null) &&
                  roles.length > 0
                    ? t("common.showing_results", { count: roles.length })
                    : null}
                </div>
                {renderPagination()}
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddRole onSuccess={() => applyFiltersAndSearch()} />

      <EditRole data={selectedRole} onRefresh={() => applyFiltersAndSearch()} />
    </div>
  );
};

export default RolesPermissions;
