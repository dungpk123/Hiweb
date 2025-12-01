import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

const API_URL = `${process.env.REACT_APP_API_URL}/role/permissions`;
const AddPermission = ({ onSuccess }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    slug: "",
    name_vi: "",
    name_en: "",
    module: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("userToken");
      const { data } = await axios.post(API_URL, form, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `${token}`,
        },
      });
      if (data.status && (data.code === 200 || data.code === 201)) {
        setSuccess(t("addpermission.successAdd"));
        onSuccess && onSuccess();
      } else if ((data.msg && data.msg === 'already exists')) {
        setError(t("addpermission.duplicateError"));
      } else if (data.msg) {
        setError(t(`addpermission.apiErrorMsg.${data.msg}`) !== `addpermission.apiErrorMsg.${data.msg}` ? t(`addpermission.apiErrorMsg.${data.msg}`) : data.msg);
      } else {
        setError(t("addpermission.failedAdd"));
      }
    } catch (err) {
      const msg = err?.response?.data?.msg;
      if (err?.response?.status === 409 || msg === 'already exists') {
        setError(t("addpermission.duplicateError"));
      } else if (err?.response?.data?.message) {
        setError(t(`addpermission.apiErrorMsg.${err.response.data.message}`) !== `addpermission.apiErrorMsg.${err.response.data.message}` ? t(`addpermission.apiErrorMsg.${err.response.data.message}`) : err.response.data.message);
      } else if (msg) {
        setError(t(`addpermission.apiErrorMsg.${msg}`) !== `addpermission.apiErrorMsg.${msg}` ? t(`addpermission.apiErrorMsg.${msg}`) : msg);
      } else {
        setError(t("addpermission.apiError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade" id="add-permission" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{t("addpermission.addNewPermission")}</h5>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">{t("addpermission.slug")}</label>
                <input type="text" className="form-control" name="slug" value={form.slug} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">{t("addpermission.name_vi")}</label>
                <input type="text" className="form-control" name="name_vi" value={form.name_vi} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">{t("addpermission.name_en")}</label>
                <input type="text" className="form-control" name="name_en" value={form.name_en} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">{t("addpermission.module")}</label>
                <input type="text" className="form-control" name="module" value={form.module} onChange={handleChange} required />
              </div>
              {success && <div className="alert alert-success">{success}</div>}
              {error && <div className="alert alert-danger">{error}</div>}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">{t("addpermission.cancel")}</button>
              <button type="submit" className="btn btn-primary" disabled={loading} >
                {loading ? t("addpermission.saving") : t("addpermission.save")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

AddPermission.propTypes = {
  onSuccess: PropTypes.func,
};

export default AddPermission;
