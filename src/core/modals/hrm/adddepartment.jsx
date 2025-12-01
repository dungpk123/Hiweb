import React, { useState } from "react";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import PropTypes from "prop-types";

const API_URL = `${process.env.REACT_APP_API_URL}/department/departments`;

const AddDepartment = ({ onDepartmentAdded }) => {
  const { t } = useTranslation();
  const MySwal = withReactContent(Swal);

  // State cho form
  const [nameVi, setNameVi] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [departmentSlug, setDepartmentSlug] = useState("");
  const [level, setLevel] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  // Dữ liệu giả định cho Level
  const levelList = [
    { value: "0", label: "Level 0" },
    { value: "1", label: "Level 1" },
    { value: "2", label: "Level 2" },
  ];

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

  // Hàm xử lý tạo Department
  const handleAddDepartment = async (e) => {
    e.preventDefault();

    // Kiểm tra trường bắt buộc
    if (!nameVi || !nameEn || !departmentSlug || !level) {
      showNotification(
        "common.error.title",
        "common.error.errorRequiredFields",
        "warning"
      );
      return;
    }

    const token = localStorage.getItem("userToken");
    if (!token) {
      showNotification(
        "common.error.title",
        "common.error.noAuthToken",
        "error"
      );
      return;
    }

    setLoading(true);

    // Chuẩn bị dữ liệu theo yêu cầu API
    const dataToSend = {
      parent_id: null,
      slug: departmentSlug.toLowerCase().replace(/\s+/g, "_"),
      name_vi: nameVi,
      name_en: nameEn,
      level: level,
      is_active: isActive,
    };

    try {
      const response = await axios.post(API_URL, dataToSend, {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.status) {
        const modalElement = document.getElementById("add-department");
        if (modalElement) {
          modalElement.classList.remove("show");

          document.body.classList.remove("modal-open");

          document.body.style.removeProperty("overflow");
          document.body.style.removeProperty("padding-right");

          const modalBackdrops =
            document.getElementsByClassName("modal-backdrop");
          while (modalBackdrops[0]) {
            modalBackdrops[0].parentNode.removeChild(modalBackdrops[0]);
          }
        }

        showNotification("common.ok", "department.created", "success");
        if (onDepartmentAdded) {
          onDepartmentAdded();
        }
      } else {
        // Xử lý thất bại (status: false)
        const apiMsgKey = response.data.msg || "common.error.title";
        const errValue = response.data.err || null;
        showNotification("common.error.title", apiMsgKey, "error", errValue);
      }
    } catch (error) {
      console.error("API POST error:", error);
      const errorMsg =
        error.response?.data?.msg || "common.error.connectionError";
      const errorErr = error.response?.data?.err || null;
      showNotification("common.error.title", errorMsg, "error", errorErr);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Add Department */}
      <div className="modal fade" id="add-department">
        <div className="modal-dialog modal-dialog-centered custom-modal-two">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content">
                <div className="modal-header border-0 custom-modal-header">
                  <div className="page-title">
                    <h4>
                      {t("department.addNewDepartment") || "Add Department"}
                    </h4>
                  </div>
                  <button
                    type="button"
                    className="close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body custom-modal-body">
                  <form onSubmit={handleAddDepartment}>
                    <div className="row">
                      {/* Name VI */}
                      <div className="col-lg-12">
                        <div className="mb-3">
                          <label className="form-label">
                            {t("department.departmentName") ||
                              "Department Name"}{" "}
                            (VI) <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={nameVi}
                            onChange={(e) => setNameVi(e.target.value)}
                          />
                        </div>
                      </div>
                      {/* Name EN */}
                      <div className="col-lg-12">
                        <div className="mb-3">
                          <label className="form-label">
                            {t("department.departmentName") ||
                              "Department Name"}{" "}
                            (EN) <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={nameEn}
                            onChange={(e) => setNameEn(e.target.value)}
                          />
                        </div>
                      </div>
                      {/* Slug */}
                      <div className="col-lg-12">
                        <div className="mb-3">
                          <label className="form-label">
                            {t("department.slug") || "Slug"}{" "}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={departmentSlug}
                            onChange={(e) => setDepartmentSlug(e.target.value)}
                          />
                        </div>
                      </div>
                      {/* Level Select */}
                      <div className="col-lg-12">
                        <div className="mb-3">
                          <label className="form-label">
                            {t("department.level") || "Level"}{" "}
                            <span className="text-danger">*</span>
                          </label>
                          <Select
                            className="select"
                            options={levelList}
                            placeholder={t("common.choose") || "Choose Level"}
                            onChange={(selectedOption) =>
                              setLevel(
                                selectedOption ? selectedOption.value : "0"
                              )
                            }
                            value={levelList.find(
                              (option) => option.value === level
                            )}
                          />
                        </div>
                      </div>

                      {/* Status Toggle */}
                      <div className="input-blocks m-0">
                        <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                          <span className="status-label">
                            {t("common.status") || "Status"}
                          </span>
                          <input
                            type="checkbox"
                            id="depStatusCheck"
                            className="check"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                          />
                          <label
                            htmlFor="depStatusCheck"
                            className="checktoggle"
                          >
                            {" "}
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer-btn">
                      <button
                        type="button"
                        className="btn btn-cancel me-2"
                        data-bs-dismiss="modal"
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Khai báo PropTypes để khắc phục lỗi ESLint
AddDepartment.propTypes = {
  onDepartmentAdded: PropTypes.func,
};

AddDepartment.defaultProps = {
  onDepartmentAdded: () => {},
};

export default AddDepartment;
