import React, { useState, useEffect } from "react";
import axios from "axios";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router-dom";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import {
  PlusCircle,
  RotateCcw,
} from "feather-icons-react/build/IconComponents";
import { useDispatch, useSelector } from "react-redux";
import { setToogleHeader } from "../../core/redux/action";
import { ChevronUp, Filter, Users, FileText } from "react-feather";
import Select from "react-select";
import { getCurrentLanguage } from "../../untils/i18n";
import { useTranslation } from 'react-i18next';
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import ToastMessage from "../components/ToastMessage/ToastMessage";
import AddDesignation from "../../core/modals/hrm/adddesignation";

const UserDepartment = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Cập nhật state list
  const [userDepartmentList, setUserDepartmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingIds, setPendingIds] = useState([]);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const MySwal = withReactContent(Swal);

  // --- STATE CHO TÌM KIẾM & LỌC ---
  const [searchTerm, setSearchTerm] = useState("");
  // 'all', 'manager', 'not_manager'
  const [isManagerFilter, setIsManagerFilter] = useState({
    value: "all",
    label: "Tất cả trạng thái",
  });
  // --- END STATE CHO TÌM KIẾM & LỌC ---

  const currentLang = getCurrentLanguage();
  const isVietnamese = currentLang && currentLang.startsWith("vi");

  const { t } = useTranslation();

  const API_URL = `${import.meta.env.VITE_API_URL}/department/userDepartments`;

  const fetchUserDepartments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      const authHeader = token
        ? token.toLowerCase().startsWith("bearer ")
          ? token
          : `Bearer ${token}`
        : undefined;

      console.debug("fetchUserDepartments: calling API", {
        API_URL,
        tokenPresent: !!token,
      });
      const response = await axios.get(API_URL, {
        headers: authHeader
          ? { Authorization: authHeader, "Content-Type": "application/json" }
          : { "Content-Type": "application/json" },
      });

      if (response.data && response.data.data) {
        setUserDepartmentList(response.data.data);
        console.log("Dữ liệu người dùng phòng ban:", response.data.data);
      } else {
        setUserDepartmentList([]);
        console.warn(
          "API returned empty data array or incorrect structure:",
          response.data
        );
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng phòng ban:", error);
      const serverMessage =
        error.response?.data?.msg ||
        error.response?.data?.error ||
        error.message;
      setToast({
        show: true,
        type: "error",
        message: `Lấy danh sách thất bại: ${serverMessage}`,
      });
      setTimeout(() => setToast({ show: false, type: "", message: "" }), 4000);
      setUserDepartmentList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDepartments();
    const handler = () => {
      try {
        fetchUserDepartments();
      } catch (e) {
        console.error('refreshUserDepartments handler error', e);
      }
    };
    document.addEventListener('refreshUserDepartments', handler);
    return () => document.removeEventListener('refreshUserDepartments', handler);
  }, []);

  const toggleActive = async (id) => {
    if (pendingIds.includes(id)) return;

    const itemToUpdate = userDepartmentList.find((item) => item.id === id);
    if (!itemToUpdate) return;

    const prevIsManager = itemToUpdate.is_manager;
    const newValue = !prevIsManager;

    setUserDepartmentList((prevList) =>
      prevList.map((item) =>
        item.id === id ? { ...item, is_manager: newValue } : item
      )
    );
    setPendingIds((p) => [...p, id]);

    try {
      const token = localStorage.getItem("userToken");
      const authHeader = token
        ? token.toLowerCase().startsWith("bearer ")
          ? token
          : `Bearer ${token}`
        : undefined;

      if (!token) {
        throw new Error("Token không tồn tại, vui lòng đăng nhập lại");
      }

      const payload = {
        id: String(itemToUpdate.id),
        user_uuid: String(itemToUpdate.user_uuid),
        department_id: String(itemToUpdate.department_id),
        is_manager: newValue,
      };

      await axios.put(API_URL, payload, {
        headers: authHeader
          ? { Authorization: authHeader, "Content-Type": "application/json" }
          : { "Content-Type": "application/json" },
      });

      setToast({
        show: true,
        type: newValue ? 'success' : 'error',
        message: newValue ? t('hrm.set_manager_success') : t('hrm.unset_manager_success'),
      });
      setTimeout(() => setToast({ show: false, type: "", message: "" }), 1400);
    } catch (error) {
      console.error("Error updating manager state:", error);

      setUserDepartmentList((prevList) =>
        prevList.map((item) =>
          item.id === id ? { ...item, is_manager: prevIsManager } : item
        )
      );

      const errorMessage =
        error.response?.data?.msg ||
        error.response?.data?.message ||
        error.message ||
        "Không thể cập nhật trạng thái quản lý. Vui lòng thử lại.";

      MySwal.fire({
        title: "Lỗi",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setPendingIds((p) => p.filter((x) => x !== id));
    }
  };

  const showConfirmationAlert = (id) => {
    MySwal.fire({
      title: t('common.are_you_sure'),
      text: t('common.delete_confirm_text') || t('common.cant_revert'),
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      confirmButtonText: t('common.yes_delete'),
      cancelButtonColor: "#d33",
      cancelButtonText: t('common.cancel'),
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("userToken");
          const authHeader = token
            ? token.toLowerCase().startsWith("bearer ")
              ? token
              : `${token}`
            : undefined;

          const requestBody = { id };
          await axios.delete(API_URL, {
            headers: authHeader
              ? {
                Authorization: authHeader,
                "Content-Type": "application/json",
              }
              : { "Content-Type": "application/json" },
            data: requestBody,
          });

          MySwal.fire({
            title: t('common.deleted') || 'Deleted!',
            text: t('common.deleted_success') || 'Record has been deleted.',
            icon: 'success',
            confirmButtonText: t('common.ok') || 'OK',
            customClass: {
              confirmButton: 'btn btn-success',
            },
          });
          await fetchUserDepartments();
        } catch (error) {
          console.error("Lỗi khi xóa:", error);
          const errorMessage =
            error.response?.data?.msg ||
            error.response?.data?.message ||
            "Có lỗi xảy ra khi xóa.";
          MySwal.fire({
            title: t('common.error.title') || 'Error',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: t('common.ok') || 'OK',
          });
        }
      } else {
        MySwal.close();
      }
    });
  };

  const toggleFilterVisibility = () => {
    setIsFilterVisible((prevVisibility) => !prevVisibility);
  };

  const filteredUserDepartments = userDepartmentList.filter((item) => {
    const searchMatch =
      item.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!searchMatch) return false;

    const filterValue = isManagerFilter.value;
    if (filterValue === "manager" && !item.is_manager) return false;
    if (filterValue === "not_manager" && item.is_manager) return false;

    return true;
  });

  const managerFilterOptions = [
    { value: "all", label: t('hrm.filter_all_status') },
    { value: "manager", label: t('hrm.filter_manager') },
    { value: "not_manager", label: t('hrm.filter_not_manager') },
  ];

  // Tooltip Render Functions (giữ nguyên)
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
    <div className="page-wrapper">
      {/* Toast Message Component */}
      {toast.show && (
        <ToastMessage
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>{t('hrm.designation_title')}</h4>
              <h6>{t('hrm.designation_subtitle')}</h6>
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
                  onClick={fetchUserDepartments} // Gắn hàm refresh
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
            <Link
              to="#"
              className="btn btn-added"
              data-bs-toggle="modal"
              data-bs-target="#add-designation"
            >
              <PlusCircle className="me-2" />
              {t('hrm.add_new_designation')}
            </Link>
          </div>
        </div>
        {/* /product list */}
        <div className="card table-list-card">
          <div className="card-body pb-0">
            <div className="table-top table-top-new">
              <div className="search-set mb-0">
                <div className="total-employees">
                  {/* Total members từ API.pagination.total */}
                  <h6>
                    <Users />
                    {t('hrm.total_entries')}{" "}
                    <span>{filteredUserDepartments.length || 0}</span>
                  </h6>
                </div>
                <div className="search-input">
                  <Link to="#" className="btn btn-searchset">
                    <i data-feather="search" className="feather-search" />
                  </Link>
                  <input
                    type="search"
                    className="form-control"
                    placeholder={t('hrm.search_placeholder')}
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
                      <FileText className="info-img" />
                      {/* Lọc theo Trạng thái Quản lý */}
                      <Select
                        className="select"
                        options={managerFilterOptions}
                        placeholder={t('hrm.filter_placeholder')}
                        value={isManagerFilter}
                        onChange={(selectedOption) =>
                          setIsManagerFilter(selectedOption)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* /Filter */}
            <div className="table-responsive">
              {loading ? (
                <p>{t('common.loading')}</p>
              ) : (
                <table className="table datanew">
                  <thead>
                    <tr>
                      <th className="no-sort">
                        <label className="checkboxs">
                          <input type="checkbox" id="select-all" />
                          <span className="checkmarks" />
                        </label>
                      </th>
                      <th>{t('common.userName')}</th>
                      <th>{t('common.fullName')}</th>
                      <th>{t('common.department')}</th>
                      <th>{t('hrm.is_manager')}</th>
                      <th>{t('department.createdAt')}</th>
                      <th className="no-sort">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUserDepartments.length > 0 ? (
                      filteredUserDepartments.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <label className="checkboxs">
                              <input type="checkbox" />
                              <span className="checkmarks" />
                            </label>
                          </td>
                          <td>{item.user_name}</td>
                          <td>{item.full_name}</td>
                          <td>
                            {isVietnamese
                              ? item.department_name_vi
                              : item.department_name_en}
                          </td>
                          <td>
                            <div
                              className={`status-toggle d-flex align-items-center ${pendingIds.includes(item.id) ? "disabled" : ""
                                }`}
                              onClick={() => toggleActive(item.id)}
                            >
                              <input
                                type="checkbox"
                                id={`status_${item.id}`}
                                className="check"
                                checked={item.is_manager}
                                readOnly
                              />
                              <label
                                htmlFor={`status_${item.id}`}
                                className={`checktoggle ${item.is_manager ? "active" : ""
                                  }`}
                              >
                                {item.is_manager ? t('hrm.manager') : t('hrm.not_manager')}
                              </label>
                            </div>
                          </td>
                          <td>
                            {item.created_at
                              ? new Date(item.created_at).toLocaleDateString()
                              : t('common.not_available') || 'N/A'}
                          </td>
                          <td className="action-table-data">
                            <div className="edit-delete-action">
                              <Link
                                className="confirm-text p-2"
                                to="#"
                                onClick={() => showConfirmationAlert(item.id)}
                              >
                                <i
                                  data-feather="trash-2"
                                  className="feather-trash-2"
                                />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">
                          {t('hrm.no_data')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
      <AddDesignation />
    </div>
  );
};

export default UserDepartment;
