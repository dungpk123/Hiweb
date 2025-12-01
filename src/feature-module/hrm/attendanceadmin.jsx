import React, { useState, useEffect, useCallback, useMemo } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ChevronUp, RotateCcw } from "feather-icons-react/build/IconComponents";
import { Filter, PlusCircle, Search } from "react-feather";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import Table from "../../core/pagination/datatable.jsx";
import { setToogleHeader } from "../../core/redux/action.jsx";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";

const API_URL = `${import.meta.env.VITE_API_URL}/attendance/attendances`;

const AttendanceAdmin = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);
  const { t, i18n } = useTranslation();
  const MySwal = withReactContent(Swal);

  // --- STATE QUẢN LÝ DỮ LIỆU & PHÂN TRANG ---
  const [attendancesData, setAttendancesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [filterVisible, setFilterVisible] = useState(false);

  // Thêm Filter States (Để dễ dàng mở rộng)
  const [searchTerm, setSearchTerm] = useState("");
  // filterType: 'department' | 'date'
  const [filterType, setFilterType] = useState("department");
  const [filterValue, setFilterValue] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [dateOptions, setDateOptions] = useState([]);

  // --- LOGIC FETCH DATA ---
  const fetchAttendances = useCallback(
    async (page = 1, per_page = itemsPerPage, keyword = "", departmentId = "", logDate = "") => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("userToken");
        const params = {
          page: page.toString(),
          per_page: per_page.toString(),
        };
        if (keyword && keyword.toString().trim() !== "") {
          // backend expects 'keyword' for searching across date, name and department
          params.keyword = keyword.toString().trim();
        }
        if (departmentId && String(departmentId).trim() !== "") {
          params.department_id = String(departmentId).trim();
        }
        if (logDate && String(logDate).trim() !== "") {
          // filter by single date using from_date/to_date
          params.from_date = String(logDate).trim();
          params.to_date = String(logDate).trim();
        }

        const searchParams = new URLSearchParams(params).toString();
        const apiPath = `${API_URL}?${searchParams}`;

        const response = await axios.get(apiPath, {
          headers: {
            Authorization: token ? `${token}` : "",
            "Content-Type": "application/json",
          },
        });

        const result = response.data;

        if (result.status && Array.isArray(result.data)) {
          setAttendancesData(result.data);
          setTotalItems(result.pagination?.total || 0);
          setCurrentPage(result.pagination?.current_page || 1);
          setTotalPages(result.pagination?.total_pages || 1);
        } else {
          setAttendancesData([]);
          setTotalItems(0);
          setTotalPages(1);
          setError(
            result.msg ||
            t("attendance.fetch_error") ||
            "Lỗi khi tải dữ liệu chấm công: Dữ liệu không hợp lệ."
          );
        }
      } catch (err) {
        console.error("Fetch error:", err);
        const errorMsg =
          err.response?.data?.msg ||
          err.message ||
          t("error.api_connection") ||
          "Lỗi kết nối API.";
        setError(errorMsg);
        setAttendancesData([]);
        setTotalItems(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [t, itemsPerPage]
  );

  useEffect(() => {
    // always include the active search term and selected filter when loading pages
    const deptId = filterType === "department" ? filterValue?.value : "";
    const logDate = filterType === "date" ? filterValue?.value : "";
    fetchAttendances(currentPage, itemsPerPage, searchTerm, deptId, logDate);
  }, [currentPage, itemsPerPage, fetchAttendances, searchTerm, filterType, filterValue]);

  // Load departments, but prefer departments actually present in attendance records
  // This ensures the filter only shows relevant departments and uses attendance-derived labels when available
  useEffect(() => {
    let mounted = true;
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const api = `${import.meta.env.VITE_API_URL}/department/departments?per_page=10000`;
        const res = await axios.get(api, { headers: { Authorization: token ? `${token}` : "" } });

        const lang = (i18n && i18n.language) ? i18n.language.toLowerCase() : "en";
        const deptList = (res?.data?.status && Array.isArray(res.data.data)) ? res.data.data : [];

        // map of department id -> api-provided label
        const deptMap = new Map();
        deptList.forEach((d) => {
          const labelVi = d.department_name_vi || d.name_vi || d.name || d.department_name_en || d.name_en;
          const labelEn = d.department_name_en || d.name_en || d.name || d.department_name_vi || d.name_vi;
          deptMap.set(String(d.id), {
            id: String(d.id),
            labelApi: lang.includes("vi") ? (labelVi || String(d.id)) : (labelEn || String(d.id)),
          });
        });

        // Collect department ids and labels from attendance pages (to ensure relevance and prefer localized labels)
        const per_page = 1000;
        let page = 1;
        let totalPages = 1;
        const presentIds = new Set();
        const attendanceLabels = {}; // id -> {vi, en}

        while (mounted && page <= totalPages) {
          const attRes = await axios.get(`${API_URL}?per_page=${per_page}&page=${page}`, { headers: { Authorization: token ? `${token}` : "" } });
          if (!mounted) break;
          if (attRes?.data?.status && Array.isArray(attRes.data.data)) {
            attRes.data.data.forEach((item) => {
              if (item && item.department_id) {
                const idStr = String(item.department_id);
                presentIds.add(idStr);
                if (!attendanceLabels[idStr]) {
                  attendanceLabels[idStr] = {
                    vi: item.department_name_vi || item.department_name || null,
                    en: item.department_name_en || item.department_name || null,
                  };
                }
              }
            });
            const pagination = attRes.data.pagination;
            if (pagination && typeof pagination.total_pages === 'number') {
              totalPages = pagination.total_pages;
            } else if (attRes.data.data.length < per_page) {
              break;
            } else {
              break;
            }
          } else {
            break;
          }
          page += 1;
        }

        // Build final options only for departments present in attendance data. Prefer attendance labels when available.
        const opts = Array.from(presentIds).map((id) => {
          const att = attendanceLabels[id] || {};
          const apiDept = deptMap.get(id);
          let label = apiDept ? apiDept.labelApi : id;
          if (lang.includes("vi")) {
            label = att.vi || apiDept?.labelApi || id;
          } else {
            label = att.en || apiDept?.labelApi || id;
          }
          return { value: id, label };
        }).sort((a, b) => a.label.localeCompare(b.label));

        if (mounted) {
          setDepartments(opts);
        }
      } catch (e) {
        console.error("Failed to load departments", e);
        if (mounted) setDepartments([]);
      }
    };
    fetchDepartments();
    return () => { mounted = false; };
  }, [i18n && i18n.language]);

  // Load date options when user switches filterType to 'date'
  useEffect(() => {
    if (filterType !== "date") return;
    let mounted = true;
    const fetchDates = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const per_page = 1000; // reasonable page size for pagination
        let page = 1;
        let totalPages = 1;
        const datesSet = new Set();

        while (mounted && page <= totalPages) {
          const api = `${API_URL}?per_page=${per_page}&page=${page}`;
          const res = await axios.get(api, {
            headers: { Authorization: token ? `${token}` : "" },
          });
          if (!mounted) break;
          if (res?.data?.status && Array.isArray(res.data.data)) {
            res.data.data.forEach((i) => {
              if (i && i.log_date) datesSet.add(i.log_date);
            });
            const pagination = res.data.pagination;
            if (pagination && typeof pagination.total_pages === 'number') {
              totalPages = pagination.total_pages;
            } else if (res.data.data.length < per_page) {
              // no pagination info but fewer results than page size => done
              break;
            } else {
              // assume single page if no pagination provided
              break;
            }
          } else {
            break;
          }
          page += 1;
        }

        if (mounted) {
          const uniq = Array.from(datesSet).filter(Boolean).sort((a, b) => b.localeCompare(a));
          setDateOptions(uniq.map((d) => ({ value: d, label: d })));
        }
      } catch (e) {
        console.error("Failed to load dates", e);
        if (mounted) setDateOptions([]);
      }
    };
    fetchDates();
    return () => { mounted = false; };
  }, [filterType]);

  // --- LOGIC UI & HELPER FUNCTIONS ---
  const toggleFilterVisibility = () => {
    setFilterVisible((prev) => {
      const next = !prev;
      // If we are closing the filter panel (was visible, now hidden), reset filters and reload table
      if (prev) {
        setFilterType("department");
        setFilterValue(null);
        setSearchTerm("");
        setCurrentPage(1);
        // fetch initial attendances (no keyword, no department, no date)
        fetchAttendances(1, itemsPerPage, "", "", "");
      }
      return next;
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    const deptId = filterType === 'department' ? filterValue?.value : '';
    const logDate = filterType === 'date' ? filterValue?.value : '';
    fetchAttendances(1, itemsPerPage, searchTerm, deptId, logDate);
  };

  const renderTooltip = (id, text) => {
    const TooltipWrapper = (props) => (
      <Tooltip id={id} {...props}>
        {text}
      </Tooltip>
    );
    TooltipWrapper.displayName = `Tooltip_${id}`;
    return TooltipWrapper;
  };

  const showConfirmationAlert = useCallback(() => {
    MySwal.fire({
      title: t("alert.are_you_sure"),
      text: t("alert.cannot_revert"),
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      confirmButtonText: t("alert.yes_delete"),
      cancelButtonColor: "#dc3545",
      cancelButtonText: t("alert.cancel"),
    }).then((result) => {
      if (result.isConfirmed) {
        MySwal.fire({
          title: t("alert.deleted_title"),
          text: t("alert.deleted_text"),
          className: "btn btn-success",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "btn btn-success",
          },
        });
      } else {
        MySwal.close();
      }
    });
  }, [MySwal, t]);

  // --- LOGIC RENDER PHÂN TRANG ---
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

      if (current < total - 2) {
        pages.push("...");
      }

      if (total > 1) {
        pages.push(total);
      }

      // Loại bỏ các dấu ... 
      const uniquePages = [];
      pages.forEach((page, index) => {
        if (
          page === "..." &&
          (uniquePages[uniquePages.length - 1] === "..." ||
            uniquePages[uniquePages.length - 1] + 1 === pages[index + 1])
        ) {
          return;
        }
        if (page === 1 && uniquePages.includes(1)) {
          return;
        }
        if (page === total && uniquePages.includes(total)) {
          return;
        }
        uniquePages.push(page);
      });
    }

    // Đảm bảo trang 1 và trang cuối luôn có mặt và sắp xếp đúng
    const finalPages = Array.from(new Set(pages))
      .filter((p) => p !== "...")
      .sort((a, b) => a - b);

    const finalPagesWithDots = [];
    if (finalPages.length > 0) {
      finalPagesWithDots.push(finalPages[0]);
      for (let i = 1; i < finalPages.length; i++) {
        if (finalPages[i] > finalPages[i - 1] + 1) {
          finalPagesWithDots.push("...");
        }
        finalPagesWithDots.push(finalPages[i]);
      }
    }

    // Logic tối ưu hóa:
    const optimizedPages = [];
    optimizedPages.push(1);

    if (current > 3 && total > maxVisiblePages) {
      optimizedPages.push("...");
    }

    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      if (i !== 1 && i !== total) {
        optimizedPages.push(i);
      }
    }

    if (current < total - 2 && total > maxVisiblePages) {
      optimizedPages.push("...");
    }

    if (total > 1) {
      optimizedPages.push(total);
    }

    // Xử lý các trường hợp đặc biệt để loại bỏ trùng lặp và ... không cần thiết
    const deduplicatedPages = optimizedPages.filter((page, index) => {
      if (page === "..." && optimizedPages[index - 1] === "...") {
        return false;
      }
      if (index > 0 && page !== "..." && page === optimizedPages[index - 1]) {
        return false;
      }
      return true;
    }).filter((page, index, arr) => {
      if (page === "...") {
        if (arr[index - 1] === 1 || arr[index + 1] === total) {
          return false;
        }
      }
      return true;
    });


    return (
      <div
        className="dataTables_paginate paging_simple_numbers"
        id="DataTables_Table_0_paginate"
      >
        {" "}
        <ul className="pagination">
          {" "}
          <li
            className={`paginate_button page-item previous ${current === 1 ? "disabled" : ""
              }`}
            onClick={() => handlePageChange(current - 1)}
          >
            {" "}
            <Link to="#" className="page-link">
              <FontAwesomeIcon icon={faAngleLeft} />
            </Link>{" "}
          </li>{" "}
          {deduplicatedPages.map((page, index) => {
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
                className={`paginate_button page-item ${page === current ? "active" : ""
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
            className={`paginate_button page-item next ${current === total ? "disabled" : ""
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

  // ---(COLUMNS) ---
  const columns = useMemo(
    () => [
      {
        title: t("attendance.date"),
        dataIndex: "log_date",
        key: "log_date",
        sorter: (a, b) => a.log_date.localeCompare(b.log_date),
      },
      {
        title: t("common.fullName"),
        dataIndex: "full_name",
        key: "full_name",
        sorter: (a, b) => a.full_name.localeCompare(b.full_name),
        render: (text, record) => (
          <div>
            <strong>{text}</strong>
            <br />
            <small className="text-muted">({record.user_name})</small>
          </div>
        ),
      },
      {
        title: t("common.department"),
        dataIndex: "department_name_vi",
        key: "department",
        sorter: (a, b) => {
          const lang = (i18n && i18n.language) ? i18n.language.toLowerCase() : "en";
          const aLabel = lang.includes("vi") ? (a.department_name_vi || a.department_name_en || "") : (a.department_name_en || a.department_name_vi || "");
          const bLabel = lang.includes("vi") ? (b.department_name_vi || b.department_name_en || "") : (b.department_name_en || b.department_name_vi || "");
          return String(aLabel).localeCompare(String(bLabel));
        },
        render: (text, record) => {
          const lang = (i18n && i18n.language) ? i18n.language.toLowerCase() : "en";
          return lang.includes("vi") ? (record.department_name_vi || record.department_name_en || "-") : (record.department_name_en || record.department_name_vi || "-");
        },
      },
      {
        title: t("attendance.check_in"),
        dataIndex: "check_in_at",
        key: "check_in_at",
        render: (text) => {
          return text
            ? new Date(text).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
            : "N/A";
        },
      },
      {
        title: t("attendance.check_out"),
        dataIndex: "check_out_at",
        key: "check_out_at",
        render: (text) => {
          return text
            ? new Date(text).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
            : "N/A";
        },
      },
      {
        title: t("attendance.work_hours"),
        dataIndex: "work_hours",
        key: "work_hours",
        sorter: (a, b) => a.work_hours - b.work_hours,
      },
      {
        title: t("attendance.late_hours"),
        dataIndex: "late_hours",
        key: "late_hours",
        sorter: (a, b) => a.late_hours - b.late_hours,
        render: (text) => (
          <span className={text > 0 ? "text-danger" : "text-success"}>
            {text}h
          </span>
        ),
      },
      {
        title: t("attendance.ot_hours"),
        dataIndex: "ot_hours",
        key: "ot_hours",
        sorter: (a, b) => a.ot_hours - b.ot_hours,
      },
      {
        title: t("attendance.total_hours"),
        dataIndex: "total_hours",
        key: "total_hours",
        sorter: (a, b) => a.total_hours - b.total_hours,
        render: (text) => <strong>{text}h</strong>,
      },
      {
        title: t("common.actions"),
        dataIndex: "actions",
        key: "actions",
        render: () => (
          <div className="action-table-data">
            <Link className="me-2" to="#">
              <i data-feather="edit" className="feather-edit"></i>
            </Link>
            <Link to="#" onClick={showConfirmationAlert}>
              <i data-feather="trash-2" className="feather-trash-2 hover-red"></i>
            </Link>
          </div>
        ),
      },
    ],
    [t, showConfirmationAlert]
  );

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          {/* Header */}
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>{t("attendance.title")}</h4>
                <h6>{t("attendance.subtitle")}</h6>
              </div>
            </div>
            {/* Table Top Head  */}
            <ul className="table-top-head">
              <li>
                <OverlayTrigger
                  placement="top"
                  overlay={renderTooltip("pdf-tooltip", "Pdf")}
                >
                  <Link>
                    <img src="assets/img/icons/pdf.svg" alt="Pdf" />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger
                  placement="top"
                  overlay={renderTooltip("excel-tooltip", "Excel")}
                >
                  <Link>
                    <img src="assets/img/icons/excel.svg" alt="Excel" />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger
                  placement="top"
                  overlay={renderTooltip("printer-tooltip", "Printer")}
                >
                  <Link>
                    <i data-feather="printer" className="feather-printer" />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger
                  placement="top"
                  overlay={renderTooltip("refresh-tooltip", "Refresh")}
                >
                  <Link onClick={handleRefresh}>
                    <RotateCcw />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger
                  placement="top"
                  overlay={renderTooltip("collapse-tooltip", "Collapse")}
                >
                  <Link
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
                {t("attendance.add_new")}
              </Link>
            </div>
          </div>
          {/* /Header */}

          <div className="card table-list-card">
            <div className="card-body pb-0">
              {/* Table Top */}
              <div className="table-top">
                <div className="input-blocks search-set mb-0">
                  <div className="search-set">
                    <div className="search-input">
                      <input
                        type="text"
                        placeholder={t("attendance.search")}
                        className="form-control form-control-sm formsearch"
                        style={{ width: "320px" }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setCurrentPage(1);
                            const deptId = filterType === 'department' ? filterValue?.value : '';
                            const logDate = filterType === 'date' ? filterValue?.value : '';
                            fetchAttendances(1, itemsPerPage, searchTerm, deptId, logDate);
                          }
                        }}
                      />
                      <Link
                        onClick={() => {
                          setCurrentPage(1);
                          const deptId = filterType === 'department' ? filterValue?.value : '';
                          const logDate = filterType === 'date' ? filterValue?.value : '';
                          fetchAttendances(1, itemsPerPage, searchTerm, deptId, logDate);
                        }}
                        className="btn btn-searchset"
                      >
                        <Search className="feather-search" />
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="search-path d-flex align-items-center search-path-new">
                  <div className="d-flex align-items-center">
                    {/* Filter Toggle */}
                    <Link
                      className={`btn btn-filter ${filterVisible ? "setclose" : ""
                        }`}
                      onClick={toggleFilterVisibility}
                    >
                      <Filter className="filter-icon" />
                      <span
                        style={{ display: filterVisible ? "inline" : "none" }}
                      >
                        <img src="assets/img/icons/closes.svg" alt="Close" />
                      </span>
                    </Link>
                  </div>

                </div>
              </div>
              <div
                className={`card${filterVisible ? " visible" : ""}`}
                id="filter_inputs"
                style={{ display: filterVisible ? "block" : "none", marginBottom: filterVisible ? '0.7cm' : undefined, margintop: filterVisible ? '-0.3cm' : undefined }}
              >
                <div className="card-body pb-0" style={{ paddingBottom: '1cm' }}>
                  <div className="row">
                    <div className="col-lg-6 col-sm-12 col-12">
                      <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                        <div style={{ minWidth: 160 }}>
                          <label className="form-label d-block mb-1">{t('filter.type') || 'Filter by'}</label>
                          <Select
                            className="select"
                            options={[
                              { value: 'date', label: t('attendance.date') || 'Date' },
                              { value: 'department', label: t('common.department') || 'Department' },
                            ]}
                            value={{ value: filterType, label: filterType === 'date' ? (t('attendance.date') || 'Date') : (t('common.department') || 'Department') }}
                            onChange={(v) => { setFilterType(v.value); setFilterValue(null); }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label className="form-label d-block mb-1">{t('filter.value') || 'Value'}</label>
                          <Select
                            className="select"
                            options={filterType === 'date' ? dateOptions : departments}
                            placeholder={filterType === 'date' ? (t('filter.select_date') || 'Select date') : (t('filter.select_department') || 'Select department')}
                            value={filterValue}
                            onChange={(val) => {
                              setFilterValue(val);
                              // trigger fetch with new filter
                              const deptId = filterType === 'department' ? val?.value : '';
                              const logDate = filterType === 'date' ? val?.value : '';
                              setCurrentPage(1);
                              fetchAttendances(1, itemsPerPage, searchTerm, deptId, logDate);
                            }}
                            isClearable
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {loading ? (
                <div className="text-center p-4">
                  <p>{t("common.loading")}</p>
                </div>
              ) : error ? (
                <div className="text-center p-4">
                  <p className="text-danger">{error}</p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <Table
                      columns={columns}
                      dataSource={attendancesData}
                      pagination={false}
                      rowKey="id"
                    />
                  </div>
                  {totalItems > 0 && (
                    <div className="table-bottom">
                      <div className="dataTables_info">
                        Tổng {totalItems} mục.
                      </div>
                      <div className="dataTables_paginate">
                        {renderPagination()}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

AttendanceAdmin.displayName = "AttendanceAdmin";

export default AttendanceAdmin;
