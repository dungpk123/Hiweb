import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const EditDepartmentList = ({ initialData, onUpdate, onCloseModal }) => {
    const { t } = useTranslation();
    const MySwal = withReactContent(Swal);

    const [department, setDepartment] = useState(initialData || {});
    const [loading, setLoading] = useState(false); 

    useEffect(() => {
        const sanitizedData = {
            ...(initialData || {}),
            level: initialData && initialData.level !== undefined ? Number(initialData.level) : null
        };
        setDepartment(sanitizedData);
    }, [initialData]);


    // Hàm hiển thị thông báo SweetAlert2
    const showNotification = (titleKey, textKey, icon, err) => {
        let text = t(textKey);
        if (err) {
            text = `${err} (${text})`;
        }
        MySwal.fire({
            title: t(titleKey),
            text: text,
            icon: icon,
            confirmButtonText: t("common.ok") || "OK",
            customClass: {
                confirmButton: `btn btn-${icon === "success" ? "success" : "danger"}`,
            },
        });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setDepartment(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };
    
    const handleSelectChange = (name, selectedOption) => {
        setDepartment(prevData => ({
            ...prevData,
            [name]: selectedOption ? selectedOption.value : null,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { name_vi, name_en, slug, level } = department;

        // 1. Kiểm tra trường bắt buộc
        if (!name_vi || !name_en || !slug || level === null || level === undefined) {
            showNotification(
                "common.error.title",
                "common.error.errorRequiredFields", 
                "warning"
            );
            return;
        }

        if (!department.id) {
            showNotification(
                "common.error.title",
                "department.not.found",
                "error"
            );
            return;
        }

        const API_URL = `${process.env.REACT_APP_API_URL}/department/departments`;
        const userToken = localStorage.getItem("userToken");

        // 2. Kiểm tra Token
        if (!userToken) {
            showNotification(
                "common.error.title",
                "common.error.noAuthToken", 
                "error"
            );
            return;
        }

        setLoading(true);

        // Chuẩn bị dữ liệu gửi đi 
        const dataToSend = {
            id: department.id,
            parent_id: department.parent_id || null, 
            slug: department.slug ? department.slug.toLowerCase().replace(/\s+/g, "_") : '',
            name_vi: department.name_vi,
            name_en: department.name_en,
            level: department.level,
            is_active: !!department.is_active,
        };

        try {
            const response = await axios.put(API_URL, dataToSend, {
                headers: {
                    Authorization: `${userToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.data.status) {
                const modalElement = document.getElementById("edit-department");
                if (modalElement) {
                    const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
                    if (closeButton) {
                        closeButton.click();
                    }
                }

                showNotification("common.ok", "department.updated", "success");
                if (onUpdate) onUpdate(response.data.data);
            } else {
                const apiMsgKey = response.data.msg || "common.error.title";
                const errValue = response.data.err || null;
                showNotification("common.error.title", apiMsgKey, "error", errValue);
            }

        } catch (error) {
            console.error("API PUT error:", error);
            const errorMsg =
                error.response?.data?.msg || "common.error.connectionError";
            const errorErr = error.response?.data?.err || null;
            showNotification("common.error.title", errorMsg, "error", errorErr);
        } finally {
            setLoading(false);
        }
    };
    
    // Đảm bảo Level là number khi so sánh/tìm kiếm
    const levelList = [
        { value: 0, label: `${t("common.level")} 0` },
        { value: 1, label: `${t("common.level")} 1` },
        { value: 2, label: `${t("common.level")} 2` },
    ];
    
    const selectedLevelValue = department.level !== undefined && department.level !== null ? Number(department.level) : null;
    const selectedLevelOption = levelList.find(opt => opt.value === selectedLevelValue) || null;

    return (
        <div className="modal fade" id="edit-department" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered custom-modal-two">
                <div className="modal-content">
                    <div className="page-wrapper-new p-0">
                        <div className="content">
                            <div className="modal-header custom-modal-header">
                                <h5 className="modal-title">{t("common.edit")} {t("department.title")}</h5>
                                <button type="button" className="close w-auto" data-bs-dismiss="modal" onClick={onCloseModal}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>

                            <div className="modal-body custom-modal-body">
                                
                                {department.id ? (
                                    <form onSubmit={handleSubmit}>
                                        <div className="row">

                                            {/* SLUG */}
                                            <div className="col-lg-12">
                                                <div className="mb-3">
                                                    <label className="form-label">
                                                        {t("department.slug") || "Slug"} <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="slug"
                                                        value={department.slug || ''}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            </div>

                                            {/* Name VI */}
                                            <div className="col-lg-12">
                                                <div className="mb-3">
                                                    <label className="form-label">
                                                        {t("department.departmentName") || "Department Name"} (Vi) <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="name_vi"
                                                        value={department.name_vi || ''}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            </div>

                                            {/* Name EN */}
                                            <div className="col-lg-12">
                                                <div className="mb-3">
                                                    <label className="form-label">
                                                        {t("department.departmentName") || "Department Name"} (En) <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="name_en"
                                                        value={department.name_en || ''}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            </div>

                                            {/* LEVEL */}
                                            <div className="col-lg-12">
                                                <div className="mb-3">
                                                    <label className="form-label">
                                                        {t("department.level") || "Level"} <span className="text-danger">*</span>
                                                    </label>
                                                    <Select
                                                        className="select"
                                                        options={levelList}
                                                        placeholder={t("common.choose") || "Choose Level"}
                                                        name="level"
                                                        value={selectedLevelOption}
                                                        onChange={(opt) => handleSelectChange('level', opt)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <div className="input-blocks m-0">
                                                <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                                                    <span className="status-label">{t("common.status") || "Status"}</span>
                                                    <input
                                                        type="checkbox"
                                                        id="depEditStatusCheck" 
                                                        className="check"
                                                        name="is_active"
                                                        checked={!!department.is_active}
                                                        onChange={handleChange}
                                                    />
                                                    <label htmlFor="depEditStatusCheck" className="checktoggle">{" "}</label>
                                                </div>
                                            </div>

                                        </div>

                                        {/* Buttons */}
                                        <div className="modal-footer-btn">
                                            <button
                                                type="button"
                                                className="btn btn-cancel me-2"
                                                data-bs-dismiss="modal"
                                                onClick={onCloseModal}
                                            >
                                                {t("common.cancel") || "Cancel"}
                                            </button>

                                            <button 
                                                type="submit" 
                                                className="btn btn-submit"
                                                disabled={loading} 
                                            >
                                                {loading
                                                    ? `${t("common.loading")}...`
                                                    : t("common.save") || "Save Changes"}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="text-center p-3">
                                        <p>{t("department.not.found") || "Department data not found."}</p>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

EditDepartmentList.propTypes = {
    initialData: PropTypes.object,
    onUpdate: PropTypes.func,
    onCloseModal: PropTypes.func,
};

EditDepartmentList.defaultProps = {
    initialData: {},
    onUpdate: () => {},
    onCloseModal: () => {},
};

export default EditDepartmentList;