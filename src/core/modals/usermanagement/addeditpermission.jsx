import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const API_URL = `${import.meta.env.VITE_API_URL}/role/permissions`;

const AddEditPermission = ({ show, onHide, permission, onSuccess }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    id: permission?.id || '',
    slug: permission?.slug || '',
    name_vi: permission?.name_vi || '',
    name_en: permission?.name_en || '',
    module: permission?.module || '',
  });

  // Reset form khi permission prop thay đổi (khi bấm chỉnh sửa)
  useEffect(() => {
    setForm({
      id: permission?.id || '',
      slug: permission?.slug || '',
      name_vi: permission?.name_vi || '',
      name_en: permission?.name_en || '',
      module: permission?.module || '',
    });
  }, [permission]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('userToken');
      let response;
      if (permission) {
        // Edit: luôn truyền id lấy từ permission prop (phòng trường hợp user xóa id trong form)
        const payload = { ...form, id: permission.id };
        response = await axios.put(`${API_URL}`, payload, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `${token}`,
          },
        });
      } else {
        // Add
        response = await axios.post(API_URL, form, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `${token}`,
          },
        });
      }
      if (response.data.status) {
        onSuccess();
        onHide();
      } else {
        setError(response.data.msg || t('addeditpermission.error'));
      }
    } catch (err) {
      setError(t('addeditpermission.network_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {permission ? t('addeditpermission.editPermission') : t('addeditpermission.addPermission')}
        </Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="mb-3">
            <label className="form-label">Slug</label>
            <input
              type="text"
              className="form-control"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Tên (VI)</label>
            <input
              type="text"
              className="form-control"
              name="name_vi"
              value={form.name_vi}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Tên (EN)</label>
            <input
              type="text"
              className="form-control"
              name="name_en"
              value={form.name_en}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Module</label>
            <input
              type="text"
              className="form-control"
              name="module"
              value={form.module}
              onChange={handleChange}
              required
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? t('common.saving') : t('common.save')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default AddEditPermission;

AddEditPermission.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  permission: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    slug: PropTypes.string,
    name_vi: PropTypes.string,
    name_en: PropTypes.string,
    module: PropTypes.string,
  }),
  onSuccess: PropTypes.func.isRequired,
};
