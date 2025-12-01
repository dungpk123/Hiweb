import React, { useState, useEffect, useCallback } from "react";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useTranslation } from 'react-i18next';
import axios from "axios";
import Select from "react-select";

const API_DEPARTMENTS_URL = `${import.meta.env.VITE_API_URL}/department/departments`;
const API_USER_LIST = `${import.meta.env.VITE_API_URL}/role/userRoles`;

const MySwal = withReactContent(Swal);

const AddDesignation = () => {
    const { t } = useTranslation();
    // State cho Form
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
    const [formData, setFormData] = useState({
        userName: "",
        fullName: "",
        isManager: false,
    });
    const [userOptions, setUserOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);

    // Fetch danh sách USERS
    const fetchUserList = useCallback(async () => {
        try {
            const token = localStorage.getItem("userToken");
            let allUsers = [];
            let currentPage = 1;
            let totalPages = 1;
            const perPage = 50;
            while (currentPage <= totalPages) {
                const response = await axios.get(API_USER_LIST, {
                    headers: { Authorization: `${token}` },
                    params: { per_page: perPage, page: currentPage },
                });
                if (response.data.status && Array.isArray(response.data.data)) {
                    allUsers = allUsers.concat(response.data.data);
                    totalPages = response.data.pagination?.total_pages || 1;
                    currentPage++;
                } else break;
            }
            // Remove duplicate users by user_id
            const uniqueUsersMap = {};
            allUsers.forEach(user => {
                if (!uniqueUsersMap[user.user_id]) {
                    uniqueUsersMap[user.user_id] = user;
                }
            });
            const uniqueUsers = Object.values(uniqueUsersMap);
            const options = uniqueUsers.map((user) => ({
                value: user.user_id,
                label: user.user_name,
                fullName: user.full_name,
            }));
            setUserOptions(options);
        } catch (error) {
            setUserOptions([]);
        }
    }, []);

    // Fetch danh sách DEPARTMENTS
    const fetchDepartmentList = useCallback(async () => {
        try {
            const token = localStorage.getItem("userToken");
            let allDepartments = [];
            let currentPage = 1;
            let totalPages = 1;
            const perPage = 100;
            while (currentPage <= totalPages) {
                const response = await axios.get(API_DEPARTMENTS_URL, {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `${token}`,
                    },
                    params: {
                        per_page: perPage,
                        page: currentPage,
                    },
                });
                if (response.data.status && Array.isArray(response.data.data)) {
                    allDepartments = allDepartments.concat(response.data.data);
                    totalPages = response.data.pagination?.total_pages || 1;
                    currentPage++;
                } else {
                    break;
                }
            }
            const options = allDepartments.map((dep) => ({
                value: String(dep.id),
                label: dep.name_vi || dep.name_en || dep.slug || "N/A",
            }));
            setDepartmentOptions(options);
        } catch (err) {
            setDepartmentOptions([]);
        }
    }, []);

    useEffect(() => {
        fetchUserList();
        fetchDepartmentList();
    }, [fetchUserList, fetchDepartmentList]);

    // Cập nhật fullName khi user được chọn
    const handleUserSelect = (selectedOption) => {
        setSelectedUserId(selectedOption ? selectedOption.value : null);
        setFormData((prev) => ({
            ...prev,
            fullName: selectedOption ? selectedOption.fullName : "",
            userName: selectedOption ? selectedOption.label : "",
        }));
    };

    const handleDepartmentSelect = (selectedOption) => {
        setSelectedDepartmentId(selectedOption ? selectedOption.value : null);
    };
    // Save handler: collect userId, fullName, departmentId, isManager and send as JSON
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUserId || !selectedDepartmentId) {
            MySwal.fire(
                t('common.warning') || 'Cảnh báo!',
                t('user.select_required') || 'Vui lòng chọn User Name và Department!',
                'warning'
            );
            return;
        }
        const data = {
            user_uuid: selectedUserId,
            department_id: selectedDepartmentId,
            is_manager: formData.isManager || false
        };
        try {
            const token = localStorage.getItem("userToken");
            await axios.post(
                "https://hiweb.vn/api/v1/department/userDepartments",
                data,
                { headers: { Authorization: `${token}` } }
            );
            // show success alert and wait for the user to confirm (OK)
            await MySwal.fire(
                t('common.success') || 'Thành công!',
                t('user.add_success') || 'Người dùng đã được thêm thành công.',
                'success'
            );
            // close bootstrap modal if available
            try {
                const modalEl = document.getElementById('add-designation');
                if (modalEl) {
                    const bs = window.bootstrap && window.bootstrap.Modal ? window.bootstrap : null;
                    const inst = bs ? (bs.Modal.getInstance(modalEl) || new bs.Modal(modalEl)) : null;
                    if (inst && typeof inst.hide === 'function') inst.hide();
                }
            } catch (e) {
                // ignore
            }
            // dispatch event for parent to reload table
            try {
                document.dispatchEvent(new CustomEvent('refreshUserDepartments', { detail: { source: 'addDesignation' } }));
            } catch (e) {
                // ignore
            }

        } catch (err) {
            console.error('Lỗi khi lưu:', err?.response || err);
            if (err?.response?.status === 409) {
                MySwal.fire(
                    t('common.info') || 'Thông báo',
                    t('user.already_in_department') || 'Người này đã ở vị trí/phòng ban này rồi!',
                    'info'
                );
                return;
            }
            let msg = t('common.error.title') || 'Có lỗi khi lưu!';
            if (err?.response?.data?.message) {
                msg += '\n' + err.response.data.message;
            } else if (err?.response?.data) {
                msg += '\n' + JSON.stringify(err.response.data);
            }
            MySwal.fire(
                t('common.error.title') || 'Có lỗi khi lưu!',
                msg,
                'error'
            );
        }
    };

    return (
        <div>
            <div className="modal fade" id="add-designation" tabIndex="-1" aria-labelledby="addDesignationModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered custom-modal-two">
                    <div className="modal-content">
                        <div className="page-wrapper-new p-0">
                            <div className="content">
                                <div className="modal-header border-0 custom-modal-header">
                                    <div className="page-title">
                                        <h4>{t('user.add_new')}</h4>
                                    </div>
                                    <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">×</span>
                                    </button>
                                </div>
                                <div className="modal-body custom-modal-body">
                                    <form onSubmit={handleSubmit}>
                                        <div className="row align-items-end">
                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>{t('common.userName')}</label>
                                                    <Select
                                                        className="select"
                                                        options={userOptions}
                                                        placeholder={t('user.select_user')}
                                                        onChange={handleUserSelect}
                                                        value={userOptions.find((opt) => opt.value === selectedUserId)}
                                                        isDisabled={false}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>{t('common.fullName')}</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={formData.fullName}
                                                        name="fullName"
                                                        placeholder={t('common.fullName')}
                                                        disabled
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row align-items-end mt-3">
                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>{t('common.department')}</label>
                                                    <Select
                                                        className="select"
                                                        options={departmentOptions}
                                                        placeholder={t('department.select_department')}
                                                        onChange={handleDepartmentSelect}
                                                        value={departmentOptions.find((opt) => opt.value === selectedDepartmentId)}
                                                        isDisabled={false}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="form-check ms-2" style={{ marginTop: '-25%' }}>
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id="isManagerCheckbox"
                                                        checked={formData.isManager || false}
                                                        onChange={e => setFormData(prev => ({ ...prev, isManager: e.target.checked }))}
                                                    />
                                                    <label className="form-check-label ms-1" htmlFor="isManagerCheckbox">
                                                        {t('common.manager')}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="modal-footer-btn">
                                            <button type="button" className="btn btn-cancel me-2" data-bs-dismiss="modal">
                                                {t('common.cancel')}
                                            </button>
                                            <button type="submit" className="btn btn-submit">
                                                {t('common.save')}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddDesignation;
