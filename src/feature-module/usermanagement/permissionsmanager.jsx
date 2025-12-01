import React, { useState, useEffect, useCallback, useRef } from "react";
import Swal from "sweetalert2";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ChevronUp, RotateCcw } from "feather-icons-react/build/IconComponents";
import { useDispatch, useSelector } from "react-redux";
import { setToogleHeader } from "../../core/redux/action";
import { PlusCircle, Filter } from "react-feather";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import axios from "axios";
import { useTranslation } from "react-i18next";
import AddPermission from "../../core/modals/usermanagement/addpermission";
import AddEditPermission from "../../core/modals/usermanagement/addeditpermission";
import withReactContent from "sweetalert2-react-content";
import Select from "react-select";
import ShowingInfo from "../components/ShowingInfo";
import PaginationControl from "../components/PaginationControl";

const API_URL = `${import.meta.env.VITE_API_URL}/role/permissions`;

const PermissionsManager = () => {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.toggle_header);
    const MySwal = withReactContent(Swal);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refresh, setRefresh] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editPermission, setEditPermission] = useState(null);
    const { t } = useTranslation();

    const [searchTerm, setSearchTerm] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [selectedModule, setSelectedModule] = useState(null);
    const [appliedModule, setAppliedModule] = useState("");
    const [moduleOptions, setModuleOptions] = useState([]);
    const [loadingModules, setLoadingModules] = useState(false);
    const searchInputRef = useRef(null);

    const showConfirmationAlert = (permissionId) => {
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
                // TODO: Implement deletePermission action or API call here using permissionId
                // dispatch(deletePermission(permissionId));
                MySwal.fire({
                    title: "Deleted!",
                    text: `Permission ${permissionId} has been deleted.`,
                    icon: "success",
                    confirmButtonText: "OK",
                    customClass: {
                        confirmButton: 'btn btn-success',
                    },
                }).then(() => {
                    fetchPermissions(currentPage, appliedSearch);
                });
            }
        });
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


    const fetchPermissions = async (
        page = 1,
        search = appliedSearch,
        moduleFilter = appliedModule
    ) => {
        try {
            setLoading(true);
            setError("");
            const token = localStorage.getItem("userToken");
            let apiPath = `${API_URL}?page=${page}&per_page=10`;
            const keywordParts = [];
            if (search) {
                keywordParts.push(search);
            }
            if (moduleFilter) {
                keywordParts.push(moduleFilter);
            }
            const keyword = keywordParts.join(" ").trim();
            if (keyword) {
                apiPath += `&keyword=${encodeURIComponent(keyword)}`;
            }
            const response = await axios.get(apiPath, {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `${token}`,
                },
            });
            if (response.data.status && response.data.code === 200) {
                setPermissions(response.data.data);
                setTotalPages(response.data.pagination?.total_pages || 1);
                setTotalItems(
                    response.data.pagination?.total || response.data.data.length
                );
                setCurrentPage(response.data.pagination?.current_page || 1);
            } else {
                setError("Không lấy được dữ liệu permissions");
            }
        } catch (error) {
            setError("Lỗi khi gọi API permissions");
        } finally {
            setLoading(false);
            if (searchInputRef.current) {
                const inputEl = searchInputRef.current;
                const caretPos = inputEl.selectionStart ?? inputEl.value.length;
                inputEl.focus();
                requestAnimationFrame(() => {
                    inputEl.setSelectionRange(caretPos, caretPos);
                });
            }
        }
    };

    useEffect(() => {
        fetchPermissions(1, appliedSearch, appliedModule);
    }, [refresh, appliedSearch, appliedModule]);

    const loadModuleOptions = useCallback(async () => {
        try {
            setLoadingModules(true);
            const token = localStorage.getItem("userToken");
            const perPage = 100;
            let page = 1;
            let totalPages = 1;
            const moduleSet = new Set();
            while (page <= totalPages) {
                const response = await axios.get(
                    `${API_URL}?page=${page}&per_page=${perPage}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            Authorization: `${token}`,
                        },
                    }
                );
                if (response.data.status && Array.isArray(response.data.data)) {
                    response.data.data.forEach((item) => {
                        const moduleValue = item.module?.trim();
                        if (moduleValue) {
                            moduleSet.add(moduleValue);
                        }
                    });
                    totalPages = response.data.pagination?.total_pages || page;
                    if (!response.data.pagination) {
                        break;
                    }
                    page += 1;
                } else {
                    break;
                }
            }
            const options = Array.from(moduleSet)
                .sort((a, b) => a.localeCompare(b))
                .map((moduleValue) => ({
                    value: moduleValue,
                    label: moduleValue,
                }));
            setModuleOptions(options);
        } catch (err) {
            console.error("Failed to load modules list", err);
            setModuleOptions([]);
        } finally {
            setLoadingModules(false);
        }
    }, []);

    useEffect(() => {
        loadModuleOptions();
    }, [loadModuleOptions, refresh]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            fetchPermissions(page, appliedSearch, appliedModule);
        }
    };

    const toggleFilterVisibility = () => {
        setIsFilterVisible((prev) => !prev);
    };

    const handleSearchInputChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);
        setCurrentPage(1);
        setAppliedSearch(value.trim());
    };



    const handleModuleFilterChange = (option) => {
        setSelectedModule(option);
        setCurrentPage(1);
        setAppliedModule(option?.value || "");
    };


    return (
        <div>
            <div className="page-wrapper">
                <div className="content">
                    <div className="page-header">
                        <div className="add-item d-flex">
                            <div className="page-title">
                                <h4>{t("permissionsManager.title")}</h4>
                                <h6>{t("permissionsManager.subTitle")}</h6>
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
                            <a
                                to="#"
                                className="btn btn-added"
                                data-bs-toggle="modal"
                                data-bs-target="#add-permission"
                            >
                                <PlusCircle className="me-2" />
                                {t("permissionsManager.addNewPermission")}
                            </a>
                        </div>
                    </div>
                    <div className="card table-list-card">
                        <div className="card-body">
                            <div className="table-top">
                                <div className="search-set" style={{ marginLeft: '0.4cm' }}>
                                    <div className="search-input">
                                        <input
                                            type="text"
                                            placeholder={
                                                t("permissionsManager.searchPlaceholder") ||
                                                t("roles-permissions.searchPlaceholder") ||
                                                "Search permissions"
                                            }
                                            className="form-control form-control-sm formsearch"
                                            value={searchTerm}
                                            onChange={handleSearchInputChange}
                                            ref={searchInputRef}
                                        />
                                        <span className="btn btn-searchset disabled">
                                            <i data-feather="search" className="feather-search" />
                                        </span>
                                    </div>
                                </div>
                                <div className="search-path">
                                    <Link
                                        to="#"
                                        className={`btn btn-filter ${isFilterVisible ? "setclose" : ""}`}
                                        id="filter_search"
                                        onClick={toggleFilterVisibility}
                                    >
                                        <Filter className="filter-icon" />
                                        <span>
                                            <ImageWithBasePath
                                                src="assets/img/icons/closes.svg"
                                                alt="Close"
                                            />
                                        </span>
                                    </Link>
                                </div>

                            </div>
                            {isFilterVisible && (
                                <div className="card filter-card mb-3" style={{ border: 'none', boxShadow: 'none' }}>
                                    <div className="card-body">
                                        <div className="row g-3 align-items-end">
                                            <div className="col-md-6 col-lg-4" style={{ marginLeft: '1cm' }}>
                                                <label className="form-label">
                                                    {t("permissionsManager.filterModule") || "Module"}
                                                </label>
                                                <Select
                                                    isClearable
                                                    classNamePrefix="select"
                                                    className="select"
                                                    options={moduleOptions}
                                                    value={selectedModule}
                                                    onChange={handleModuleFilterChange}
                                                    isLoading={loadingModules}
                                                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                    menuPosition="fixed"
                                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                    placeholder={
                                                        t("permissionsManager.filterModulePlaceholder") ||
                                                        "All modules"
                                                    }
                                                />
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="table-responsive">
                                {loading ? (
                                    <p>Đang tải dữ liệu...</p>
                                ) : error ? (
                                    <p className="text-danger">{error}</p>
                                ) : (
                                    <>
                                        <ShowingInfo 
                                            currentCount={Math.min(permissions.length, totalItems)}
                                            totalCount={totalItems}
                                            type="permissions"
                                        />
                                        <table className="table datanew">
                                        <thead>
                                            <tr>
                                                <th>{t("permissionsManager.slug")}</th>
                                                <th>{t("permissionsManager.name_vi")}</th>
                                                <th>{t("permissionsManager.name_en")}</th>
                                                <th>{t("permissionsManager.module")}</th>
                                                <th>{t("permissionsManager.createdAt")}</th>
                                                <th>{t("permissionsManager.updatedAt")}</th>
                                                <th>{t("permissionsManager.actions")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {permissions.map((item) => (
                                                <tr key={item.id}>
                                                    <td>{item.slug}</td>
                                                    <td>{item.name_vi}</td>
                                                    <td>{item.name_en}</td>
                                                    <td>{item.module}</td>
                                                    <td>{item.created_at}</td>
                                                    <td>{item.updated_at}</td>
                                                    <td className="action-table-data">
                                                        <div className="edit-delete-action">
                                                            <Link
                                                                className="me-2 p-2"
                                                                to="#"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setEditPermission(item);
                                                                    setShowEditModal(true);
                                                                }}
                                                            >
                                                                <i
                                                                    data-feather="edit"
                                                                    className="feather-edit"
                                                                ></i>
                                                            </Link>
                                                            <Link
                                                                className="confirm-text p-2"
                                                                to="#"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    showConfirmationAlert(item.id);
                                                                }}
                                                            >
                                                                <i
                                                                    data-feather="trash-2"
                                                                    className="feather-trash-2"
                                                                ></i>
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    </>
                                )}
                            </div>
                        </div>
                        <PaginationControl 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                    <AddPermission onSuccess={() => setRefresh((r) => !r)} />
                    <AddEditPermission
                        show={showEditModal}
                        onHide={() => {
                            setShowEditModal(false);
                            setEditPermission(null);
                        }}
                        permission={editPermission}
                        onSuccess={() => {
                            setRefresh((r) => !r);
                            setShowEditModal(false);
                            setEditPermission(null);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
export default PermissionsManager;
