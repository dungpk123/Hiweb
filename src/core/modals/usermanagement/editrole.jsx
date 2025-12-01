import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import ToastMessage from "../../../feature-module/components/ToastMessage/ToastMessage";
import { useTranslation } from "react-i18next";

const EditRole = ({ data, onRefresh }) => {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    id: "",
    slug: "",
    name_vi: "",
    name_en: "",
    created_at: "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  useEffect(() => {
    if (data) {
      setForm({
        id: data.id || "",
        slug: data.slug || "",
        name_vi: data.name_vi || "",
        name_en: data.name_en || "",
        created_at: data.created_at || data.createdon || "",
      });
    }
  }, [data]);

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "", message: "" }), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const getCurrentTimestamp = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const YYYY = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const DD = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      showToast("error", `${t("common.error.noAuthToken")}`);
      return;
    }

    setLoading(true);
    try {
      const API_URL = `${import.meta.env.VITE_API_URL}/role/roles`;
      const payload = {
        id: form.id,
        slug: form.slug,
        name_vi: form.name_vi,
        name_en: form.name_en,
        created_at: form.created_at || undefined,
        updated_at: getCurrentTimestamp(),
      };

      console.debug("EditRole: updating role", {
        API_URL,
        payload,
        tokenPresent: !!token,
      });

      const res = await axios.put(API_URL, payload, {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      });

      console.debug("EditRole: update response", res && res.data);

      showToast("success", `${t("roles-permissions.updateRoleSuccess")}`);

      const modalEl = document.getElementById("edit-units");
      if (modalEl) {
        const closeBtn =
          modalEl.querySelector("button.close") ||
          modalEl.querySelector(".btn-close");
        if (closeBtn) closeBtn.click();
      }

      if (typeof onRefresh === "function") onRefresh();
    } catch (err) {
      const status = err.response?.status;
      const serverData = err.response?.data;
      let handledError = false; 

      const serverMessage =
        serverData?.message ||
        serverData?.error ||
        (serverData && JSON.stringify(serverData)) ||
        err.message;

      console.error("Update role error", {
        status,
        serverData,
        message: err.message,
        stack: err.stack,
      });

      if (status === 409 || serverData?.data?.code === 409) {
        showToast("error", `${t("roles-permissions.slugAlreadyExists")}`);
        handledError = true;
      }

      if (!handledError) {
        showToast("error", `${t("common.error")}: ${serverMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="modal fade" id="edit-units">
        <div className="modal-dialog modal-dialog-centered custom-modal-two">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content">
                <div className="modal-header border-0 custom-modal-header">
                  <div className="page-title">
                    <h4>{t('roles-permissions.editRole')}</h4>
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
                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="mb-3">
                      <label className="form-label">{t("common.slug")} </label>
                      <input
                        type="text"
                        className="form-control"
                        name="slug"
                        value={form.slug}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">{t("common.nameVn")}</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name_vi"
                        value={form.name_vi}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
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
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-submit"
                        onClick={handleUpdate}
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save Changes"}
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

EditRole.propTypes = {
  data: PropTypes.object,
  onRefresh: PropTypes.func,
};

EditRole.defaultProps = {
  data: null,
  onRefresh: null,
};

export default EditRole;
