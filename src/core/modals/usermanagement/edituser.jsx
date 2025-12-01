import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Select from 'react-select';
import ImageWithBasePath from '../../img/imagewithbasebath';
import ToastMessage from "../../../feature-module/components/ToastMessage/ToastMessage";

const EditUser = ({ userData, onUserUpdated }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errorValidateForm, setErrorValidateForm] = useState({});
    const [roleOptions, setRoleOptions] = useState([]);
    const [rolesLoading, setRolesLoading] = useState(false);
    const [toast, setToast] = useState({
            show: false,
            type: "",
            message: "",
        });
    // state cho form data
    const [formData, setFormData] = useState({
        uuid: '',
        user_name: '',
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        avatar_url: '',
        roles: []
    });

    // Fetch danh sách roles từ API
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                setRolesLoading(true);
                const token = localStorage.getItem("userToken");
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/role/roles`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            Authorization: `${token}`
                        },
                    }
                );

                if ( response.data.code === 200) {
                    const options = response.data.data.map(role => ({
                        value: role.slug,
                        label: role.name_en
                    }));
                    setRoleOptions(options);
                } else {
                    console.error("Failed to fetch roles");
                }
            } catch (err) {
                console.error("Error fetching roles:", err);
            } finally {
                setRolesLoading(false);
            }
        };

        fetchRoles();
    }, []);

    // Cập nhật form khi userData thay đổi
    useEffect(() => {
        if (userData) {
            console.log("Received user data in EditUser:", userData);
            
            const selectedRoles = userData.roles?.details?.map(role => ({
                value: role.slug,
                label: role.name_en
            })) || [];

            setFormData({
                uuid: userData.uuid || '',
                user_name: userData.user_name || '',
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                email: userData.email || '',
                phone_number: userData.phone_number || '',
                avatar_url: userData.avatar_url || '',
                roles: selectedRoles
            });
        }
    }, [userData]);

    // Hàm xử lý thay đổi form
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Hàm xử lý thay đổi roles (Select)
    const handleRolesChange = (selectedOptions) => {
        setFormData(prev => ({
            ...prev,
            roles: selectedOptions || []
        }));
    };

    const showToast = (type, message) => {
        setToast({ show: true, type, message });

        setTimeout(() => {
        setToast({ show: false, type: "", message: "" });
        }, 3000);
    };

    const validateForm= () =>{
        let newErrors = {};
        if (!/[a-zA-Z]/.test(formData.first_name)) {
            newErrors.first_name  = "Last name must contain letters";
        }

        if (!/[a-zA-Z]/.test(formData.last_name)) {
            newErrors.last_name  = "Last name must contain letters";
        }

        if (!/^[0-9]{10,11}$/.test(formData.phone_number)) {
            newErrors.phone_number  = "Phone number must be 10-11 digits";
        }

        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is not valid";
        }
        setErrorValidateForm(newErrors);
        return Object.keys(newErrors).length === 0;
        
    };

     // Hàm xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem("userToken");
            
            const submitData = {
                uuid: formData.uuid, 
                user_name: formData.user_name,
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone_number: formData.phone_number,
                avatar_url: formData.avatar_url,
                roles: formData.roles.map(role => role.value)
            };

            console.log("Data being submitted:", submitData);

            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/user/users`, 
                submitData,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `${token}`
                    },
                }
            );

            if (response.data.code === 200) {
                if (onUserUpdated) {
                    onUserUpdated();
                }
                
                showToast("success", `Cập nhật user thành công!`);
            } else {
                showToast("error", `Cập nhật user không thành công!`);
            }
        } catch (err) {
            setError('Lỗi khi cập nhật user!');
            console.error("Error details:", err);
            // Log chi tiết lỗi từ server nếu có
            if (err.response) {
                console.error("Server response error:", err.response.data);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Edit User */}
            <div className="modal fade" id="edit-units">
                <div className="modal-dialog modal-dialog-centered custom-modal-two">
                    <div className="modal-content">
                        <div className="page-wrapper-new p-0">
                            <div className="content">
                                <div className="modal-header border-0 custom-modal-header">
                                    <div className="page-title">
                                        <h4>
                                            Edit User 
                                            {userData?.first_name && ` - ${userData.first_name} ${userData.last_name}`}
                                        </h4>
                                    </div>
                                    <button
                                        type="button"
                                        className="close"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                        disabled={loading}
                                    >
                                        <span aria-hidden="true">×</span>
                                    </button>
                                </div>
                                <div className="modal-body custom-modal-body">
                                    {error && (
                                        <div className="alert alert-danger">
                                            {error}
                                        </div>
                                    )}
                                    
                                    <form onSubmit={handleSubmit}>
                                        <div className="row">
                                            
                                            <div className="col-lg-7">
                                                
                                                <div className="new-employee-field">
                                                    <span>Avatar</span>
                                                    <div className="profile-pic-upload edit-pic">
                                                        <div className="profile-pic">
                                                            <span>
                                                                {formData.avatar_url ? (
                                                                    <img 
                                                                        src={formData.avatar_url} 
                                                                        className="user-editer"
                                                                        alt="User"
                                                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                                                    />
                                                                ) : (
                                                                    <ImageWithBasePath
                                                                        src="assets/img/users/edit-user.jpg"
                                                                        className="user-editer"
                                                                        alt="User"
                                                                    />
                                                                )}
                                                            </span>
                                                            <div className="close-img">
                                                                <i data-feather="x" className="info-img" />
                                                            </div>
                                                        </div>
                                                        <div className="input-blocks mb-0">
                                                            <div className="image-upload mb-0">
                                                                <input type="file" disabled={loading} />
                                                                <div className="image-uploads">
                                                                    <h4>Change Image</h4>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-5">
                                                <div className="input-blocks">
                                                    <label>User name</label>
                                                    <input 
                                                        type="text" 
                                                        name="user_name"
                                                        value={formData.user_name}
                                                        onChange={handleChange}
                                                        required
                                                        disabled={loading}
                                                        readOnly
                                                        placeholder="Enter email"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>First name</label>
                                                    <input 
                                                        type="text" 
                                                        name="first_name"
                                                        value={formData.first_name}
                                                        onChange={handleChange}
                                                        required
                                                        disabled={loading} 
                                                        placeholder="Enter first name"
                                                    />
                                                    {errorValidateForm.first_name && (
                                                        <small className="text-danger">{errorValidateForm.first_name}</small>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>Last name</label>
                                                    <input 
                                                        type="text" 
                                                        name="last_name"
                                                        value={formData.last_name}
                                                        onChange={handleChange}
                                                        required
                                                        disabled={loading} 
                                                        placeholder="Enter last name"
                                                    />

                                                    {errorValidateForm.last_name && (
                                                        <small className="text-danger d-block mt-1">
                                                            {errorValidateForm.last_name}
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>Phone</label>
                                                    <input 
                                                        type="text" 
                                                        name="phone_number"
                                                        value={formData.phone_number}
                                                        onChange={handleChange}
                                                        required
                                                        disabled={loading} 
                                                        placeholder="Enter phone number"
                                                    />
                                                    {errorValidateForm.phone_number && (
                                                        <small className="text-danger">{errorValidateForm.phone_number}</small>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>Email</label>
                                                    <input 
                                                        type="email" 
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        required
                                                        disabled={loading} 
                                                        placeholder="Enter email"
                                                    />
                                                    {errorValidateForm.email && (
                                                        <small className="text-danger">{errorValidateForm.email}</small>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-lg-12">
                                                <div className="input-blocks">
                                                    <label>Roles</label>
                                                    <Select
                                                        required
                                                        isMulti
                                                        className="select"
                                                        options={roleOptions}
                                                        value={formData.roles}
                                                        onChange={handleRolesChange}
                                                        placeholder={rolesLoading ? "Loading roles..." : "Select roles..."}
                                                        isDisabled={loading || rolesLoading}
                                                        isLoading={rolesLoading}
                                                    />
                                                    <small className="text-muted">
                                                        Current roles: {formData.roles.map(role => role.label).join(', ') || 'No roles assigned'}
                                                    </small>
                                                </div>
                                            </div>
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
                                                type="submit" 
                                                className="btn btn-submit"
                                                disabled={loading || rolesLoading}
                                            >
                                                {loading ? 'Updating...' : 'Update User'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* /Edit User */}
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

// PropTypes validation
EditUser.propTypes = {
    userData: PropTypes.shape({
        uuid: PropTypes.string.isRequired, // Thêm uuid là bắt buộc
        user_name: PropTypes.string,
        first_name: PropTypes.string,
        last_name: PropTypes.string,
        email: PropTypes.string,
        phone_number: PropTypes.string,
        avatar_url: PropTypes.string,
        roles: PropTypes.shape({
            list: PropTypes.arrayOf(PropTypes.string),
            details: PropTypes.arrayOf(PropTypes.shape({
                slug: PropTypes.string,
                name_vi: PropTypes.string,
                name_en: PropTypes.string
            }))
        })
    }),
    onUserUpdated: PropTypes.func
};

// Default props
EditUser.defaultProps = {
    userData: {
        uuid: '', // Thêm uuid mặc định
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        avatar_url: '',
        roles: {
            list: [],
            details: []
        }
    },
    onUserUpdated: () => {}
};
export default EditUser;
