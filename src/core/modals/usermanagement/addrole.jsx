import React, { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import ToastMessage from "../../../feature-module/components/ToastMessage/ToastMessage";
import { useTranslation } from "react-i18next";

const AddRole = ({ onSuccess }) => {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    slug: "",
    name_vi: "",
    name_en: "",
  });

  // const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // toast
  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update form state
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const showToast = (type, message) => {
    setToast({ show: true, type, message });

    setTimeout(() => {
      setToast({ show: false, type: "", message: "" });
    }, 3000);
  };

  const API_URL = `${process.env.REACT_APP_API_URL}/role/roles`;
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Lấy token đúng key
    const token = localStorage.getItem("userToken");
    if (!token) {
      showToast("error", `${t("common.error.noAuthToken")}`);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        API_URL,
        {
          slug: form.slug,
          name_vi: form.name_vi,
          name_en: form.name_en,
        },
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Tạo vai trò thành công:", res.data);
      showToast("success", `${t("roles-permissions.createRoleSuccess")}`);
      if (onSuccess) onSuccess();

      // Reset form
      setForm({ slug: "", name_vi: "", name_en: "" });
      // setErrors({});
    } catch (err) {
      console.error("Error:", err);
      const api = err.response?.data;

      if (api) {
        if (api.code === 409 && api.error?.includes("slug")) {
          showToast("error", `${t("roles-permissions.slugAlreadyExists")}`);
          return;
        }
      }
      showToast("error", `${t("roles-permissions.slugAlreadyExists")}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="modal fade" id="add-units">
        <div className="modal-dialog modal-dialog-centered custom-modal-two">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content">
                <div className="modal-header border-0 custom-modal-header">
                  <div className="page-title">
                    <h4>{t("roles-permissions.createRoleTitle")}</h4>
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
                  <form onSubmit={handleSubmit}>
                    <div className="mb-0">
                      <label className="form-label">{t("common.slug")}</label>
                      <input
                        type="text"
                        className="form-control"
                        name="slug"
                        value={form.slug}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-0">
                      <label className="form-label">{t("common.nameVn")}</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name_vi"
                        value={form.name_vi}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-0">
                      <label className="form-label">{t("common.nameEn")}</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name_en"
                        value={form.name_en}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="modal-footer-btn">
                      <button
                        type="button"
                        className="btn btn-cancel me-2"
                        data-bs-dismiss="modal"
                        disabled={loading}
                      >
                        {t("common.cancel")}
                      </button>
                      <button
                        type="submit"
                        className="btn btn-submit"
                        disabled={loading}
                      >
                        {loading
                          ? `${t("common.loading")}`
                          : `${t("common.save")}`}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
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
  );
};

export default AddRole;

AddRole.propTypes = {
  onSuccess: PropTypes.func,
};
