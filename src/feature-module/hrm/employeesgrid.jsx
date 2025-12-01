import React, { useState, useEffect } from "react";
import axios from "axios";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { all_routes } from "../../Router/all_routes";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import {
  Grid,
  List,
  MoreVertical,
  PlusCircle,
  RotateCcw,
  Trash2,
} from "feather-icons-react/build/IconComponents";
import { setToogleHeader } from "../../core/redux/action";
import {
  ChevronUp,
  Filter,
  Sliders,
  StopCircle,
  User,
  Users,
} from "react-feather";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import { getCurrentLanguage } from "../../untils/i18n";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import ToastMessage from "../components/ToastMessage/ToastMessage";

const EmployeesGrid = () => {
  const route = all_routes;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const [employeeList, setEmployeeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setPendingIds] = useState([]);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  const API_URL = `${import.meta.env.VITE_API_URL}/department/userDepartments`;
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      const authHeader = token
        ? token.toLowerCase().startsWith("bearer ")
          ? token
          : `Bearer ${token}`
        : undefined;

      console.debug("fetchEmployees: calling API", {
        API_URL,
        tokenPresent: !!token,
      });
      const response = await axios.get(API_URL, {
        headers: authHeader
          ? { Authorization: authHeader, "Content-Type": "application/json" }
          : { "Content-Type": "application/json" },
      });
      if (response.data && response.data.data) {
        const normalized = response.data.data.map((it) => {
          const isManager =
            it.is_manager === true ||
            it.is_manager === 1 ||
            it.is_manager === "1" ||
            it.is_manager === "true";
          return { ...it, is_manager: !!isManager };
        });
        setEmployeeList(normalized);
        console.log("Dữ liệu nhân viên (normalized):", normalized);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhân viên:", error);
      try {
        console.debug("error.toJSON():", error.toJSON ? error.toJSON() : null);
      } catch (e) {
        console.debug("Could not toJSON error", e);
      }
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      setToast({
        show: true,
        type: "error",
        message: `Lấy danh sách thất bại: ${serverMessage}`,
      });
      setTimeout(() => setToast({ show: false, type: "", message: "" }), 4000);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchEmployees();
  }, []);

  const toggleActive = async (id, index) => {
    const prev = employeeList[index]?.is_manager;
    const updated = [...employeeList];
    if (!updated[index]) return;
    const newValue = !updated[index].is_manager;
    updated[index] = { ...updated[index], is_manager: newValue };
    setEmployeeList(updated);
    setPendingIds((p) => [...p, id]);
    let token;
    let payload;
    try {
      token = localStorage.getItem("userToken");
      const authHeader = token
        ? token.toLowerCase().startsWith("bearer ")
          ? token
          : `Bearer ${token}`
        : undefined;

      if (!token) {
        setEmployeeList((prevList) =>
          prevList.map((it, i) =>
            i === index ? { ...it, is_manager: prev } : it
          )
        );
        setToast({
          show: true,
          type: "error",
          message: "Token không tồn tại, vui lòng đăng nhập lại",
        });
        setTimeout(
          () => setToast({ show: false, type: "", message: "" }),
          3000
        );
        return;
      }

      payload = {
        id: String(updated[index].id),
        user_uuid: String(updated[index].user_uuid),
        department_id: String(updated[index].department_id),
        is_manager: newValue,
      };
      console.debug("toggleActive: put", {
        url: API_URL,
        payload,
        tokenPresent: !!token,
      });
      await axios.put(API_URL, payload, {
        headers: authHeader
          ? { Authorization: authHeader, "Content-Type": "application/json" }
          : { "Content-Type": "application/json" },
      });

      setToast({
        show: true,
        type: "success",
        message: newValue ? "Đã đặt làm quản lý" : "Hủy quản lý",
      });
      setTimeout(() => setToast({ show: false, type: "", message: "" }), 1400);
    } catch (error) {
      console.error("Error updating manager state:", error);
      try {
        console.error("Request config:", JSON.stringify(error.config || {}));
      } catch (stringifyErr) {
        console.error("Failed to stringify error.config:", stringifyErr);
      }
      if (!error.response) {
        console.error("Network error calling API", {
          API_URL,
          message: error.message,
          stack: error.stack,
        });
        setToast({
          show: true,
          type: "error",
          message: `Network Error. Không thể kết nối tới API (${API_URL}). Chi tiết: ${error.message}`,
        });
        setTimeout(
          () => setToast({ show: false, type: "", message: "" }),
          6000
        );
        setEmployeeList((prevList) =>
          prevList.map((it, i) =>
            i === index ? { ...it, is_manager: prev } : it
          )
        );
        return;
      }
      const serverData =
        error.response && error.response.data ? error.response.data : null;

      if (
        error.response &&
        (error.response.status === 404 || error.response.status === 400)
      ) {
        try {
          await axios.post(API_URL, payload, {
            headers: {
              Authorization: `${token}`,
              "Content-Type": "application/json",
            },
          });
          MySwal.fire({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 1400,
            icon: "success",
            title: newValue ? "Set as manager" : "Unset manager",
          });
          return;
        } catch (postErr) {
          console.error("Fallback POST failed:", postErr);
          const postData =
            postErr.response && postErr.response.data
              ? postErr.response.data
              : null;
          MySwal.fire({
            title: "Error",
            text:
              (postData && (postData.msg || postData.message)) ||
              (serverData && (serverData.msg || serverData.message)) ||
              postErr.message ||
              "Không thể cập nhật trạng thái quản lý. Vui lòng thử lại.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      } else {
        MySwal.fire({
          title: "Error",
          text:
            (serverData && (serverData.msg || serverData.message)) ||
            error.message ||
            "Không thể cập nhật trạng thái quản lý. Vui lòng thử lại.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }

      setEmployeeList((prevList) =>
        prevList.map((it, i) =>
          i === index ? { ...it, is_manager: prev } : it
        )
      );
    } finally {
      setPendingIds((p) => p.filter((x) => x !== id));
    }
  };

  const toggleFilterVisibility = () => {
    setIsFilterVisible((prevVisibility) => !prevVisibility);
  };

  const getManagerLabel = () => {
    const lang = getCurrentLanguage();
    return lang && lang.startsWith("en") ? "Manager" : "Quản lý";
  };
  const oldandlatestvalue = [
    { value: "date", label: "Sort by Date" },
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
  ];
  const status = [
    { value: "Choose Status", label: "Choose Status" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  const names = [
    { value: "Choose Name", label: "Choose Name" },
    { value: "Mitchum Daniel", label: "Mitchum Daniel" },
    { value: "Susan Lopez", label: "Susan Lopez" },
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

          MySwal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            className: "btn btn-success",
            confirmButtonText: "OK",
            customClass: {
              confirmButton: "btn btn-success",
            },
          });
          await fetchEmployees();
        } catch (error) {
          console.error("Lỗi khi xóa:", error);
          MySwal.fire({
            title: "Error!",
            text: "Có lỗi xảy ra khi xóa (kiểm tra lại API).",
            icon: "error",
            confirmButtonText: "OK",
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
                <h4>Employees</h4>
                <h6>Manage your employees</h6>
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
                  <Link data-bs-toggle="tooltip" data-bs-placement="top">
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
              <Link to={route.addemployee} className="btn btn-added">
                <PlusCircle className="me-2" />
                Add New Employee
              </Link>
            </div>
          </div>
          {/* /product list */}
          <div className="card">
            <div className="card-body pb-0">
              <div className="table-top table-top-two table-top-new">
                <div className="search-set mb-0">
                  <div className="total-employees">
                    <h6>
                      <Users />
                      Total Employees <span>21</span>
                    </h6>
                  </div>
                  <div className="search-input">
                    <Link to="" className="btn btn-searchset">
                      <i data-feather="search" className="feather-search" />
                    </Link>
                    <input type="search" className="form-control" />
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
                    <Link to={route.employeelist} className="btn-list">
                      <List />
                    </Link>
                    <Link to={route.employeegrid} className="btn-grid active">
                      <Grid />
                    </Link>
                  </div>
                  <div className="form-sort">
                    <Sliders className="info-img" />
                    <Select
                      className="select"
                      options={oldandlatestvalue}
                      placeholder="Newest"
                    />
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
                        <User className="info-img" />
                        <Select
                          className="select"
                          options={names}
                          placeholder="Choose Name"
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
                    <div className="col-lg-3 col-sm-6 col-12 ms-auto">
                      <div className="input-blocks">
                        <Link className="btn btn-filters ms-auto">
                          {" "}
                          <i
                            data-feather="search"
                            className="feather-search"
                          />{" "}
                          {t("common.search")}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Filter */}
            </div>
          </div>
          {/* /product list */}
          <div className="employee-grid-widget">
            <div className="row employee-grid-container">
              <div className="row">
                {loading ? (
                  <div className="col-12 text-center">
                    <h5>{t("common.loading")}</h5>
                  </div>
                ) : employeeList.length > 0 ? (
                  employeeList.map((item, index) => (
                    <div
                      className="col-xxl-3 col-xl-4 col-lg-6 col-md-6 mb-4"
                      key={index}
                    >
                      <div className="employee-grid-profile">
                        <div className="profile-head">
                          <label className="checkboxs">
                            <input type="checkbox" />
                            <span className="checkmarks" />
                          </label>
                          <div className="profile-head-action">
                            <div
                              className="me-2"
                              style={{
                                border: `1px solid ${
                                  item.is_manager ? "#28a745" : "#dc3545"
                                }`,
                                borderRadius: 20,
                                padding: "4px 8px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span style={{ fontWeight: 500 }}>
                                {getManagerLabel()}
                              </span>
                              <div className="form-check form-switch m-0 p-0">
                                <input
                                  className="form-check-input ms-1"
                                  type="checkbox"
                                  role="switch"
                                  id={`activeSwitch-${item.id}`}
                                  checked={item.is_manager}
                                  onChange={() => toggleActive(item.id, index)}
                                />
                              </div>
                            </div>
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
                                    className="dropdown-item confirm-text mb-0"
                                    onClick={() =>
                                      showConfirmationAlert(item.id)
                                    }
                                  >
                                    <Trash2 className="info-img" /> Delete
                                  </Link>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="profile-info">
                          <div className="profile-pic active-profile">
                            {/* Lấy ảnh từ API, nếu không có thì dùng ảnh mặc định */}
                            <ImageWithBasePath
                              src={
                                item.avatar_url ||
                                "assets/img/users/user-01.jpg"
                              }
                              alt=""
                            />
                          </div>
                          <h5>ID: {item.id}</h5>
                          <h4>{item.full_name}</h4>
                          <span>{item.department_name_en}</span>
                          <div style={{ fontSize: 13, color: "#6c757d" }}>
                            {item.designation || getManagerLabel()}
                          </div>
                        </div>

                        <ul className="department">
                          <li>
                            <strong>Phòng ban (VN)</strong>
                            <span>{item.department_name_vi}</span>
                          </li>
                          <li>
                            <strong>User Name</strong>
                            <span>{item.user_name}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center">
                    <h5>Không tìm thấy nhân viên nào.</h5>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* --- KẾT THÚC KHU VỰC HIỂN THỊ --- */}

          <div className="container-fluid">
            <div className="row custom-pagination">
              <div className="col-md-12">
                <div className="paginations d-flex justify-content-end mb-3">
                  <span>
                    <i className="fas fa-chevron-left" />
                  </span>
                  <ul className="d-flex align-items-center page-wrap">
                    <li>
                      <Link to="#" className="active">
                        1
                      </Link>
                    </li>
                    <li>
                      <Link to="#">2</Link>
                    </li>
                    <li>
                      <Link to="#">3</Link>
                    </li>
                    <li>
                      <Link to="#">4</Link>
                    </li>
                  </ul>
                  <span>
                    <i className="fas fa-chevron-right" />
                  </span>
                </div>
              </div>
            </div>
          </div>
          {toast.show && (
            <ToastMessage
              type={toast.type}
              message={toast.message}
              onClose={() => setToast({ ...toast, show: false })}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeesGrid;
