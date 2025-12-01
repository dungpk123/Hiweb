import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import axios from "axios";

import ImageWithBasePath from "../../core/img/imagewithbasebath";

const extractProfileFromResponse = (responseData) => {
  if (!responseData) {
    return null;
  }
  if (responseData.data) {
    if (Array.isArray(responseData.data)) {
      return responseData.data[0] || null;
    }
    return responseData.data;
  }
  return responseData;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_NUMBER_REGEX = /^(0|\+84)\d{9,10}$/;
const NAME_REGEX = /^[a-zA-Z\s\u00C0-\u1EF9]+$/;
const ONE_WORD_REGEX = /^[a-zA-Z\u00C0-\u1EF9]+$/;

const Profile = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // state cho phần password
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setNewShowPassword] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
  });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleNewPasswordVisibility = () => {
    setNewShowPassword((prev) => !prev);
  };

  // Hàm validate định dạng email
  const isValidEmail = (email) => EMAIL_REGEX.test(email);

  // Hàm validate định dạng số điện thoại
  const isValidPhoneNumber = (phoneNumber) =>
    PHONE_NUMBER_REGEX.test(phoneNumber);

  // Hàm validate tổng thể cho Profile
  const validateProfileForm = () => {
    const { first_name, last_name, email, phone_number } = profileData;
    let errors = {};
    let isValid = true;

    // --- Kiểm tra first_name ---
    if (!first_name) {
      errors.first_name = t("common.error.errorRequiredFields");
      isValid = false;
    } else if (first_name.length > 30) {
      errors.first_name = t("profile.errorFirstNameLength");
      isValid = false;
    } else if (!ONE_WORD_REGEX.test(first_name)) {
      // Kiểm tra chỉ 1 từ (không có khoảng trắng) và không có kí tự đặc biệt
      errors.first_name = t("profile.errorFirstNameFormat");
      isValid = false;
    }

    // --- Kiểm tra last_name ---
    if (!last_name) {
      errors.last_name = t("common.error.errorRequiredFields");
      isValid = false;
    } else if (last_name.length > 40) {
      errors.last_name = t("profile.errorLastNameLength");
      isValid = false;
    } else if (!NAME_REGEX.test(last_name)) {
      // Kiểm tra không có kí tự đặc biệt
      errors.last_name = t("profile.errorLastNameFormat");
      isValid = false;
    }

    // --- Kiểm tra email ---
    if (!email) {
      errors.email = t("common.error.errorRequiredFields");
      isValid = false;
    } else if (!isValidEmail(email)) {
      errors.email = t("register.errorInvalidEmail");
      isValid = false;
    }

    // --- Kiểm tra phone_number ---
    if (!phone_number) {
      errors.phone_number = t("common.error.errorRequiredFields");
      isValid = false;
    } else if (!isValidPhoneNumber(phone_number)) {
      errors.phone_number = t("register.errorInvalidPhoneNumber");
      isValid = false;
    }

    setFormErrors((prev) => ({ ...prev, ...errors }));
    return isValid;
  };

  // Hàm validate cho Change Password
  const validatePasswordForm = () => {
    const { old_password, new_password } = passwordData;
    let errors = {};
    let isValid = true;

    if (!old_password) {
      errors.old_password = t("common.error.errorRequiredFields");
      isValid = false;
    }
    if (!new_password) {
      errors.new_password = t("common.error.errorRequiredFields");
      isValid = false;
    }

    setFormErrors((prev) => ({ ...prev, ...errors }));
    return isValid;
  };

  // Hàm kiểm tra lỗi ngay khi(onBlur)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    let errorMessage = "";

    // Check Profile Fields
    if (["first_name", "last_name", "email", "phone_number"].includes(name)) {
      if (!value) {
        errorMessage = t("common.error.errorRequiredFields");
      } else if (name === "first_name") {
        if (value.length > 30) {
          errorMessage = t("profile.errorFirstNameLength");
        } else if (!ONE_WORD_REGEX.test(value)) {
          errorMessage = t("profile.errorFirstNameFormat");
        }
      } else if (name === "last_name") {
        if (value.length > 40) {
          errorMessage = t("profile.errorLastNameLength");
        } else if (!NAME_REGEX.test(value)) {
          errorMessage = t("profile.errorLastNameFormat");
        }
      } else if (name === "email" && !isValidEmail(value)) {
        errorMessage = t("register.errorInvalidEmail");
      } else if (name === "phone_number" && !isValidPhoneNumber(value)) {
        errorMessage = t("register.errorInvalidPhoneNumber");
      }
    }

    if (["old_password", "new_password"].includes(name) && !value) {
      errorMessage = t("common.error.errorRequiredFields");
    }

    if (errorMessage) {
      setFormErrors((prev) => ({ ...prev, [name]: errorMessage }));
    } else {
      // Xóa lỗi nếu giá trị hợp lệ
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const API_URL_PROFILE = `${import.meta.env.VITE_API_URL}/user/profile`;
  const API_URL_PASSWORD = `${import.meta.env.VITE_API_URL}/user/changePassword`;

  useEffect(() => {
    const fetchCurrentUser = () => {
      try {
        const currentUserString = localStorage.getItem("currentUser");
        if (currentUserString) {
          const currentUserData = JSON.parse(currentUserString);
          setUser(currentUserData);
          // Khởi tạo profileData với các trường cần thiết cho form
          setProfileData({
            uuid: currentUserData.uuid || "",
            user_name: currentUserData.user_name || "",
            is_active: currentUserData.is_active || false,
            is_verified: currentUserData.is_verified || false,
            created_at: currentUserData.created_at || "",
            updated_at: currentUserData.updated_at || "",
            first_name: currentUserData.first_name || "",
            last_name: currentUserData.last_name || "",
            full_name: currentUserData.full_name || "",
            phone_number: currentUserData.phone_number || "",
            email: currentUserData.email || "",
            avatar_url: currentUserData.avatar_url || null,
            last_login_at: currentUserData.last_login_at || "",
            deleted_at: currentUserData.deleted_at || null,
            locked_until: currentUserData.locked_until || null,
            "2fa": currentUserData["2fa"] || false,
          });
        } else {
          console.warn(
            "Không tìm thấy dữ liệu 'currentUser' trong localStorage."
          );
        }
      } catch (error) {
        console.error(
          "Lỗi khi đọc dữ liệu 'currentUser' từ localStorage:",
          error
        );
        setError(t("profile.errorFetchProfile"));
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const submitProfileUpdate = useCallback(
    async (overrides = {}, { successMessage } = {}) => {
      if (!profileData || isSubmitting) return;

      const token = user?.token;
      if (!token) {
        setError(t("common.error.noAuthToken"));
        return;
      }

      const mergedProfileData = { ...profileData, ...overrides };

      setProfileData(mergedProfileData);
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const payload = {
        uuid: mergedProfileData.uuid,
        user_name: mergedProfileData.user_name,
        is_active: mergedProfileData.is_active,
        is_verified: mergedProfileData.is_verified,
        created_at: mergedProfileData.created_at,
        updated_at: mergedProfileData.updated_at,
        first_name: mergedProfileData.first_name,
        last_name: mergedProfileData.last_name,
        full_name: mergedProfileData.full_name,
        phone_number: mergedProfileData.phone_number,
        email: mergedProfileData.email,
        avatar_url: mergedProfileData.avatar_url,
        last_login_at: mergedProfileData.last_login_at,
        deleted_at: mergedProfileData.deleted_at,
        locked_until: mergedProfileData.locked_until,
        "2fa": mergedProfileData["2fa"],
      };

      if (mergedProfileData.first_name || mergedProfileData.last_name) {
        payload.full_name = `${mergedProfileData.first_name || ""} ${
          mergedProfileData.last_name || ""
        }`.trim();
      }

      try {
        const response = await axios.put(API_URL_PROFILE, payload, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 200) {
          const serverProfile = extractProfileFromResponse(response.data);
          const normalizedProfile =
            serverProfile && Object.keys(serverProfile).length > 0
              ? serverProfile
              : payload;

          if (payload.avatar_url && !normalizedProfile.avatar_url) {
            normalizedProfile.avatar_url = payload.avatar_url;
          }

          const updatedRoles = user?.roles || [];
          const updatedUser = {
            ...user,
            ...normalizedProfile,
            roles: updatedRoles,
            avatar_url:
              normalizedProfile.avatar_url ||
              payload.avatar_url ||
              user?.avatar_url,
          };

          localStorage.setItem("currentUser", JSON.stringify(updatedUser));
          setUser(updatedUser);
          setProfileData((prev) => ({
            ...prev,
            ...normalizedProfile,
            avatar_url:
              normalizedProfile.avatar_url ||
              payload.avatar_url ||
              prev.avatar_url,
          }));
          setSuccess(successMessage || t("profile.successUpdateProfile"));

          window.dispatchEvent(
            new CustomEvent("profile-updated", {
              detail: {
                profile: updatedUser,
                roles: updatedRoles,
              },
            })
          );
        } else {
          setError(t("profile.errorUpdateFailed"));
        }
      } catch (err) {
        console.error("Lỗi khi cập nhật hồ sơ:", err);
        const errCode = err.response?.data?.err;
        const msgKey = err.response?.data?.msg;

        const errorMessage = errCode
          ? `${errCode} ${t(msgKey)}`
          : msgKey
          ? t(msgKey)
          : t("error.networkError");

        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      API_URL_PROFILE,
      extractProfileFromResponse,
      isSubmitting,
      profileData,
      t,
      user,
    ]
  );

  // --- Upload ảnh lên Imgbb & Preview ---
  useEffect(() => {
    const imgInp = document.getElementById("imgInp");
    if (!imgInp) return;

    // Hàm này chỉ để Review ảnh, KHÔNG upload
    const handleFileChange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setError("Vui lòng chọn file ảnh hợp lệ");
        return;
      }

      setPendingFile(file);

      const objectUrl = URL.createObjectURL(file);
      setPreviewAvatar(objectUrl);
    };
    imgInp.addEventListener("change", handleFileChange);

    return () => {
      imgInp.removeEventListener("change", handleFileChange);
    };
  }, [submitProfileUpdate]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh hợp lệ");
      return;
    }

    setPendingFile(file);

    const objectUrl = URL.createObjectURL(file);
    setPreviewAvatar(objectUrl);
  };

  const handleSaveAllChanges = async () => {
    if (!validateProfileForm()) {
      setError(t("common.error.errorRequiredFields"));
      return;
    }
    // Bắt đầu loading
    setIsSubmitting(true);
    setError(null);

    let finalAvatarUrl = profileData.avatar_url;

    try {
      // Nếu có chọn ảnh mới (pendingFile) thì upload lên ImgBB trước
      if (pendingFile) {
        const formData = new FormData();
        formData.append("image", pendingFile);

        // Gọi API ImgBB
        const uploadRes = await axios.post(
          "https://api.imgbb.com/1/upload?key=06ff5fe8c70dffa4175102d7ea9e871f",
          formData
        );

        // Lấy URL ảnh mới từ ImgBB
        finalAvatarUrl = uploadRes.data.data.url;
      }
      await submitProfileUpdate({ avatar_url: finalAvatarUrl });

      setPendingFile(null);
    } catch (err) {
      console.error("Lỗi quá trình lưu:", err);
      setError("Có lỗi xảy ra khi cập nhật (Upload ảnh hoặc lưu thông tin).");
      setIsSubmitting(false);
    }
  };

  // Cập nhật state khi giá trị input thay đổi
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Xóa lỗi của trường đang nhập
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  // Hàm xử lý việc gửi form cập nhật
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    await submitProfileUpdate();
  };

  // --- Logic Modal Đổi Mật Khẩu ---
  const handlePasswordChangeInput = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    const token = user?.token;

    if (!validatePasswordForm()) {
      return;
    }

    if (!token) {
      setPasswordError(t("common.error.noAuthToken"));
      return;
    }

    if (!passwordData.old_password || !passwordData.new_password) {
      setPasswordError(t("profile.errorEmptyPassword"));
      return;
    }

    setIsChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      // Gửi POST request
      const response = await axios.post(API_URL_PASSWORD, passwordData, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200 || response.status === 201) {
        setPasswordSuccess(t("profile.successChangePassword"));
        // Reset form sau khi thành công
        setPasswordData({ old_password: "", new_password: "" });
        // Tự động đóng modal sau 2 giây
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess(null);
        }, 2000);
      }
    } catch (err) {
      console.error("Lỗi đổi mật khẩu:", err);
      const msg =
        t(err.response?.data?.msg) || t("profile.errorChangePasswordFailed");
      setPasswordError(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const closeModal = () => {
    setShowPasswordModal(false);
    setPasswordError(null);
    setPasswordSuccess(null);
    setPasswordData({ old_password: "", new_password: "" });
  };

  // Hiển thị trạng thái loading hoặc không có dữ liệu
  if (loading || !user) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <p>{t("common.loading")}...</p>
        </div>
      </div>
    );
  }

  // Dữ liệu hiển thị
  const firstName = profileData?.first_name || "";
  const lastName = profileData?.last_name || "";
  const fallbackFullName = `${firstName} ${lastName}`.trim();
  const fullName =
    fallbackFullName || profileData?.full_name || t("profile.title");
  const email = profileData?.email || "";
  const phoneNumber = profileData?.phone_number || "";
  const userName = profileData?.user_name || "";

  // Lấy vai trò hiển thị
  const firstRole = user.roles && user.roles.length > 0 ? user.roles[0] : null;
  const displayedRole = firstRole ? t(`roles.${firstRole.slug}`) : t("guest");

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="page-title">
            <h4>{t("profile.title")}</h4>
            <h6>{t("profile.subTitle")}</h6>
          </div>
        </div>
        {/* /product list */}
        <div className="card">
          <div className="card-body">
            <div className="profile-set">
              <div className="profile-head"></div>
              <div className="profile-top">
                <div className="profile-content">
                  <div className="profile-contentimg">
                    <img
                      src={
                        previewAvatar ||
                        profileData?.avatar_url ||
                        "assets/img/profiles/avatar-default.png"
                      }
                      alt="Profile Avatar"
                      id="blah"
                      style={{
                        width: 120,
                        height: 120,
                        objectFit: "cover",
                        borderRadius: "50%",
                        objectPosition: "center",
                      }}
                    />

                    <div className="profileupload">
                      <input
                        type="file"
                        id="imgInp"
                        onChange={handleFileChange}
                        accept="image/*"
                      />
                      <Link to="#">
                        <ImageWithBasePath
                          src="assets/img/icons/edit-set.svg"
                          alt="Edit"
                        />
                      </Link>
                    </div>
                  </div>
                  <div className="profile-contentname">
                    <h2>{fullName} | {userName}</h2>
                    <h4>
                      {displayedRole} | {t("profile.description")}
                    </h4>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Cập Nhật */}
            <form onSubmit={handleUpdateProfile}>
              {/* Hiển thị thông báo thành công/thất bại */}
              {success && <div className="alert alert-success">{success}</div>}
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="row">
                <div className="col-lg-6 col-sm-12">
                  <div className="input-blocks">
                    <label className="form-label">
                      {t("profile.firstName")}
                    </label>
                    <input
                      type="text"
                      className={"form-control "}
                      name="first_name"
                      value={firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {formErrors.first_name && (
                      <div className="text-danger mt-1">
                        {formErrors.first_name}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-lg-6 col-sm-12">
                  <div className="input-blocks">
                    <label className="form-label">
                      {t("profile.lastName")}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="last_name"
                      value={lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    {formErrors.last_name && (
                      <div className="text-danger mt-1">
                        {formErrors.last_name}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-lg-6 col-sm-12">
                  <div className="input-blocks">
                    <label>{t("profile.email")}</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    {formErrors.email && (
                      <div className="text-danger mt-1">{formErrors.email}</div>
                    )}
                  </div>
                </div>
                <div className="col-lg-6 col-sm-12">
                  <div className="input-blocks">
                    <label className="form-label">
                      {t("profile.phoneNumber")}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone_number"
                      value={phoneNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    {formErrors.phone_number && (
                      <div className="text-danger mt-1">
                        {formErrors.phone_number}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-12">
                  <button
                    type="button"
                    className="btn btn-submit me-2"
                    disabled={isSubmitting}
                    onClick={handleSaveAllChanges}
                  >
                    {isSubmitting
                      ? t("common.loading")
                      : t("profile.buttonSubmit")}
                  </button>
                  <Link to="/" className="btn btn-cancel me-2">
                    {t("profile.buttonCancel")}
                  </Link>
                  <button
                    type="button"
                    className="btn btn-change-password btn-warning"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    {t("profile.buttonChangePassword")}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {showPasswordModal && (
        <>
          {/* Overlay background */}
          <div className="modal-backdrop fade show"></div>

          {/* Modal Dialog */}
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {t("profile.buttonChangePassword")}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                    aria-label="Close"
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>

                <form onSubmit={handleSubmitPassword}>
                  <div className="modal-body">
                    {passwordSuccess && (
                      <div className="alert alert-success">
                        {passwordSuccess}
                      </div>
                    )}
                    {passwordError && (
                      <div className="alert alert-danger">{passwordError}</div>
                    )}

                    {/* --- OLD PASSWORD --- */}
                    <div className="mb-3">
                      <label className="form-label">
                        {t("profile.oldPassword") || "Mật khẩu cũ"}
                      </label>
                      <div className="pass-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          className={`form-control ${
                            formErrors.old_password ? "is-invalid" : ""
                          }`}
                          name="old_password"
                          value={passwordData.old_password}
                          onChange={handlePasswordChangeInput}
                          onBlur={handleBlur}
                          required
                        />
                        <span
                          className={`fas toggle-password ${
                            showPassword ? "fa-eye" : "fa-eye-slash"
                          }`}
                          onClick={togglePasswordVisibility}
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                      {/*  Hiển thị lỗi */}
                      {formErrors.old_password && (
                        <div className="text-danger mt-1 small">
                          {formErrors.old_password}
                        </div>
                      )}
                    </div>

                    {/* --- NEW PASSWORD --- */}
                    <div className="mb-3">
                      <label className="form-label">
                        {t("profile.newPassword") || "Mật khẩu mới"}
                      </label>
                      <div className="pass-group">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          className={`form-control ${
                            formErrors.new_password ? "is-invalid" : ""
                          }`}
                          name="new_password"
                          value={passwordData.new_password}
                          onChange={handlePasswordChangeInput}
                          onBlur={handleBlur}
                          required
                        />
                        <span
                          className={`fas toggle-password ${
                            showNewPassword ? "fa-eye" : "fa-eye-slash"
                          }`}
                          onClick={toggleNewPasswordVisibility}
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                      {/* Hiển thị lỗi */}
                      {formErrors.new_password && (
                        <div className="text-danger mt-1 small">
                          {formErrors.new_password}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closeModal}
                    >
                      {t("common.cancel") || "Hủy"}
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword
                        ? t("loading")
                        : t("common.save") || "Lưu thay đổi"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
