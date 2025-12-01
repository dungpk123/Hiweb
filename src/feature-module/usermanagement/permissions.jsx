import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useTranslation } from "react-i18next";
import AddPermission from "../../core/modals/usermanagement/addpermission";
import AddRolePermission from "../../core/modals/usermanagement/addrolepermission";
import AddEditPermission from "../../core/modals/usermanagement/addeditpermission";
import Select from 'react-select';
import { Filter } from "react-feather";
import ImageWithBasePath from "../../core/img/imagewithbasebath";

const API_URL = `${process.env.REACT_APP_API_URL}/role/rolePermissions`;

const Permissions = () => {

    const { t, i18n } = useTranslation();
    const safeT = (key, fallback) => {
        try {
            const val = t(key);
            return typeof val === 'string' ? val : fallback;
        } catch (e) {
            return fallback;
        }
    };

    const showConfirmationAlert = (roleId, permissionIds) => {
        Swal.fire({
            title: safeT('common.are_you_sure', 'Are you sure?'),
            text: safeT('common.delete_confirm_text', 'You won\'t be able to revert this!'),
            showCancelButton: true,
            confirmButtonColor: '#00ff00',
            confirmButtonText: safeT('common.yes_delete', 'Yes, delete it!'),
            cancelButtonColor: '#ff0000',
            cancelButtonText: safeT('common.cancel', 'Cancel'),
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('userToken');
                    // ensure permission_ids is an array
                    const permissionIdsArray = Array.isArray(permissionIds) ? permissionIds : [permissionIds];
                    await axios.delete(API_URL, {
                        data: {
                            role_id: roleId,
                            permission_ids: permissionIdsArray,
                        },
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                            Authorization: `${token}`,
                        },
                    });
                    Swal.fire({
                        title: safeT('common.deleted', 'Deleted!'),
                        text: safeT('permissions.deleted_success', 'Permission has been deleted.'),
                        icon: 'success',
                        confirmButtonText: safeT('common.ok', 'OK'),
                    });
                    setRefresh(r => !r);
                } catch (error) {
                    Swal.fire({
                        title: safeT('common.error', 'Error!'),
                        text: safeT('common.network_error', 'Delete failed. Please try again.'),
                        icon: 'error',
                        confirmButtonText: safeT('common.ok', 'OK'),
                    });
                }
            }
        });
    };
    const [searchTerm, setSearchTerm] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const toggleFilterVisibility = () => {
        setIsFilterVisible((v) => {
            const next = !v;
            console.debug('permissions: toggleFilterVisibility ->', next);
            if (!next) {
                // filter is being closed -> reset filters and reload default data
                setSelectedRole(null);
                setAppliedRole("");
                setSearchTerm("");
                setAppliedSearch("");
                setCurrentPage(1);
                // fetch default list
                fetchPermissions(1, "", "");
            }
            return next;
        });
    };

    const [roleOptions, setRoleOptions] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [appliedRole, setAppliedRole] = useState("");
    const [loadingRoles, setLoadingRoles] = useState(false);



    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refresh, setRefresh] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editPermission, setEditPermission] = useState(null);
    const searchInputRef = useRef(null);
    const fetchPermissions = useCallback(async (page = 1, search = appliedSearch, roleFilter = appliedRole) => {
        try {
            setLoading(true);
            setError("");
            const token = localStorage.getItem("userToken");
            let apiPath = `${API_URL}?page=${page}&per_page=10`;
            const keywordParts = [];
            if (search && search.toString().trim().length > 0) {
                keywordParts.push(search.toString().trim());
            }
            const keyword = keywordParts.join(" ").trim();
            if (keyword) {
                apiPath += `&keyword=${encodeURIComponent(keyword)}`;
            }
            if (roleFilter) {
                apiPath += `&role_id=${encodeURIComponent(roleFilter)}`;
            }
            const response = await axios.get(
                apiPath,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `${token}`,
                    },
                }
            );
            if (response.data.status && response.data.code === 200) {
                setPermissions(response.data.data);
                setTotalPages(response.data.pagination?.total_pages || 1);
                setTotalItems(response.data.pagination?.total || response.data.data.length);
                setCurrentPage(response.data.pagination?.current_page || 1);
            } else {
                setError("Không lấy được dữ liệu rolePermissions");
            }
        } catch (error) {
            setError("Lỗi khi gọi API rolePermissions");
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
    }, [appliedSearch, appliedRole]);
    useEffect(() => {
        fetchPermissions(1, appliedSearch, appliedRole);
    }, [fetchPermissions, refresh, appliedSearch, appliedRole]);



    const loadRoleOptions = useCallback(async () => {
        try {
            setLoadingRoles(true);
            const token = localStorage.getItem('userToken');
            const perPage = 100;
            let page = 1;
            let totalPages = 1;
            const roleMap = new Map();
            while (page <= totalPages) {
                const resp = await axios.get(`${API_URL}?page=${page}&per_page=${perPage}`, {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `${token}`,
                    },
                });
                if (resp.data && resp.data.status && Array.isArray(resp.data.data)) {
                    resp.data.data.forEach((item) => {
                        const id = item.role_id ?? item.role?.id ?? item.role_id;
                        const name_vi = item.role_name_vi || item.role?.name_vi || "";
                        const name_en = item.role_name_en || item.role?.name_en || "";
                        if (id && !roleMap.has(id)) {
                            roleMap.set(id, { id, name_vi, name_en });
                        }
                    });
                    totalPages = resp.data.pagination?.total_pages || page;
                    if (!resp.data.pagination) break;
                    page += 1;
                } else {
                    break;
                }
            }
            const lang = i18n?.language || 'en';
            const options = Array.from(roleMap.values())
                .sort((a, b) => {
                    const an = (lang === 'vi' ? a.name_vi : a.name_en) || '';
                    const bn = (lang === 'vi' ? b.name_vi : b.name_en) || '';
                    return an.localeCompare(bn);
                })
                .map((r) => ({ value: String(r.id), label: lang === 'vi' ? (r.name_vi || r.name_en) : (r.name_en || r.name_vi) }));
            setRoleOptions(options);
        } catch (e) {
            console.error('Failed to load role options', e);
            setRoleOptions([]);
        } finally {
            setLoadingRoles(false);
        }
    }, [i18n]);



    useEffect(() => {
        loadRoleOptions();
    }, [loadRoleOptions, refresh, i18n?.language]);

    const handlePageChange = useCallback((page) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            fetchPermissions(page, appliedSearch, appliedRole);
        }
    }, [currentPage, totalPages, fetchPermissions, appliedSearch, appliedRole]);

    const handleSearchInputChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);
        setCurrentPage(1);
        setAppliedSearch(value.trim());
    };

    const handleRoleFilterChange = (option) => {
        setSelectedRole(option);
        setCurrentPage(1);
        setAppliedRole(option?.value || "");
    };

    // clear filter handler removed (not used)



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
            const uniquePagesTemp = Array.from(
                new Set(pages.filter((p) => p !== "..."))
            );
            if (current < total - 2) {
                if (
                    uniquePagesTemp.length > 0 &&
                    uniquePagesTemp[uniquePagesTemp.length - 1] < total - 1
                ) {
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
        <div className="page-wrapper">
            <div className="content">
                <div className="page-header">
                    <div className="add-item d-flex">
                        <div className="page-title">
                            <h4>{t("permissions.title")}</h4>
                            <h6>{t("permissions.subTitle")}</h6>
                        </div>
                    </div>
                    <div className="page-btn">
                        <a
                            to="#"
                            className="btn btn-added"
                            data-bs-toggle="modal"
                            data-bs-target="#add-role-permission"
                        >
                            <i className="feather-plus me-2"></i>
                            {t("permissions.addNewRolePermission")}
                        </a>
                    </div>
                </div>
                <div className="card table-list-card">
                    <div className="card-body">
                        <div className="table-responsive">
                            <div className="table-top table-top-new mb-3">
                                <div className="search-set">
                                    <div className="search-input">
                                        <input
                                            type="search"
                                            className="form-control"
                                            placeholder={t('permissions.search_placeholder')}
                                            value={searchTerm}
                                            onChange={handleSearchInputChange}
                                            ref={searchInputRef}
                                        />
                                        {/* search icon removed per design */}
                                    </div>
                                </div>
                                <div className="search-path">
                                    <button
                                        type="button"
                                        className={`btn btn-filter ${isFilterVisible ? "setclose" : ""}`}
                                        id="filter_search"
                                        onClick={() => { console.debug('permissions: filter button clicked'); toggleFilterVisibility(); }}
                                    >
                                        <Filter className="filter-icon" />
                                        <span>
                                            <ImageWithBasePath
                                                src="assets/img/icons/closes.svg"
                                                alt="Close"
                                            />
                                        </span>
                                    </button>
                                </div>

                            </div>

                            {isFilterVisible && (
                                <div className="card filter-card mb-3" id="filter_inputs" style={{ display: isFilterVisible ? 'block' : 'none' }}>
                                    <div className="card-body pb-0">
                                        <div className="row g-3 align-items-end">

                                            <div className="col-lg-4 col-sm-6 col-12">
                                                <label className="form-label">
                                                    {t('permissions.filterRole')}
                                                </label>
                                                <Select
                                                    className="select"
                                                    classNamePrefix="select"
                                                    options={roleOptions}
                                                    value={selectedRole}
                                                    onChange={handleRoleFilterChange}
                                                    isClearable
                                                    isLoading={loadingRoles}
                                                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                    menuPosition="fixed"
                                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                    placeholder={t('permissions.filterRolePlaceholder')}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {loading ? (
                                <p>{t('common.loading')}</p>
                            ) : error ? (
                                <p className="text-danger">{error}</p>
                            ) : (
                                <table className="table datanew">
                                    <thead>
                                        <tr>
                                            <th>{t("permissions.role")}</th>
                                            <th>{t("permissions.role_name_vi")}</th>
                                            <th>{t("permissions.role_name_en")}</th>
                                            <th>{t("permissions.permission")}</th>
                                            <th>{t("permissions.permission_name_vi")}</th>
                                            <th>{t("permissions.permission_name_en")}</th>
                                            <th>{t("permissions.actions")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {permissions.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.role_slug}</td>
                                                <td>{item.role_name_vi}</td>
                                                <td>{item.role_name_en}</td>
                                                <td>{item.permission_slug}</td>
                                                <td>{item.permission_name_vi}</td>
                                                <td>{item.permission_name_en}</td>
                                                <td className="action-table-data">
                                                    <div className="edit-delete-action">
                                                        <Link className="me-2 p-2" to="#" onClick={e => { e.preventDefault(); setEditPermission(item); setShowEditModal(true); }}>
                                                            <i data-feather="edit" className="feather-edit"></i>
                                                        </Link>
                                                        <Link className="confirm-text p-2" to="#" onClick={e => { e.preventDefault(); showConfirmationAlert(item.role_id, [item.permission_id]); }}>
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
                                {t("common.showing") || "Showing"} {(currentPage - 1) * 10 + 1} {t("common.to") || "to"} {Math.min(currentPage * 10, totalItems)} {t("common.of") || "of"} {totalItems} {t("common.entries") || "entries"}
                            </div>
                            {renderPagination()}
                        </div>
                    </div>
                </div>
                <AddPermission onSuccess={() => setRefresh(r => !r)} />
                <AddRolePermission onSuccess={() => setRefresh(r => !r)} />
                <AddEditPermission
                    show={showEditModal}
                    onHide={() => { setShowEditModal(false); setEditPermission(null); }}
                    permission={editPermission}
                    onSuccess={() => { setRefresh(r => !r); setShowEditModal(false); setEditPermission(null); }}
                />
            </div>
        </div>
    );
}

export default Permissions