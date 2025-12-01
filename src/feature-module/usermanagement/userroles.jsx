import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { setToogleHeader } from '../../core/redux/action';
import axios from "axios";
import { useTranslation } from "react-i18next";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ChevronUp, RotateCcw } from "feather-icons-react/build/IconComponents";
import { Filter, Sliders } from "react-feather";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import Select from "react-select";
import { PlusCircle } from "react-feather";

const UserRoles = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);
  const oldandlatestvalue = [
    { value: "date", label: "Sort by Date" },
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
  ];
  const { t } = useTranslation();
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const toggleFilterVisibility = () => {
    setIsFilterVisible((prevVisibility) => !prevVisibility);
  };

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const response = await axios.get(
          "http://192.168.0.119/api/v1/role/userRoles",
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `${token}`,
            },
          }
        );
        if (response.data.status && response.data.code === 200) {
          setUserRoles(response.data.data);
        } else {
          setError("Không lấy được dữ liệu userRoles");
        }
      } catch (error) {
        setError("Lỗi khi gọi API userRoles");
      } finally {
        setLoading(false);
      }
    };
    fetchUserRoles();
  }, []);

  // Tooltip cho các nút xuất file
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

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>{t("userroles.title", "Phân quyền người dùng")}</h4>
                <h6>{t("userroles.subTitle", "Quản lý phân quyền người dùng")}</h6>
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
                    <ImageWithBasePath src="assets/img/icons/excel.svg" alt="img" />
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
                    onClick={() => { dispatch(setToogleHeader(!data)) }}
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
                data-bs-target="#add-role"
              >
                <PlusCircle className="me-2" />
                {t("userroles.addNewRole")}
              </a>
            </div>
          </div>
          {/* /user roles list */}
          <div className="card table-list-card">
            <div className="card-body">
              <div className="table-top">
                <div className="search-set">
                  <div className="search-input">
                    <input
                      type="text"
                      placeholder={t("roles-permissions.searchPlaceholder")}
                      className="form-control form-control-sm formsearch" />
                    <Link to className="btn btn-searchset">
                      <i data-feather="search" className="feather-search" />
                    </Link>
                  </div>
                </div>
                <div className="search-path">
                  <Link
                    className={`btn btn-filter ${isFilterVisible ? "setclose" : ""}`}
                    id="filter_search"
                  >
                    <Filter className="filter-icon" onClick={toggleFilterVisibility} />
                    <span onClick={toggleFilterVisibility}>
                      <ImageWithBasePath src="assets/img/icons/closes.svg" alt="Close" />
                    </span>
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
              {/* /Filter */}
              <div className="table-responsive">
                {loading ? (
                  <p>Đang tải dữ liệu...</p>
                ) : error ? (
                  <p className="text-danger">{error}</p>
                ) : (
                  <table className="table datanew">
                    <thead>
                      <tr>
                        <th>{t("userroles.userName")}</th>
                        <th>{t("userroles.fullName")}</th>
                        <th>{t("userroles.role")}</th>
                        <th>{t("userroles.roleNameVi")}</th>
                        <th>{t("userroles.roleNameEn")}</th>
                        <th>{t("userroles.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userRoles.map((item) => (
                        <tr key={item.user_id}>
                          <td>{item.user_name}</td>
                          <td>{item.full_name}</td>
                          <td>{item.role_id}</td>
                          <td>{item.name_vi}</td>
                          <td>{item.name_en}</td>
                          <td>
                            <td className="action-table-data">
                              <div className="edit-delete-action">
                                <Link className="me-2 p-2" to="#">
                                  <i data-feather="eye" className="feather feather-eye action-eye"></i>
                                </Link>
                                <Link className="me-2 p-2" to="#" data-bs-toggle="modal" data-bs-target="#edit-units">
                                  <i data-feather="edit" className="feather-edit"></i>
                                </Link>
                                <Link className="confirm-text p-2" to="#">
                                  <i data-feather="trash-2" className="feather-trash-2"></i>
                                </Link>
                              </div>
                            </td>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
          {/* /user roles list */}
        </div>
      </div>
    </div>
  );
};

export default UserRoles;