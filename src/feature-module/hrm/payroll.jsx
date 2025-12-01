
import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import { Filter, Globe, X } from "react-feather";
import { Link } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { ChevronUp, RotateCcw } from "feather-icons-react/build/IconComponents";
import { useDispatch, useSelector } from "react-redux";
import { setToogleHeader } from "../../core/redux/action";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import Sidebar from "../../InitialPage/Sidebar/Sidebar";
import Header from "../../InitialPage/Sidebar/Header";

const API_URL = `${import.meta.env.VITE_API_URL}/attendance/salary`;

const Payroll = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);
  const { t } = useTranslation();

  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  // const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);


  const fetchPayrolls = useCallback(async (page = 1, search = "") => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("userToken");
      let apiPath = `${API_URL}?page=${page}&per_page=10`;
      if (search && search.trim().length > 0) {
        apiPath += `&search=${encodeURIComponent(search)}`;
      }
      const response = await axios.get(apiPath, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `${token}`,
        },
      });
      if (response.data.status && response.data.code === 200) {
        setPayrolls(response.data.data);
        setTotalPages(response.data.pagination?.total_pages || 1);
        setTotalItems(response.data.pagination?.total || response.data.data.length);
        setCurrentPage(response.data.pagination?.current_page || 1);
      } else {
        setError(t("payrolls.fetch_error"));
      }
    } catch (err) {
      setError(t("payrolls.api_error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPayrolls(1);
  }, [fetchPayrolls, refresh]);

  // Build filter options from payrolls
  // const userOptions = [
  //   { label: 'Tất cả nhân viên', value: '' },
  //   ...Array.from(new Set(payrolls.map(p => p.full_name || p.user_name || '')))
  //     .filter(Boolean)
  //     .map(name => ({ label: name, value: name }))
  // ];
  const departmentOptions = [
    { label: 'Tất cả phòng ban', value: '' },
    ...Array.from(new Set(payrolls.map(p => p.department_name_vi || p.department_name_en || '')))
      .filter(Boolean)
      .map(dep => ({ label: dep, value: dep }))
  ];

  // Filtered payrolls based on searchTerm and filters
  const filteredPayrolls = payrolls.filter(item => {
    const q = searchTerm.trim().toLowerCase();
    let match = true;
    if (q) {
      match = (
        String(item.user_name || '').toLowerCase().includes(q) ||
        String(item.full_name || '').toLowerCase().includes(q) ||
        String(item.department_name_vi || '').toLowerCase().includes(q) ||
        String(item.department_name_en || '').toLowerCase().includes(q)
      );
    }
    // if (selectedUser && selectedUser.value) {
    //   match = match && (item.full_name === selectedUser.value || item.user_name === selectedUser.value);
    // }
    if (selectedDepartment && selectedDepartment.value) {
      match = match && (item.department_name_vi === selectedDepartment.value || item.department_name_en === selectedDepartment.value);
    }
    return match;
  });

  // Tooltips
  const renderTooltip = (props) => (
    <Tooltip id="pdf-tooltip" {...props}>Pdf</Tooltip>
  );
  const renderExcelTooltip = (props) => (
    <Tooltip id="excel-tooltip" {...props}>Excel</Tooltip>
  );
  const renderPrinterTooltip = (props) => (
    <Tooltip id="printer-tooltip" {...props}>Printer</Tooltip>
  );
  const renderRefreshTooltip = (props) => (
    <Tooltip id="refresh-tooltip" {...props}>Refresh</Tooltip>
  );
  const renderCollapseTooltip = (props) => (
    <Tooltip id="refresh-tooltip" {...props}>Collapse</Tooltip>
  );

  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchPayrolls(page, searchTerm);
    }
  }, [currentPage, totalPages, fetchPayrolls, searchTerm]);
  // ...existing code...



  const renderPagination = () => {
    const pages = [];
    const current = currentPage;
    const total = totalPages;
    if (total <= 1) return null;
    if (total <= 3) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (current > 2) pages.push("...");
      // Always show current, and one before/after if in range
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        if (i !== 1 && i !== total) pages.push(i);
      }
      const uniquePagesTemp = Array.from(new Set(pages.filter((p) => p !== "...")));
      if (current < total - 1) {
        if (uniquePagesTemp.length > 0 && uniquePagesTemp[uniquePagesTemp.length - 1] < total - 1) {
          pages.push("...");
        }
      }
      if (total > 1 && uniquePagesTemp.indexOf(total) === -1) {
        pages.push(total);
      }
    }
    const uniquePages = Array.from(new Set(pages));
    return (
      <div className="dataTables_paginate paging_simple_numbers">
        <ul className="pagination">
          <li
            className={`paginate_button page-item previous ${current === 1 ? "disabled" : ""}`}
            onClick={() => handlePageChange(current - 1)}
          >
            <Link to="#" className="page-link">&lt;</Link>
          </li>
          {uniquePages.map((page, index) => {
            if (page === "...") {
              return (
                <li key={index} className="paginate_button page-item disabled">
                  <Link to="#" className="page-link">...</Link>
                </li>
              );
            }
            return (
              <li
                key={index}
                className={`paginate_button page-item ${page === current ? "active" : ""}`}
                onClick={() => handlePageChange(page)}
              >
                <Link to="#" className="page-link">{page}</Link>
              </li>
            );
          })}
          <li
            className={`paginate_button page-item next ${current === total ? "disabled" : ""}`}
            onClick={() => handlePageChange(current + 1)}
          >
            <Link to="#" className="page-link">&gt;</Link>
          </li>
        </ul>
      </div>
    );
  };

  return (
    <div className="main-wrapper">
      <Sidebar />
      <Header />
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>{t('payrolls.title')}</h4>
                <h6>{t('payrolls.subTitle')}</h6>
              </div>
            </div>
            <ul className="table-top-head">
              <li>
                <OverlayTrigger placement="top" overlay={renderTooltip}>
                  <Link>
                    <ImageWithBasePath src="assets/img/icons/pdf.svg" alt="img" />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderExcelTooltip}>
                  <Link>
                    <ImageWithBasePath src="assets/img/icons/excel.svg" alt="img" />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderPrinterTooltip}>
                  <Link>
                    <i data-feather="printer" className="feather-printer" />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderRefreshTooltip}>
                  <Link onClick={() => setRefresh((r) => !r)}>
                    <RotateCcw />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>
                  <Link
                    id="collapse-header"
                    className={data ? "active" : ""}
                    onClick={() => {
                      if (dispatch) dispatch(setToogleHeader(!data));
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
                onClick={() => alert('Chức năng thêm mới Payroll sẽ được bổ sung!')}
              >
                <i className="feather-plus me-2"></i>
                {t('payrolls.addNewPayroll')}
              </a>
            </div>
          </div>
          <div className="card table-list-card">
            <div className="card-body">
              {/* Search & Filter */}
              <div className="table-top mb-3">
                <div className="search-set">
                  <div className="search-input">
                    <input
                      type="text"
                      placeholder={t('payrolls.search_placeholder')}
                      className="form-control form-control-sm formsearch"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                    <Link to className="btn btn-searchset">
                      <i data-feather="search" className="feather-search" />
                    </Link>
                  </div>
                </div>
                <div className="search-path">
                  <Link
                    className={`btn btn-filter ${isFilterVisible ? "setclose open" : ""}`}
                    id="filter_search"
                    onClick={() => setIsFilterVisible(v => !v)}
                    style={isFilterVisible ? { background: '#ff2323', color: '#fff' } : { background: '#00cfff', color: '#fff' }}
                  >
                    {isFilterVisible ? <X size={20} /> : <Filter className="filter-icon" />}
                  </Link>
                </div>
              </div>
              {/* Filter section */}
              <div
                className={`card${isFilterVisible ? " visible" : ""}`}
                id="filter_inputs"
                style={{ display: isFilterVisible ? "block" : "none" }}
              >
                <div className="card-body pb-0">
                  <div className="row">
                    {/* Xóa filter chọn nhân viên, chỉ giữ filter phòng ban */}
                    <div className="col-lg-3 col-sm-6 col-12">
                      <div className="input-blocks">
                        <Globe className="info-img" />
                        <Select
                          options={departmentOptions}
                          placeholder="Chọn phòng ban"
                          value={selectedDepartment}
                          onChange={setSelectedDepartment}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="table-responsive">
                {loading ? (
                  <p>{t('common.loading')}</p>
                ) : error ? (
                  <p className="text-danger">{error}</p>
                ) : (
                  <table className="table datanew">
                    <thead>
                      <tr>
                        <th>{t('payrolls.user_name')}</th>
                        <th>{t('payrolls.full_name')}</th>
                        <th>{t('payrolls.department_name_vi')}</th>
                        <th>{t('payrolls.department_name_en')}</th>
                        <th>{t('payrolls.salary_daily')}</th>
                        <th>{t('payrolls.salary_monthly')}</th>
                        <th>{t('payrolls.work_minutes')}</th>
                        <th>{t('payrolls.work_hours_real')}</th>
                        <th>{t('payrolls.total_income')}</th>
                        <th>{t('payrolls.net_income')}</th>
                        <th>{t('payrolls.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayrolls.map((item) => (
                        <tr key={item.user_uuid}>
                          <td>{item.user_name}</td>
                          <td>{item.full_name}</td>
                          <td>{item.department_name_vi}</td>
                          <td>{item.department_name_en}</td>
                          <td>{item.salary_daily}</td>
                          <td>{item.salary_monthly}</td>
                          <td>{item.work_minutes}</td>
                          <td>{item.work_hours_real}</td>
                          <td>{item.total_income}</td>
                          <td>{item.net_income}</td>
                          <td className="action-table-data">
                            <div className="edit-delete-action">
                              <span className="me-2 p-2 text-muted" style={{ cursor: 'not-allowed', opacity: 0.5 }} title="Chức năng sẽ được bổ sung">
                                <i data-feather="edit" className="feather-edit"></i>
                              </span>
                              <Link
                                className="confirm-text p-2"
                                to="#"
                                onClick={e => {
                                  e.preventDefault();
                                  alert('Chức năng xóa Payroll sẽ được bổ sung!');
                                }}
                              >
                                <i data-feather="trash-2" className="feather-trash-2"></i>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="d-flex justify-content-between align-items-center flex-wrap mt-3">
                <div className="dataTables_info">
                  {t('common.showing')} {(currentPage - 1) * 10 + 1} {t('common.to')} {Math.min(currentPage * 10, totalItems)} {t('common.of')} {totalItems} {t('common.entries')}
                </div>
                {renderPagination()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payroll;
